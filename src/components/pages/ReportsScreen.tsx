"use client";

import Image from "next/image";

import { Container, SectionBand, Typography } from "@root/design-system";
import { useDictionary } from "@root/i18n";

const REPORT_COUNT = 8;
const FPV_REPORT_NUMBER = 3;
const IMAGE_SIZES = [
  "(min-width: 1200px) 347px",
  "(min-width: 940px) calc(33.33vw - 53px)",
  "(min-width: 768px) calc(50vw - 68px)",
  "(min-width: 592px) calc(50vw - 36px)",
  "calc(100vw - 48px)",
].join(", ");

const formatIndex = (value: number): string => String(value).padStart(2, "0");

export default function ReportsScreen() {
  const dictionary = useDictionary();

  const reports = Array.from({ length: REPORT_COUNT }, (_, position) => {
    const number = position + 1;

    return {
      image: `/images/reports/report_${number}.jpg`,
      index: formatIndex(number),
      caption:
        number === FPV_REPORT_NUMBER ? dictionary.reports.fpv_caption : null,
    };
  });

  return (
    <>
      <SectionBand
        title={dictionary.shared.reports}
        meta={`${formatIndex(1)}–${formatIndex(REPORT_COUNT)}`}
      />

      <section className="pt-8 pb-24">
        <Container>
          <div className="flex flex-col gap-8">
            <Typography
              variant="body"
              as="p"
              className="max-w-[46ch] text-pretty text-ink-soft"
            >
              {dictionary.reports.intro}
            </Typography>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-6">
              {reports.map((report) => (
                <figure key={report.image} className="flex flex-col gap-3">
                  <div className="relative aspect-square border-2 border-ink bg-white">
                    <Image
                      src={report.image}
                      alt=""
                      fill
                      quality={100}
                      sizes={IMAGE_SIZES}
                      className="object-cover"
                    />
                  </div>

                  <figcaption className="flex items-baseline gap-3">
                    <Typography
                      variant="caption"
                      as="span"
                      className="flex-none text-ink-faint"
                    >
                      {report.index}
                    </Typography>

                    {report.caption ? (
                      <Typography
                        variant="caption"
                        as="span"
                        className="text-pretty"
                      >
                        {report.caption}
                      </Typography>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
