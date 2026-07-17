# Step 1 — Rescue: drop Firebase, static catalog, RSC migration (executor prompt)

Precondition: PR #2 (step 0) is merged; branch from fresh `master`.
Invocation: paste everything below into the executor tab as one message.

---

/feature Step 1 of the production-polish initiative: remove Firebase entirely, replace the Firestore catalog with a typed static in-repo catalog + local images, and migrate catalog pages to server components. This is a rescue: production is partially down (Firebase Storage returns 402 on every image, the category/product API 504s), and this step brings the site back fully working with zero Firebase dependencies.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-7 drop-Firebase, D-8 money fallback, D-9 component layer — all RATIFIED, do not re-litigate), `deferred.md` (DEF-8, DEF-12 land here), and `initiatives/production-polish/extracted/README.md` — the inventory of recovered content this step consumes. The scope below is a fence; adjacent problems (Recoil, redesign, fonts, SEO beyond basics) belong to later steps — note them as findings in the PR instead of fixing.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner.

**Scope:**

1. **Typed static catalog module** (location/shape is your design call, e.g. `src/data/`):
   - Sources of truth in `initiatives/production-polish/extracted/`: `catalog-1.0-routes.js` (12 products in 3 categories: titles, UAH prices, availability, sizes, English descriptions), `translations-1.0-ua.json` + `translations-1.0-en.json` (Ukrainian translations for product titles and t-shirt descriptions; key = English string), `categories.json` (live category list snapshot).
   - **Data faithfulness is sacred**: titles, prices, availability, sizes, descriptions verbatim from the sources — never invent or "improve" catalog content. Availability is confirmed current: all 6 t-shirts out of stock, patches and stickers in stock.
   - Model: localized title/description (uk + en), price as UAH integer, availability, sizes (t-shirts: M/L/XL/2XL), image path, category. Category URL segments stay `patches`/`stickers`/`tshirts` (lowercase, matching today's URLs). Product slugs: pick stable, readable, lowercase slugs (old Firestore product IDs are unknown and prod product URLs are already dead, so there is no continuity to preserve).
   - Category display names keep working via the existing `dictionary.categories` mechanism or move into the module — your call, but both locales must render correctly.
2. **All images local.** Copy the recovered originals from `initiatives/production-polish/extracted/assets/` into `public/` (structure your call): 13 product/category photos, 8 report photos, `no_commercial.JPG` (about page), `favicon-2.0.ico` → the app's favicon (App Router `icon` convention or metadata — replace the `<head>` hot-link), `IMG-0253-logo-640.png` → the NavBar/home logo. **This copy is required and is the one exception to the planner-artifact rule: you copy files OUT of `initiatives/` INTO `public/` and commit `public/`; you still never stage `initiatives/` or `CLAUDE.md` themselves.**
   - Home hero photo is unrecoverable (DEF-9): remove the dead hero `<Image>` and let the typographic block + logo carry the hero — minimal effort, no design investment (step 4b redesigns it). No broken images may remain anywhere.
   - Remove the `firebasestorage.googleapis.com` remotePattern from `next.config.mjs` (no remote images remain).
3. **RSC migration of catalog pages.** Home, `/category`, `/category/[categoryId]`, `/category/[categoryId]/[productId]` become server components importing the catalog module directly — no fetch, no API routes, no useEffect, no loading states for catalog data (it is synchronous). Screen components may stay client (they read the Recoil dictionary until step 2) and receive catalog data via props.
   - `generateStaticParams` for category and product routes from the module; unknown category/product → `notFound()`.
   - DEF-8: add `dynamicParams = false` for `[lang]` so `/fr/anything` is a 404 instead of a runtime crash.
   - Add `error.tsx` and `not-found.tsx` (root level; localized copy if reachable, minimal styling — functional, not designed).
   - Collapse the four route groups `(main)`/`(categories)`/`(category)`/`(product)` into plain segments; replace the per-group static metadata layouts with `generateMetadata` on the pages (localized: product pages titled by product name, category pages by category name). Keep it modest — the full SEO pack is step 5.
   - Product page: render the localized description as a plain paragraph (its debut — Firestore never had descriptions). Sizes stay data-only; the size selector UI is step 4b.
   - Delete: the three `/api/categories*` routes, `src/lib/firebaseAdmin.ts`, the `firebase-admin` dependency, the four `FIREBASE_*` keys from `.env.example`, `firebase.json`, `.firebaserc`.
4. **Exchange rates — terminal fix (D-8).** Fetch with `next: { revalidate: 3600 }` (keep the step-0 guards). Display currency becomes explicit data instead of being derived from locale: when rates are available, `en` converts to USD as today; when rates are unavailable, **both locales show real UAH amounts formatted as ₴** — never a `$` glyph on a UAH magnitude, never NaN. Thread `{coefficient, currency}` (or equivalent) from the layout through the provider into `formatPrice` call sites; exact shape is your design call. Do NOT change the checkout payload (field names/shape are a sacred contract; `locale` + `total` stay as-is — the operator-side Telegram formatting quirk when rates are down is a known accepted issue, DEF-13).
5. **Order route hygiene (DEF-12).** In `/api/place_order`, stop sending `details: errorMessage` to the client in the 500 body (keep the server-side `console.error`).
6. **Cart storage invalidation.** Bump the cart localStorage key (`src/utils/constants/recoil.ts`, e.g. a versioned key). Rationale: persisted carts hold dead `firebasestorage` image URLs; after the remotePattern removal, `next/image` throws at runtime on a non-allowlisted host, so a stale cart would crash the cart drawer.
7. **README touch-up.** Update the description/stack/env sections to match reality (static in-repo catalog, no Firebase, env is now only the 2 exchange-rate keys + `PLACE_ORDER_URL`). Minimal edits; the presentation README is step 7.

**Acceptance gates (verify and report in the PR test plan):**

- `npx tsc --noEmit`, `yarn lint`, and `yarn build` green — build with **no env vars at all**.
- `grep -ri firebase src/ package.json` → zero matches; `firebase.json`/`.firebaserc` gone; no `firebasestorage` string anywhere in the repo outside `initiatives/`.
- Build output: home, `/category`, category and product pages are SSG/static (`●`/`○`), not `ƒ`.
- View-source of `/uk` and `/uk/category/patches` contains product/category titles (server-rendered content, no client fetch for catalog).
- All images load from `public/` paths; no broken images on any page (hero included).
- `/fr/anything` → 404; unknown category/product slug → 404.
- With no env: both locales show ₴-formatted UAH prices everywhere (catalog, cart, checkout totals).
- `/api/categories` returns 404 (deleted); `/api/place_order` still works and its 500 body contains no `details`.
- Stale-cart safety: seed localStorage with the old cart key holding a firebasestorage image URL → app renders without crashing (old cart ignored).
- `yarn dev` smoke: navigate home → category → product → add to cart → cart drawer → checkout form renders; language switcher works on catalog pages.

**Constraints:**

- Match existing code style; no comments in code; remove existing comments in any section you edit.
- No drive-by work: no Recoil changes beyond what the rates threading requires, no redesign, no font/dependency swaps (D-9 lands in step 4a), no test scaffolding.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
- Never stage `CLAUDE.md` or `initiatives/` (the asset copy in scope item 2 commits `public/` only).
- Do not edit files under `initiatives/` — planner-managed.
