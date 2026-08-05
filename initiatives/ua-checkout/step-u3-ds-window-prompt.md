# Step U3 — the DS window: Combobox, ChoiceChips, CartLine media amendment, DEF-41 (executor prompt)

---

/feature Step U3 of the ua-checkout initiative: extend the sealed design system with the two form primitives the ratified checkout design needs (`Combobox`, `ChoiceChips`), apply the ratified `CartLine` media amendment, and close DEF-41 by making `Skeleton` own its settled state. DS-only window: the new primitives ship barrel-exported but UNUSED by pages (checkout adoption is a later step) — that is deliberate, not an omission.

**Context (read, never edit or stage).** `initiatives/ua-checkout/`: `charter.md`, `requirements.md` (§9 for the CartLine/summary behavior), `decisions.md` (D-4 lists the engineering-binding design details), `deferred.md` (DEF-41 — inherited from `initiatives/production-polish/deferred.md`, whose entry has the full history). **The spec for this step is `initiatives/ua-checkout/design-export/screens/checkout/component-specs-addendum.md`** — implement it, don't redesign it. The ratified look in context: `design-export/screens/checkout/Checkout.dc.html` (combobox/chips rendered live) and `design-export/screens/cart/cart-drawer.js` (CartLine media treatment); `design-export/README.md` carries the export-review notes. The DS seal is mechanical (lint): everything ships inside `src/design-system/`, exported only via the barrel `index.ts`; raw colors / raw text sizes / deep imports stay illegal outside.

**Process gate.** You run headless under a planner session. Stop after your plan & design stage and END YOUR TURN with the complete plan-gate summary (the plan, open questions, options each with your recommendation). Expected plan-gate proposals: the exact `Combobox` prop API (debounce lives INSIDE the component, 250ms per the addendum; the component is presentation-only — options/loading arrive via props, no fetching inside), the `ChoiceChips` keyboard shape (the addendum's ARIA roles are the floor; propose the roving-tabindex/arrow-key pattern per WAI radiogroup), the `CartLine` scale-preset API (`drawer` 64px default / `summary` 56px — drawer consumers must compile and render unchanged), and the `Skeleton` settled-state API (DEF-41: the component owns hidden/settled internally; consumers stop cancelling DS animations).

**Scope:**

1. **`Combobox`** (new DS primitive, barrel-exported) per the addendum §Combobox: controlled async single-select; input with static chevron affordance; portal-less panel absolutely positioned under the input with the `-2px` border fuse, max-height 220px, scroll; states idle / typing→loading (3 pulse bars) / results (active row = ink inversion, optional right mono-caps meta on rows) / empty (mono-caps non-interactive row) / selected (label verbatim in the input; typing again clears the selection) / disabled (native disabled treatment) / error (`Field`-compatible); blur closes after a 140ms grace so option mousedown lands; focus opens the full list; keyboard ↓ ↑ Enter Esc; ARIA `combobox`/`listbox`/`option` wiring per the addendum. Composes inside the existing `Field` wrapper for label/required/error, like `Input` does.
2. **`ChoiceChips`** (new DS primitive, barrel-exported) per the addendum §ChoiceChips: controlled single-select radiogroup chips; 44px min-height, 2px ink border, mono 13px caps; default / hover (ink-inversion preview) / focus-visible (2px `--secondary` ring, offset 2) / selected (ink bg, `aria-checked`) / disabled (.55 dim); wrapping flex row; `Field`-compatible label.
3. **`CartLine` media amendment** per the addendum §CartLine: the framed media stretches to the full line height (`align-self: stretch`, auto height, `object-cover`, no aspect lock); ONE component with TWO scale presets — `drawer` (64px frame, default: existing consumers unchanged) and `summary` (56px); the content column carries `min-height` equal to the frame width with `justify-content: space-between` so the stepper/price row pins to the frame's bottom edge at both scales.
4. **DEF-41 fold-in**: `Skeleton` owns its settled/hidden state (fade + pulse stop live inside the component); `src/components/pages/ReportsScreen.tsx` drops the `VIEWER_SKELETON_*` constants' `animate-none` knowledge of DS internals (lines ~34–36) and drives the new API instead; the screen's other skeleton usages keep working identically.

**Out of scope (hard fence):** anything under `src/components/checkout/` and `CheckoutScreen` (a later step adopts the primitives), dictionaries, the order payload and API routes, the e2e suite beyond keeping it green, `src/design-system/styles/theme.css` (ZERO new tokens, colors, or type sizes), and any page-level mounting of the new primitives. Never stage `CLAUDE.md` or anything under `initiatives/`.

**Acceptance gates (verify and report in the PR test plan):**

- `yarn lint`, `yarn format` (run before committing), `yarn typecheck`, `yarn test`, zero-env `yarn build` — all green.
- Unit coverage for the new state matrices, in the project's `tests/` mirror + dom-test conventions: combobox debounce under fake timers, blur-grace, keyboard nav, ARIA wiring, empty/loading/disabled/error, selection-clear-on-type; chips radio semantics + keyboard; `CartLine` rendering at both scale presets; `Skeleton` settled/hidden behavior.
- `grep -rn "animate-none" src/components/` returns nothing (the DEF-41 knowledge-coupling is gone).
- Existing suites stay green — the cart drawer's units especially; drawer consumer code needs zero edits for the CartLine change.
- New primitives reachable from `@root/design-system` only (barrel); no new deep-import paths.

**Resource budget (WSL — mandatory).** Every heavy command (`next build`, full vitest runs) goes inside `systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=1G -- <cmd>`, with `NODE_OPTIONS=--max-old-space-size=3072` on builds and vitest capped (`--maxWorkers=2`). Heavy commands strictly one at a time. If `systemd-run --user` is unavailable, say so in your report and apply the diet + sequencing alone.

**Constraints:**

- No comments in code; remove existing comments in any region you edit.
- No skip flags (`--no-verify`, `--ignore-engines`, …) — root-cause failures instead.
- Follow the existing DS component conventions (one dir per component under `src/design-system/components/`, kebab-case files, variants via the established cn/cva patterns you find there).
- Branch from `master`, PR against `master`. Commits and PR text in English, first person, no assistant signatures anywhere.
