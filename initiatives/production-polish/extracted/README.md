# extracted/ — recovered content (consumed by step 1)

Planner-managed. Step 1 consumed this into `public/` + the typed catalog module
(`src/data/`); what remains here is the documentary record: the recovered data sources
and the bot contract. `assets/` is gitignored (binaries; `public/` is the asset SSOT)
and exists only on the planner's machine.

## Why this exists

Firebase (project `ukrainian-tactical-gear`) is being dropped (D-7). As of 2026-07-17
production is partially down: Firebase Storage returns **402 Payment Required** on every
image (Spark plan stopped serving), and `GET /api/categories/[id]` times out (**504
FUNCTION_INVOCATION_TIMEOUT**, reproducible ×4) — so category/product pages render
empty and no product images load anywhere. Only `GET /api/categories` (top-level list)
still works. Content was recovered from the public `maksim-pokhiliy/utg-1.0` repo
(CRA-era, images + full catalog committed), Wayback Machine, and the live top-level API.

## Inventory

- `categories.json` — live prod snapshot of `GET /api/categories` (3 categories: PATCHES, STICKERS, TSHIRTS; image URLs are dead firebasestorage links).
- `catalog-1.0-routes.js` — the 1.0 static catalog (source of truth for products): titles, prices (UAH), availability, sizes, **descriptions** (richer than Firestore — 2.0 never had descriptions), report captions. Per user, catalog data never changed in the project's life. Availability confirmed current (DEF-10): t-shirts all out of stock, patches + stickers in stock.
- `translations-1.0-ua.json` / `translations-1.0-en.json` — the 1.0 i18n dictionaries: **Ukrainian translations for product titles and t-shirt descriptions** («Death» Black → «Death» Чорна, full uk description paragraphs). Key = English string, value = translation. 2.0's Firestore catalog was English-only; these make the static catalog properly bilingual.
- `assets/products/` — all 13 product/category images (originals from 1.0).
- `assets/reports/` — report_1..8.jpg.
- `assets/no_commercial.JPG` — about-page image.
- `assets/IMG-0253-logo-640.png` — the UTG logo used in NavBar/home; recovered from Wayback via the Vercel image optimizer cache at 640×448 (largest archived size; rendered at ≤320px in the app, so sufficient).
- `assets/favicon-1.0.ico`, `assets/favicon-2.0.ico` — byte-identical (1.0 repo / Wayback bucket capture).
- `assets/logo150.png` — 1.0 header logo.
- `bot-contract-index.js` — full source of the order bot (public repo `maksim-pokhiliy/utg-tg-order-bot`, deployed as `telegram-bot-server` on Vercel). Contract: POST `/place_order` with `{first_name, last_name, telephone, country, state, city, address, locale, total, cart: [{title, quantity, productUrl}], additional}`; bot formats `total` itself via the same locale→currency map; responds `200 {status:"success"}` / `500 {status:"error", message}`.

## Known gaps

- `hero/utg-hero-3.JPG` (home hero photo, rendered ~1000px) — NOT recovered: absent from 1.0, absent from Wayback, Storage returns 402. Ask user for the original, or replace the hero in step 4a.
- Product images at full original resolution only — Firestore may have referenced identical files (filenames match 1.0 exactly), assumed same.
- Firestore product doc IDs unknown (products endpoint dead); step 1 defines its own slugs — prod product URLs are already broken, so no continuity is lost.
- 1.0 data marks all 6 t-shirts `PRODUCT_NOT_AVAILABLE`; patches and stickers available. Confirm with user this still reflects reality before shipping the static catalog.
