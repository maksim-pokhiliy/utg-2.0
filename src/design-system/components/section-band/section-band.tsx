import { Slot } from "@radix-ui/react-slot";
import type { ReactElement } from "react";

import { cn } from "../../lib/cn";
import { Typography } from "../typography/typography";

const KICKER_LINK =
  "type-caption inline-flex items-center min-h-[var(--hit)] -mt-[14px] text-band-muted no-underline hover:text-band-foreground hover:underline";

interface SectionBandBaseProps {
  title: string;
  as?: "h1" | "h2";
  meta?: string;
  center?: boolean;
  className?: string;
}

type SectionBandCaptionProps = SectionBandBaseProps & {
  kicker?: string;
  kickerAsChild?: false;
};

type SectionBandSlotProps = SectionBandBaseProps & {
  kicker: ReactElement;
  kickerAsChild: true;
};

type SectionBandProps = SectionBandCaptionProps | SectionBandSlotProps;

export function SectionBand({
  title,
  as = "h1",
  meta,
  kicker,
  kickerAsChild = false,
  center = false,
  className,
}: SectionBandProps): ReactElement {
  const kickerNode =
    kicker == null ? null : kickerAsChild ? (
      <Slot className={KICKER_LINK}>{kicker}</Slot>
    ) : (
      <Typography variant="caption" as="p" className="mb-2 text-band-muted">
        {kicker}
      </Typography>
    );

  return (
    <div
      className={cn(
        "bg-band text-band-foreground py-8 [&_:focus-visible]:outline-band-foreground",
        center && "text-center",
        className
      )}
    >
      <div className="mx-auto w-full max-w-(--container) px-(--gutter)">
        {kickerNode}
        {meta != null ? (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <Typography variant={as} as={as}>
              {title}
            </Typography>
            <Typography variant="caption" as="span" className="text-band-muted">
              {meta}
            </Typography>
          </div>
        ) : (
          <Typography variant={as} as={as}>
            {title}
          </Typography>
        )}
      </div>
    </div>
  );
}
