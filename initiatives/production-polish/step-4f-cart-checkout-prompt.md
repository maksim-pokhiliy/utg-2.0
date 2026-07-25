# Step 4f — Implement the cart drawer + checkout per the ratified D3.4 design + D-12 currency (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature Step 4f of the production-polish initiative: re-compose the cart drawer and the checkout page per the ratified designs, wire add-to-cart feedback, and land the D-12 payload `currency` field. This is the money path of a live shop — the checkout must keep taking real orders through every intermediate commit. The design system is sealed and frozen — this step adds one sanctioned DS composite (`CartLine`) plus one micro-delta (`IconSize` gains 40), and touches nothing else in the DS.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-10 + addendum, D-11, **D-12**), `deferred.md` (DEF-13 is this step's payload half). **The specs are `initiatives/production-polish/design-export/screens/cart/` and `screens/checkout/`** — each holds a distilled `*-reference.md` (structure, verbatim copy, ratified DS-addition specs, mapping notes) + the ratified prototype sources (`CartDrawer.dc.html` + `cart-drawer.js`, `Checkout.dc.html`; inline styles and kit classes are the medium — your implementation renders the same result from DS exports and token utilities; strings/store mock in `screens/data/catalog.js`). The checkout→bot payload contract is SACRED (`extracted/bot-contract-index.js`): existing keys byte-identical, plus exactly the one D-12 addition. The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. Expected plan-gate items: the `CartLine` React API (constraints in the cart reference: media slot + title + remove trigger + stepper + line-total; the 32px remove affordance is INTERNAL to the component; ConfirmDialog wiring stays app-side), the dictionary key placement for the four new strings, and where the `currency` value threads from the money context into the payload.

**Scope:**

1. **DS changes** (ratified in D3.4 — implement, don't redesign):
   - **`CartLine`** (new composite, barrel-exported) per the cart reference: 64px framed media slot | title (may carry the composed ` · SIZE`) + internal 32px remove trigger (18px trash) | `QuantityStepper size="sm"` + line-total `Price`. Callbacks for quantity/remove; visual state fully DS-owned.
   - **`IconSize` gains 40** (empty-state pictograms). Stroke stays the sealed 2px — the prototype's 1.5 is rejected.
   - **NOTHING else**: `SizeSelector` interaction is untouched — the prototype's radio-preselect was explicitly REJECTED at ratification; the shipped 4e flow (no preselect, toggle-deselect, «Оберіть розмір» hint) stands.
2. **Cart drawer** re-composition (`CartDrawer.tsx` content; the Sheet container and its global layout mount stay): band header «Кошик» + mono `[count]` (band-muted, total qty, only when > 0) + localized close label; `CartLine` rows with per-line totals; removal via the existing `ConfirmDialog` flow (composed titles appear in the dialog body); footer — 2px ink top border, «Всього» + `Price` big, accent block CTA → `/checkout`; empty state — 40px `shopping-bag`, display-caps `empty_cart`, help line + flag-blue «тут» → `/category`.
3. **Add-to-cart feedback** (ratified): adding on the product page OPENS the drawer; qty resets to 1 after add. Wiring only in `ProductScreen` + the sidebar store — no other product-page changes.
4. **Checkout** re-composition (`CheckoutScreen.tsx`): band `h1` = `checkout.checkout` + derived item-count meta (shipped plural util; hidden on success/empty); body flex `row-reverse` wrap (summary ABOVE form on mobile, right on desktop); form through DS `Field`/`Input`/`Textarea` with destructive `*` on required labels; FROZEN field set/names, required six (first_name, last_name, telephone, country, city, address); submit validation → per-field error + `role="alert"` «Обов'язкове поле», error clears on input, focus jumps to the first errored input; review note + the page's ONE accent `Button` with `loading`; summary card (2px ink border, band-colored header «Підсумок» + `[n]`, 48px-thumb lines with `×qty`, hairlines, total row + `Price` big); outcomes — success (cart clears ONLY here; band title becomes `successTitle`; flag-yellow 48px check square; `order_success` body + `successNote` small), error (shipped `Toaster` error variant with `order_error`; form AND cart intact), empty-cart state (mirrors the drawer's). Preserve the shipped outcome semantics — a failed order never clears the cart, success is only reported on upstream success.
5. **D-12 — payload `currency`.** The payload gains `currency: "UAH" | "USD"` from the money context (the currency actually displayed); every other key byte-identical; `/api/place_order` stays an untouched pass-through (verify it forwards the body verbatim). Confirm additive-safety against `extracted/bot-contract-index.js` in your plan (the bot destructures known keys).
6. **Dictionary keys** (both locales, verbatim from the references): `successTitle`, `successNote`, `required` (kit adoptions), `close` (drawer close label — the live one is hardcoded English). Reuse everything else (`cart.*` form vocabulary, `order_success`/`order_error`, `review`, `place_order`, `checkout.*`). Remove keys the old compositions orphan (grep before deleting).

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint / `prettier --check` / zero-env `yarn build` green; route table unchanged (all pages SSG); all six seal greps zero.
- View-source `/uk/checkout` + `/en/checkout`: band title server-rendered; no hydration warnings in the browser.
- **Payload proof**: log or intercept the submitted body — key set byte-identical to the bot contract plus exactly `currency`; a sized line's `title` carries ` · SIZE`; `currency` matches the displayed currency in both rates-up and rates-down runs (zero-env dev run covers rates-down).
- **Outcome semantics proof**: zero-env checkout submit hits the real 503 → error toast, form and cart INTACT (this is the natural error-path test — no mocking needed); with `PLACE_ORDER_URL` unset the cart must survive; success path clears the cart (mock or relay).
- Persisted-cart compat: a pre-4f cart (bare-slug and composed lines) renders in the new drawer and checks out without errors.
- Browser gates for the user, listed explicitly in the PR: add-to-cart opens the drawer (sized flow via a local, uncommitted availability flip — flip, test, discard); stepper/remove/confirm in the drawer; empty states (drawer + checkout); validation errors + focus jump; pending; error toast with intact form; success screen; 375px and 1200px+; both locales.
- Fence: `CartDrawer.tsx`, the new `cart-line` DS component + `icon.tsx` (IconSize) + barrel, `ProductScreen.tsx` (open-on-add wiring only), `CheckoutScreen.tsx`, the sidebar store if the open call needs it, dictionaries. NO catalog data, NO `SizeSelector`, NO other screens, NO `place_order` route changes.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
