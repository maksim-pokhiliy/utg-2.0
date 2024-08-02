"use client";

import { useRecoilValue } from "recoil";
import Image from "next/image";

import { dictionaryState } from "@root/recoil/atoms";

export default function AboutScreen() {
  const dictionary = useRecoilValue(dictionaryState);

  return (
    <div className="mx-auto pb-10 md:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 md:py-10">
        <h1 className="font-bold uppercase text-3xl md:text-6xl">
          {dictionary.about}
        </h1>
      </div>

      <div className="p-10 sm:px-14">
        <p className="text-sm md:text-base">{dictionary.site_created}</p>

        <p className="text-sm md:text-base mt-10">{dictionary.all_proceeds}</p>

        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: "100%" }}
        >
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Fno_commercial.a708a4a2d69ed1a61c22.jpg?alt=media&token=d33f7fa1-10b2-4d1b-8fd5-b7e0a3976d1f"
            alt="no commercial"
            quality={100}
            className="absolute inset-0 w-full h-full object-cover mt-10"
            priority
            fill
          />
        </div>
      </div>
    </div>
  );
}
