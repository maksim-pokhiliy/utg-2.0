"use client";

import Image from "next/image";

import { CategoryTile, Container, SectionBand } from "@root/design-system";
import { CategorySummary } from "@root/data";
import { useDictionary, useLocale } from "@root/i18n";
import { formatCount } from "@root/utils/plural";

import { NavLink } from "@root/components/layout/NavLink";

interface ICategoriesScreenProps {
  categories: CategorySummary[];
}

export default function CategoriesScreen({
  categories,
}: ICategoriesScreenProps) {
  const dictionary = useDictionary();
  const locale = useLocale();

  const itemForms = {
    one: dictionary.category.itemOne,
    few: dictionary.category.itemFew,
    many: dictionary.category.itemMany,
  };

  return (
    <>
      <SectionBand
        title={dictionary.shared.merch}
        meta={dictionary.main.counter}
      />

      <section className="pt-8 pb-24">
        <Container>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-6">
            {categories.map((category, index) => (
              <li key={category.slug}>
                <NavLink
                  href={`/category/${category.slug}`}
                  className="block text-ink no-underline"
                >
                  <CategoryTile
                    index={index + 1}
                    name={category.name}
                    meta={{
                      count: formatCount(category.count, locale, itemForms),
                      availability: category.isAnyAvailable
                        ? dictionary.category.inStock
                        : dictionary.category.out,
                    }}
                    media={
                      <Image
                        src={category.image}
                        alt=""
                        fill
                        quality={100}
                        loading="lazy"
                        sizes="(min-width: 1200px) 360px, (min-width: 880px) 33vw, (min-width: 552px) 46vw, 100vw"
                      />
                    }
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
