"use client";

import { useState, type ReactElement } from "react";

import {
  Badge,
  Button,
  Price,
  QuantityStepper,
  Typography,
} from "@root/design-system";
import { ProductView } from "@root/data";
import { formatPrice } from "@root/utils/formatPrice";
import { useCartStore, type ICartItem } from "@root/store/cart";
import { useDictionary, useLocale, useMoney } from "@root/i18n";

interface IProductSidebarProps {
  product: ProductView;
}

export default function ProductSidebar({
  product,
}: IProductSidebarProps): ReactElement {
  const dictionary = useDictionary();
  const money = useMoney();
  const locale = useLocale();

  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    const item: ICartItem = {
      id: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      image: product.image,
      productUrl: window.location.href,
    };

    addItem(item);
    setQuantity(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h2" as="h1">
        {product.title}
      </Typography>

      <div className="flex items-center gap-3">
        <Price size="big">{formatPrice(product.price, money, locale)}</Price>

        {!product.isAvailable ? (
          <Badge variant="out">{dictionary.category.out}</Badge>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Typography variant="caption" as="span">
          {dictionary.shared.quantity}
        </Typography>

        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          ariaLabel={dictionary.shared.quantity}
          disabled={!product.isAvailable}
        />
      </div>

      {product.isAvailable ? (
        <Button
          variant="accent"
          block
          onClick={addToCart}
          aria-label={dictionary.product.add}
        >
          {dictionary.product.add}
        </Button>
      ) : null}
    </div>
  );
}
