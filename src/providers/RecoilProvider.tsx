"use client";

import { ReactNode } from "react";
import { MutableSnapshot, RecoilRoot } from "recoil";

import { currencyMap } from "@root/utils/formatPrice";

import {
  dictionaryState,
  exchangeCoefficientState,
  exchangeRatesState,
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
    const coefficient = exchangeRates[currency];

    snapshot.set(dictionaryState, dictionary);
    snapshot.set(exchangeRatesState, exchangeRates);
    snapshot.set(exchangeCoefficientState, coefficient);
  };

  return <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>;
}
