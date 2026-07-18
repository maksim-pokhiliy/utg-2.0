import type { ReactElement, SelectHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import { input } from "../input/input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: SelectProps): ReactElement {
  return (
    <div className="relative block">
      <select
        className={cn(
          input({ invalid }),
          "appearance-none pr-10 cursor-pointer",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevron-down"
        size={20}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink"
      />
    </div>
  );
}
