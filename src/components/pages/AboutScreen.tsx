"use client";

import Image from "next/image";

import { useDictionary } from "@root/i18n";

export default function AboutScreen() {
  const dictionary = useDictionary();

  return (
    <div className="mx-auto pb-10 md:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 md:py-10">
        <h1 className="font-bold uppercase text-3xl md:text-6xl">
          {dictionary.shared.about}
        </h1>
      </div>

      <div className="p-10 sm:px-14">
        <p className="text-sm md:text-base">{dictionary.about.site_created}</p>

        <p className="text-sm md:text-base mt-10">
          {dictionary.about.all_proceeds}
        </p>

        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: "100%" }}
        >
          <Image
            src="/images/no_commercial.JPG"
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
