# design-export/ — ratified design system, exported for implementation

Verbatim export from the Claude Design project `62bf007e-1ea9-45bc-a40a-f64544314e8c`
("UTG Design System", visual SSOT per D-4), pulled via DesignSync on 2026-07-18.
**Do not edit these files** — they are the spec, not the implementation. If the design
changes, the planner re-exports. Excluded from Prettier (verbatim rule).

## Contents

- `system-readme.md` — the design system's own overview: content fundamentals (bilingual rules, tone, casing, prices), visual foundations (color/type/spacing/borders/motion/hover/focus), iconography (Lucide, 2px stroke), component inventory.
- `tokens/colors.css` — palette + shadcn semantic aliases (`--background`…`--ring`), band tokens. All pairs AA.
- `tokens/typography.css` — font stacks + fluid type scale + semantic `--type-*` shorthands.
- `tokens/spacing.css` — spacing scale, container/gutters, radius 0, border weights (2px rule voice), motion durations/easing, touch target, focus ring.
- `tokens/base.css` — element defaults (headings uppercase, link treatment, selection color, focus-visible, spinner-button removal).
- `tokens/components.css` — **the per-component visual spec**: every `utg-*` class with variants and states (buttons, badges, price, form fields, stepper, rules, skeleton, product card, band, toast, dialog/drawer chrome, cart line). Implementation translates these into shadcn-structured Tailwind components with identical rendered results.
- `tokens/fonts.css` — reference only: the design vendored TTFs; implementation uses `next/font/google` (Oswald variable 200–700; IBM Plex Sans variable; IBM Plex Mono 400/500/600) with `latin` + `cyrillic` subsets.

## Consumption rules (4a)

Token values (hex colors, px scales, durations) transfer **exactly** — the 4a gate
diff-checks them. Class names (`utg-*`) do NOT transfer — implementation uses Tailwind
utilities/shadcn variants that render the same result. Screen composition lives in the
design project's `ui_kits/storefront/` and is 4b/4c territory, not 4a.
