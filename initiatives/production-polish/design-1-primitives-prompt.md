# D1 — Design system primitives (Claude Design brief)

Paste everything below into Claude Design as one message.

---

Build a design system for **UTG — Ukrainian Tactical Gear** (ua-tactical-gear.com), a small volunteer merch storefront. Every hryvnia of proceeds buys equipment for a Ukrainian special-forces unit — this is a donation shop wearing a store's clothes, not a commercial brand. Audience: supporters of Ukraine, arriving mostly from Instagram on phones. Bilingual: Ukrainian (default) and English.

## Direction (fixed, do not rebrand)

Black/military **brutalism, sharpened**. Raw, utilitarian, honest. High contrast: near-black ink on a warm off-white paper (`#FFF9F6` today), inverted black blocks for section headers. Hard edges — zero border radius everywhere. Strong condensed uppercase display type. The Ukrainian flag pair (today `#ffc657` yellow, `#5362ac` blue) exists in the palette — use it as **rare, deliberate accents** (one primary CTA moment, availability/highlight marks), never decorative wallpaper. No tactical-cosplay kitsch: no camo patterns, no crosshairs, no stencil-font clichés unless typography genuinely earns it. Think: army supply depot paperwork meets modern editorial.

## Deliverable: one design-system sheet (light theme only)

1. **Color tokens**, named for a shadcn/ui CSS-variable theme: `background`, `foreground`, `card`, `muted`, `muted-foreground`, `primary`, `primary-foreground`, `accent` (flag yellow), `secondary` (flag blue), `destructive`, `border`, `input`, `ring`. All text/background pairs must pass WCAG AA. Refine today's values if needed — keep the warm-paper + ink character.
2. **Typography** from Google Fonts with **full Ukrainian Cyrillic support — hard constraint, verify glyphs (є ї ґ і)**: one condensed/display face for headlines (uppercase-friendly), one workhorse grotesk for body/UI. Type scale: hero display, h1–h3, body, small/caption, price. Ukrainian strings run ~20–30% longer than English — show a long-string example.
3. **Primitives** (default / hover / focus-visible / active / disabled states where relevant):
   - Buttons: primary, secondary/outline, ghost, destructive; loading state with spinner; icon button (cart, close, burger).
   - Form: text input + label + helper + error state, textarea, select, phone field example; validation styling.
   - Quantity stepper (compact, used in cart rows and product page).
   - Badges: "In stock" / "Out of stock" (uk: «В наявності» / «Немає в наявності»), price tag style for ₴1 000 / $25.00.
   - Product card: photo (square), title, price, availability — grid unit for catalog pages. Photos are real amateur product shots on varied backgrounds — give them a consistent frame/treatment so the grid looks intentional.
   - Cart drawer (right-side sheet): header, line items (thumb, title, qty stepper, price, remove), sticky total + CTA footer, empty state.
   - Toasts: success and error (order placed / order failed).
   - Dialog/confirmation, skeleton loaders (card grid + product page), divider/rule styles.
4. **Layout rules**: spacing scale, container widths, border weights (brutalism tolerates thick rules — pick one voice), image aspect ratios, what a black "section header band" looks like at mobile and desktop.

## Constraints

- Must be expressible as Tailwind + shadcn/ui tokens: flat colors, zero radius, no gradients, no glassmorphism, no heavy shadows/blur. Keep effects cheap — this ships on a fast static site.
- Mobile-first: show key primitives at 375px width as well as desktop.
- Accessibility: AA contrast, visible focus rings (pick a brutalist-compatible focus treatment), touch targets ≥44px.
- Real content for samples: «Death» Black t-shirt — ₴1 000, out of stock; «Waiting» patch — ₴300, in stock; Sticker Pack — ₴250, in stock.
