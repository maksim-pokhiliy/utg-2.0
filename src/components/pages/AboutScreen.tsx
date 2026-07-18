"use client";

import Image from "next/image";

import { Container, SectionBand, Typography } from "@root/design-system";
import { useDictionary } from "@root/i18n";

export default function AboutScreen() {
  const dictionary = useDictionary();

  return (
    <div className="pb-10 md:pb-20">
      <SectionBand title={dictionary.shared.about} center />

      <Container className="py-10">
        <Typography variant="body">{dictionary.about.site_created}</Typography>

        <Typography variant="body" className="mt-10">
          {dictionary.about.all_proceeds}
        </Typography>

        <div
          className="relative w-full overflow-hidden mt-10"
          style={{ paddingBottom: "100%" }}
        >
          <Image
            src="/images/no_commercial.JPG"
            alt="no commercial"
            quality={100}
            className="absolute inset-0 w-full h-full object-cover mt-10"
            priority
            fill
          />
        </div>
      </Container>
    </div>
  );
}
