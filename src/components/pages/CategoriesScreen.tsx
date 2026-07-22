"use client";

import Image from "next/image";

import { CategoryTile, Container, SectionBand } from "@root/design-system";
import { CategorySummary } from "@root/data";
import { useDictionary, useLocale } from "@root/i18n";
import { formatCategoryCount, formatItemCount } from "@root/utils/plural";

import { NavLink } from "@root/components/layout/NavLink";

const ABOVE_FOLD_IMAGE_COUNT = 3;

interface ICategoriesScreenProps {
  categories: CategorySummary[];
}

export default function CategoriesScreen({
  categories,
}: ICategoriesScreenProps) {
  const dictionary = useDictionary();
  const locale = useLocale();

  return (
    <>
      <SectionBand
        title={dictionary.shared.merch}
        meta={formatCategoryCount(categories.length, locale, dictionary)}
      />

      <section className="pt-8 pb-24">
        <Container>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-6">
            {categories.map((category, index) => {
              const count = formatItemCount(category.count, locale, dictionary);
              const availability = category.isAnyAvailable
                ? dictionary.category.inStock
                : dictionary.category.out;

              return (
                <li key={category.slug}>
                  <NavLink
                    href={`/category/${category.slug}`}
                    aria-label={`${category.name}, ${count}, ${availability}`}
                    className="block h-full text-ink no-underline"
                  >
                    <CategoryTile
                      index={index + 1}
                      name={category.name}
                      meta={{ count, availability }}
                      className="h-full"
                      media={
                        <Image
                          src={category.image}
                          alt=""
                          fill
                          quality={100}
                          priority={index < ABOVE_FOLD_IMAGE_COUNT}
                          sizes="(min-width: 1200px) 360px, (min-width: 880px) 33vw, (min-width: 552px) 46vw, 100vw"
                        />
                      }
                    />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>
    </>
  );
}
