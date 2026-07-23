"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import {
  Badge,
  Button,
  Container,
  Icon,
  Price,
  QuantityStepper,
  SectionBand,
  Separator,
  SizeSelector,
  Typography,
} from "@root/design-system";
import { ProductView } from "@root/data";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import { composeCartLine, useCartStore } from "@root/store/cart";
import { formatPrice } from "@root/utils/formatPrice";

import { NavLink } from "@root/components/layout/NavLink";
import { INSTAGRAM_URL } from "@root/components/layout/nav";

const IMAGE_FRAME =
  "relative aspect-square border-2 border-ink bg-white [&_img]:object-cover";
const IMAGE_FRAME_OUT = `${IMAGE_FRAME} [&_img]:grayscale-[0.45] [&_img]:opacity-70`;
const IMAGE_SIZES = "(min-width: 1200px) 576px, (min-width: 800px) 50vw, 100vw";

interface IProductScreenProps {
  product: ProductView;
  categoryName: string;
}

export default function ProductScreen({
  product,
  categoryName,
}: IProductScreenProps) {
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const addItem = useCartStore((state) => state.addItem);

  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeMissing, setIsSizeMissing] = useState(false);
  const hintId = useId();

  const handleSizeChange = (next: string | null) => {
    setSize(next);
    setIsSizeMissing(false);
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && size === null) {
      setIsSizeMissing(true);

      return;
    }

    addItem(
      composeCartLine({
        slug: product.slug,
        title: product.title,
        size,
        price: product.price,
        quantity,
        image: product.image,
        productUrl: window.location.href,
      })
    );

    setQuantity(1);
    setSize(null);
    setIsSizeMissing(false);
  };

  return (
    <>
      <SectionBand
        title={product.title}
        kickerAsChild
        kicker={
          <NavLink href={`/category/${product.category}`}>
            {`← ${categoryName}`}
          </NavLink>
        }
      />

      <section className="pt-8 pb-24">
        <Container>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-x-12 gap-y-8">
            <div
              className={product.isAvailable ? IMAGE_FRAME : IMAGE_FRAME_OUT}
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                quality={100}
                priority
                sizes={IMAGE_SIZES}
              />
              <Badge
                variant={product.isAvailable ? "in" : "out"}
                className="absolute left-0 top-0"
              >
                {product.isAvailable
                  ? dictionary.category.inStock
                  : dictionary.category.out}
              </Badge>
            </div>

            <div className="flex min-w-0 flex-col gap-6">
              <Price size="big" muted={!product.isAvailable}>
                {formatPrice(product.price, money, locale)}
              </Price>

              {product.sizes && product.sizes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <Typography
                    variant="caption"
                    as="span"
                    className="text-ink-faint"
                  >
                    {dictionary.product.size}
                  </Typography>

                  {product.isAvailable ? (
                    <>
                      <SizeSelector
                        sizes={product.sizes}
                        value={size}
                        onChange={handleSizeChange}
                        ariaLabel={dictionary.product.size}
                        ariaDescribedBy={isSizeMissing ? hintId : undefined}
                      />
                      <Typography
                        variant="caption"
                        as="p"
                        id={hintId}
                        role="status"
                        className="mt-2 text-destructive empty:mt-0"
                      >
                        {isSizeMissing ? dictionary.product.sizeRequired : null}
                      </Typography>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((productSize) => (
                        <Badge key={productSize} variant="out">
                          {productSize}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <Separator weight="hair" />

              {product.isAvailable ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <Typography
                      variant="caption"
                      as="span"
                      className="text-ink-faint"
                    >
                      {dictionary.shared.quantity}
                    </Typography>
                    <QuantityStepper
                      value={quantity}
                      onChange={setQuantity}
                      ariaLabel={dictionary.shared.quantity}
                    />
                  </div>
                  <Button
                    variant="accent"
                    block
                    onClick={handleAddToCart}
                    aria-label={dictionary.product.add}
                  >
                    {dictionary.product.add}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Typography
                    variant="body"
                    as="p"
                    className="max-w-[55ch] text-pretty text-ink-soft"
                  >
                    {dictionary.product.outMessage}
                  </Typography>
                  <Button asChild variant="outline" block>
                    <Link href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                      <Icon name="instagram" size={20} />
                      Instagram
                    </Link>
                  </Button>
                </div>
              )}

              {product.description ? (
                <div className="flex flex-col gap-3 border-t border-line pt-6">
                  <Typography
                    variant="caption"
                    as="span"
                    className="text-ink-faint"
                  >
                    {dictionary.product.description}
                  </Typography>
                  <Typography
                    variant="body"
                    as="p"
                    className="max-w-[55ch] text-pretty text-ink-soft"
                  >
                    {product.description}
                  </Typography>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
