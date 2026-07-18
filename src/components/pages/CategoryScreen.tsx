"use client";

import Image from "next/image";

import { Badge, Price, SectionBand, Typography } from "@root/design-system";
import { CategoryView } from "@root/data";
import { formatPrice } from "@root/utils/formatPrice";
import { useDictionary, useLocale, useMoney } from "@root/i18n";

import { NavLink } from "@root/components/layout/NavLink";

interface ICategoryScreenProps {
  category: CategoryView;
}

export default function CategoryScreen({ category }: ICategoryScreenProps) {
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  return (
    <div className="mx-auto pb-10 md:pb-20">
      <SectionBand
        title={category.name}
        center
        className="h-[320px] md:h-[500px]"
      />

      <div className="full-w overflow-hidden mx-auto text-center mt-[-200px] md:mt-[-220px] px-10">
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 grid-flow-row">
          {category.products.map((product) => (
            <li key={product.slug} className="relative group">
              <NavLink
                className="block h-auto w-full"
                href={`/category/${category.slug}/${product.slug}`}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ paddingBottom: "100%" }}
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    quality={100}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
                    priority
                    fill
                  />
                </div>
              </NavLink>

              {product.isAvailable ? (
                <Badge variant="in" className="absolute -mt-10 left-0">
                  {dictionary.category.order}
                </Badge>
              ) : (
                <Badge variant="out" className="absolute -mt-10 left-0">
                  {dictionary.category.out}
                </Badge>
              )}

              <div className="p-2 text-left">
                <Typography variant="body" as="span">
                  {product.title}
                </Typography>

                <br />

                <Price>{formatPrice(product.price, money, locale)}</Price>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
