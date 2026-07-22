# Catalog index (`/category`) — ratified page design (D3.2)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/catalog/Catalog.dc.html`, exported verbatim alongside this file;
derived-data logic in `../data/catalog.js`), user-approved 2026-07-22. The prototype's
inline styles are the medium — implementation composes DS exports and token utilities
that render the same result. Planner fidelity review: all values are tokens or
D1-ratified card-language pixels; zero yellow on this page (deliberate — pure
navigation surface); the card vocabulary (`utg-card*`) is the D1 kit's own CSS, not new
styles.

## Structure (top to bottom)

1. **Header / Footer** — existing chrome, unchanged.
2. **Band** (`utg-band`): baseline flex-wrap row, gap `space-2`/`space-4` —
   `h1` = `shared.merch` («мерч», renders display-caps) left + right mono caption
   counter in `band-muted`: «3 категорії» / "3 categories" (derived from the category
   count in the prototype; same rendered string as Home's `main.counter` — reuse or
   derive, displayed result must match).
3. **Category grid** (padding `space-6` top / `space-9` bottom, gutters, Container):
   `repeat(auto-fit,minmax(min(100%,240px),1fr))` gap `space-5` — three **extended
   CategoryTiles** (data + order from the catalog module).

## The CategoryTile meta extension (RATIFIED DS addition)

The shipped tile (media / caption number `ink-faint` / display-caps `--text-h3` name /
20px `arrow-right`) gains an optional **meta row** at the card bottom:

- `margin-top: auto` (bottom-pinned), `border-top: 1px solid var(--line)` (hairline),
  padding `10px 16px 12px`.
- Caption typography (`--type-caption`, caps-tracking, uppercase), color `ink-faint`.
- Left: item count («5 товарів» / "5 items"); right: availability («В наявності» /
  «Немає в наявності»). Both wrap as whole units (`white-space: nowrap` +
  `flex-wrap`), `gap: 2px var(--space-3)`, `justify-content: space-between`.
- Props are additive and optional — Home's tiles render byte-identically without them.

## Copy (verbatim; new keys → dictionaries, both locales)

| purpose | uk | en |
| --- | --- | --- |
| band title | reuse `shared.merch` | — |
| band counter | «3 категорії» (= `main.counter` rendering; derive or reuse) | "3 categories" |
| tile count | `{n}` + товар/товари/товарів (uk plural rules) | `{n}` + item/items |
| availability — in stock (NEW key) | В наявності | In Stock |
| availability — out | reuse `category.out` («Немає в наявності» / "Out Of Stock") | — |

Notes: the prototype renders en in-stock as "In stock"; the dictionary key lands as
**"In Stock"** to match sibling `category.out` casing — rendered identically (the row
is uppercase-transformed). Uk plural rules: 1→товар, 2–4→товари, 5+/11–14→товарів
(the exact algorithm is in `../data/catalog.js` `ukPlural`). Real counts today:
patches 5 (В наявності), stickers 1 (В наявності), tshirts 6 (Немає в наявності) — all
derived from the catalog module, never hardcoded.

## Implementation mapping notes

- Page stays a fully static server component; tiles wrapped in `NavLink` exactly like
  Home (the shipped pattern).
- Tile links get their accessible name from visible text content (name + number +
  meta); `alt=""` on tile images, `loading="lazy"` (below-fold grid).
- Zero flag-yellow on this page is intentional (accent budget: the page is pure
  navigation).
- The current `CategoriesScreen` (SectionBand `center` + overlap tricks) is replaced
  wholesale by this composition; the band goes through the extended `SectionBand` (see
  `../category/category-reference.md` — the extension is shared).
