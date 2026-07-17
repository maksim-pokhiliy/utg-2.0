"use client";

import { ReactNode } from "react";
import { MutableSnapshot, RecoilRoot } from "recoil";

import { IMoney } from "@root/utils/formatPrice";
import { dictionaryState, moneyState } from "@root/recoil/atoms";

interface IRecoilProviderProps {
  dictionary: Record<string, Record<string, string>>;
  money: IMoney;
  children: ReactNode;
}

export default function RecoilProvider({
  dictionary,
  money,
  children,
}: IRecoilProviderProps) {
  const initializeState = (snapshot: MutableSnapshot) => {
    snapshot.set(dictionaryState, dictionary);
    snapshot.set(moneyState, money);
  };

  return <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>;
}
