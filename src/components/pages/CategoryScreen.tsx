"use client";

import Image from "next/image";

import { Container, ProductCard, SectionBand } from "@root/design-system";
import { CategoryView } from "@root/data";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { formatPrice } from "@root/utils/formatPrice";
import { formatItemCount } from "@root/utils/plural";

import { NavLink } from "@root/components/layout/NavLink";

const ABOVE_FOLD_IMAGE_COUNT = 3;

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
  const meta =
    formatItemCount(total, locale, dictionary) +
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
            {category.products.map((product, index) => (
              <li key={product.slug}>
                <NavLink
                  href={`/category/${category.slug}/${product.slug}`}
                  aria-label={
                    product.isAvailable
                      ? product.title
                      : `${product.title}, ${dictionary.category.out}`
                  }
                  className="block h-full text-ink no-underline"
                >
                  <ProductCard
                    title={product.title}
                    price={formatPrice(product.price, money, locale)}
                    isAvailable={product.isAvailable}
                    orderLabel={dictionary.category.order}
                    outLabel={dictionary.category.out}
                    className="h-full"
                    media={
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        quality={100}
                        priority={index < ABOVE_FOLD_IMAGE_COUNT}
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
