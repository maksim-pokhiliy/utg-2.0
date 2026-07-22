# Category page (`/category/[categoryId]`) — ratified page design (D3.2)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/category/Category.dc.html`, exported verbatim alongside this file;
derived-data logic in `../data/catalog.js`), user-approved 2026-07-22. Three real
instances ratified: patches (5 in stock), stickers (1 — single card must not stretch),
tshirts (6, all out — page stays honest and non-dead). Planner fidelity review: all
values are tokens or D1-ratified card-language pixels; the ProductCard vocabulary
(`utg-card-media/body/title`, `utg-badge--out`, `utg-btn--sm`, `utg-card--out`) is the
D1 kit's own components.css — composed, not invented.

## Structure (top to bottom)

1. **Header / Footer** — existing chrome, unchanged.
2. **Band** (`utg-band`):
   - **Kicker back-link** above the title: `← ` + `shared.merch` («← мерч» → `/category`).
     Caption typography, `band-muted`, `min-height: 44px` (touch target),
     `margin-top: -14px` (tightens into the band padding), no underline; hover →
     `band-foreground` + underline.
   - Baseline flex-wrap row (gap `space-2`/`space-4`): `h1` category name + right mono
     caption meta in `band-muted`: item count, and when NOTHING in the category is
     available, ` · ` + `category.out` appended — tshirts announces «6 товарів · Немає
     в наявності» up front.
3. **Product grid** (padding `space-6` top / `space-9` bottom, gutters, Container):
   `repeat(auto-fill,minmax(min(100%,280px),1fr))` gap `space-5` — **auto-FILL** (not
   fit) so the single stickers card keeps column width instead of stretching.

## ProductCard (RATIFIED DS addition — enters the sealed DS in 4d)

Whole card is ONE link (product page). Anatomy per the D1 card CSS:

- Frame: `utg-card` spec (2px ink border, paper bg).
- Media: 1:1, 2px ink bottom border, white bg, `object-cover`; hover zoom
  `scale(1.03)` at `--dur`/`--ease` (card-level hover, like CategoryTile).
- Out-of-stock badge overlaid top-left of media (`Badge` — `paper-dim` bg, ink-muted
  text) with `category.out`.
- Body: flex column, gap 4, padding `12px 14px 14px`, stretches (`flex: 1 1 auto`).
- Title: `500 1rem/1.35` body font, no transform (`utg-card-title`), `text-wrap: pretty`.
- Footer row (`margin-top: auto`, `padding-top: 10px`, space-between, gap `space-3`):
  - `Price` (existing DS component; `muted` when out).
  - Order action, ONLY when in stock: the small button treatment (`utg-btn--sm`:
    min-height 40px, padding 0 16px, 0.9375rem) rendered as a PRESENTATIONAL span —
    no nested interactive inside the card link; 40px is fine because the tap target is
    the whole card. Label = `category.order`.
- Out state (`utg-card--out`): image `grayscale(.45) opacity(.7)`, title `ink-muted`
  (kit hex #5D554C = our `--color-ink-muted` token), `Price muted`, order action
  REMOVED; the card stays a link — out-of-stock products remain navigable.
- States: default / hover (photo zoom, action inverts per `utg-btn` hover) /
  focus-visible (flag-blue ring from base.css) / out.
- Deliberate design departures from the old kit demo (ratified): NO yellow in-stock
  badge on grid cards (yellow rarity — an in-badge belongs to the product page), and
  the added Order row.

## SectionBand extension (RATIFIED at intent level)

Both D3.2 pages need the band as: optional kicker row (HERE a back-LINK) + baseline
flex-wrap title row with `h1|h2` + optional right meta caption (`band-muted`).
The current `SectionBand` has `title`/`kicker: string`/`as`/`center`; the extension
adds the meta caption and makes the kicker linkable. Exact React API = executor's
plan-gate question. Constraints: visual state fully DS-owned; internal navigation
stays app-land (`NavLink`) — an asChild/slot composition mirroring `Button asChild`
is the sanctioned shape; `center` stays for existing consumers.

## Copy (verbatim)

| purpose | uk | en |
| --- | --- | --- |
| back-link | «← мерч» (`← ` + `shared.merch`; the arrow is presentation, not a new key) | "← merch" |
| meta count | «5 товарів» / «1 товар» / «6 товарів» (plural rules in `../data/catalog.js`) | "5 items" / "1 item" / "6 items" |
| meta out suffix | ` · ` + `category.out` (only when the whole category is out) | — |
| badge / out label | reuse `category.out` | — |
| order action | reuse `category.order` («Замовити» / "Order Now") | — |
| product titles / prices | from the catalog module (sacred) — incl. the longest: «Набір із "Waiting, Welcome, Death"» | — |

## Implementation mapping notes

- Page stays a fully static server component (SSG per category); NO loading states.
- Card wrapped in `NavLink` to the REAL product route (`/category/[categoryId]/[productId]`)
  — live transitional product pages until 4e redesigns them. Accessible name from the
  visible title text; `alt=""` on card images; `loading="lazy"` + real `sizes` for the
  280px auto-fill grid.
- Money through the existing DS `Price` + money context (uk ₴ / en $ per the shipped
  rate flow) — the prototype's fixed demo rate is prototype-only.
- The tshirts instance is the honesty gate: band meta announces the out state, six
  grayscale cards with badges, no order affordances, everything still navigable.
