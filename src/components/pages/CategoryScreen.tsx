import { useRecoilValue } from "recoil";
import Image from "next/image";

import { ICategory } from "@root/types";
import { formatPrice } from "@root/utils/formatPrice";

import {
  dictionaryState,
  exchangeCoefficientState,
  languageState,
} from "@root/recoil/atoms";

import LoadingContainer from "@root/components/ui/LoadingContainer";
import { NavLink } from "@root/components/layout/NavBar/NavLink";

interface ICategoryScreenProps {
  isLoading: boolean;
  category: ICategory | null;
}

export default function CategoryScreen({
  isLoading,
  category,
}: ICategoryScreenProps) {
  const dictionary = useRecoilValue(dictionaryState);
  const coefficient = useRecoilValue(exchangeCoefficientState);
  const locale = useRecoilValue(languageState);

  return (
    <LoadingContainer isLoading={isLoading}>
      <div className="mx-auto pb-10 md:pb-20">
        <div className="bg-black text-custom-1 text-center py-4 md:py-10 md:py-20 h-[320px] md:h-[500px]">
          <h1 className="font-bold uppercase text-3xl md:text-6xl">
            {dictionary?.categories[category?.title ?? ""]}
          </h1>
        </div>

        <div className="full-w overflow-hidden mx-auto text-center mt-[-200px] md:mt-[-220px] px-10">
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 grid-flow-row">
            {category?.products.map((product) => {
              return (
                <li key={product.id} className="relative group">
                  <NavLink
                    className="block h-auto w-full"
                    href={`/category/${category.id.toLowerCase()}/${
                      product.id
                    }`}
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

                    {product.availability ? (
                      <span className="btn-main absolute -mt-10 left-0 cursor-pointer">
                        {dictionary?.category.order}
                      </span>
                    ) : (
                      <span className="btn-main absolute -mt-10 left-0 cursor-pointer">
                        {dictionary?.category.out}
                      </span>
                    )}

                    <div className="p-2 text-left">
                      <span>{product.title}</span>

                      <br />

                      <span className="text-xs">
                        {formatPrice(product.price * coefficient, locale)}
                      </span>
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </LoadingContainer>
  );
}
