"use client";

import Image from "next/image";

import { Container, SectionBand, Typography } from "@root/design-system";
import { useDictionary } from "@root/i18n";

import { NavLink } from "@root/components/layout/NavLink";

const REPORTS_LINK_TOKEN = "{link}";
const IMAGE_SIZES = "(min-width: 568px) 520px, calc(100vw - 48px)";
const IMAGE_ALT = "FOR DONATIONS · NO COMMERCIAL · @UKRAINIAN_TACTICAL_GEAR";

const splitAtToken = (text: string): [string, string] | null => {
  const tokenStart = text.indexOf(REPORTS_LINK_TOKEN);

  if (tokenStart === -1) {
    return null;
  }

  return [
    text.slice(0, tokenStart),
    text.slice(tokenStart + REPORTS_LINK_TOKEN.length),
  ];
};

export default function AboutScreen() {
  const dictionary = useDictionary();

  const segments = splitAtToken(dictionary.about.all_proceeds);

  return (
    <>
      <SectionBand title={dictionary.shared.about} />

      <section className="pt-8 pb-24">
        <Container>
          <div className="flex max-w-[760px] flex-col gap-6">
            <Typography variant="body" as="p" className="text-pretty">
              {dictionary.about.site_created}
            </Typography>

            <Typography variant="body" as="p" className="text-pretty">
              {segments === null ? (
                dictionary.about.all_proceeds
              ) : (
                <>
                  {segments[0]}
                  <NavLink href="/reports" className="text-flag-blue">
                    {dictionary.about.reports_link}
                  </NavLink>
                  {segments[1]}
                </>
              )}
            </Typography>

            <div className="relative mt-2 aspect-square w-full max-w-[520px] border-2 border-ink bg-white">
              <Image
                src="/images/no_commercial.JPG"
                alt={IMAGE_ALT}
                fill
                quality={100}
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
