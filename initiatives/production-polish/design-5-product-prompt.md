# D3.3 — Product page design (Claude Design brief)

Paste everything below into the SAME cumulative Claude Design dialog (the one holding
Home + catalog + category), as one message, with the freshly refreshed `utg-2.0`
Desktop snapshot attached.

Standing rule for ALL page briefs (D3 track): the user attaches a FRESH snapshot of the
codebase (folder `utg-2.0`, planner refreshes it on the Desktop before each brief) to
the design dialog; the newest snapshot SUPERSEDES any previously attached one. The
brief still carries all copy inline; the attached code is the ground truth for what
exists — the sealed design system in `src/design-system/` (tokens `styles/theme.css`,
primitives, public barrel `index.ts`), current screens in `src/app/[lang]/` +
`src/components/`, dictionaries in `src/app/[lang]/dictionaries/`.

---

Page-design phase, third brief — same dialog, the prototype grows. The freshly attached
`utg-2.0` snapshot SUPERSEDES the previous one: your catalog index and category pages
are now SHIPPED and live (`CategoriesScreen`/`CategoryScreen`), and the DS carries your
ratified `ProductCard`, the `CategoryTile` meta row, and the extended `SectionBand`
(title + meta + linkable kicker, Container-aligned geometry). The design system is
FROZEN — tokens, type, primitives, guidelines are the law; do not restyle them. Older
`ui_kits/` demos remain sketches you may depart from.

**Task: design the PRODUCT page** (`/category/[categoryId]/[productId]`) — the buy
surface, the deepest page of the funnel. Mobile-first (375px) and desktop (1200px+),
Ukrainian default with an English variant (uk strings run 20–30% longer — design for
uk, verify en).

THREE real content shapes must all look right (design-load rule — all three MUST exist
in the prototype and be reachable by browsing from the category pages):

1. **Out-of-stock t-shirt** (all 6 are out): title, price 1000, a real DESCRIPTION
   (the longest content on the site), sizes exist but nothing is orderable — the page
   must stay honest and useful (the kit's answer: sizes rendered as plain badges, an
   out-of-stock message, an outline Instagram CTA instead of add-to-cart).
2. **In-stock patch with NEITHER description NOR sizes** («Waiting», 300) — the
   minimal shape; the page must not look empty or broken. Also the longest title lives
   here (set, 800).
3. **In-stock sticker** («Стікер Пак», 250) — one product, same minimal shape.

Real content (verbatim; the full catalog incl. descriptions is in the snapshot's
`src/data/catalog.ts` — sacred, do not invent or "improve"):

- Sizes exist ONLY for t-shirts: `M · L · XL · 2XL`. No sizes → no size block at all.
- T-shirt descriptions (uk shown; en in the module): «Ліворуч спереду дрібний принт:
  лого Ukrainian Tactical Gear. Принт на спині зі слоганом "With you or for you it
  depends on how you trained" і великим малюнком.» (Death) / same with "Welcome to
  Ukraine, suka!" (Welcome).
- Patches: «Waiting» 300 · «Welcome» 300 · «Death» 300 · «UTG» 300 · Набір із
  «Waiting, Welcome, Death» 800 — in stock, no descriptions, no sizes.
- Sticker: «Стікер Пак» 250 — in stock, no description, no sizes.

Existing dictionary strings (verbatim, reuse): `product.add` «Додати у Кошик» /
"Add to Cart"; `shared.quantity` «Кількість» / "Quantity"; `category.out` «Немає в
наявності» / "Out Of Stock"; `shared.merch` «мерч» / "merch". Kit-authored copy
available for adoption (verbatim from the ratified kit table): size «Розмір» / "Size";
description «Опис» / "Description"; out-of-stock message «Наразі немає в наявності.
Слідкуйте за оновленнями в Instagram.» / "Currently out of stock. Follow updates on
Instagram." Checkout strings remain out of scope.

The kit's old Product demo is a legitimate sketch, not a constraint: back-link above,
two-column grid (image left in the 2px ink frame with the availability badge; right
column: display title, big Price, description block, size chips, hair divider,
quantity + stepper, block add-to-cart), out state swaps chips→badges + message +
outline Instagram CTA. Depart where the page gets better — the category page's band
pattern (kicker back-link «← {category}») is now shipped chrome-language you can echo.

Interaction expectations (design them; implementation wires them in 4e):

- Size selection for t-shirts: chips with a selected state (the kit prototyped chips as
  raw buttons — our seal forbids that in app-land, so the chips are the EXPECTED
  **proposed DS addition** of this brief: list the component with its full state set —
  default / hover / focus-visible / selected / disabled-out).
- Quantity via the existing `QuantityStepper`; add-to-cart via the accent `Button` —
  **this is THE flag-yellow moment of the page** (one accent per view; the catalog
  pages deliberately carry zero yellow). Per the D3.2 departure note, the in-stock
  badge belongs HERE if you want it — your call.
- Out-of-stock: nothing orderable, no dead controls — message + outline Instagram CTA
  (the kit shape), sizes informational only.

Money: UAH integers; uk ₴ / en $ via the DS `Price` (size `big` exists; `muted` for
out). Honest tone — no dark patterns, no urgency, no invented claims; AA contrast;
touch targets ≥44px; every interactive element maps to an existing DS primitive or an
explicitly proposed addition; NO loading states (SSG, synchronous data).

If a composition genuinely needs something the DS lacks, do NOT silently improvise a
style — build the page with it, but list it separately as a "proposed DS addition" for
ratification.

Deliverable: ONE worked composition — no variant forks: commit to a direction and
polish it across both breakpoints, both locales, and all states. Ship as new files in
this project (`screens/product/`), clearly separated.

Because the prototype is cumulative, WIRE the navigation: category-page product cards
click through to this screen (correct product per card), and the product page's
back-link returns to its category — the project should browse like the real site on
mocked data.
