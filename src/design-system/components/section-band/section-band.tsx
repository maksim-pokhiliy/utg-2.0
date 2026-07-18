import type { ReactElement } from "react";

import { cn } from "../../lib/cn";
import { Typography } from "../typography/typography";

interface SectionBandProps {
  title: string;
  kicker?: string;
  as?: "h1" | "h2";
  center?: boolean;
  className?: string;
}

export function SectionBand({
  title,
  kicker,
  as = "h1",
  center = false,
  className,
}: SectionBandProps): ReactElement {
  return (
    <div
      className={cn(
        "bg-band text-band-foreground py-8 px-(--gutter) [&_:focus-visible]:outline-band-foreground",
        center && "text-center",
        className
      )}
    >
      {kicker ? (
        <Typography variant="caption" as="p" className="text-band-muted mb-2">
          {kicker}
        </Typography>
      ) : null}

      <Typography variant={as} as={as}>
        {title}
      </Typography>
    </div>
  );
}
