# Home — ratified page design (D3.1)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371` (`screens/home/Home.dc.html`,
exported verbatim alongside this file), user-approved 2026-07-21. The prototype's inline
styles are the medium — implementation composes DS exports and token utilities that
render the same result. Planner fidelity review: all values are tokens; no raw
colors/sizes; no new DS primitives proposed by the designer.

## Structure (top to bottom)

1. **Header / Footer** — existing chrome, unchanged (logo rendered ~38px tall in the header).
2. **Hero section** (paper, padding `clamp(space-7,7vw,space-9)` top / `space-7` bottom, gutters; Container width):
   - `h1` wordmark in `--type-hero`, three lines: `Ukrainian<br>Tactical<br>Gear`.
   - Skull logo absolutely positioned right/bottom of the wordmark block, width `clamp(120px,26vw,300px)`. **Photo slot (DEF-9-ready):** the design defines a `heroPhotoSrc` variant — when a hero photo exists it replaces the skull (bordered 2px ink, aspect 1:1, `clamp(150px,30vw,320px)`); until then the skull renders. Implementation ships the skull path only, structured so the swap is trivial later.
   - `utg-rule--heavy` full-width rule, `space-5` above.
   - Below the rule (`space-5` top padding), a flex-wrap row, `align-items:flex-end`, `space-between`:
     - Left (`flex 1 1 300px`): mono-caps caption stamp (ink), `space-2` below it, then mission paragraph (`--type-body`, ink-soft, max 46ch).
     - Right: accent `Button` with trailing `arrow-right` Icon (20px) → **in-page anchor `#merch`** (the band below; per the ratified design the CTA scrolls, it does not navigate to `/category`), and the Instagram link as a mono-caps row with the Instagram icon (18px), min-height 48px.
3. **Merch band** (`utg-band`, `id="merch"`): `h2` merch title + right-aligned band-muted mono caption counter, baseline-aligned, flex-wrap.
4. **Categories section** (padding `space-6` top / `space-9` bottom, Container): grid `repeat(auto-fit,minmax(min(100%,240px),1fr))`, gap `space-5`, of **numbered category tiles** — `utg-card` link: square media image on top; body row (padding 14/16): mono caption number (`01`/`02`/`03`, ink-faint) + display-caps category name (`--text-h3`, flex-grow) + `arrow-right` icon (20px). Category data (names, images, order: patches → stickers → tshirts) comes from the catalog module, not hardcoded.

## Copy (verbatim; new keys → dictionaries, both locales)

| purpose | uk | en |
| --- | --- | --- |
| hero stamp (new) | Волонтерський проект | Volunteer project |
| hero mission (new — the ratified mission line split at the colon; stamp carries the head) | Усі кошти з продажу мерчу йдуть на спорядження для підшефного спецпідрозділу. | All merch proceeds buy equipment for a Ukrainian special-forces unit. |
| CTA | reuse existing `main.get` («Замовити мерч» / "Get Merch") | — |
| band title | reuse existing `shared.merch` | — |
| band counter (new) | 3 категорії | 3 categories |
| category names | from the catalog module | — |

Counter note: the catalog is static (3 categories, never changed); render the verbatim
string or interpolate the count — executor's call, displayed result must match.

## Implementation mapping notes

- Page stays a fully static server component; the CTA anchor needs no JS.
- The Instagram labeled icon-link and the numbered category tile are styled interactive
  elements → DS-owned (D-10): extend `IconLink` with a labeled variant (or equivalent)
  and add a `CategoryTile`-style component to the barrel; the tile is reused by the
  catalog page later (4d).
- The header-logo ~38px sizing is chrome polish, not a new component.
