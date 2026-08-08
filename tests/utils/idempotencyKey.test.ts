import { afterEach, describe, expect, it, vi } from "vitest";

import { createIdempotencyKey } from "@root/utils/idempotencyKey";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const VERSION_NIBBLE_INDEX = 14;

const VARIANT_NIBBLE_INDEX = 19;

const RFC_VARIANT_NIBBLES = "89ab";

const ASCENDING_BYTES = new Uint8Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
]);

const SATURATED_BYTES = new Uint8Array(ASCENDING_BYTES.length).fill(0xff);

const ASCENDING_UUID = "00010203-0405-4607-8809-0a0b0c0d0e0f";

const SATURATED_UUID = "ffffffff-ffff-4fff-bfff-ffffffffffff";

const stubCryptoWithBytes = (bytes: Uint8Array): void => {
  vi.stubGlobal("crypto", {
    getRandomValues: (target: Uint8Array): Uint8Array => {
      target.set(bytes);

      return target;
    },
  });
};

const requireKey = (): string => {
  const key = createIdempotencyKey();

  if (key === undefined) {
    throw new Error("The platform minted no idempotency key");
  }

  return key;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createIdempotencyKey on a platform with a real crypto", () => {
  it("returns a lowercase 8-4-4-4-12 uuid the relay can key an order on", () => {
    expect(createIdempotencyKey()).toMatch(UUID_V4_PATTERN);
  });

  it("marks the key as version 4 with an RFC variant nibble", () => {
    expect(requireKey()[VERSION_NIBBLE_INDEX]).toBe("4");
    expect(RFC_VARIANT_NIBBLES).toContain(requireKey()[VARIANT_NIBBLE_INDEX]);
  });

  it("returns a different key on every call, so two orders never share one", () => {
    expect(createIdempotencyKey()).not.toBe(createIdempotencyKey());
  });
});

describe("createIdempotencyKey when the platform hides randomUUID", () => {
  it("assembles a well-formed version 4 uuid out of getRandomValues", () => {
    stubCryptoWithBytes(ASCENDING_BYTES);

    expect(createIdempotencyKey()).toMatch(UUID_V4_PATTERN);
  });

  it("groups the random bytes into the hex the relay reads as a uuid", () => {
    stubCryptoWithBytes(ASCENDING_BYTES);

    expect(createIdempotencyKey()).toBe(ASCENDING_UUID);
  });

  it("stamps the version and variant bits over the bytes the platform supplied", () => {
    stubCryptoWithBytes(SATURATED_BYTES);

    expect(createIdempotencyKey()).toBe(SATURATED_UUID);
  });
});

describe("createIdempotencyKey without a usable crypto source", () => {
  it("returns undefined when crypto exposes neither randomUUID nor getRandomValues", () => {
    vi.stubGlobal("crypto", {});

    expect(createIdempotencyKey()).toBeUndefined();
  });

  it("returns undefined when the platform exposes no crypto at all", () => {
    vi.stubGlobal("crypto", undefined);

    expect(createIdempotencyKey()).toBeUndefined();
  });

  it("gives up the optional hint rather than throwing the checkout a failure", () => {
    vi.stubGlobal("crypto", undefined);

    expect(() => createIdempotencyKey()).not.toThrow();
  });
});
