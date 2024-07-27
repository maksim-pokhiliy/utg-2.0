import Image from "next/image";

import { ICategory } from "@root/types";

import LoadingContainer from "@root/components/ui/LoadingContainer";

interface ICategoriesScreenProps {
  isLoading: boolean;
  categories: ICategory[];
}

export default function CategoriesScreen({
  isLoading,
  categories,
}: ICategoriesScreenProps) {
  return (
    <LoadingContainer isLoading={isLoading}>
      <div className="mx-auto pb-10 md:pb-20">
        <div className="bg-black text-custom-1 text-center py-4 md:py-10 md:py-20 h-[320px] md:h-[500px]">
          <h1 className="uppercase text-3xl md:text-6xl">Merch</h1>
        </div>

        <div className="full-w overflow-hidden mx-auto text-center mt-[-200px] md:mt-[-220px] px-10">
          <ul className="grid md:grid-cols-3 gap-8 grid-flow-row">
            {categories.map((category) => (
              <li key={category.id} className="relative group">
                <a
                  href={`/category/${category.id.toLowerCase()}`}
                  className="block h-auto w-full"
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ paddingBottom: "100%" }}
                  >
                    <Image
                      src={category.image}
                      alt={category.title}
                      quality={100}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
                      priority
                      fill
                    />
                  </div>
                </a>

                <span className="font-bold text-2xl md:text-5xl block text-center text-black mt-2">
                  <a href={`/category/${category.id.toLowerCase()}`}>
                    {category.title}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LoadingContainer>
  );
}
