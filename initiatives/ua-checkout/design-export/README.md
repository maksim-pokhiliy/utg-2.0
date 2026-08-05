# ua-checkout — design export (U2, ratified)

Verbatim snapshot of the ua-checkout design session output, pulled via DesignSync from
the Claude Design project **UTG** (`01558ea9-9ab1-4308-b99f-b71e70dfb371`) on
2026-08-05, after the user ratified the session result. This directory is the visual
SSOT for U3 (DS window) and U5 (checkout rework); deviations need a new decision
(D-4). The behavioral SSOT remains `../requirements.md` — on conflict the
requirements win.

## Contents

- `screens/checkout/Checkout.dc.html` — the redesigned checkout screen. Tweaks
  toggle the three modes: `locale` uk/en, `npDirectory` live/fallback,
  `submitOutcome` success/error. Covers: UA delivery flow (method chips → city
  combobox → dependent warehouse combobox / courier fields), contact block
  (Прізвище/Ім'я/По батькові/+380 mask/channel chips), editable summary (CartLine at
  56px scale, pending lock), expectations box + consent line, redesigned success
  state, error toast.
- `screens/checkout/component-specs-addendum.md` — DS-grade specs for the two new
  primitives (**Combobox**, **ChoiceChips**) + the ratified **CartLine media
  amendment** (full-line-height frame; 64px drawer / 56px summary presets) + the
  editable-summary pattern note. Companion to production-polish
  `design-export/component-specs.md`.
- `screens/cart/CartDrawer.dc.html` + `cart-drawer.js` — the drawer rebuilt on the
  amended CartLine media treatment (demoEmpty tweak for the empty state).
- `screens/data/np-directory.js` — mock НП directory backing the prototype
  comboboxes (async shape only; demo entries, NOT real warehouses — the real
  directory comes from the U4 proxy).
- `screens/data/catalog.js` — prototype plumbing: mock catalog mirroring the sacred
  `src/data/catalog.ts` + the bilingual dict (the checkout strings here ARE the
  ratified copy) + a localStorage cart store.
- `screens/*/support.js` — generated dc-runtime (identical files, documentary).

## Seal check

The screens link tokens from the project's embedded copy of the SAME ratified design
system (`_ds/utg-design-system-62bf007e-…`) — no token changes, no new colors, no new
type sizes. Screen-level styles use existing custom properties only (plus one
prototype-local `utgToastIn` keyframe and the sticky-aside media query).

## Implementation notes (spotted at export review)

- The prototype dict still carries the legacy uk name placeholders («John» /
  «Wick») into the uk form — requirements §6 mandates real Ukrainian examples; U5
  fixes this at the dictionary level (UAC-3), no design impact.
- uk renders Прізвище before Ім'я (UA convention); en-generic keeps its labels but
  inherits the same visual order — deliberate design call, D-4.
- The combobox is deliberately portal-less (in-flow panel under the input) — keep it
  that way in the DS implementation; the panel's `margin-top:-2px` border-fuse is
  part of the ratified look.
