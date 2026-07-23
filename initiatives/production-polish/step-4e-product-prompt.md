# Step 4e — Implement the product page per the ratified D3.3 design + DEF-3 composite cart identity (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature Step 4e of the production-polish initiative: re-compose the product page per the ratified page design, debut the size selector, and make cart identity size-aware (DEF-3) — with the checkout payload contract byte-compatible. The design system is sealed and frozen — this step adds one sanctioned DS component (`SizeSelector`) and touches nothing else in the DS.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-10 + addendum, D-11), `deferred.md` (DEF-3 is this step's core). **The page spec is `initiatives/production-polish/design-export/screens/product/`** — `product-reference.md` (structure, verbatim copy, the ratified `SizeSelector` spec, mapping notes) + `Product.dc.html` (the ratified prototype; its inline styles are the medium — your implementation renders the same result from DS exports and token utilities). The checkout→bot payload shape is a SACRED contract (`initiatives/production-polish/extracted/bot-contract-index.js`): field names/keys must not change. The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. Expected plan-gate items: the `SizeSelector` React API, the cart-line/identity data shape, and the required-size hint strings (planner-proposed uk «Оберіть розмір» / en "Choose a size" — pending user approval).

**Scope:**

1. **`SizeSelector`** (new DS component, barrel-exported) — implement the ratified spec from the reference exactly: chip row `role="group"` (accessible name = the size label), chips min-w 56 / min-h 44 / px-14 / 2px ink border / mono 500 0.9375rem caps; states default / hover (ink bg, paper text) / focus-visible (2px flag-blue ring, offset 2) / selected (ink bg, paper text, `aria-pressed`); single-select with toggle-deselect; transitions at `--dur`/`--ease`. Out-of-stock sizes are NOT a chip state — they render as plain `Badge variant="out"` elements (page-side).
2. **Product page** per the reference, replacing the current transitional composition (`ProductScreen`): band with kicker back-link `← {category name}` → its category (extended `SectionBand`) + `h1` product title; two-column `auto-fit minmax(min(100%,320px),1fr)` grid — image (1:1, 2px ink frame, `bg-white`, availability `Badge` overlaid ALWAYS: `in` accent / `out` paper-dim; out image `grayscale-[.45] opacity-70`; **`priority` — this image is the LCP**, not lazy) and the right column: `Price size="big"` (`muted` when out) → size block (label + chips in-stock / out-badges) → hair rule → buy block (quantity label + `QuantityStepper` + accent block `Button` — the page's ONE yellow CTA) or out block (`outMsg` + outline block `Button` with the 18px Instagram icon, new tab) → description block (hair top border, label + body ink-soft 55ch) when the product has one. All four content shapes must render right: sized+out (tees), sized+in (unreachable in data today — keep it correct anyway), sizeless+in (patches/stickers), longest title (set).
3. **DEF-3 — composite cart identity.** Sized products REQUIRE a selected size to add; attempted add without one → inline caption hint near the chips (the approved strings), never a silent no-op and never an unexplained disabled button. Cart line identity becomes slug+size composite (sizeless products keep bare slug); same product + same size increments quantity, different sizes are separate lines. The line's stored display title is composed at add time as `{title} · {size}` for sized lines — CartDrawer and the checkout payload then flow it through UNCHANGED, so the bot's operator message carries the size inside the existing `title` field; **no new payload keys, no key renames, `productUrl` unchanged**. Backward compatibility with persisted carts is additive: existing `utg-cart-v2` lines (bare-slug ids, no size) keep working with no storage-key bump and no migration crash — verify by seeding an old-shape cart.
4. **Dictionary keys** (both locales, verbatim from the reference's copy table): size label, description label, out-of-stock message, and the required-size hint. Reuse `product.add`, `shared.quantity`, `category.in_stock`, `category.out`. Remove keys the old composition orphans (grep before deleting).
5. **Image hygiene**: the product image gets `priority` + a real `sizes` for the two-column grid; keep `quality={100}` per the app-wide convention.

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint / `prettier --check` / zero-env `yarn build` green; route table unchanged (all pages SSG); all six seal greps zero.
- View-source `/uk/category/tshirts/death-black` (adjust to the real route shape): title in the band h1, price, description, sizes as badges, outMsg — all server-rendered; `/uk/category/patches/waiting`: no size block, no description block, buy block present; `/en` parity spot-check.
- Cart correctness, verified and described: sized add requires selection (hint shows); patch+patch increments one line; the same tee in two sizes would make two lines (prove via the sized+in shape with a temporary local availability flip during dev — NEVER committed: catalog data is sacred); payload `cart[]` item keys byte-identical to the bot contract with the size inside `title`; a pre-4e persisted cart (seeded fixture) loads and checks out without errors.
- Browser gates for the user, listed explicitly in the PR: chips select/deselect/keyboard focus ring; add-to-cart puts the composed line in the drawer; out-of-stock tee shows badges + message + Instagram button and no dead controls; 375px and 1200px+ layouts; no hydration warnings.
- Only `ProductScreen` (+ its `page.tsx` if the props need it), the `SizeSelector` DS addition + barrel, the cart store + its direct consumers (drawer/checkout line rendering — presentation of the composed title only), and dictionaries in the diff. No chrome, no other screens' compositions, no catalog data VALUES, no bot-contract shape changes.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
