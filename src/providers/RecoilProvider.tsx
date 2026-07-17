"use client";

import { ReactNode } from "react";
import { MutableSnapshot, RecoilRoot } from "recoil";

import { currencyMap, IMoney } from "@root/utils/formatPrice";

import {
  dictionaryState,
  languageState,
  moneyState,
} from "@root/recoil/atoms";

interface IRecoilProviderProps {
  lang: keyof typeof currencyMap;
  dictionary: Record<string, Record<string, string>>;
  money: IMoney;
  children: ReactNode;
}

export default function RecoilProvider({
  lang,
  dictionary,
  money,
  children,
}: IRecoilProviderProps) {
  const initializeState = (snapshot: MutableSnapshot) => {
    snapshot.set(languageState, lang);
    snapshot.set(dictionaryState, dictionary);
    snapshot.set(moneyState, money);
  };

  return <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>;
}
