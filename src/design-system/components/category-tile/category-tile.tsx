import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import { Typography } from "../typography/typography";

interface CategoryTileProps {
  index: number;
  name: string;
  media: ReactNode;
  className?: string;
}

export function CategoryTile({
  index,
  name,
  media,
  className,
}: CategoryTileProps): ReactElement {
  return (
    <span
      className={cn("flex flex-col border-2 border-ink bg-paper", className)}
    >
      <span className="relative aspect-square overflow-hidden border-b-2 border-ink bg-paper">
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
    </span>
  );
}
