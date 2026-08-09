const INVISIBLES = /\p{Cf}/gu;

export const stripInvisibles = (raw: string): string =>
  raw.replace(INVISIBLES, "");
