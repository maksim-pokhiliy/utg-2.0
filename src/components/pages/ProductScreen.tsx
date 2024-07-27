import Image from "next/image";

import { IProduct } from "@root/types";
import LoadingContainer from "../ui/LoadingContainer";

interface IProductScreenProps {
  isLoading: boolean;
  product: IProduct | null;
}

export default function ProductScreen({
  isLoading,
  product,
}: IProductScreenProps) {
  return (
    <LoadingContainer isLoading={isLoading}>
      <div className="mx-auto px-10 my-12">
        {product ? (
          <div className="full-w overflow-hidden max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="box-border flex flex-col basis-1/2 group">
                <div className="h-100 max-w-xl">
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ paddingBottom: "100%" }}
                  >
                    <Image
                      src={product.image}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
                      quality={100}
                      priority
                      fill
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full h-full basis-1/2 text-left">
                {/* <ProductSidebar product={product} /> */}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-3xl w-full text-center p-9 box-border max-w-4xl mx-auto">
            Product Not Found
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}
