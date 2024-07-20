import Image from "next/image";

import { ICategory } from "@root/types";

interface IHomeScreenProps {
  category: ICategory | null;
}

export default function CategoryScreen({ category }: IHomeScreenProps) {
  return (
    <div className="mx-auto pb-10 md:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 md:py-10 md:py-20 h-[320px] md:h-[500px]">
        <h1 className="uppercase text-3xl md:text-6xl">{category?.title}</h1>
      </div>

      <div className="full-w overflow-hidden mx-auto text-center mt-[-200px] md:mt-[-220px] px-10">
        <ul className="grid md:grid-cols-3 gap-8 grid-flow-row">
          {category?.products.map((product) => {
            return (
              <li key={product.id} className="relative group">
                <a
                  href={`/product/${product.id}`}
                  className="block h-auto w-full"
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
                    <a
                      className="btn-main absolute -mt-10 left-0 cursor-pointer"
                      href={`/product/${product.id}`}
                    >
                      Buy Now
                    </a>
                  ) : (
                    <button
                      className="btn-main absolute -mt-10 left-0 cursor-pointer"
                      disabled
                    >
                      Out of Stock
                    </button>
                  )}

                  <div className="p-2 text-left">
                    <span>{product.title}</span>
                    <br />
                    <span className="text-xs">{product.price}</span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
