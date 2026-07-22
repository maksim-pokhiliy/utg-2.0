import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import { Typography } from "../typography/typography";

interface CategoryTileProps {
  index: number;
  name: string;
  media: ReactNode;
  meta?: { count: string; availability: string };
  className?: string;
}

export function CategoryTile({
  index,
  name,
  media,
  meta,
  className,
}: CategoryTileProps): ReactElement {
  return (
    <span
      className={cn(
        "group/tile flex flex-col border-2 border-ink bg-paper",
        className
      )}
    >
      <span className="relative aspect-square overflow-hidden border-b-2 border-ink bg-paper [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-[var(--ease)] group-hover/tile:[&_img]:scale-[1.03]">
        {media}
      </span>
      <span className="flex items-center gap-3 px-4 py-[14px]">
        <Typography variant="caption" as="span" className="text-ink-faint">
          {String(index).padStart(2, "0")}
        </Typography>
        <Typography variant="h3" as="span" className="grow">
          {name}
        </Typography>
        <Icon name="arrow-right" size={20} />
      </span>
      {meta ? (
        <span className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-[2px] border-t border-line px-4 pt-[10px] pb-3">
          <Typography
            variant="caption"
            as="span"
            className="whitespace-nowrap text-ink-faint"
          >
            {meta.count}
          </Typography>
          <Typography
            variant="caption"
            as="span"
            className="whitespace-nowrap text-ink-faint"
          >
            {meta.availability}
          </Typography>
        </span>
      ) : null}
    </span>
  );
}
