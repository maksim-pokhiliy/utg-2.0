# ua-checkout — journal

Append-only. One entry per session/step.

## 2026-08-05 — initiative born: scope ratified on four axes

- Scoping session grounded in a read of the current checkout
  (`CheckoutForm`/`fields.ts`), the recovered bot contract
  (`extracted/bot-contract-index.js`) and the dictionaries. Finding: the current form
  is a US-style international form with Ukrainian labels (`country/state/city/address`
  free-text, `555-0100` placeholder, dual-purpose "Телефон / Нік у Телеграм" field) —
  adaptation means replacing the delivery model, not decorating it.
- User ratified the four scope axes via Q&A → **D-1** (NP-only carriers; en keeps the
  generic form; full contact pack; live NP API via proxy with fail-open fallback), and
  issued the requirements-first directive → **D-2** (form fields and bot payload are
  movable; contract reshapes via paired shop+bot steps). **D-3** (payload v2 vs
  additive) left OPEN for U1.
- Charter + U0–U7 plan seeded. Production-polish ledger tails folded in as SCHEDULED:
  DEF-36/37 (e2e), DEF-39 (cart decoder), DEF-41 (DS window). UAC-1 opened for the
  external NP key dependency.
- `initiatives/ACTIVE` switched from `production-polish` (COMPLETE since 2026-08-02;
  its board already points at the bot repo for the bot phase) to `ua-checkout` — one
  genuinely-driven track in this repo. The B2 prereq (x-relay-secret) is carried here
  as U0 so the pointer survives the switch.

## 2026-08-05 — U1 done: requirements + design brief; D-3 ratified (payload v2)

- НП API contract verified against two independent SDK mirrors
  (`maddsua/NovaPoshtaREST` typings, `daaner/NovaPoshta` docs) — the official portal
  403s behind Cloudflare (UAC-2 opened for the U4 re-check). Confirmed:
  `searchSettlements` (online city search, `{CityName, Limit, Page}`) and
  `getWarehouses` (`{CityRef, …}`, `CategoryOfWarehouse`, `DenyToSelect`,
  daily-refresh guidance straight from НП's own docs — our 24h server cache follows
  it).
- `requirements.md` written: three modes (uk-live / uk-fallback / en-generic),
  operator-driven field model (patronymic uk-only, contact channel chips, no email,
  no НП refs), +380 normalization rules, fail-open budgets, copy drafts (pre-submit
  expectations block + consent line), test matrix with the DEF folds.
- **D-3 RATIFIED** (planner engineering call, veto open): payload v2 — one
  discriminated envelope (`version: 2`, `customer`/`delivery.mode`/`source`),
  rollout bot-dual-accept → shop-flip → v1 drop. `cart/total/currency/locale`
  byte-compatible.
- `design-brief.md` written for the U2 Claude Design session: form flow, two new DS
  primitives to spec (async Combobox, ChoiceChips), full state matrix incl.
  uk-fallback and mobile. **Next: user drives the brief through Claude Design.**

## 2026-08-05 — scope add before U2: editable summary on checkout

- User finding: the checkout summary is read-only — cart edits force the
  header-icon → drawer hop. Verified: `CheckoutSummary` renders static rows while
  the drawer already composes DS `CartLine` (stepper + remove + ConfirmDialog), so
  the fix is pattern reuse, zero new DS primitives.
- Folded before the design session consumed the brief: charter (scope bullet +
  acceptance #8), requirements new §9 (in-place editing, live totals, empty-out
  transition, locked-while-pending, e2e list), brief (context + task section +
  states). Lands in U5 with the checkout rework; U2 designs the aside states.
