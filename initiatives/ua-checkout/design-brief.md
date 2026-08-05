# ua-checkout — design brief (U2, for the Claude Design session)

Design the Ukrainian-market checkout for the UTG store inside the existing ratified
design system. This brief is the input; the session's output gets ratified and
exported (DesignSync) to `initiatives/ua-checkout/design-export/`. Behavioral SSOT:
`requirements.md` (U1) — the brief summarizes it, the spec wins on conflict.

## Context (what already exists — reuse, don't reinvent)

- The sealed UTG design system: tokens (`design-export/tokens/`), component specs
  (`design-export/component-specs.md`), and the ratified current checkout screen
  (`design-export/screens/checkout/` — `Checkout.dc.html` + reference). Oswald
  uppercase display, IBM Plex Sans body, IBM Plex Mono for prices/meta; UTG semantic
  palette only — no new colors, no new type sizes.
- Existing form anatomy: `Field` (label + required mark + error line) wrapping
  `Input`/`Select`/`Textarea`; accent `Button`; `SectionBand` page header; chip-row
  pattern precedent: `SizeSelector` (controlled single-select chips on product
  pages).
- The checkout page layout (form column + sticky summary aside, success screen)
  stays; this brief redesigns the FORM COLUMN's content, makes the SUMMARY editable,
  and adds two form primitives to the DS.
- The cart drawer already has the editable-line pattern: DS `CartLine` (media,
  title, `QuantityStepper`, line total, remove) + a destructive `ConfirmDialog` on
  remove — the checkout summary adopts it, not reinvents it.

## The task

Replace the US-style delivery block (Country/State/City/Address free-text) with a
Ukrainian delivery flow, and upgrade the contact block. Three modes (see
requirements §1): **uk-live** (НП directory autocomplete), **uk-fallback** (same
fields, free-text), **en-generic** (current international form, restyled only where
shared blocks change).

### Form flow (uk)

1. **Recipient + contact** — Прізвище, Ім'я, По батькові (optional), Телефон
   (+380 mask), «Як з вами зв'язатися»: chips Дзвінок / Telegram / Viber (Дзвінок
   preselected).
2. **Delivery** — method selector (3 options): НП відділення / НП поштомат /
   НП кур'єр. Then per method:
   - відділення/поштомат: Місто (async combobox against the НП directory) →
     Відділення/Поштомат (dependent combobox, searchable by number, shows the full
     «Відділення №1: вул. …» string);
   - кур'єр: Місто (same combobox) + Вулиця, Будинок, Квартира (optional).
3. **Comment** — optional textarea (exists today).
4. **Expectations block** — BEFORE the button: «Онлайн-оплати на сайті немає — це
   волонтерський проєкт. Після оформлення менеджер зв'яжеться з вами, щоб узгодити
   оплату й підтвердити замовлення. Доставка — за тарифами Нової Пошти при
   отриманні.» Design it as a calm, load-bearing element (this is the trust moment
   of a charity store), not an alert/warning.
5. **Submit** — accent button + consent one-liner: «Надсилаючи замовлення, ви
   погоджуєтесь на обробку персональних даних для його виконання.»

### Editable order summary (requirements §9)

Today the summary is a read-only list — editing the cart from checkout forces a hop
through the header icon into the drawer. Redesign the aside with the drawer's
`CartLine` anatomy at summary scale: quantity stepper + remove (with the existing
confirm dialog) per line, live totals. States: editing, remove-confirm,
empty-after-last-remove (hands off to the existing empty-cart screen), and
locked-while-submit-pending. Same in all three modes; desktop + mobile.

### New DS primitives to spec (anatomy + all states, DS-grade)

- **Combobox** — async single-select: idle / typing / loading / results /
  empty («нічого не знайдено») / error→fallback handoff / selected / disabled
  (warehouse before city is chosen). Keyboard + ARIA listbox pattern, mobile
  behavior (this is a phone-first audience). Visual DNA: `Input` + dropdown panel
  consistent with existing menus/dialog surfaces.
- **ChoiceChips** — form-grade radiogroup chips (delivery method, contact channel):
  states default/selected/focus/disabled, wrapping on narrow screens. Visual DNA:
  `SizeSelector`, promoted to a general form control with a `Field`-compatible
  label.

### States to design

- uk-live happy path (desktop + mobile ~375px);
- uk-fallback: same layout, city/warehouse as plain inputs + hint «Довідник Нової
  Пошти зараз недоступний — впишіть місто та відділення вручну.»;
- validation errors (existing per-field error pattern, focus-first-invalid);
- summary editing: stepper interaction, remove-confirm, empty-after-edit handoff;
- submit pending (form controls AND summary editing locked); success screen
  (exists — check copy still fits);
- en-generic: current fields + the new shared blocks (channel chips, expectations,
  consent) — no patronymic, no НП elements.

## Deliverables

Screen designs for the states above + component specs for Combobox and ChoiceChips
(same spec format as `component-specs.md`), ratified in the session, then exported.
Copy may be typographically tuned but its meaning is fixed by requirements §6.
