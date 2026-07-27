"use client";

import Image from "next/image";
import { useState } from "react";

import {
  Container,
  Lightbox,
  MediaFigure,
  SectionBand,
  Typography,
} from "@root/design-system";
import { useDictionary } from "@root/i18n";

const REPORT_DIMENSIONS = [
  { width: 1015, height: 1280 },
  { width: 1072, height: 1168 },
  { width: 1125, height: 821 },
  { width: 960, height: 1280 },
  { width: 1280, height: 995 },
  { width: 1280, height: 1280 },
  { width: 1126, height: 1280 },
  { width: 960, height: 1280 },
];
const REPORT_COUNT = REPORT_DIMENSIONS.length;
const FPV_REPORT_NUMBER = 3;
const IMAGE_SIZES = [
  "(min-width: 1200px) 347px",
  "(min-width: 940px) calc(33.33vw - 53px)",
  "(min-width: 768px) calc(50vw - 68px)",
  "(min-width: 592px) calc(50vw - 36px)",
  "calc(100vw - 48px)",
].join(", ");
const VIEWER_SIZES = "(max-width: 956px) 92vw, 880px";

const formatIndex = (value: number): string => String(value).padStart(2, "0");

export default function ReportsScreen() {
  const dictionary = useDictionary();
  const [viewedPosition, setViewedPosition] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const reports = REPORT_DIMENSIONS.map((dimensions, position) => {
    const number = position + 1;
    const index = formatIndex(number);
    const caption =
      number === FPV_REPORT_NUMBER ? dictionary.reports.fpv_caption : null;
    const name = `${dictionary.shared.reports} ${index}`;

    return {
      ...dimensions,
      index,
      caption,
      image: `/images/reports/report_${number}.jpg`,
      ariaLabel: caption === null ? name : `${name} — ${caption}`,
    };
  });

  const viewed = reports[viewedPosition];

  const openViewer = (position: number) => {
    setViewedPosition(position);
    setIsViewerOpen(true);
  };

  const step = (delta: number) => {
    setViewedPosition((current) =>
      Math.min(Math.max(current + delta, 0), REPORT_COUNT - 1)
    );
  };

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
              {reports.map((report, position) => (
                <figure key={report.image} className="flex flex-col gap-3">
                  <MediaFigure
                    ariaLabel={report.ariaLabel}
                    onClick={() => openViewer(position)}
                    media={
                      <Image
                        src={report.image}
                        alt=""
                        fill
                        quality={100}
                        sizes={IMAGE_SIZES}
                      />
                    }
                  />

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

      <Lightbox
        open={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        ariaLabel={viewed.ariaLabel}
        index={viewed.index}
        caption={viewed.caption ?? undefined}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        hasPrev={viewedPosition > 0}
        hasNext={viewedPosition < REPORT_COUNT - 1}
        prevLabel={dictionary.reports.prev}
        nextLabel={dictionary.reports.next}
        closeLabel={dictionary.cart.close}
        media={
          <Image
            key={viewed.image}
            src={viewed.image}
            alt=""
            width={viewed.width}
            height={viewed.height}
            quality={100}
            sizes={VIEWER_SIZES}
          />
        }
      />
    </>
  );
}
