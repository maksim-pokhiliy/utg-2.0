"use client";

import Image from "next/image";

import {
  Button,
  CategoryTile,
  Container,
  Icon,
  IconLink,
  Separator,
  Typography,
} from "@root/design-system";
import { CategorySummary } from "@root/data";
import { useDictionary } from "@root/i18n";

import { NavLink } from "@root/components/layout/NavLink";
import { INSTAGRAM_URL } from "@root/components/layout/nav";

interface IHomeScreenProps {
  categories: CategorySummary[];
}

export default function HomeScreen({ categories }: IHomeScreenProps) {
  const dictionary = useDictionary();

  return (
    <>
      <section className="pt-[clamp(var(--space-7),7vw,var(--space-9))] pb-12">
        <Container>
          <div className="relative">
            <Typography variant="hero">
              Ukrainian
              <br />
              Tactical
              <br />
              Gear
            </Typography>
            <Image
              className="absolute right-0 bottom-1 h-auto w-[clamp(120px,26vw,300px)]"
              src="/logo.png"
              alt="UTG"
              width={300}
              height={210}
              priority
            />
          </div>

          <Separator weight="heavy" className="mt-6" />

          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pt-6">
            <div className="grow basis-[300px]">
              <Typography variant="caption" as="p" className="mb-2 text-ink">
                {dictionary.main.stamp}
              </Typography>
              <Typography
                variant="body"
                className="max-w-[46ch] text-pretty text-ink-soft"
              >
                {dictionary.main.mission}
              </Typography>
            </div>

            <div className="flex flex-none flex-wrap items-center gap-x-6 gap-y-4">
              <Button asChild variant="accent" className="w-[220px]">
                <NavLink href="#merch">
                  {dictionary.main.get}
                  <Icon name="arrow-right" size={20} />
                </NavLink>
              </Button>
              <IconLink
                href={INSTAGRAM_URL}
                external
                label="Instagram"
                aria-label="Instagram"
              >
                <Icon name="instagram" size={20} className="size-[18px]" />
              </IconLink>
            </div>
          </div>
        </Container>
      </section>

      <section id="merch" className="bg-band py-8 text-band-foreground">
        <Container className="flex flex-wrap items-baseline justify-between gap-4">
          <Typography variant="h2">{dictionary.shared.merch}</Typography>
          <Typography variant="caption" as="span" className="text-band-muted">
            {dictionary.main.counter}
          </Typography>
        </Container>
      </section>

      <section className="pt-8 pb-24">
        <Container>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-6">
            {categories.map((category, index) => (
              <li key={category.slug}>
                <NavLink
                  href={`/category/${category.slug}`}
                  aria-label={category.name}
                  className="group block text-ink no-underline"
                >
                  <CategoryTile
                    index={index + 1}
                    name={category.name}
                    media={
                      <Image
                        src={category.image}
                        alt=""
                        fill
                        sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    }
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
