# Checkout page (`/checkout`) — ratified design (D3.4, surface 2)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/checkout/Checkout.dc.html`, exported verbatim alongside; strings in
`../data/catalog.js`), user-approved 2026-07-25. All form classes are D1 kit CSS
(`utg-field/label/errtext/input/input--error` + `.req` verified in components.css).
The prototype composes those classes directly (its own caveat); the IMPLEMENTATION
renders through the shipped DS `Field`/`Input`/`Textarea` components — identical
pixels, components are the law.

## Structure

1. **Band** (extended `SectionBand` language): `h1` = existing `checkout.checkout`
   («оформлення»); right meta caption = derived item count («4 товари» via the shipped
   plural util) — hidden on success/empty. On success the band title becomes
   «Замовлення прийнято»/"Order received" (NEW key).
2. **Body — form + summary** (Container; flex `row-reverse` wrap, gap
   `space-6`/`space-7`, align start → summary ABOVE the form on mobile, RIGHT of it on
   desktop; form `flex:2 1 360px`, summary `flex:1 1 320px`):
   - **Form**: display-caps h3-scale section heading «Інформація про замовника» →
     2-col `auto-fit minmax(170px,1fr)` grid (first/last name) → telephone
     (`type="tel"`); hair rule `space-6`; heading «Деталі доставки» → 2-col
     (country/state) → city → address → additional as textarea rows=5. Required
     fields carry a `--destructive` ` *` in the label (kit `.req`). FROZEN field
     set/names; required six: first_name, last_name, telephone, country, city,
     address.
   - **Validation**: submit with empty required fields → per-field error state
     (destructive border) + `role="alert"` errtext «Обов'язкове поле»/"Required
     field" (NEW key); error clears on input; focus jumps to the FIRST errored input.
     No format policing — required-only.
   - **Review note** (small, ink-soft) above the CTA; then the page's ONE accent —
     block `Button` «Зробити Замовлення» with `loading` during submit.
   - **Summary card** (2px ink border): band-colored header row (caption-caps
     «Підсумок» + mono `[n]` in band-muted) → lines: 48px thumb (1px ink border),
     small title (composed ` · SIZE` flows through), caption `×qty` in ink-faint,
     line-total `Price` right, hairline separators → total row (`utg-label` «Всього» +
     `Price` big).
3. **Outcomes**:
   - **Success** (replaces band meta + body; cart clears ONLY here; scroll to top):
     48px flag-yellow square with a 26px check (status marker — not a second CTA),
     body «Дякуємо за ваше замовлення!…» (existing `order_success`), small ink-faint
     successNote «Оплата не відбувається онлайн…» (NEW key — the honest-tone
     centerpiece).
   - **Error**: toast via the shipped `Toaster` (`error` variant) with the existing
     `order_error`; form AND cart stay intact — retry costs nothing. (The prototype's
     fixed-position toast wrapper + keyframe is glue for its bundle; our Sonner
     placement/animation is the law.)
   - **Empty cart** (direct visit with nothing in the cart): centered display-caps
     `empty_cart` + help line + flag-blue «тут» → `/category` (mirrors the drawer's
     empty state).

## Copy

Everything existing reused verbatim (`cart.*` form vocabulary, `checkout.*`,
`order_success`, `order_error`, `review`, `place_order`). NEW keys (kit-authored,
adopt verbatim): successTitle «Замовлення прийнято»/"Order received", successNote
«Оплата не відбувається онлайн — це волонтерський проект. Менеджер узгодить з вами
оплату та доставку.»/"No online payment — this is a volunteer project. Our manager
will arrange payment and delivery with you.", required «Обов'язкове поле»/"Required
field".

## Implementation mapping notes

- The page shell stays SSG; the screen is the existing client `CheckoutScreen`
  re-composed. NO loading states except the real submit pending.
- The payload keys stay byte-identical to the bot contract, with ONE ratified
  addition (D-12): `currency: "UAH" | "USD"` from the money context — the bot
  destructures known keys, so the extra key is additive-safe until the bot-side read
  lands (user's own repo, separate follow-up).
- The summary card is app-land composition (layout containers + token utilities +
  `Price` — nothing interactive to seal). The band-headed treatment echoes the
  drawer header.
- The success check square: flag-yellow bg + ink 26px check icon — app-land tokens +
  DS `Icon name="check"`.
