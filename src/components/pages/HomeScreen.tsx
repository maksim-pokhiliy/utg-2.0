"use client";

import Image from "next/image";

import { Button, Container, Icon, Typography } from "@root/design-system";
import { CategorySummary } from "@root/data";
import { useDictionary } from "@root/i18n";

import { NavLink } from "@root/components/layout/NavLink";

interface IHomeScreenProps {
  categories: CategorySummary[];
}

export default function HomeScreen({ categories }: IHomeScreenProps) {
  const dictionary = useDictionary();

  return (
    <div className="mx-auto relative">
      <div className="relative">
        <div className="flex sm:flex-row flex-col bg-ink pb-20">
          <div className="basis-1/2 text-center sm:text-left relative">
            <div className="px-10 sm:px-14 py-6 bg-background">
              <Typography variant="hero" className="animate-fade-in pb-6">
                UKRAINIAN
                <br /> TACTICAL
                <br /> GEAR
              </Typography>

              <div className="flex text-ink-soft gap-4 justify-center sm:justify-start">
                <a
                  href="https://www.instagram.com/ukrainian_tactical_gear/"
                  target="_blank"
                >
                  <Icon name="instagram" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <Image
          className="absolute inset-x-2/4 -translate-x-2/4 -translate-y-[20%] bottom-0 top-[30%] hidden sm:block"
          src="/logo.png"
          alt="UTG"
          quality={100}
          width={320}
          height={320}
          priority
        />
      </div>

      <Container className="pb-10">
        <div className="text-paper text-center sm:text-left pt-10 sm:py-20 basis-1/2">
          <Typography
            variant="h1"
            className="text-center sm:text-left text-ink mb-4"
          >
            {dictionary.shared.merch}
          </Typography>

          <Button asChild variant="accent">
            <NavLink href="/category">{dictionary.main.get}</NavLink>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-14">
            {categories.map((category) => (
              <div key={category.slug} className="mt-10 group">
                <NavLink
                  href={`/category/${category.slug}`}
                  className="block h-auto w-full"
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ paddingBottom: "100%" }}
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      quality={100}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
                      priority
                      fill
                    />
                  </div>
                </NavLink>

                <Typography
                  variant="h2"
                  as="span"
                  className="block text-center text-ink mt-4"
                >
                  <NavLink href={`/category/${category.slug}`}>
                    {category.name}
                  </NavLink>
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
