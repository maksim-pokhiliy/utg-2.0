"use client";

import { useRecoilValue } from "recoil";
import Image from "next/image";

import { CategoryView } from "@root/data";
import { dictionaryState } from "@root/recoil/atoms";

import { NavLink } from "@root/components/layout/NavBar/NavLink";

interface ICategoriesScreenProps {
  categories: CategoryView[];
}

export default function CategoriesScreen({
  categories,
}: ICategoriesScreenProps) {
  const dictionary = useRecoilValue(dictionaryState);

  return (
    <div className="mx-auto pb-10 md:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 md:py-10 md:py-20 h-[320px] md:h-[500px]">
        <h1 className="font-bold uppercase text-3xl md:text-6xl">
          {dictionary?.shared.merch}
        </h1>
      </div>

      <div className="full-w overflow-hidden mx-auto text-center mt-[-200px] md:mt-[-220px] px-10">
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 grid-flow-row">
          {categories.map((category) => (
            <li key={category.slug} className="relative group">
              <NavLink
                href={`/category/${category.slug}`}
                className="block h-auto w-full"
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ paddingBottom: "100%" }}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    quality={100}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
                    priority
                    fill
                  />
                </div>
              </NavLink>

              <span className="font-bold text-2xl md:text-5xl block text-center text-black mt-2">
                <NavLink href={`/category/${category.slug}`}>
                  {category.name}
                </NavLink>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
