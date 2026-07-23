# Product page (`/category/[categoryId]/[productId]`) — ratified page design (D3.3)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/product/Product.dc.html`, exported verbatim alongside this file; data +
derived strings in `../data/catalog.js`), user-approved 2026-07-23. All four content
shapes ratified: in-stock sizeless (patch/sticker), in-stock with sizes (via the
prototype's `demoInStock` review toggle — unreachable in real data today, all six tees
are out), out-of-stock with sizes + description (tees), longest title (set). Planner
fidelity review: token vocabulary throughout (one `background:#fff` on the image frame
is medium sloppiness — it maps to the ratified `--white`; NOT a new color); the in-stock
badge (`utg-badge--in` = accent bg) debuts here exactly as the D3.2 departure note
reserved; the chips are the expected new DS component.

## Structure (top to bottom)

1. **Header / Footer** — existing chrome, unchanged.
2. **Band** (extended `SectionBand` language): kicker back-link `← ` + category name →
   its category page (44px target, band-muted → hover band-foreground + underline);
   `h1` = the PRODUCT TITLE (`text-wrap: balance`). No meta caption on this band.
3. **Product section** (padding `space-6` top / `space-9` bottom, gutters, Container):
   grid `repeat(auto-fit,minmax(min(100%,320px),1fr))`, gap `space-6`/`space-7`,
   `align-items: start` — two columns desktop, one column mobile (image first).
   - **Left — image**: 1:1, 2px ink border, white bg, `object-cover`; availability
     `Badge` overlaid top-left ALWAYS (`in` = accent yellow / `out` = paper-dim) —
     label `category.in_stock` / `category.out`. Out state: image
     `grayscale(.45) opacity(.7)`. This image is the page LCP — implementation uses
     `priority`, NOT the prototype's `loading="lazy"`.
   - **Right — column** (flex col, gap `space-5`):
     1. `Price` size **big**, `muted` when out.
     2. **Size block** (only when the product has sizes): caption label `Розмір`/`Size`
        (ink-faint) + in-stock → the chip row; out → sizes as plain out-Badges
        (informational only).
     3. Hair rule (`line`).
     4. In-stock → **buy block** (flex col gap `space-4`): row of caption label
        `Кількість`/`Quantity` (ink-faint) + `QuantityStepper` right; then accent
        `Button` block `Додати у Кошик`/`Add to Cart` — **THE yellow CTA of the page**.
        Out → **out block**: `outMsg` paragraph (body, ink-soft, 55ch) + outline
        `Button` block with the Instagram icon (18px) → Instagram, new tab.
     5. **Description block** (only when the product has one): hair top border,
        `space-5` top padding, caption label `Опис`/`Description` (ink-faint) + body
        paragraph (ink-soft, max 55ch, `text-wrap: pretty`).

## SizeSelector (RATIFIED DS addition — enters the sealed DS in 4e)

Chip row, fully DS-owned (interactive buttons — the seal forbids app-land raw
`<button>`): container `flex flex-wrap gap-(--space-2)`, `role="group"` with the
size label as its accessible name. Each chip:

- Box: `inline-flex items-center justify-center`, min-width **56px**, min-height
  **44px**, padding 0 14px, 2px ink border, zero radius.
- Type: mono 500 **0.9375rem**, caps-tracking, uppercase.
- States: default (paper bg, ink text) / hover (ink bg, paper text) / focus-visible
  (2px `--secondary` = flag-blue ring, offset 2) / **selected** (ink bg, paper text,
  `aria-pressed="true"`). Transition background+color at `--dur`/`--ease`.
- Interaction: single-select; clicking the selected chip DESELECTS it (back to none).
- The out-of-stock rendering is NOT a chip state — sizes render as plain out-Badges
  instead (a different, non-interactive element).

## Copy (verbatim; new keys → dictionaries, both locales)

| purpose | uk | en |
| --- | --- | --- |
| back-link | `← ` + category name (from the catalog module) | — |
| size label (NEW key) | Розмір | Size |
| description label (NEW key) | Опис | Description |
| out-of-stock message (NEW key) | Наразі немає в наявності. Слідкуйте за оновленнями в Instagram. | Currently out of stock. Follow updates on Instagram. |
| add to cart | reuse `product.add` («Додати у Кошик» / "Add to Cart") | — |
| quantity label | reuse `shared.quantity` («Кількість» / "Quantity") | — |
| badge labels | reuse `category.in_stock` / `category.out` | — |
| titles / prices / descriptions / sizes | from the catalog module (sacred; descriptions verified byte-verbatim in the prototype data) | — |

## Implementation mapping notes

- Page stays a fully static server component (SSG per product); NO loading states.
- The prototype's kit `Price big={true}` maps to our `Price size="big"`; the kit
  `Badge` classes map to our `Badge` variants `in`/`out` (both shipped since 4a).
- The image frame's `background:#fff` maps to `bg-white` (ratified `--white` token).
- Accent budget: ONE accent CTA (add-to-cart). The yellow in-badge is a semantic
  status marker, not a CTA — ratified together with the composition.
- The `demoInStock` prop is a prototype-only review affordance; the implementation
  derives availability from data.
- DEF-3 rides the implementation step (4e), not this design: composite cart identity
  (slug+size), size encoded in the payload line TITLE — payload keys sacred.
