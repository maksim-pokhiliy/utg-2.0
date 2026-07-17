# Step 0 — Quick wins (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature small Step 0 of the production-polish initiative: kill artificial loading delays, fix the broken order-placement response handling, make the app boot/build without secrets, remove dead code, add .env.example, replace the boilerplate README.

**Context.** This repo runs a multi-step initiative driven by a separate planner session. Before planning, read `initiatives/production-polish/charter.md` (goal, sacred constraints), `initiatives/production-polish/state.md` (board), and `initiatives/production-polish/decisions.md` (do not re-litigate RATIFIED decisions). This run is **Step 0 — Quick wins**. The scope below is a fence: nothing else goes in this PR. Bigger refactors (RSC migration, state management, redesign) are later steps — if you find adjacent problems, note them in the PR description as findings instead of fixing them.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner.

**Scope (all of it, nothing else):**

1. **Remove the artificial 1s loading delay.** All four data pages wrap `setIsLoading(false)` in `setTimeout(..., 1000)` inside `finally`: `src/app/[lang]/(main)/page.tsx`, `src/app/[lang]/(categories)/category/page.tsx`, `src/app/[lang]/(category)/category/[categoryId]/page.tsx`, `src/app/[lang]/(product)/category/[categoryId]/[productId]/page.tsx`. Clear the loading state immediately.

2. **Fix order placement reporting false success.** `src/app/api/place_order/route.ts` returns `NextResponse.json(response)` where `response` is a fetch `Response` object — it serializes to `{}` with status 200 no matter what the upstream did, so the client always sees success. Fix the route to read the upstream body and forward it together with the upstream status; guard a missing/unset `PLACE_ORDER_URL` with a 503 instead of fetching `"undefined/place_order"`. Then fix `handleSubmit` in `src/components/pages/CheckoutScreen.tsx`: non-ok response → error toast, cart and form stay intact; only a confirmed ok response clears the cart and shows the success toast. Add the missing `Content-Type: application/json` header to that fetch. Behavior contract: a failed order must never clear the cart or report success. Do NOT change the outgoing payload shape (field names/structure) — it is a sacred contract with the external bot service.

3. **Env-tolerant boot and build.** `yarn build` currently crashes without `.env.local`: `src/lib/firebaseAdmin.ts` calls `process.env.FIREBASE_PRIVATE_KEY!.replace(...)` at module load, and the root layout's exchange-rates fetch (`src/app/[lang]/layout.tsx`) has no error handling. Required behavior:
   - Firebase Admin initializes lazily on first use; with creds missing, catalog API routes return 503 with a clear error body instead of crashing the process/build.
   - Remove the redundant `dotenv` import/config from `firebaseAdmin.ts` and drop the `dotenv` dependency from package.json (Next.js loads `.env.local` natively).
   - The rates fetch is guarded (missing env, network failure, non-ok, bad JSON). On failure the site still renders and prices are shown as real UAH amounts for both locales (never NaN, never a wrong-currency conversion). How you thread the fallback through is your design call — keep the diff minimal; proper caching/revalidation is a later step.
   - Net result: `yarn build` green with no `.env.local` present.

4. **Delete dead code.** `src/hooks/useInitializeCart.ts` (empty file); the write-only `exchangeRatesState` atom in `src/recoil/atoms.ts` and its seeding in `src/providers/RecoilProvider.tsx`.

5. **Add `.env.example`** documenting all 7 required vars with a one-line hint each: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_STORAGE_BUCKET` (Firebase service account), `EXCHANGE_RATE_API_URL`, `EXCHANGE_RATE_API_KEY` (UAH-based rates API), `PLACE_ORDER_URL` (external order-relay service).

6. **Replace the boilerplate README.** The current `README.md` is untouched create-next-app output. Write a minimal honest one: one-paragraph description (bilingual uk/en volunteer merch storefront; proceeds support a Ukrainian military unit — source the tone from `src/app/[lang]/dictionaries/en.json` `about` section, no marketing fluff), stack list, getting started (Node + yarn, `.env.example` → `.env.local`, `yarn dev`), scripts table. Keep it lean — the full README with screenshots/badges is a later step; do not gold-plate.

**Acceptance gates (verify and state results in the PR test plan):**

- `npx tsc --noEmit` and `yarn lint` green.
- `yarn build` green **without** `.env.local`.
- Without env: dev server boots, pages render (empty catalog + 503 API responses acceptable), no unhandled crashes.
- If `.env.local` is available: home/category/product pages load with no artificial delay; checkout failure path (point `PLACE_ORDER_URL` at an unreachable host) shows the error toast and keeps the cart; success path still works.
- State explicitly in the PR which gates you exercised and which you could not (and why).

**Constraints:**

- Match existing code style. No comments in code; remove existing ones in any section you edit.
- Surgical diffs only — no drive-by refactors, no formatting sweeps outside touched code.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
- Do not stage or commit `CLAUDE.md`, `initiatives/`, or any other untracked planner artifacts — only files your change touches.
- Do not edit files under `initiatives/` — planner-managed.
