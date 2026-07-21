# Step 4b — Screens per the ratified kit: home/catalog/product/reports/about/404, sizes, swiper removal (executor prompt)

Precondition: master at/after `ba65cb6` (4a + fix round merged).
Invocation: paste everything below into the executor tab as one message.

---

/feature Step 4b of the production-polish initiative: re-compose every non-checkout screen per the ratified design kit — home, category list/grid, product page (with the size selector's debut and composite cart identity), reports (grid, killing swiper), about, and the 404 — adding the missing commerce components to the sealed design system. Checkout/cart-flow polish is step 4c; do not touch the checkout form.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-10 incl. the addendum — controls and composite patterns are DS-owned, intents not constructors), `deferred.md` (DEF-3, DEF-14, DEF-20 land here). **The screen spec is `initiatives/production-polish/design-export/kit-screens-reference.md`** — verbatim kit compositions + the copy table; read it in full plus `system-readme.md` before planning. The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint — your new screens are built exclusively from DS exports and token utilities.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner.

**Scope:**

1. **New DS components** (per the kit; exported from the barrel, visual state fully DS-owned): `ProductCard` (square media + Badge overlay top-left, out-of-stock grayscale/opacity treatment, body = title + Price, whole card links), a category tile (own component or ProductCard variant — your call; body = display-caps name + arrow icon), and a **size selector** (choice-chip control per the kit spec: ≥48px chips, mono, active = ink/paper inversion — the kit prototypes it as raw buttons, which our seal forbids in app-land; it becomes a DS primitive with a closed API).
2. **Screens per the reference** (structure/hierarchy/values from the kit; SSG stays — no loading states, the kit's skeleton theater does not apply to synchronous data): Home (typographic hero + mission + accent CTA + Instagram IconLink + logo column; band with category counter; tile grid), Category (`SectionBand` with kicker + ProductCard grid), Product (back-link — the kit's breadcrumb answer; two-column grid; description block; size selector on sized in-stock products; out-of-stock variant with size Badges + `outMsg` + Instagram outline button), Reports (**grid of numbered figures, swiper dies without replacement** — remove the dependency and its CSS), About (narrow column), 404 (`not-found.tsx` restyled per kit with the `nf*` strings). `error.tsx` gets the same visual treatment as 404 (band + body + CTA) with its existing copy.
3. **DEF-3 — composite cart identity.** Sized products: the selected size becomes part of the cart line — line id = `slug:size` (unsized products keep bare slug), so different sizes are distinct lines. **The payload field shape is sacred — no new fields**: encode the size into the line `title` (e.g. «Футболка «Death» Black (M)») so the bot prints it naturally; `{id,title,price,quantity,image,productUrl}` keys stay exactly as-is. Old persisted carts (bare-slug ids, no size in title) must still load and remain orderable — additive compatibility, no storage-key bump.
4. **DEF-14 — kit copy into dictionaries.** Add/update the keys your screens need from the reference's copy table (both locales, verbatim; the drift-guard forces pairs). Includes the about1/en fix ("the unit we support"). Checkout strings are explicitly NOT yours (4c).
5. **DEF-20 sweep** (verify each against current master first — some may have died in the fix round): NavOverlay/Dialog missing `aria-describedby`; `Button asChild` silently ignoring `loading` (guard or type-forbid the combination); Footer's unnecessary `"use client"` (server-ify via props if clean); LanguageSwitcher's unanchored `pathname.replace` (anchor to `^/locale`).
6. **Chrome fidelity — NavOverlay per the kit** (user-reported defect): the burger overlay must match the kit's composition (`design-export/chrome-reference.md`, NavOverlay section) — LEFT-aligned link column starting ~10vh from the top (ours is centered: wrong), links in the kit's large display size with baseline-aligned mono numbered prefixes, Instagram as a mono-caps row with icon pinned to the bottom via auto margin. Whatever type step this needs (the kit link size exceeds the current Typography scale) lives inside the DS, not as app-land overrides.
7. **Image hygiene** (the 4b half of old DEF-11): proper `sizes` for every `next/image` in grids/hero per its rendered width, `priority` only above the fold (hero logo, first grid row at most), `loading="lazy"` for reports/about, quality per the existing `qualities` config. No full-size overfetch on grid thumbnails.

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint / `prettier --check` / zero-env `yarn build` green; route table unchanged (all pages SSG); **all six seal greps zero**; `swiper` absent from package.json/lockfile/imports.
- View-source: home hero + mission + category names server-rendered; product page contains description and size chips markup; reports grid has 8 figures with `01…08` captions and exactly one text caption (#3).
- Cart identity: add tee M then tee L → two distinct lines; add tee M twice → one line qty 2; unsized patch behaves as before; a pre-4b persisted cart (bare ids) loads and checks out; payload keys byte-identical (`{id,title,price,quantity,image,productUrl}` + `locale`/`total`/form fields — no `size` key anywhere).
- Both locales walkthrough: home → category → product (in-stock with sizes; out-of-stock tee shows badges/outMsg/Instagram) → add to cart → drawer shows size-suffixed titles → remove-confirm still works; `/uk/x` 404 renders the kit design; no hydration warnings.
- No regressions on chrome from the fix round (switcher toggle, footer, stepper hug); NavOverlay matches the kit in both locales (left-aligned numbered column, Instagram pinned bottom).

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Checkout screen/flow untouched (4c); no SEO work (step 5); no tests (step 6); catalog data verbatim (titles/prices/availability/sizes/descriptions from `src/data/` — display-level size suffix in cart titles is presentation, not data editing).
- Run `yarn format` before committing (planner markdown excluded via .prettierignore).
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
