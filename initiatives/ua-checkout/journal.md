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
