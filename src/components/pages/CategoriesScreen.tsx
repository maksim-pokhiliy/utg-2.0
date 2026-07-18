"use client";

import Image from "next/image";

import { SectionBand, Typography } from "@root/design-system";
import { CategorySummary } from "@root/data";
import { useDictionary } from "@root/i18n";

import { NavLink } from "@root/components/layout/NavLink";

interface ICategoriesScreenProps {
  categories: CategorySummary[];
}

export default function CategoriesScreen({
  categories,
}: ICategoriesScreenProps) {
  const dictionary = useDictionary();

  return (
    <div className="mx-auto pb-10 md:pb-20">
      <SectionBand
        title={dictionary.shared.merch}
        center
        className="h-[320px] md:h-[500px]"
      />

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

              <Typography
                variant="h2"
                as="span"
                className="block text-center text-ink mt-2"
              >
                <NavLink href={`/category/${category.slug}`}>
                  {category.name}
                </NavLink>
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
