# Kit checkout composition + strings (verbatim from `ui_kits/storefront/`, pulled 2026-07-25)

Closes the "checkout strings reserved" gap in `kit-screens-reference.md`. Per D-11 the
kit screens are DS DEMOS — reference material and the verbatim source for kit-authored
copy. Pulled from project `62bf007e-…` (`ui_kits/storefront/{Checkout.jsx,data.js}`).

## Kit checkout composition (sketch, not a ratified design)

- `SectionBand kicker="/ UTG" title={checkout}` → Container grid
  `repeat(auto-fit,minmax(min(340px,100%),1fr))` gap 48, align start.
- **Left — form** (flex col, gap 18): `h3` customer → 2-col grid (first/last name) →
  telephone → hair Divider → `h3` delivery → 2-col (country/state) → city → address →
  additional as `Textarea rows=3`. `Field` with `required` mark + `error={required}`
  string on empty submit; errors clear per-field on input.
- **Required set (kit)**: first_name, last_name, telephone, country, city, address
  (state + additional optional). CORRECTION (2026-07-25): the LIVE form requires
  SEVEN — `state` included (a truncated planner grep produced the earlier
  "matches the live six" claim; executor verification caught it). The implementation
  keeps the live seven per the OQ-B ruling — the kit's optionality was a designer
  guess, not a product decision.
- **Right — summary card** (2px ink border): `utg-band` header row (`h3` summary) →
  lines (48px thumb with 1px ink border, small title — **`{title}{size ? " · " + size}`**,
  mono ×qty in ink-faint, price) → baseline total row (label + `price--big`) → accent
  block `Button loading={placing}` place → small ink-faint `review` note under it.
- **Success state** (replaces the whole page): band `successTitle` → column max 560px:
  48px flag-yellow square with a 28px `check` Icon, body `success` paragraph, small
  ink-faint `successNote`.

The kit summary line anticipates the shipped DEF-3 composed titles — our cart already
delivers `Title · SIZE` inside the `title` field, so the kit's `size` concat is
implementation-free for us.

## Strings — delta vs the live dictionaries

**Already live verbatim** (the kit copied the dictionaries; reuse `cart.*` /
`checkout.*` keys): customer_details, delivery_details, all eight field labels +
placeholders, review, place_order, order_success, total, checkout, summary.

**Kit-authored NEW strings** (exist only in the kit; adopt verbatim — DEF-14):

| key | uk | en |
| --- | --- | --- |
| successTitle | Замовлення прийнято | Order received |
| successNote | Оплата не відбувається онлайн — це волонтерський проект. Менеджер узгодить з вами оплату та доставку. | No online payment — this is a volunteer project. Our manager will arrange payment and delivery with you. |
| required | Обов'язкове поле | Required field |

**Live-only** (the kit has no error state; keep): order_error, the drawer strings
(cart, proceed, empty_cart, add_to_cart, here, remove_*).
