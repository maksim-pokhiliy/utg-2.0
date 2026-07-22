# Step 4d — Implement the catalog index + category pages per the ratified D3.2 design (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature small Step 4d of the production-polish initiative: re-compose the catalog index (`/category`) and the category page (`/category/[categoryId]`) per the ratified page designs. The design system is sealed and frozen — this step composes existing DS exports plus three sanctioned DS changes (a new `ProductCard`, an optional meta row on `CategoryTile`, a `SectionBand` extension), and touches nothing else.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-10 + addendum, D-11), `deferred.md`. **The page specs are `initiatives/production-polish/design-export/screens/catalog/` and `screens/category/`** — each holds a distilled `*-reference.md` (structure, verbatim copy, ratified DS-addition specs, mapping notes) + the ratified prototype source (`*.dc.html`; its inline styles are the medium — your implementation renders the same result from DS exports and token utilities; the derived-count/plural logic is in `screens/data/catalog.js`). The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner. Expected plan-gate question: the exact React API of the `SectionBand` extension — constraints are fixed in the category reference (visual state fully DS-owned; internal navigation stays app-land via `NavLink`; an asChild/slot composition mirroring `Button asChild` is the sanctioned shape; `center` keeps working for existing consumers).

**Scope:**

1. **Three DS changes** (ratified in D3.2, specs in the references — implement, don't redesign):
   - **`ProductCard`** (new, barrel-exported): whole-card-link anatomy per the D1 card CSS — 1:1 media with hover zoom, out-badge overlay, title, footer row of `Price` (`muted` when out) + presentational order action (in-stock only). Full state set: default / hover / focus-visible / out (`grayscale(.45) opacity(.7)`, `ink-muted` title, no order affordance, still a link). Presentational like `CategoryTile` — the app wraps it in `NavLink` and injects `next/image` media.
   - **`CategoryTile` meta extension**: optional bottom meta row (hairline `line` top border, caption `ink-faint`, count left / availability right, whole-unit wrapping, bottom-pinned). Additive and optional — Home's tiles render byte-identically without it.
   - **`SectionBand` extension**: baseline title row `h1|h2` + optional right meta caption (`band-muted`) + optional kicker rendered as a LINK (44px target, band-muted, hover → band-foreground + underline). API per your plan-gate proposal.
   - `Price` already has `muted` — no change there.
2. **Catalog index** (`/category`, replacing `CategoriesScreen`'s composition): extended-`SectionBand` band (`h1` = `shared.merch` + counter caption «3 категорії»/"3 categories" — reuse `main.counter`'s rendering or derive; displayed result must match), then the `auto-fit minmax(min(100%,240px),1fr)` grid of extended CategoryTiles (count + availability per category, ALL derived from the catalog module — nothing hardcoded).
3. **Category page** (`/category/[categoryId]`, replacing `CategoryScreen`'s composition): band with kicker back-link `← ` + `shared.merch` → `/category`, `h1` category name, meta caption = item count, appending `·` + `category.out` when the whole category is out (tshirts announces it up front); then the **`auto-fill` minmax(min(100%,280px),1fr)** product grid (auto-FILL so the single stickers card keeps column width) of `ProductCard`s linking to the live product routes.
4. **Dictionary keys** (both locales): a new in-stock key («В наявності» / "In Stock" — title-case en per sibling casing; rendered uppercase anyway) + whatever the count strings need. Uk plurals are real (1 товар / 2–4 товари / 5+ товарів; 11–14 → товарів) — mechanism is your call (forms map or `Intl.PluralRules`), the rendered strings in the references are fixed. Reuse `category.order`, `category.out`, `shared.merch`. Remove keys the old compositions orphan (grep before deleting).
5. **Image hygiene**: `alt=""` on card/tile images with accessible names from visible text, `loading` lazy below the fold, real `sizes` for both grid geometries (240px auto-fit tiles, 280px auto-fill cards), no full-size overfetch.

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint / `prettier --check` / zero-env `yarn build` green; route table unchanged (all pages SSG); all six seal greps zero.
- View-source `/uk/category` and `/en/category`: band title + counter, all three tile names, counts, and availability strings server-rendered.
- View-source `/uk/category/tshirts`: meta caption «6 товарів · Немає в наявності», six badge labels, zero order labels. `/uk/category/stickers`: exactly one card. `/uk/category/patches`: five cards incl. the full set title «Набір із "Waiting, Welcome, Death"».
- Both locales in the browser: tiles navigate to categories, back-link returns to `/category`, cards navigate to product pages, hover zoom works on tiles and cards, layout holds at 375px and 1200px+; no hydration warnings.
- Only the two screens (+ the three DS changes + dictionaries) in the diff — no Home, no chrome, no product-page, no checkout/cart, no catalog-data changes.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
