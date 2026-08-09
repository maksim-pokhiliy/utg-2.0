import { describe, expect, it } from "vitest";

import { stripInvisibles } from "@root/utils/invisibles";

type InvisibleCase = readonly [string, number];

const SOFT_HYPHEN_CODE = 0x00ad;
const ZERO_WIDTH_SPACE_CODE = 0x200b;
const ZERO_WIDTH_NON_JOINER_CODE = 0x200c;
const ZERO_WIDTH_JOINER_CODE = 0x200d;
const LEFT_TO_RIGHT_MARK_CODE = 0x200e;
const RIGHT_TO_LEFT_MARK_CODE = 0x200f;
const WORD_JOINER_CODE = 0x2060;
const FUNCTION_APPLICATION_CODE = 0x2061;
const INVISIBLE_TIMES_CODE = 0x2062;
const INVISIBLE_SEPARATOR_CODE = 0x2063;
const INVISIBLE_PLUS_CODE = 0x2064;
const BYTE_ORDER_MARK_CODE = 0xfeff;

const ARABIC_LETTER_MARK_CODE = 0x061c;
const LEFT_TO_RIGHT_EMBEDDING_CODE = 0x202a;
const RIGHT_TO_LEFT_EMBEDDING_CODE = 0x202b;
const POP_DIRECTIONAL_FORMATTING_CODE = 0x202c;
const LEFT_TO_RIGHT_OVERRIDE_CODE = 0x202d;
const RIGHT_TO_LEFT_OVERRIDE_CODE = 0x202e;
const LEFT_TO_RIGHT_ISOLATE_CODE = 0x2066;
const RIGHT_TO_LEFT_ISOLATE_CODE = 0x2067;
const FIRST_STRONG_ISOLATE_CODE = 0x2068;
const POP_DIRECTIONAL_ISOLATE_CODE = 0x2069;

const ARABIC_NUMBER_SIGN_CODE = 0x0600;
const MONGOLIAN_VOWEL_SEPARATOR_CODE = 0x180e;
const MUSICAL_BEGIN_BEAM_CODE = 0x1d173;
const LANGUAGE_TAG_CODE = 0xe0001;
const TAG_LATIN_CAPITAL_A_CODE = 0xe0041;

const SPACE_CODE = 0x0020;
const TAB_CODE = 0x0009;
const LINE_FEED_CODE = 0x000a;
const NON_BREAKING_SPACE_CODE = 0x00a0;
const NUL_CODE = 0x0000;

const RUN_LENGTH = 3;

const EMPTY_TEXT = "";
const CYRILLIC_TEXT = "Київ";
const LATIN_TEXT = "Nova Poshta";
const MIXED_TEXT = "с. Київець, Львівська обл.";

const RETIRED_HAND_LIST: readonly InvisibleCase[] = [
  ["a soft hyphen", SOFT_HYPHEN_CODE],
  ["a zero width space", ZERO_WIDTH_SPACE_CODE],
  ["a zero width non-joiner", ZERO_WIDTH_NON_JOINER_CODE],
  ["a zero width joiner", ZERO_WIDTH_JOINER_CODE],
  ["a left-to-right mark", LEFT_TO_RIGHT_MARK_CODE],
  ["a right-to-left mark", RIGHT_TO_LEFT_MARK_CODE],
  ["a word joiner", WORD_JOINER_CODE],
  ["a function application", FUNCTION_APPLICATION_CODE],
  ["an invisible times", INVISIBLE_TIMES_CODE],
  ["an invisible separator", INVISIBLE_SEPARATOR_CODE],
  ["an invisible plus", INVISIBLE_PLUS_CODE],
  ["a byte order mark", BYTE_ORDER_MARK_CODE],
];

const BIDI_SPOOFING_CLASS: readonly InvisibleCase[] = [
  ["an arabic letter mark", ARABIC_LETTER_MARK_CODE],
  ["a left-to-right embedding", LEFT_TO_RIGHT_EMBEDDING_CODE],
  ["a right-to-left embedding", RIGHT_TO_LEFT_EMBEDDING_CODE],
  ["a pop directional formatting", POP_DIRECTIONAL_FORMATTING_CODE],
  ["a left-to-right override", LEFT_TO_RIGHT_OVERRIDE_CODE],
  ["a right-to-left override", RIGHT_TO_LEFT_OVERRIDE_CODE],
  ["a left-to-right isolate", LEFT_TO_RIGHT_ISOLATE_CODE],
  ["a right-to-left isolate", RIGHT_TO_LEFT_ISOLATE_CODE],
  ["a first strong isolate", FIRST_STRONG_ISOLATE_CODE],
  ["a pop directional isolate", POP_DIRECTIONAL_ISOLATE_CODE],
];

const WIDER_FORMAT_CLASS: readonly InvisibleCase[] = [
  ["an arabic number sign", ARABIC_NUMBER_SIGN_CODE],
  ["a mongolian vowel separator", MONGOLIAN_VOWEL_SEPARATOR_CODE],
  ["a musical begin beam", MUSICAL_BEGIN_BEAM_CODE],
  ["a language tag", LANGUAGE_TAG_CODE],
  ["a tag latin capital a", TAG_LATIN_CAPITAL_A_CODE],
];

const VISIBLE_CLASS: readonly InvisibleCase[] = [
  ["an ordinary space", SPACE_CODE],
  ["a tab", TAB_CODE],
  ["a line feed", LINE_FEED_CODE],
  ["a non-breaking space", NON_BREAKING_SPACE_CODE],
  ["a nul", NUL_CODE],
];

const WHOLE_FORMAT_CLASS: readonly InvisibleCase[] = [
  ...RETIRED_HAND_LIST,
  ...BIDI_SPOOFING_CLASS,
  ...WIDER_FORMAT_CLASS,
];

const CLEAN_TEXTS: readonly string[] = [
  CYRILLIC_TEXT,
  LATIN_TEXT,
  MIXED_TEXT,
  EMPTY_TEXT,
];

const character = (code: number): string => String.fromCodePoint(code);

const wrap = (code: number, text: string): string =>
  `${character(code)}${text}${character(code)}`;

const interleave = (code: number, text: string): string =>
  text.split(EMPTY_TEXT).join(character(code));

const enclose = (opening: number, closing: number, text: string): string =>
  `${character(opening)}${text}${character(closing)}`;

const run = (code: number): string => character(code).repeat(RUN_LENGTH);

describe("stripInvisibles over the format characters the retired hand-list already carried", () => {
  it.each(RETIRED_HAND_LIST)(
    "strips %s wherever the paste dropped it",
    (_label, code) => {
      expect(stripInvisibles(wrap(code, CYRILLIC_TEXT))).toBe(CYRILLIC_TEXT);
      expect(stripInvisibles(interleave(code, CYRILLIC_TEXT))).toBe(
        CYRILLIC_TEXT
      );
    }
  );
});

describe("stripInvisibles over the bidi class the retired hand-list missed", () => {
  it.each(BIDI_SPOOFING_CLASS)(
    "strips %s, which the hand-listed subset let straight through",
    (_label, code) => {
      expect(stripInvisibles(wrap(code, CYRILLIC_TEXT))).toBe(CYRILLIC_TEXT);
      expect(stripInvisibles(interleave(code, CYRILLIC_TEXT))).toBe(
        CYRILLIC_TEXT
      );
    }
  );

  it("flattens a label that hides a right-to-left override between every letter", () => {
    expect(
      stripInvisibles(interleave(RIGHT_TO_LEFT_OVERRIDE_CODE, MIXED_TEXT))
    ).toBe(MIXED_TEXT);
  });

  it("unwraps a query an isolate pair was wrapped around", () => {
    const isolated = enclose(
      FIRST_STRONG_ISOLATE_CODE,
      POP_DIRECTIONAL_ISOLATE_CODE,
      CYRILLIC_TEXT
    );

    expect(stripInvisibles(isolated)).toBe(CYRILLIC_TEXT);
  });
});

describe("stripInvisibles over the rest of the format class", () => {
  it.each(WIDER_FORMAT_CLASS)(
    "strips %s, which no hand-list would ever have thought to name",
    (_label, code) => {
      expect(stripInvisibles(wrap(code, CYRILLIC_TEXT))).toBe(CYRILLIC_TEXT);
    }
  );

  it("strips an astral tag character whole instead of leaving half a surrogate pair", () => {
    const tagged = `${CYRILLIC_TEXT}${character(TAG_LATIN_CAPITAL_A_CODE)}`;

    expect(stripInvisibles(tagged)).toBe(CYRILLIC_TEXT);
    expect(stripInvisibles(tagged)).toHaveLength(CYRILLIC_TEXT.length);
  });
});

describe("stripInvisibles on input that is nothing but format characters", () => {
  it("returns an empty string when every codepoint in the input is a format character", () => {
    const characters = WHOLE_FORMAT_CLASS.map(([, code]) => character(code));

    expect(stripInvisibles(characters.join(EMPTY_TEXT))).toBe(EMPTY_TEXT);
  });

  it.each(WHOLE_FORMAT_CLASS)(
    "returns an empty string for a run made only of %s",
    (_label, code) => {
      expect(stripInvisibles(run(code))).toBe(EMPTY_TEXT);
    }
  );
});

describe("stripInvisibles on text that must survive untouched", () => {
  it.each(CLEAN_TEXTS)("returns %j unchanged", (text) => {
    expect(stripInvisibles(text)).toBe(text);
  });

  it.each(VISIBLE_CLASS)(
    "keeps %s, which is not a format character and is somebody else's job to normalize",
    (_label, code) => {
      const raw = wrap(code, CYRILLIC_TEXT);

      expect(stripInvisibles(raw)).toBe(raw);
    }
  );

  it("keeps the cyrillic and the punctuation a settlement label is made of", () => {
    const spoofed = enclose(
      ZERO_WIDTH_SPACE_CODE,
      RIGHT_TO_LEFT_ISOLATE_CODE,
      MIXED_TEXT
    );

    expect(stripInvisibles(spoofed)).toBe(MIXED_TEXT);
  });
});
