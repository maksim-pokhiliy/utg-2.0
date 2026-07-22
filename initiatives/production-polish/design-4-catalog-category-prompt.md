# D3.2 — Catalog index + Category pages design (Claude Design brief)

Paste everything below into the SAME Claude Design dialog that produced the Home
prototype, as one message, with the freshly refreshed `utg-2.0` Desktop snapshot
attached. The design project now accumulates page by page into a full clickable
prototype of the site on mocked data — every following page brief lands in this same
dialog.

Standing rule for ALL page briefs (D3 track): the user attaches a FRESH snapshot of the
codebase (folder `utg-2.0`, planner refreshes it on the Desktop before each brief) to
the design dialog; the newest snapshot SUPERSEDES any previously attached one. The
brief still carries all copy inline; the attached code is the ground truth for what
exists — the sealed design system in `src/design-system/` (tokens `styles/theme.css`,
primitives, public barrel `index.ts`), current screens in `src/app/[lang]/` +
`src/components/`, dictionaries in `src/app/[lang]/dictionaries/`.

---

Page-design phase, second brief — same dialog, the prototype grows. The freshly
attached `utg-2.0` snapshot SUPERSEDES the one from the Home brief: your ratified Home
is now SHIPPED and live in it (`src/components/pages/HomeScreen.tsx`), and
`src/design-system/` now includes `CategoryTile` (your numbered tile, as implemented —
DS-native values). The design system is FROZEN and ratified — tokens, type, primitives,
guidelines are the law; do not restyle them. The storefront screens in older `ui_kits/`
demos are sketches you may depart from, not ratified designs.

**Task: design TWO surfaces** (they ship together as one implementation step).
Mobile-first (375px) and desktop (1200px+), Ukrainian default with an English variant
(uk strings run 20–30% longer — design for uk, verify en).

**Surface 1 — Catalog index (`/category`).** The header-nav «мерч» destination. Home
already shows the three numbered category tiles, so this page needs its own reason to
exist as the catalog's front door — fuller tiles, per-category product counts, whatever
earns the visit — without inventing content (any count must be derivable from the
catalog module, nothing hardcoded). REUSE the shipped `CategoryTile`; if it needs an
extension (a count line, a fuller body), propose it explicitly as a DS addition — do
not restyle it silently.

**Surface 2 — Category page (`/category/[categoryId]`).** The product grid. THREE real
instances must all look right:

- Патчі / Patches — 5 products, all in stock;
- Стікери / Stickers — ONE product (a one-card grid must not look broken);
- Футболки / T-Shirts — 6 products, ALL out of stock (the page must stay honest and
  non-dead).

Real content (no lorem; design-load rule: the longest title and the out-of-stock states
MUST appear in the prototype):

- Патчі: «Waiting» 300 · «Welcome» 300 · «Death» 300 · «UTG» 300 · Набір із «Waiting,
  Welcome, Death» / Set of «Waiting, Welcome, Death» 800 — all in stock.
- Стікери: «Стікер Пак» / «Sticker Pack» 250 — in stock.
- Футболки: «Death» Чорна/Black · «Welcome» Чорна/Black · «Death» Зелена/Green ·
  «Welcome» Зелена/Green · «Death» Сіра/Grey · «Welcome» Сіра/Grey — 1000 each, ALL out
  of stock.

Product and category photos: real files in the snapshot under `public/images/products/`;
each product's `image` path is in `src/data/catalog.ts` — use the real photos, amateur-photo
treatment per the ratified system (1:1, 2px ink frame).

Money: prices are UAH integers; uk renders ₴, en renders $ (converted). The DS `Price`
component exists — use it.

Existing dictionary strings (verbatim, reuse — do not re-invent): `category.order`
«Замовити» / "Order Now"; `category.out` «Немає в наявності» / "Out Of Stock";
`shared.merch` «мерч» / "merch". Kit-authored copy is available for adoption where it
fits (e.g. the kicker «Категорія» / "Category"). Product-DETAIL copy (size, description,
out-of-stock message) is NOT this brief — the product page comes next.

The ratified out-of-stock treatment is system law: image 45% grayscale + 70% opacity,
`Badge` state; out-of-stock products stay visible and navigable (their product pages
exist) — never hidden, never faked as available.

A product-card treatment will be needed. Styled interactive elements are DS-owned:
whatever card you land, list it separately as a **proposed DS addition** (`ProductCard`)
with its full state set (default / hover / focus / out-of-stock) for ratification — the
old kit ProductCard demo is a legitimate starting sketch, not a constraint.

Rules (unchanged from the system): honest tone — no dark patterns, no urgency
mechanics, no invented claims (no fake scarcity, no "popular" labels); ONE accent
(flag-yellow) CTA moment per view; AA contrast; touch targets ≥44px; every interactive
element maps to an existing DS primitive or an explicitly proposed addition; NO loading
states — these pages are SSG with synchronous data (the old kit's skeleton theater is
banned).

If a composition genuinely needs something the DS lacks (a new variant, a new pattern),
do NOT silently improvise a style — build the page with it, but list it separately as a
"proposed DS addition" for ratification.

Deliverable: ONE worked composition per surface — no variant forks: commit to a
direction and polish it across both breakpoints, both locales, and all states
(hover/focus per the system). Ship as new files in this project, clearly separated
(e.g. `screens/catalog/` + `screens/category/`).

Because the prototype is cumulative, WIRE the navigation: the Home screen's category
tiles and its catalog flow click through to the new screens, the catalog index's tiles
click through to the three category instances — the project should browse like the
real site on mocked data.
