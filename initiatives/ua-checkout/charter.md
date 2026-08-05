# ua-checkout — charter

**Goal.** The checkout speaks the Ukrainian market's language: delivery is built around
Нова Пошта with live directory autocomplete (and an always-available free-text
fallback), the contact block matches how Ukrainian buyers actually communicate (+380,
messenger preference, patronymic), and payment expectations are stated **before**
submit — while the en locale keeps its generic international form and the operator
keeps receiving complete, structured orders in Telegram.

**Driving decision(s).** D-1 (scope ratification, four axes), D-2 (requirements-first —
the current form fields and bot payload are NOT constraints; the contract is ours to
reshape via a paired bot-repo step). Requirements spec: `requirements.md` (written in
U1). Visual SSOT: the Claude Design session driven by `design-brief.md` (U2), ratified
and exported to `design-export/` in this directory.

**Acceptance criteria.**

1. uk checkout with the NP key present (prod): city and warehouse autocomplete answer
   from the live Нова Пошта directory through our proxy; a real order arrives in the
   operator's Telegram with structured delivery + contact data (method, city,
   warehouse/address, +380-normalized phone, contact channel, patronymic when given).
2. Zero-env invariant holds: `yarn build` + boot with no env vars; uk checkout renders
   the same field model as free-text fallback and still submits; the blank-env e2e
   battery stays green and deterministic (the NP key blanked alongside the existing
   three).
3. The NP integration fails open: key absent / API down / slow → fallback fields,
   never a blocked order.
4. Both uk modes (mocked-live + fallback) and the unchanged en generic form are
   e2e-covered; the payload contract test pins the new shape and the bot-repo
   counterpart pins the same shape (paired PRs).
5. New form primitives live inside the sealed DS (barrel-exported, seal lint green);
   the implementation matches the ratified Claude Design export.
6. Pre-submit copy states: volunteer project, no online payment, the manager arranges
   payment after the order, delivery at carrier tariffs on receipt; a personal-data
   consent one-liner is present; uk + en.
7. Prod live-verified by a user browser gate on ua-tactical-gear.com.
8. Cart lines are editable directly on the checkout page (quantity stepper +
   remove-with-confirm, the drawer's pattern); emptying the cart there lands on the
   existing empty state; the header-drawer hop is no longer required for edits.

**Scope.**

- uk delivery flow: method selector (відділення / поштомат / кур'єр), NP city
  autocomplete, NP warehouse autocomplete (searchable by number), courier
  street+building fields.
- NP directory proxy route(s): server-side key, caching, rate limiting; env plumbing
  (`NOVA_POSHTA_API_KEY` — name finalized in U1) + `.env.example`.
- Contact block: +380 normalization/validation, contact-channel choice
  (дзвінок / Telegram / Viber), optional patronymic, consent line.
- Pre-submit payment-expectations copy; dictionary strings uk + en.
- Editable order summary on checkout: reuse the DS `CartLine`
  (stepper + remove + confirm) in place of the read-only rows; live totals;
  pending submit locks editing.
- Bot contract update as a paired shop+bot step; contract tests on both sides.
- DS window: the form primitives the ratified design needs (async combobox,
  choice-chips/radio group — exact set ratified in U2) + the DEF-41 fold-in +
  `CartLine` media-fill polish (media frame spans the full line height).
- Tests: units for new primitives / route / normalization; e2e for both uk modes + en
  regression; DEF-36/37/39 folded where steps touch their zones.

**Non-goals.**

- Online payment of any kind (LiqPay / mono / Fondy / Stripe) — payment stays
  operator-arranged after the order; that's the charity model, not a gap.
- Укрпошта / Meest integrations — the comment field covers them; revisit only on
  operator demand.
- TTN creation/tracking, order numbers, accounts, any database.
- An international shipping flow for en — the generic form stays as is.
- Bot internals beyond rendering the new contract (bot-polish owns the bot).

**Sacred (do not touch).**

- Prod takes real orders — every merged PR leaves checkout able to place one; the NP
  integration must never become a point of failure for ordering.
- Zero-env boot/build; blank-env e2e determinism.
- The DS seal (production-polish D-10): new primitives go inside
  `src/design-system/`; no raw colors / raw text-size utilities outside it.
- Catalog data (`src/data/`) untouched; `extracted/` stays verbatim-documentary.
- Planner artifacts (`CLAUDE.md`, `initiatives/`) never staged into executor PRs.
- Sequencing with the bot phase: B2 (x-relay-secret) lands before the
  contract-touching steps here; the DEF-13 `currency` read keeps working through the
  contract change.
