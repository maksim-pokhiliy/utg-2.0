# Step 6 — Tests + CI + drift-guard riders (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature Step 6 of the production-polish initiative: the repo's first test suite and CI — Vitest + RTL over the money-path logic, a Playwright happy path, and a GitHub Actions workflow green on every PR — plus the drift-guard riders scheduled to this window (DEF-33 + DEF-34 as one family, DEF-35). The shop is live and takes real orders; every intermediate commit leaves it fully functional, and the suite itself must never touch the real order relay.

**Context.** Read first: `initiatives/production-polish/charter.md` (acceptance: "Unit + e2e suites exist and run green in GitHub Actions on every PR"), `state.md`, `decisions.md`, `deferred.md` (DEF-33/34/35 are this step's riders; the DS-hygiene trio DEF-27/28/32 is explicitly OUT — it lands as step 6b after this suite exists, so refactors go in under green tests). Standing facts:

- The build is zero-env by design and CI must stay secretless: `yarn build` with no env is the established invariant; checkout returns 503 without `PLACE_ORDER_URL` — that 503 is a DETERMINISTIC fixture for the error path, not a failure to work around.
- The checkout payload (`{...values, cart, locale, total, currency}`; field names per `extracted/bot-contract-index.js`) is a SACRED contract — this step turns it into an executable contract test; it must never change it.
- Cart persistence is a RAW JSON array under localStorage key `utg-cart-v2` (custom PersistStorage, NOT Zustand's envelope) — the codec and its legacy-line compatibility are contract surface.
- All t-shirts are out of stock in the real catalog; patches are available and sizeless — e2e flows use a patch. Never flip availability in committed code.
- Catalog DATA VALUES are sacred. DEF-34 sanctions a SCHEMA change: `CatalogProduct` image entries gain `width`/`height` (typed, so a product without dimensions cannot compile) — the numbers themselves must be verified against the actual file headers, never guessed.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. Expected plan-gate items: the test-file layout (colocated vs `__tests__`), the Vitest config shape (jsdom for RTL, `@root` alias mapping), the unit-test matrix vs the list below (argue additions/removals), the e2e matrix and its Playwright-in-CI setup (browser install + caching strategy; note if the LOCAL environment cannot run Playwright — the CI run on the PR branch is then the authoritative gate, never a silent skip), the DEF-34 schema shape, how the drift-guard tests read image headers, and the CI workflow structure (Node version pin, yarn cache, job layout).

**Scope:**

1. **Vitest + RTL infrastructure** (devDependencies sanctioned; config files at repo root; no comments anywhere — the no-comments law covers tests and configs).
2. **Unit suites over the money path** (the floor — extend at the plan gate, do not shrink):
   - `cart.ts`: `composeCartLine` identity (sized `slug::SIZE` + `Title · SIZE`, sizeless bare slug), quantity normalization ≥1 at every entry point, add/merge/setQty/remove/clear semantics, the RAW-array persistence codec incl. a legacy bare-slug line surviving rehydration.
   - money: `resolveMoney` matrix — rates present → USD on `en`; rates absent → real UAH amounts on BOTH locales (never `$` on a UAH magnitude); formatting.
   - checkout: validation (required six, trimmed values are what ships), the PAYLOAD CONTRACT test — the built payload's key set byte-equals the bot contract (test name points at `extracted/bot-contract-index.js`), `currency` follows the money context; outcome semantics — success is the only path that clears the cart, error keeps cart AND form.
   - rate limiter: window math, 429 + Retry-After beyond threshold, LRU eviction to the low-water mark, fail-OPEN on null identity, future timestamps ignored.
   - seo utils: `buildPageMetadata` (canonical/hreflang/OG shape on the www base), `splitAtToken` null contract, sitemap = exactly 38 entries with checkout/404 absent.
3. **Playwright happy path** (against a zero-env `next start`): home → category → patch product → add to cart (drawer auto-opens, count updates) → checkout → fill the form → submit → the REAL 503 path: error toast, cart and form intact. A second spec mocks the relay route to 200 (Playwright route interception — no real relay, no new env) → success screen, cart cleared. Plus: cart survives a reload (persistence e2e).
4. **GitHub Actions** (`.github/workflows/ci.yml`): on `pull_request` and push to `master` — install (yarn, cached), tsc, lint, `prettier --check`, vitest, zero-env build, Playwright. Secretless by construction. The workflow lands on this PR's branch, so THE PR ITSELF must show it green — that is the charter's acceptance mechanism proving itself.
5. **DEF-34 rider**: image dimensions move into the typed catalog schema (`catalog.types.ts` + the entries in `catalog.ts` — schema + derived-metadata addition, zero business-value edits); `IMAGE_DIMENSIONS` in `src/utils/seo.ts` dies; consumers read the catalog.
6. **DEF-33 rider**: a drift-guard test asserts every catalog image's declared width/height — and `REPORT_DIMENSIONS` in ReportsScreen — byte-match the actual JPEG/PNG headers under `public/images/`.
7. **DEF-35 rider**: `LOCALES: readonly Locale[]` exported beside `DEFAULT_LOCALE` in `src/utils/locale.ts`; `proxy.ts`, `sitemap.ts`, and any other bare `["uk", "en"]` consume it; a locale skipped from the list would now fail the sitemap-count test.

**Acceptance gates (verify and report in the PR test plan):**

- Full battery green: tsc / lint (0/0) / `prettier --check` / vitest / zero-env `yarn build`; route table unchanged (the suite must not de-SSG anything); all seal greps zero.
- The payload contract test FAILS if any key is added/renamed/removed (prove it with a temporary local mutation, then revert — describe in the PR, do not commit the mutation).
- The drift-guard test FAILS on a wrong dimension (same prove-then-revert protocol).
- Playwright: both order outcomes (real 503, mocked 200) + persistence pass — locally if the environment allows, otherwise via the CI run on this PR (state which explicitly).
- CI green on the PR itself — link the run in the PR body.
- Fence: devDependencies + test/CI configs, `.github/workflows/`, test files, `src/data` (DEF-34 schema + dimensions only), `src/utils/locale.ts` + `src/proxy.ts` + `src/app/sitemap.ts` (DEF-35 consumption only), `src/utils/seo.ts` (IMAGE_DIMENSIONS removal only). NO app behavior changes beyond the three riders, NO DS changes (the trio is 6b), NO payload keys, NO catalog business values, NO test-only exports bolted onto app modules without a plan-gate case.

**Constraints:**

- No comments in code — tests and configs included; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
