"use client";

import { ReactNode } from "react";
import { MutableSnapshot, RecoilRoot } from "recoil";

import { currencyMap } from "@root/utils/formatPrice";

import {
  dictionaryState,
  exchangeCoefficientState,
} from "@root/recoil/atoms";

interface IRecoilProviderProps {
  lang: keyof typeof currencyMap;
  dictionary: Record<string, Record<string, string>>;
  exchangeRates: Record<string, number>;
  children: ReactNode;
}

export default function RecoilProvider({
  lang,
  dictionary,
  exchangeRates,
  children,
}: IRecoilProviderProps) {
  const initializeState = (snapshot: MutableSnapshot) => {
    const currency = currencyMap[lang];
    const rate = exchangeRates[currency];
    const coefficient = Number.isFinite(rate) ? rate : 1;

    snapshot.set(dictionaryState, dictionary);
    snapshot.set(exchangeCoefficientState, coefficient);
  };

  return <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>;
}
