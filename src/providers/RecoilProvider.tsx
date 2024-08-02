"use client";

import { dictionaryState } from "@root/recoil/atoms";
import { ReactNode } from "react";
import { RecoilRoot } from "recoil";

interface IRecoilProviderProps {
  dictionary: Record<string, string>;
  children: ReactNode;
}

export default function RecoilProvider({
  dictionary,
  children,
}: IRecoilProviderProps) {
  return (
    <RecoilRoot initializeState={({ set }) => set(dictionaryState, dictionary)}>
      {children}
    </RecoilRoot>
  );
}
