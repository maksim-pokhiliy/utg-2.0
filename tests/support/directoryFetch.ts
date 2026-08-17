import { vi, type Mock } from "vitest";

const OK_STATUS = 200;
const UNAVAILABLE_STATUS = 503;
const JSON_HEADERS = { "Content-Type": "application/json" };
const ABORT_ERROR_NAME = "AbortError";
const ABORT_MESSAGE = "The operation was aborted.";
const SINGLE_REPLY = 1;

export type DirectoryRoute = "settlements" | "warehouses";

export interface DirectoryReply {
  status: number;
  body?: unknown;
  isHeld?: boolean;
  ignoresAbort?: boolean;
}

interface HeldRequest {
  route: DirectoryRoute;
  settle: () => void;
}

export interface DirectoryFetch {
  mock: Mock<typeof fetch>;
  queue: (route: DirectoryRoute, replies: readonly DirectoryReply[]) => void;
  callsTo: (route: DirectoryRoute) => readonly string[];
  signalsTo: (route: DirectoryRoute) => readonly AbortSignal[];
  heldCount: () => number;
  release: () => void;
}

const ROUTE_PATHS = {
  settlements: "/api/np/settlements",
  warehouses: "/api/np/warehouses",
} as const satisfies Record<DirectoryRoute, string>;

export const rowsReply = (items: readonly unknown[]): DirectoryReply => ({
  status: OK_STATUS,
  body: { items },
});

export const heldReply = (items: readonly unknown[]): DirectoryReply => ({
  ...rowsReply(items),
  isHeld: true,
});

export const heldFailure = (status: number): DirectoryReply => ({
  status,
  isHeld: true,
});

export const heldPastAbort = (items: readonly unknown[]): DirectoryReply => ({
  ...heldReply(items),
  ignoresAbort: true,
});

const abortError = (): Error => {
  const error = new Error(ABORT_MESSAGE);

  error.name = ABORT_ERROR_NAME;

  return error;
};

const toResponse = ({ status, body }: DirectoryReply): Response =>
  body === undefined
    ? new Response(null, { status })
    : new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const takeReply = (replies: DirectoryReply[]): DirectoryReply => {
  const reply = replies.length > SINGLE_REPLY ? replies.shift() : replies[0];

  return reply ?? { status: UNAVAILABLE_STATUS };
};

const readRoute = (url: string): DirectoryRoute | null => {
  if (url.startsWith(ROUTE_PATHS.settlements)) {
    return "settlements";
  }

  return url.startsWith(ROUTE_PATHS.warehouses) ? "warehouses" : null;
};

export const createDirectoryFetch = (): DirectoryFetch => {
  const replies: Record<DirectoryRoute, DirectoryReply[]> = {
    settlements: [],
    warehouses: [],
  };
  const signals: Record<DirectoryRoute, AbortSignal[]> = {
    settlements: [],
    warehouses: [],
  };
  const held: HeldRequest[] = [];

  const answer = (
    route: DirectoryRoute,
    reply: DirectoryReply,
    signal: AbortSignal | null
  ): Promise<Response> => {
    if (reply.isHeld !== true) {
      return Promise.resolve(toResponse(reply));
    }

    return new Promise<Response>((resolve, reject) => {
      held.push({
        route,
        settle: () => {
          resolve(toResponse(reply));
        },
      });

      if (reply.ignoresAbort === true) {
        return;
      }

      signal?.addEventListener(
        "abort",
        () => {
          reject(abortError());
        },
        { once: true }
      );
    });
  };

  const mock = vi.fn<typeof fetch>((input, init) => {
    const url = String(input);
    const route = readRoute(url);

    if (route === null) {
      return Promise.resolve(new Response(null, { status: OK_STATUS }));
    }

    const signal = init?.signal ?? null;

    if (signal !== null) {
      signals[route].push(signal);
    }

    if (signal?.aborted === true) {
      return Promise.reject(abortError());
    }

    return answer(route, takeReply(replies[route]), signal);
  });

  return {
    mock,
    queue: (route, next) => {
      replies[route] = [...next];
    },
    callsTo: (route) =>
      mock.mock.calls
        .map(([input]) => String(input))
        .filter((url) => url.startsWith(ROUTE_PATHS[route])),
    signalsTo: (route) => signals[route],
    heldCount: () => held.length,
    release: () => {
      const pending = held.splice(0, held.length);

      for (const request of pending) {
        request.settle();
      }
    },
  };
};
