import { createServer } from "node:http";

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
  | { kind: "silence" };

export interface LocalRelay {
  origin: string;
  received: ReceivedRequest[];
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

export const SILENCE: RelayAnswer = { kind: "silence" };

const startLocalRelay = async (
  answer: () => RelayAnswer
): Promise<LocalRelay> => {
  const received: ReceivedRequest[] = [];
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
