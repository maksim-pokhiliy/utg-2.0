# D3.4 — Cart drawer + Checkout design (Claude Design brief)

Paste everything below into the SAME cumulative Claude Design dialog (Home + catalog +
category + product), as one message, with the freshly refreshed `utg-2.0` Desktop
snapshot attached.

Standing rule for ALL page briefs (D3 track): the user attaches a FRESH snapshot of the
codebase (folder `utg-2.0`, planner refreshes it on the Desktop before each brief) to
the design dialog; the newest snapshot SUPERSEDES any previously attached one. The
brief still carries all copy inline; the attached code is the ground truth for what
exists — the sealed design system in `src/design-system/` (tokens `styles/theme.css`,
primitives, public barrel `index.ts`), current screens in `src/app/[lang]/` +
`src/components/`, dictionaries in `src/app/[lang]/dictionaries/`.

---

Page-design phase, fourth brief — same dialog, the prototype grows. The freshly
attached `utg-2.0` snapshot SUPERSEDES the previous one: your product page is now
SHIPPED and live (`ProductScreen` + the `SizeSelector` chips), and the cart is
size-aware — a sized line's `title` arrives ALREADY COMPOSED as `Title · SIZE`
(e.g. «Death» Чорна · M); render it as one string, never re-parse it. The design
system is FROZEN — tokens, type, primitives, guidelines are the law. Older `ui_kits/`
demos remain sketches you may depart from.

**Task: design the BUY-COMPLETION pair** (they ship together as one implementation
step): the **cart drawer** and the **checkout page** (`/checkout`) — the money path of
a live shop taking real orders. Mobile-first (375px) and desktop (1200px+), Ukrainian
default with an English variant (uk runs 20–30% longer — design for uk, verify en).

**Surface 1 — Cart drawer.** Opens from the header cart icon on every screen (the
shipped `Sheet` pattern stays — a different container needs an explicit proposal).
Design its content:

- Line item: photo thumb, title (may carry ` · SIZE` — and the longest line is «Набір
  із "Waiting, Welcome, Death"», design for it), price, `QuantityStepper`, remove —
  removal confirms via the shipped `ConfirmDialog` (strings below).
- Total row + the drawer's ONE accent CTA → checkout («Перейти до Оформлення»).
- Empty state (strings below — empty_cart / add_to_cart / here → catalog link).
- **Add-to-cart feedback is yours to design**: today adding from the product page is
  SILENT — no toast, drawer stays closed. Decide the feedback (the DS `Toaster`
  exists; auto-opening the drawer is also on the table) and design it explicitly.

**Surface 2 — Checkout page.** Form + summary + the three outcomes. The kit sketch
(legitimate starting point, not a constraint): band title → two-column auto-fit grid —
form left (customer section: first/last name 2-col, telephone; hair rule; delivery
section: country/state 2-col, city, address, additional as textarea), summary card
right (2px ink border, band header row, line items with mono ×qty, baseline total with
`price--big`, accent block place-order `Button`, small review note under it). Success
in the kit replaces the page: band «Замовлення прийнято» + flag-yellow 48px square
with a check icon + success paragraph + small successNote.

Hard constraints on this page (the payload contract with the order bot is SACRED):

- The form field SET is FROZEN: first_name, last_name, telephone, country, state,
  city, address, additional — restyle and regroup freely, but never add, remove, or
  rename a field. Required set (matches the live form): first_name, last_name,
  telephone, country, city, address; state + additional optional.
- Validation: `Field`/`Input`/`Textarea` with their error states exist in the DS;
  empty-required error text is «Обов'язкове поле» / "Required field". Design the
  errored form state explicitly.
- The submit is the site's one REAL async action — the accent `Button` has a
  `loading` state; design pending. Then BOTH outcomes: success (kit shape above) and
  ERROR — the relay can fail («Помилка при відправці замовлення» / "Error when
  placing an order"); the cart must visibly survive an error (nothing clears until
  success). No loading states anywhere else (SSG pages, synchronous data).

Copy (verbatim; most is ALREADY LIVE in the dictionaries — reuse; three kit-authored
strings are NEW and adopted per our no-reinvention rule):

- Drawer: «Кошик»/"Cart" · «Всього»/"Total" · «Перейти до Оформлення»/"Proceed to
  Checkout" · empty: «Ваш кошик порожній»/"Your cart is empty" + «Додайте товари до
  свого кошика»/"Add products to your cart in" + link «тут»/"here" · remove dialog:
  «Видалити товар?»/"Remove item?", «{title}» буде видалено з кошика. / "{title} will
  be removed from your cart.", «Скасувати»/"Cancel", «Видалити»/"Remove".
- Checkout: «оформлення»/"checkout" (band) · sections «Інформація про замовника»/
  "Customer details" + «Деталі доставки»/"Delivery details" · fields (label /
  placeholder): Ім'я/John, Прізвище/Wick, Телефон / Нік у Телеграм/555-0100,
  Країна/Україна, Область/Львівська Область, Місто/Львів, Адреса/Вулиця Казкового
  Міста 1, Додаткова інформація/— (en: First Name, Last Name, Phone Number / Telegram
  Nickname, Country/Ukraine, Region / State/Lviv Region, City/Lviv, Address/Fairy Tale
  City Street 1, Additional Information) · «Підсумок»/"Order summary" · «Зробити
  Замовлення»/"Place Order" · «Перегляньте ваші дані вище та продовжуйте, коли будете
  готові.»/"Review your details above and continue when you're ready." · success:
  «Дякуємо за ваше замовлення! Наш менеджер зв'яжеться з вами найближчим часом»/
  "Thank you for your order! Our manager will contact you shortly".
- NEW (kit-authored, adopt verbatim): «Замовлення прийнято»/"Order received" ·
  «Оплата не відбувається онлайн — це волонтерський проект. Менеджер узгодить з вами
  оплату та доставку.»/"No online payment — this is a volunteer project. Our manager
  will arrange payment and delivery with you." · «Обов'язкове поле»/"Required field".

Design-load (must exist in the prototype): a cart holding a SIZED line («Death» Чорна
· M), the long set-title line, a quantity > 1; the empty drawer; the errored form; the
pending submit; the success state; the error state. Both locales.

Accent budget: one flag-yellow moment per view — drawer: proceed CTA; checkout: place
order; the success check-square is a status marker (the in-badge precedent), fine.
Money: uk ₴ / en $ via the DS `Price`; totals derive from lines. Honest tone — no
urgency, no invented claims; AA contrast; touch targets ≥44px; every interactive
element maps to an existing DS primitive or an explicitly proposed addition.

If a composition genuinely needs something the DS lacks, do NOT silently improvise a
style — build the page with it, but list it separately as a "proposed DS addition" for
ratification.

Deliverable: ONE worked composition per surface — no variant forks; polish across both
breakpoints, both locales, and all states. Ship as new files (`screens/cart/` +
`screens/checkout/`), clearly separated.

Because the prototype is cumulative, WIRE the flow: the header cart icon opens the
drawer on every screen; add-to-cart on the product screen feeds the drawer (with your
designed feedback); proceed → checkout; a mock submit reaches pending → success (and
an error toggle for the error state) — the project should demo the full buy path on
mocked data.
