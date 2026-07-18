import Image from "next/image";

import { Container, Typography } from "@root/design-system";
import { ProductView } from "@root/data";
import ProductSidebar from "@root/components/product/ProductSidebar";

interface IProductScreenProps {
  product: ProductView;
}

export default function ProductScreen({ product }: IProductScreenProps) {
  return (
    <Container className="py-12">
      <div className="full-w overflow-hidden max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-10">
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
            <ProductSidebar product={product} />

            {product.description ? (
              <Typography variant="body" className="mt-2">
                {product.description}
              </Typography>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
