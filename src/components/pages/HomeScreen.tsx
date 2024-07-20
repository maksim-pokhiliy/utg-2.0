import { LinkProps } from "next/link";
import Image from "next/image";

import { ICategory } from "@root/types";

import { NavLink } from "@root/components/layout/NavBar/NavLink";

interface IHomeScreenProps {
  categories: ICategory[];
}

const StyledNavLink = ({
  isActive,
  className,
  ...linkProps
}: LinkProps & {
  isActive: boolean;
  target?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <NavLink
    className={`${className ?? ""} ${"text-gray-700 hover:text-gray-500"}`}
    {...linkProps}
  />
);

export default function HomeScreen({ categories }: IHomeScreenProps) {
  return (
    <div className="mx-auto relative">
      <div className="relative">
        <div className="flex sm:flex-row flex-col bg-zinc-900 pb-20">
          <div className="basis-1/2 text-center sm:text-left relative">
            <div className="px-10 sm:px-14 py-6 bg-site">
              <h1 className="text-5xl sm:text-[80px] 2xl:text-[120px] leading-none animate-fade-in pb-6">
                UKRAINIAN
                <br /> TACTICAL
                <br /> GEAR
              </h1>

              <div className="flex text-gray-700 gap-4 justify-center sm:justify-start">
                <StyledNavLink
                  className="text-lg"
                  isActive={false}
                  href="https://www.instagram.com/ukrainian_tactical_gear/"
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-5 h-5"
                  >
                    <path
                      fill="currentColor"
                      d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                    />
                  </svg>
                </StyledNavLink>
              </div>
            </div>
          </div>

          <div className="basis-1/2 pt-20 sm:pt-0">
            <Image
              style={{ objectFit: "cover", objectPosition: "start" }}
              className="w-full max-h-[500px] overflow-hidden px-10 sm:px-0"
              src="https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/hero%2Futg-hero-3.JPG?alt=media&token=fe0afb92-8c0f-44fc-8c0d-0a5fbfe6a2a5"
              alt="UTG"
              quality={100}
              width={1000}
              height={1000}
              priority
            />
          </div>
        </div>

        <Image
          className="absolute inset-x-2/4 -translate-x-2/4 -translate-y-[20%] bottom-0 top-[30%] hidden sm:block"
          src="https://firebasestorage.googleapis.com/v0/b/ukrainian-tactical-gear.appspot.com/o/IMG-0253.PNG?alt=media&token=b2855721-c087-4bea-bdb9-0345dcf8b57f"
          alt="UTG"
          quality={100}
          width={320}
          height={320}
          priority
        />
      </div>

      <div className="px-10 pb-10">
        <div className="text-custom-1 text-center sm:text-left pt-10 sm:py-20 basis-1/2">
          <h1 className="uppercase text-4xl sm:text-6xl text-center sm:text-left text-black mb-4">
            Merch
          </h1>

          <a
            href="/categories"
            className="btn-main rounded-2xl text-base px-8 py-2.5 inline-block"
          >
            Get Merch
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-14">
            {categories.map((category) => (
              <div key={category.id} className="mt-10 group">
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

                <span className="font-bold text-2xl sm:text-5xl block text-center text-black mt-4">
                  <a href={`/category/${category.id.toLowerCase()}`}>
                    {category.title}
                  </a>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
