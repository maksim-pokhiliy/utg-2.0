const UUID_GROUP_BYTES: readonly number[] = [4, 2, 2, 2, 6];

const RANDOM_BYTE_COUNT = 16;

const VERSION_INDEX = 6;

const VARIANT_INDEX = 8;

const VERSION_MASK = 0x0f;

const VERSION_BITS = 0x40;

const VARIANT_MASK = 0x3f;

const VARIANT_BITS = 0x80;

const HEX_RADIX = 16;

const HEX_DIGITS = 2;

const toHex = (byte: number): string =>
  byte.toString(HEX_RADIX).padStart(HEX_DIGITS, "0");

const formatUuid = (bytes: Uint8Array): string => {
  const groups: string[] = [];
  let offset = 0;

  for (const size of UUID_GROUP_BYTES) {
    groups.push(Array.from(bytes.slice(offset, offset + size), toHex).join(""));
    offset += size;
  }

  return groups.join("-");
};

export const createIdempotencyKey = (): string | undefined => {
  const source: Crypto | undefined = globalThis.crypto;

  if (source === undefined) {
    return undefined;
  }

  if (typeof source.randomUUID === "function") {
    return source.randomUUID();
  }

  if (typeof source.getRandomValues !== "function") {
    return undefined;
  }

  const bytes = source.getRandomValues(new Uint8Array(RANDOM_BYTE_COUNT));

  bytes[VERSION_INDEX] = (bytes[VERSION_INDEX] & VERSION_MASK) | VERSION_BITS;
  bytes[VARIANT_INDEX] = (bytes[VARIANT_INDEX] & VARIANT_MASK) | VARIANT_BITS;

  return formatUuid(bytes);
};
