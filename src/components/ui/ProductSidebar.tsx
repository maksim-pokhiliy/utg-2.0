"use client";

import { useState } from "react";

import { ProductView } from "@root/data";
import { formatPrice } from "@root/utils/formatPrice";
import { useCartStore, type ICartItem } from "@root/store/cart";
import { useDictionary, useLocale, useMoney } from "@root/i18n";
import QuantityStepper from "@root/components/ui/QuantityStepper";

interface IProductSidebarProps {
  product: ProductView;
}

export default function ProductSidebar({ product }: IProductSidebarProps) {
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
    <div className="mb-6">
      <h2 className="max-w-full w-full leading-extra-loose text-3xl tracking-wide leading-8 py-1 mt-4">
        {product.title}
      </h2>

      <p className="text-md font-semibold inline-block tracking-wide py-1">
        {formatPrice(product.price, money, locale)}
      </p>

      <div className="mt-4 mb-6">
        <span className="text-xs tracking-wide">
          {dictionary.shared.quantity}
        </span>

        <div className="mt-2">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            ariaLabel={dictionary.shared.quantity}
            disabled={!product.isAvailable}
          />
        </div>
      </div>

      {product.isAvailable ? (
        <div>
          <button
            aria-label={dictionary.product.add}
            className="btn-main w-full my-1 rounded-2xl"
            type="button"
            onClick={addToCart}
          >
            {dictionary.product.add}
          </button>
        </div>
      ) : null}
    </div>
  );
}
