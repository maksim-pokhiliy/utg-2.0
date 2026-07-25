# Cart drawer — ratified design (D3.4, surface 1)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/cart/CartDrawer.dc.html` + `cart-drawer.js`, exported verbatim alongside;
shared store + strings in `../data/catalog.js`), user-approved 2026-07-25. The drawer
is the shipped `Sheet` pattern — this design re-composes its CONTENT. All classes are
D1 kit CSS (`utg-scrim/drawer/drawer-head/cartline/help/label` verified in
components.css) — composed, not invented.

## Structure

1. **Container** — the shipped Sheet (right side, `min(420px,100vw)`, 2px ink left
   border, scrim). Band header row: `h3` «Кошик»/"Cart" + mono `[count]` in
   `band-muted` (total quantity, only when > 0) + band close `IconButton` — close gets
   a LOCALIZED label «Закрити»/"Close" (new dictionary key; the live one is hardcoded
   English).
2. **Line item** (`utg-cartline` spec): 64px square thumb (1px ink border) | content
   column — row 1: title (`500 0.9375rem/1.35` body font, `text-wrap: pretty`; may
   carry the composed ` · SIZE`) + 32px trash affordance top-right (18px icon);
   row 2: `QuantityStepper size="sm"` left + line-total `Price` (uah × qty) right.
   Hairline bottom border between lines.
3. **Remove** → the shipped `ConfirmDialog` (ghost «Скасувати» / destructive
   «Видалити», `remove_body` with the line title substituted — composed title incl.
   size appears in the dialog).
4. **Footer** (2px ink top border): baseline row `utg-label` «Всього» + `Price` big;
   then the drawer's ONE accent CTA — block `Button` «Перейти до Оформлення» →
   `/checkout`.
5. **Empty state** (centered column): `shopping-bag` icon at **40px** (ratified DS
   micro-delta: `IconSize` gains 40; the prototype's 1.5 stroke is REJECTED — the D1
   2px stroke law holds inside the sealed Icon), display-caps h3-scale «Ваш кошик
   порожній», help line «Додайте товари до свого кошика» + flag-blue link «тут» →
   `/category`.

## Add-to-cart feedback (RATIFIED interaction)

Adding from the product page **opens the drawer** (no toast — zero invented strings,
instant confirmation + the checkout path in one gesture). Product page resets qty to 1
after add. NOTE — the prototype also preselects the first size on the product page:
that change was REJECTED at ratification; the shipped 4e interaction stands (no
preselect, toggle-deselect, «Оберіть розмір» hint on unsized add — the hint flow
remains live).

## CartLine (RATIFIED DS addition — enters the sealed DS in 4f)

The line-item arrangement above becomes a DS composite: media slot | title +
remove-trigger | stepper + price. Visual state fully DS-owned incl. the 32px remove
affordance (internal to the component — no IconButton API change); quantity/remove
behavior via callbacks; the ConfirmDialog wiring stays app-side (app owns dialog
state). Exact React API = executor's plan-gate proposal.

## Copy

All strings already live (`cart.*` incl. `remove_*`) except: `close` «Закрити»/"Close"
(NEW). The empty-state title reuses `empty_cart` but RENDERS at display-caps h3 scale
(treatment change, not a copy change).

## Implementation mapping notes

- Our app's drawer is globally mounted via the layout Header — the prototype's
  per-screen mount is demo plumbing; nothing to copy.
- Line total = unit price × qty through the money context (`useMoney`); the drawer
  shows per-line totals, not unit prices.
- Sheet a11y (`role="dialog"`, focus trap) is already the shipped Radix behavior — the
  prototype hand-rolls it; keep Radix.
