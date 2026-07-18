import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactElement } from "react";

const LUCIDE_GLYPHS = {
  "shopping-bag": ShoppingBag,
  menu: Menu,
  x: X,
  plus: Plus,
  minus: Minus,
  "trash-2": Trash2,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "arrow-right": ArrowRight,
  check: Check,
  "loader-circle": LoaderCircle,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof LUCIDE_GLYPHS | "instagram";

export type IconSize = 20 | 24;

interface IconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
}

export function Icon({ name, size = 24, className }: IconProps): ReactElement {
  if (name === "instagram") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  const Glyph = LUCIDE_GLYPHS[name];

  return (
    <Glyph
      size={size}
      strokeWidth={2}
      className={className}
      aria-hidden="true"
    />
  );
}
