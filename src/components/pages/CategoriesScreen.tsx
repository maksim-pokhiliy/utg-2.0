import Image from "next/image";

import { ICategory } from "@root/types";

interface ICategoriesScreenProps {
  categories: ICategory[];
}

export default function CategoriesScreen({
  categories,
}: ICategoriesScreenProps) {
  return (
    <div className="mx-auto pb-10 md:pb-20">
      <div className="bg-black text-custom-1 text-center py-4 md:py-10 md:py-20 h-[650px] md:h-[720px]">
        <h1 className="uppercase text-3xl md:text-6xl">Merch</h1>

        <p className="text-sm md:text-base mx-auto px-8 md:max-w-[60%] my-10">
          This site was created exclusively as a volunteer project. The idea
          appeared due to numerous requests from subscribers to make merch and
          as another opportunity to collect a resource to cover the needs of the
          under-boss’s special unit.
        </p>

        <p className="text-sm md:text-base mx-auto px-8 md:max-w-[60%] my-10">
          All proceeds from the sale will be used to purchase equipment,
          consumables, and repair equipment. After the start of sales, another
          section with reports will appear here.
        </p>
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
  );
}
