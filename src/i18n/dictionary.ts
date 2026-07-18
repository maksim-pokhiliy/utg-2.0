import en from "@root/app/[lang]/dictionaries/en.json";

export type Dictionary = {
  [Section in keyof typeof en]: {
    [Key in keyof (typeof en)[Section]]: string;
  };
};
