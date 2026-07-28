# Step 6 fix round — PR #15 (executor prompt)

Invocation: paste into the SAME executor tab that ran step 6 (continuation: same
branch `feat/test-suite-ci`, same PR #15).

---

Fix round for PR #15. The review verdict: GitHub Actions is green, but the Vercel
deployment check is RED — `yarn install` dies on prod's Node 20.20.2 because jsdom@30
declares `engines.node: ^22.22.2 || ^24.15.0 || >=26.0.0` and yarn 1 hard-fails on an
engines mismatch. Ratified direction (D-13): the whole toolchain pins to Node 24 —
Vercel's own deprecation notice mandates 24.x by 2026-10-01, so 22 would only postpone
the same cliff. The owner upgrades local Node to 24 before you start — run `node -v`
first; if it does not print v24.x, STOP and report instead of working around.

Items (all in this PR, same branch):

1. **The Node pin.** `package.json` gains `"engines": { "node": "24.x" }` — the single
   binding pin: Vercel reads `engines.node` and it OVERRIDES the dashboard Node
   setting; yarn 1 hard-enforces it on every install; CI consumes it via
   `node-version-file`. In `.github/workflows/ci.yml` replace `node-version: 22` with
   `node-version-file: package.json`. Bump `@types/node` to `^24`. Do NOT add `.nvmrc`
   (a second pin file is its own drift surface, and Vercel ignores it). NEVER pass
   `--ignore-engines`: if any dependency's engines rejects Node 24, stop and escalate.
2. **tsconfig split.** Root `tsconfig.json` excludes `tests`, `e2e`,
   `vitest.config.ts`, `playwright.config.ts`; a new `tsconfig.test.json` (extends the
   root) covers exactly those; the `typecheck` script runs BOTH programs. Proof:
   `yarn tsc -p tsconfig.json --noEmit --listFiles | grep -E "/(tests|e2e)/" | wc -l`
   prints 0 — the prod build stops typechecking test files and stops depending on test
   tooling at build time.
3. **CI build hermeticity.** The `yarn build` step in ci.yml gets an explicit `env:`
   block with the three keys empty (`PLACE_ORDER_URL`, `EXCHANGE_RATE_API_URL`,
   `EXCHANGE_RATE_API_KEY`) — the build that Playwright's `yarn start` serves is then
   env-hermetic in CI exactly as the local `e2e` script already makes it.
4. **Header a11y/i18n.** ``aria-label={`Cart: ${itemsCount}`}`` in
   `src/components/layout/Header.tsx` is hardcoded English on a bilingual site.
   Compose it from EXISTING dictionary strings — `cart.cart` is «Кошик»/"Cart", so
   `` `${dictionary.cart.cart}: ${itemsCount}` `` — no new dictionary keys, no
   invented copy.
5. **e2e hooks.** e2e must not select DS-internal classes (`span.type-price-big`) or
   English-hardcoded accessible names (`button[aria-label="Cart: ..."]`). Add
   `data-testid` hooks to the header cart control and the product-page price node
   (app-land attributes only — zero DS file edits), switch `e2e/support/app.ts` to
   them; the count assertion reads rendered text or a data attribute, never the
   accessible-name string. Proof: `grep -rnE "type-price|Cart: " e2e/` prints nothing.
6. **vitest.config.ts.** The node project's `exclude` becomes
   `[...configDefaults.exclude, ...]` instead of a full override that silently drops
   the defaults.
7. **The vacuous 503 assert.** `expectUpstreamOnly(...)` in
   `tests/app/api/place_order/route.test.ts` passes vacuously over an EMPTY calls
   array in the 503 test — replace it there with an explicit assertion that the relay
   was never called (zero fetch calls).
8. **PR description truth.** "CI is green on this PR" reads as all-checks-green while
   the Vercel check was red at review time. Correct it to the full truth: Actions
   green, Vercel deployment red at review (Node 20 vs jsdom engines), fixed by this
   round — after pushing, link BOTH green checks. In Risks, drop the
   tests-in-the-prod-TS-program item (item 2 closes it); keep the rest honest.

Acceptance gates (verify and report in the PR):

- `node -v` = v24.x stated in the PR; full local battery green on it: lint /
  `prettier --check` / typecheck (both programs) / vitest / zero-env build /
  `yarn e2e`.
- The two proof commands above print 0 / nothing.
- After push, BOTH PR checks green: the Actions run AND the Vercel preview deployment.
  The dashboard is still on 20.x when you push — the preview going green is the proof
  that the engines pin alone binds Vercel. If the preview still builds on Node 20
  despite the pin, report it (the owner then flips the dashboard first and the pin
  stays as enforcement).
- Route table unchanged; seal greps zero; no catalog values, no payload keys, no DS
  files touched.

Fence: `package.json` (engines + `@types/node` + the typecheck script), `yarn.lock` as
install fallout, `tsconfig.json` + `tsconfig.test.json`, `.github/workflows/ci.yml`,
`vitest.config.ts`, `tests/`, `e2e/`, `src/components/layout/Header.tsx` (label +
testid only), the product-page price node (testid only). Nothing else.

Constraints: no comments in code (tests and configs included); never stage `CLAUDE.md`
or `initiatives/`; `yarn format` before committing; commits and PR text in English,
first person, no AI signatures.
