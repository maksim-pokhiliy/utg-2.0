import { readFileSync } from "node:fs";

import type { ImageSize } from "@root/data";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const PNG_HEADER_LENGTH = 24;
const PNG_IHDR_OFFSET = 12;
const PNG_IHDR_END = 16;
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const IHDR = "IHDR";

const MARKER_PREFIX = 0xff;
const START_OF_IMAGE = 0xd8;
const TEMPORARY_MARKER = 0x01;
const RESTART_FIRST = 0xd0;
const RESTART_LAST = 0xd9;
const JPEG_SEGMENT_HEADER_LENGTH = 2;
const JPEG_LENGTH_OFFSET = 2;
const JPEG_HEIGHT_OFFSET = 5;
const JPEG_WIDTH_OFFSET = 7;

const START_OF_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

const readPngSize = (bytes: Buffer): ImageSize | null => {
  const isPng =
    bytes.length >= PNG_HEADER_LENGTH &&
    bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) &&
    bytes.toString("ascii", PNG_IHDR_OFFSET, PNG_IHDR_END) === IHDR;

  if (!isPng) {
    return null;
  }

  return {
    width: bytes.readUInt32BE(PNG_WIDTH_OFFSET),
    height: bytes.readUInt32BE(PNG_HEIGHT_OFFSET),
  };
};

const readJpegSize = (bytes: Buffer): ImageSize | null => {
  const isJpeg =
    bytes.length > JPEG_SEGMENT_HEADER_LENGTH &&
    bytes[0] === MARKER_PREFIX &&
    bytes[1] === START_OF_IMAGE;

  if (!isJpeg) {
    return null;
  }

  let offset = JPEG_SEGMENT_HEADER_LENGTH;

  while (offset + JPEG_WIDTH_OFFSET < bytes.length) {
    if (bytes[offset] !== MARKER_PREFIX) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];

    if (marker === MARKER_PREFIX) {
      offset += 1;
      continue;
    }

    if (
      marker === TEMPORARY_MARKER ||
      (marker >= RESTART_FIRST && marker <= RESTART_LAST)
    ) {
      offset += JPEG_SEGMENT_HEADER_LENGTH;
      continue;
    }

    if (START_OF_FRAME_MARKERS.has(marker)) {
      return {
        width: bytes.readUInt16BE(offset + JPEG_WIDTH_OFFSET),
        height: bytes.readUInt16BE(offset + JPEG_HEIGHT_OFFSET),
      };
    }

    offset +=
      JPEG_SEGMENT_HEADER_LENGTH +
      bytes.readUInt16BE(offset + JPEG_LENGTH_OFFSET);
  }

  return null;
};

export const readImageSize = (filePath: string): ImageSize | null => {
  const bytes = readFileSync(filePath);

  return readPngSize(bytes) ?? readJpegSize(bytes);
};
