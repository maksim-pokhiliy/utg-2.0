# ua-checkout — component specs addendum (for ratification)

Specs for the two new DS primitives introduced by the ua-checkout brief, plus the
ratified CartLine media amendment. Format follows `component-specs.md`. Prototype
reference: `screens/checkout/Checkout.dc.html` (uk-live / uk-fallback / en-generic via
Tweaks), `screens/cart/cart-drawer.js` (CartLine media).

---

## Combobox

Async single-select. Visual DNA: `Input` + a dropdown panel in the dialog/menu
surface voice (2px ink border, flat paper, no shadow, no radius).

**Anatomy**: `Field`-compatible label (+ required mark) → input (`utg-input`, right
padding 40px) with a static chevron-down affordance (18px Lucide, `--ink-faint`,
pointer-events none) → panel: `position:absolute; top:100%` under the input,
`margin-top:-2px` so the 2px borders fuse, max-height 220px (~5 rows), scroll →
error line (`utg-errtext`).

**Option row**: min-height 44px, padding 6px 14px, `--type-small`; optional
right-aligned mono-caps meta (city rows show region, `--ink-faint`).

**States**
- idle — placeholder/empty input, chevron; panel closed.
- typing — debounce 250ms, then loading.
- loading — 3 skeleton bars (14px, `--paper-dim`, `utg-pulse` 1.2s) in the panel. The
  panel is the ONLY place a loading state is legal on SSG pages (real async).
- results — option rows; active row = ink inversion (bg `--ink`, text `--paper`).
- empty — mono-caps row «нічого не знайдено» (`--ink-faint`), non-interactive.
- selected — input shows the chosen label verbatim (city: name; warehouse: the full
  «Відділення №1: вул. …» string); panel closes; typing again clears the selection.
- disabled — dependent warehouse before city: native disabled input (base.css
  disabled treatment); also whole-form pending lock.
- error — `utg-input--error` ring + «Обов'язкове поле»; clears on input.
- error→fallback handoff — directory failure downgrades the WHOLE delivery block to
  uk-fallback (plain inputs + hint «Довідник Нової Пошти зараз недоступний — впишіть
  місто та відділення вручну.»); never a dead combobox.

**Keyboard / ARIA**: `role=combobox aria-expanded aria-controls aria-autocomplete=list`;
panel `role=listbox`, rows `role=option aria-selected`. ↓/↑ move active, Enter picks,
Esc closes, blur closes (140ms grace for option mousedown). Focus opens the panel
(shows full list — browsability without typing).

**Mobile**: panel opens in-flow under the input (no portal, page keeps scrolling);
44px rows; `inputMode` default.

**Dependency contract**: picking a city resets the warehouse; switching method
(відділення↔поштомат) resets the warehouse and re-filters by kind; warehouse search
matches by number («12», «№12») or address substring.

---

## ChoiceChips

Form-grade single-select radiogroup chips. Visual DNA: `SizeSelector` promoted to a
general form control with a `Field`-compatible label.

**Anatomy**: `utg-label` (+ required mark) → wrapping flex row, gap `--space-2` →
chip buttons: min-height 44px, padding 0 16px, 2px ink border, mono 13px caps
(+0.08em). Wraps to 2 rows on 375px without truncation (uk labels are the sizing
case: «НП відділення»).

**States**
- default — paper bg, ink text.
- hover — ink inversion (preview of commit).
- focus-visible — 2px `--secondary` ring, offset 2.
- selected — ink bg, paper text; `aria-checked=true`. Exactly one selected (radio
  semantics; preselected default — no empty state: Дзвінок / НП відділення).
- disabled — pending lock: opacity .55, no pointer.

**ARIA**: group `role=radiogroup aria-label`; chips `role=radio aria-checked`.

---

## CartLine — media amendment (ratified proportions)

The framed media stretches to the FULL line height wherever CartLine renders (cart
drawer AND checkout summary): `align-self:stretch; height:auto; object-fit:cover`.
Frame width is fixed per scale — 64px in the drawer, 56px at summary scale — and the
content column carries `min-height` equal to the frame width with
`justify-content:space-between`, so the stepper/price row pins to the frame's bottom
edge — media bottom and content bottom always meet, at both scales (ONE component,
two scale presets — not two implementations). On mobile, when the
content column wraps taller, the frame tracks the line height (crop stays centered
cover; no letterboxing, no aspect lock).

---

## Checkout summary — editable (pattern note, not a new primitive)

The aside adopts CartLine at summary scale inside the existing manifest card: line =
media 56px (full-height) | title + trash 28px | stepper `sm` + line-total `Price`;
live totals; remove confirms via the existing `ConfirmDialog` (same strings as the
drawer); last-remove hands off to the existing empty-cart screen; the whole editing
surface locks while submit is pending (opacity .45 + pointer lock on controls only —
titles and prices stay legible).
