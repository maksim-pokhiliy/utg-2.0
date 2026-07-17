# Step 2 — State migration: Recoil → Zustand, cart bug pack, typed dictionaries (executor prompt)

Precondition: PR #3 (step 1) is merged; branch from fresh `master`.
Invocation: paste everything below into the executor tab as one message.

---

/feature Step 2 of the production-polish initiative: remove Recoil entirely. Client state shrinks to exactly two concerns — cart and sidebar — in a Zustand store; everything else (dictionary, money, locale) becomes server-resolved data flowing through React context providers seeded per request. Fix the cart's correctness bugs, make dictionaries typed, and re-enable the disabled hooks lint rule.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-6 Zustand — RATIFIED, do not re-litigate), `deferred.md` (DEF-5, DEF-16 land here; DEF-3 explicitly does NOT). The scope below is a fence; adjacent problems (visual redesign, dependency swaps beyond Recoil, tests) belong to later steps — note findings in the PR instead of fixing.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner.

**Scope:**

1. **Recoil → Zustand (cart + sidebar only).** Add `zustand`; remove `recoil` from package.json. Store design is yours, with these requirements:
   - Cart store persists to localStorage under the existing key `utg-cart-v2` (`src/utils/constants/recoil.ts` — rename/move that constants file to match the new world). Persisted shape stays `{id, title, price, quantity, image, productUrl}[]` — carts saved after step 1 must survive this migration byte-compatible; do not add fields now.
   - Forward note, design-only: step 4b will add size to cart-item identity (DEF-3) — pick a store API that won't make that a breaking rewrite (e.g. line-item operations keyed by an id the caller supplies), but do NOT implement sizes now.
   - Hydration safety: the current `CartBag` uses an `isClient` flag to avoid SSR/client mismatch — solve the same problem properly with your store setup (persist rehydration), no hydration warnings in dev console.
2. **Dictionary, money, locale → server-resolved context.** Kill `dictionaryState`, `languageState`, and the money atom(s). The `[lang]` layout already resolves dictionary + `{coefficient, currency}` server-side — deliver them to client components via context provider(s) whose values come from layout props and **update on locale navigation** (this must fix the known staleness bug: Recoil's `initializeState` ran once, so client-side locale switching kept stale money/dictionary/language until hard reload; context re-renders with new props fix it). `RecoilProvider` dies; `LanguageSwitcher` reads locale from context or `useParams`, not an atom.
3. **Typed dictionaries.** Type the dictionary as `typeof en` (import the JSON) instead of `Record<string, Record<string, string>>`; consumers get compile-time key checking — the `dictionary?.x.y` optional-chain pattern dies. Delete the now-unused `categories` block from both dictionary JSONs (category names come from the catalog module since step 1; verify with a grep before deleting). Keep `uk.json` structurally identical to `en.json` — if the two files drift, the build or a type check must fail, not silently render `undefined`.
4. **Cart bug pack** (verify each against current master before fixing — all existed pre-step-1):
   - `ProductSidebar.addToCart` mutates state: `newCart[existingItemIndex].quantity += quantity` on a spread-copied array still mutates the shared item object. Immutable update.
   - `CartItem` keeps a local `useState(item.quantity)` that desyncs from the store (stale after external cart changes; `key={index}` remaps rows after removal so quantities land on the wrong item). Make quantity fully store-driven; replace `key={index}` with `key={item.id}` in `CartView` and `CheckoutScreen` lists.
   - Quantity input: `Number("")` is 0 and `parseInt("")` is NaN — typing/clearing the field must never write 0/NaN into the store or crash; empty input while typing is fine transiently, but blur/commit lands on a sane integer ≥ 1.
   - While in there: the two duplicated quantity-stepper blocks (`CartItem`, `ProductSidebar`) may be extracted into one small component if it genuinely simplifies — allowed, not required; no visual changes.
5. **Lint rule back on (DEF-5).** Delete the `react-hooks/exhaustive-deps: off` override from `.eslintrc.json`; fix every violation it surfaces properly (real dependencies, not eslint-disable comments — the no-comments code rule applies doubly to disable directives; if a genuine exception is unavoidable, justify it in the PR description).
6. **Step-1 review hygiene (DEF-16).** `src/app/[lang]/error.tsx`: log the swallowed error (`console.error(error)`). Move `resolveLocale` out of the `src/data` barrel into a locale utility module (client error boundaries currently import `@root/data` for it); update imports.

**Acceptance gates (verify and report in the PR test plan):**

- `npx tsc --noEmit`, `yarn lint` (with exhaustive-deps active), `yarn build` with zero env — all green; catalog pages still all `●` SSG in build output.
- `recoil` absent from package.json and yarn.lock; `grep -ri recoil src/` → zero (constants file renamed).
- Cart flow in `yarn dev`: add product → drawer shows it; add same product again → quantity sums (no mutation warning, correct after re-add); two different products → remove the first → second keeps its own quantity (the `key={index}` bug is dead); quantity stepper and manual input (incl. clearing the field) never produce 0/NaN/negative; cart survives page reload (same `utg-cart-v2` data written by step-1 code loads cleanly).
- Locale switch on a catalog page (`/uk/category/patches` → EN): nav labels, dictionary strings, and **price currency/values update immediately** — no stale UAH-formatted-as-USD, no hard-reload needed. Switch back likewise.
- No hydration warnings in the dev console on home, category, product, checkout with a non-empty persisted cart.
- Checkout happy path vs `PLACE_ORDER_URL` unset: submit → error toast, cart intact (unchanged behavior).
- Typed dictionary: demonstrate (in the PR description) that a bogus key like `dictionary.cart.nonexistent` is a compile error.

**Constraints:**

- Match existing code style; no comments in code; remove existing comments in any section you edit.
- No visual/markup redesign, no Flowbite/notyf/body-scroll-lock/swiper/framer-motion changes (4a, D-9), no test scaffolding (step 6), no payload changes (sacred contract).
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
- Never stage `CLAUDE.md` or `initiatives/`.
- Do not edit files under `initiatives/` — planner-managed.
