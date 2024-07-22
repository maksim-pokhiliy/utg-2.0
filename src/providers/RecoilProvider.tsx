"use client";

import { ReactNode } from "react";
import { RecoilRoot } from "recoil";

interface IRecoilProviderProps {
  children: ReactNode;
}

export default function RecoilProvider({ children }: IRecoilProviderProps) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
