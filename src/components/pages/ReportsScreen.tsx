"use client";

import Image from "next/image";
import { EffectCreative } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRecoilValue } from "recoil";

import { dictionaryState } from "@root/recoil/atoms";

import "swiper/css";
import "swiper/css/effect-creative";

const images = [
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_1.490b77553fa71db75004.jpg?alt=media&token=1c46a03e-8c1f-4a3e-b3e5-d79b2d8a30dc",
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_2.6899a30dbbf51873af5b.jpg?alt=media&token=537ed6ae-d515-456a-abe2-fba4986da12b",
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_3.ac90132f08c6b105bebd.jpg?alt=media&token=172f3fb5-348c-4e57-9d52-dbb79c569b84",
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_4.5e13824515eaa522d3bd.jpg?alt=media&token=ac01c2ba-4201-458e-8a73-3f8d390c6e5c",
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_5.fed4bcdbb21b289d6b2d.jpg?alt=media&token=2d3eb555-8225-46af-b737-cc774910b5d0",
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_6.ed39830bfbe15bc5c469.jpg?alt=media&token=828d5ff3-4184-416e-974c-c4724cf5ef05",
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_7.2545dc668e8c5bfbe4d0.jpg?alt=media&token=4039553f-1b04-4e8a-96b7-76d6697a5829",
  "https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/reports%2Freport_8.b58e8b3f49d42b93dff2.jpg?alt=media&token=0cab1ab2-36dc-4cbf-b883-c0a9a58255d4",
];

export default function ReportsScreen() {
  const dictionary = useRecoilValue(dictionaryState);

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
