"use client";

import Image from "next/image";

import { Container, ProductCard, SectionBand } from "@root/design-system";
import { CategoryView } from "@root/data";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { formatPrice } from "@root/utils/formatPrice";
import { formatCount } from "@root/utils/plural";

import { NavLink } from "@root/components/layout/NavLink";

interface ICategoryScreenProps {
  category: CategoryView;
}

export default function CategoryScreen({ category }: ICategoryScreenProps) {
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const total = category.products.length;
  const isAnyAvailable = category.products.some(
    (product) => product.isAvailable
  );

  const itemForms = {
    one: dictionary.category.itemOne,
    few: dictionary.category.itemFew,
    many: dictionary.category.itemMany,
  };
  const meta =
    formatCount(total, locale, itemForms) +
    (isAnyAvailable ? "" : ` · ${dictionary.category.out}`);

  return (
    <>
      <SectionBand
        title={category.name}
        meta={meta}
        kickerAsChild
        kicker={
          <NavLink href="/category">{`← ${dictionary.shared.merch}`}</NavLink>
        }
      />

      <section className="pt-8 pb-24">
        <Container>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-6">
            {category.products.map((product) => (
              <li key={product.slug}>
                <NavLink
                  href={`/category/${category.slug}/${product.slug}`}
                  aria-label={product.title}
                  className="block text-ink no-underline"
                >
                  <ProductCard
                    title={product.title}
                    price={formatPrice(product.price, money, locale)}
                    isAvailable={product.isAvailable}
                    orderLabel={dictionary.category.order}
                    outLabel={dictionary.category.out}
                    media={
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        quality={100}
                        loading="lazy"
                        sizes="(min-width: 1200px) 288px, (min-width: 768px) 33vw, (min-width: 480px) 50vw, 100vw"
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
