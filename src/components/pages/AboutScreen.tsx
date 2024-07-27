"use client";

import Image from "next/image";

export default function AboutScreen() {
  return (
    <div className="mx-auto pb-10 md:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 md:py-10">
        <h1 className="uppercase text-3xl md:text-6xl">about</h1>
      </div>

      <div className="p-10 sm:px-14">
        <p className="text-sm md:text-base">
          This site was created exclusively as a volunteer project. The idea
          appeared due to numerous requests from subscribers to make merch and
          as another opportunity to collect a resource to cover the needs of the
          under-boss’s special unit.
        </p>

        <p className="text-sm md:text-base mt-10">
          All proceeds from the sale will be used to purchase equipment,
          consumables, and repair equipment. After the start of sales, another
          section with reports will appear here.
        </p>

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
