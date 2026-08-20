import { createServer, type ServerResponse } from "node:http";

const LOOPBACK_HOST = "127.0.0.1";
const EPHEMERAL_PORT = 0;
const SECRET_HEADER = "x-relay-secret";
const CONTENT_TYPE_HEADER = "content-type";
const BODY_ENCODING = "utf8";
const NO_BODY = "";

export interface ReceivedRequest {
  url: string;
  body: string;
  secret: string | string[] | undefined;
  contentType: string | string[] | undefined;
  headerNames: string[];
}

export type RelayAnswer =
  | {
      kind: "reply";
      status: number;
      headers: Record<string, string>;
      body: string;
    }
  | {
      kind: "drip";
      status: number;
      headers: Record<string, string>;
      body: string;
    }
  | {
      kind: "pump";
      status: number;
      headers: Record<string, string>;
      chunk: string;
      totalBytes: number;
    }
  | { kind: "silence" };

export interface LocalRelay {
  origin: string;
  received: ReceivedRequest[];
  bytesWritten: () => number;
  isClosed: () => boolean;
  close: () => Promise<void>;
}

export const replyWith = (
  status: number,
  headers: Record<string, string>,
  body: string
): RelayAnswer => ({ kind: "reply", status, headers, body });

export const dripWith = (
  status: number,
  headers: Record<string, string>,
  body: string
): RelayAnswer => ({ kind: "drip", status, headers, body });

export const pumpWith = (
  status: number,
  headers: Record<string, string>,
  chunk: string,
  totalBytes: number
): RelayAnswer => ({ kind: "pump", status, headers, chunk, totalBytes });

export const SILENCE: RelayAnswer = { kind: "silence" };

const pumpBody = (
  response: ServerResponse,
  chunk: string,
  totalBytes: number,
  written: { bytes: number; isClosed: boolean }
): void => {
  const chunkBytes = Buffer.byteLength(chunk, BODY_ENCODING);

  let isStopped = false;

  response.on("close", () => {
    isStopped = true;
    written.isClosed = true;
  });

  const pump = (): void => {
    while (!isStopped && written.bytes < totalBytes) {
      written.bytes += chunkBytes;

      if (!response.write(chunk)) {
        response.once("drain", pump);

        return;
      }
    }

    if (!isStopped) {
      response.end();
    }
  };

  pump();
};

const startLocalRelay = async (
  answer: () => RelayAnswer
): Promise<LocalRelay> => {
  const received: ReceivedRequest[] = [];
  const written = { bytes: 0, isClosed: false };
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    request.on("end", () => {
      received.push({
        url: request.url ?? NO_BODY,
        body: Buffer.concat(chunks).toString(BODY_ENCODING),
        secret: request.headers[SECRET_HEADER],
        contentType: request.headers[CONTENT_TYPE_HEADER],
        headerNames: Object.keys(request.headers),
      });

      const outcome = answer();

      if (outcome.kind === "silence") {
        return;
      }

      response.writeHead(outcome.status, outcome.headers);

      if (outcome.kind === "pump") {
        pumpBody(response, outcome.chunk, outcome.totalBytes, written);

        return;
      }

      if (outcome.kind === "drip") {
        response.write(outcome.body);

        return;
      }

      response.end(outcome.body);
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(EPHEMERAL_PORT, LOOPBACK_HOST, resolve);
  });

  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("the local relay stand-in did not bind to a port");
  }

  return {
    origin: `http://${LOOPBACK_HOST}:${address.port}`,
    received,
    bytesWritten: () => written.bytes,
    isClosed: () => written.isClosed,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};

const running: LocalRelay[] = [];

export const trackLocalRelay = async (
  answer: () => RelayAnswer
): Promise<LocalRelay> => {
  const relay = await startLocalRelay(answer);

  running.push(relay);

  return relay;
};

export const closeLocalRelays = (): Promise<void> =>
  Promise.all(running.splice(0).map((relay) => relay.close())).then(
    () => undefined
  );
