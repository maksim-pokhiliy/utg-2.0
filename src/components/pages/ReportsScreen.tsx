"use client";

import Image from "next/image";
import { EffectCreative } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useDictionary } from "@root/i18n";

import "swiper/css";
import "swiper/css/effect-creative";

const images = [
  "/images/reports/report_1.jpg",
  "/images/reports/report_2.jpg",
  "/images/reports/report_3.jpg",
  "/images/reports/report_4.jpg",
  "/images/reports/report_5.jpg",
  "/images/reports/report_6.jpg",
  "/images/reports/report_7.jpg",
  "/images/reports/report_8.jpg",
];

export default function ReportsScreen() {
  const dictionary = useDictionary();

  return (
    <div className="mx-auto pb-10 md:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 md:py-10">
        <h1 className="font-bold uppercase text-3xl md:text-6xl">
          {dictionary.shared.reports}
        </h1>
      </div>

      <div className="p-10 sm:px-14">
        <Swiper
          effect="creative"
          modules={[EffectCreative]}
          creativeEffect={{
            prev: {
              shadow: true,
              translate: ["-120%", 0, -500],
            },
            next: {
              shadow: true,
              translate: ["120%", 0, -500],
            },
          }}
          grabCursor
        >
          {images.map((image, index) => (
            <SwiperSlide key={image}>
              <div
                className="relative w-full overflow-hidden"
                style={{ paddingBottom: "100%" }}
              >
                <Image
                  src={image}
                  alt={`Report ${index + 1}`}
                  quality={100}
                  className="absolute inset-0 w-full h-full object-cover"
                  priority
                  fill
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
