# Step 5 — SEO pack + scheduled riders (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature Step 5 of the production-polish initiative: the SEO pack — per-page, per-locale metadata with Open Graph, canonicals and hreflang; sitemap and robots; Product JSON-LD — plus five riders scheduled to this window (DEF-4 order-endpoint rate limit, DEF-22 `getCategoryName`, DEF-25 checkout autoComplete, DEF-30 the shared close label, DEF-31 lightbox loading polish). The shop is live and takes real orders — every intermediate commit leaves it fully functional.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md`, `deferred.md` (the five SCHEDULED riders above + the fresh DEF-24/DEF-29 DROPPED rulings — do not relitigate either). Standing facts you must build on:

- The canonical host is `https://www.ua-tactical-gear.com` — the apex 308-redirects to www, so `metadataBase` and every absolute URL use the www host.
- Catalog prices are UAH integers and THE OPERATOR CHARGES UAH — JSON-LD offers carry `priceCurrency: "UAH"` regardless of the display locale. The on-page USD display is informational only.
- T-shirts carry catalog descriptions; patches and stickers have NONE — a missing description is omitted, never invented (the honesty rule is repo law).
- The 404 is a catch-all page answering 200 + `robots noindex` BY DESIGN (DEF-29 accepted); keep it out of the sitemap and keep its noindex.
- Checkout is a cart-dependent client page: planner ruling — `noindex`, excluded from the sitemap.
- The `POST /api/place_order` payload is a SACRED contract: the rate limiter rejects BEFORE forwarding and never touches the body shape.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. Expected plan-gate items: the metadata architecture (layout-level defaults vs per-page `generateMetadata`); the og:image strategy (EXISTING assets only — the product photo on product pages, the logo elsewhere; no new artwork); the JSON-LD field mapping from the catalog module; **meta-description sourcing** — derive from existing dictionary copy wherever possible (the mission line, the about paragraphs, product descriptions) and LIST any genuinely new strings verbatim in both locales for owner ratification (DEF-14 discipline — no silent copy invention); the sitemap entry list with counts; the DEF-31 loading approach (options welcome); the DEF-4 rate-limit numbers.

**Scope:**

1. **Metadata** (per page, per locale): `metadataBase` on the www host; localized title + description; canonical self; `alternates.languages` uk/en + x-default; Open Graph (title, description, image, type, locale). Checkout gains `noindex`. The catch-all 404 keeps its existing noindex + title.
2. **`sitemap.ts`**: every real page in both locales — home, category index, the 3 categories, the 12 products, reports, about — with per-entry language alternates; checkout and the 404 excluded.
3. **`robots.ts`**: allow all, disallow `/api`, sitemap pointer.
4. **Product JSON-LD** on product pages: `Product` with name, image, the catalog description when it exists, and `offers` (price in UAH, `availability` from `isAvailable`, url). Minimal truthful shape that satisfies the rich-results requirements — no invented ratings/brand/GTIN, no size variants.
5. **DEF-22**: add a `getCategoryName(categoryId, locale)` accessor to `src/data` (accessor code only — catalog DATA VALUES are sacred and untouched); the product page back-link and the JSON-LD both use it instead of localizing the whole sibling list.
6. **DEF-25**: `autoComplete` tokens through `CheckoutField`: first_name→`given-name`, last_name→`family-name`, telephone→`tel`, country→`country-name`, state→`address-level1`, city→`address-level2`, address→`street-address`; the additional textarea — your call at the plan gate (omit vs `off`).
7. **DEF-30**: the close label moves to `shared.close` («Закрити»/"Close"); CartDrawer AND the Lightbox call site consume it; `cart.close` dies from both dictionaries (drift-guard keeps the shapes honest).
8. **DEF-31**: lightbox loading polish — the first open must not be a jarring blank white panel (fade-in on load, a quiet placeholder treatment, or your better idea), and `sizes` must stop over-fetching for height-clamped portraits; propose the mechanism at the plan gate. DS visual language unchanged — this is loading behavior, not restyling.
9. **DEF-4**: per-IP in-memory rate limit inside `/api/place_order` (module-scope store; propose the window/threshold, e.g. 5/min; 429 with the existing safe error body; best-effort under serverless instance reuse — say so honestly in the PR). Forwarding logic and payload byte-identical.

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint (0/0) / `prettier --check` / zero-env `yarn build` green; catalog pages STAY SSG (metadata must not de-SSG anything; sitemap/robots are their own routes); all seal greps zero.
- View-source a product page in BOTH locales: canonical, the hreflang pair + x-default, og:\* tags, and the JSON-LD script with the UAH offer — paste the JSON-LD into the schema validator (validator.schema.org or the rich-results test) and put the outcome in the PR.
- `/sitemap.xml`: exactly the expected URL set (2 locales × (home + category index + 3 categories + 12 products + reports + about) = 38 entries); `/robots.txt` serves with the sitemap line; neither checkout nor any dead URL present.
- Served checkout HTML carries noindex AND the autocomplete attributes on every mapped field.
- `cart.close` greps zero; the drawer close and the lightbox close both render the shared label in both locales.
- Rate-limit proof WITHOUT sending real orders: zero-env prod server (the route 503s on the relay call — safe), curl burst → threshold-plus requests return 429, an under-threshold request still reaches the 503 path; the 429 body carries no internals.
- Lighthouse SEO ≥ 90 on home, a category, and a product page: run the CLI against a local prod server if Chrome is available in the environment; if not, list the run explicitly as a user browser gate (devtools Lighthouse) — do not silently skip.
- Browser gates for the user, listed explicitly in the PR: rich-results test screenshot on a product URL (after deploy), mobile autofill offering real suggestions on the checkout form, the lightbox first-open on a throttled connection.
- Fence: `src/app/**` metadata/sitemap/robots (+ the `[...rest]` page only if its metadata needs aligning), `src/app/api/place_order/route.ts` (rate limit only), `src/data` (accessor addition only), `CheckoutField`, the CartDrawer + lightbox close-label call sites, dictionaries (`shared.close` move + any owner-ratified meta strings). NO catalog data values, NO payload keys, NO DS visual changes, NO new dependencies without a plan-gate case.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
