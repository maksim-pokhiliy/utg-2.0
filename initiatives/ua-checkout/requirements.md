# ua-checkout — requirements (U1)

The order-information model and behavioral requirements for the Ukrainian-market
checkout. Requirements-first per D-2: this document derives from what the operator
needs to fulfil an order, not from the current form or payload. The visual design (U2)
and every implementation step (U3–U6) build against THIS document.

## 1. Modes

The checkout form column operates in exactly three modes:

| Mode            | Locale | Delivery model                                          | Trigger                                    |
| --------------- | ------ | ------------------------------------------------------- | ------------------------------------------ |
| **uk-live**     | uk     | НП method selector + directory autocomplete             | NP key configured and directory reachable  |
| **uk-fallback** | uk     | same field model; city/warehouse as free-text           | key absent OR directory calls failing      |
| **en-generic**  | en     | current international free-text (country/state/city/address) | always on en (D-1.2)                  |

Mode is never a user choice. uk-live degrades to uk-fallback **per capability, at
runtime**: if directory search fails mid-session (timeout/error), the affected
field(s) flip to free-text with a short hint, keeping anything already selected as
text. An order must be placeable in every mode at every moment (charter: fail open).

## 2. Order-information model

What the operator must receive to fulfil a Ukrainian order:

**Recipient** — last name, first name (both required), patronymic (optional; НП asks
for ПІБ when creating a ТТН — collecting it saves the operator a call-back; uk-only
field, not rendered on en).

**Contact** — phone (required; uk: Ukrainian mobile, normalized to `+380XXXXXXXXX`;
en: lenient international `+`-digits validation), preferred contact channel (required
single-select: дзвінок / Telegram / Viber; «Дзвінок» preselected — phone is required
anyway and a call is the universal fallback).

**Delivery (uk)** — method: `np_branch` | `np_postomat` | `np_courier`, then:

- `np_branch` / `np_postomat`: settlement + warehouse. Live: both from the NP
  directory (warehouse list filtered to the method's category, searchable by number).
  Fallback: settlement and warehouse free-text (labels ask for «місто» and
  «№ відділення / поштомату»).
- `np_courier`: settlement + street + building (required), apartment (optional).
  Street stays free-text in MVP (`searchSettlementStreets` exists — deferred, see §8).

**Delivery (en)** — unchanged generic set: country, state (optional), city, address.

**Order** — cart lines exactly as today (`ICartItem` frozen: id/title incl. size,
quantity, price, productUrl…), total + currency (production-polish D-12), locale.

**Extras** — comment (optional textarea, today's `additional`), and a delivery
`source` flag telling the operator whether location strings came from the NP
directory (`np_directory`) or were typed by hand (`manual`) — hand-typed means
"verify on the confirmation call".

**Deliberately absent**: email (the operator works phone/messenger-first — status
quo), НП refs in the payload (the operator creates ТТН manually in the НП cabinet;
refs serve only ТТН automation, a non-goal), order numbers/accounts (no database).

## 3. Validation & normalization

- **Phone (uk)**: accept `0XXXXXXXXX`, `380…`, `+380…` with spaces/dashes/parens;
  strip separators, normalize to `+380XXXXXXXXX` (9 digits after 380, mobile);
  anything else → inline field error. The bot receives only the normalized form.
- **Phone (en)**: strip separators; require `+` and 8–15 digits (E.164-lenient).
- **Required by mode**: recipient names + phone + channel always; uk NP-branch/
  postomat: settlement + warehouse; uk courier: settlement + street + building;
  en: country + city + address (state optional — today it is required for no reason).
- Patronymic, apartment, comment: optional everywhere.
- Validation stays the current pattern: inline per-field errors on submit attempt,
  focus jumps to the first invalid field, no browser-native validation (`noValidate`).

## 4. НП directory integration (verified contract)

Verified 2026-08-05 against two independent SDK mirrors of the official docs
(`maddsua/NovaPoshtaREST` typings, `daaner/NovaPoshta` docs); the official portal
(`developers.novaposhta.ua`) sits behind Cloudflare — the U4 executor re-checks exact
response fields there when implementing (UAC-2).

- Envelope: `POST https://api.novaposhta.ua/v2.0/json/` with
  `{apiKey, modelName: "Address", calledMethod, methodProperties}`; responses are
  `{success, data[], errors[]…}`.
- **Settlement search**: `calledMethod: "searchSettlements"`,
  `methodProperties: {CityName, Limit, Page}` — NP's own online-search endpoint
  ("немає необхідності зберігати довідники"). Result rows carry
  `MainDescription/Area/Region/SettlementTypeCode/Ref/DeliveryCity/Warehouses`;
  display string composed as «МІСТО, область» from those fields; `DeliveryCity` is
  the city ref for the warehouse lookup.
- **Warehouses**: `calledMethod: "getWarehouses"`,
  `methodProperties: {CityRef, Page?, Limit?, Language?, TypeOfWarehouseRef?}` —
  rows carry `Description` («Відділення №N: адреса»), `Number`,
  `CategoryOfWarehouse` (Branch/Postomat…), `WarehouseStatus`, `DenyToSelect`,
  schedules, limits. NP's docs mandate keeping a cached copy refreshed daily.
- **Our proxy** (`/api/np/*`, exact routes decided in U4): key server-side only;
  per-city warehouse list fetched page-merged and cached server-side (TTL ~24h per
  NP's own guidance; settlements search cached short, e.g. minutes, keyed by query);
  responses minimized to what the UI needs (display string, number, category) — no
  raw NP dumps to the client; same per-IP limiter posture as `place_order`
  (fail-open); filter out `DenyToSelect`/non-selectable warehouses; postomat-vs-
  branch filtering by `CategoryOfWarehouse` server-side or client-side (U4 call).
- **Failure budget**: directory calls get a short timeout (~2–3s); any failure flips
  the dependent fields to fallback free-text with a hint — never a blocked form,
  never a spinner-forever. No retries that delay the buyer.
- **Warehouse search UX**: within the fetched per-city list, filtering by number or
  substring happens client-side (a city's list is bounded and cached; avoids
  per-keystroke NP calls and any dependence on unverified server-side filters).

## 5. Payload contract v2 (resolves D-3)

One discriminated envelope for all three modes; `version: 2` marks the shape so the
bot can accept v1+v2 during the rollout window:

```json
{
  "version": 2,
  "locale": "uk",
  "customer": {
    "first_name": "Марія",
    "last_name": "Шевченко",
    "patronymic": "Іванівна",
    "phone": "+380671234567",
    "contact_channel": "telegram"
  },
  "delivery": {
    "mode": "np_branch",
    "source": "np_directory",
    "city": "м. Львів, Львівська обл.",
    "warehouse": "Відділення №1: вул. Городоцька, 359",
    "warehouse_number": "1"
  },
  "comment": "після 18:00",
  "cart": [ { "id": "patches/waiting", "title": "…", "quantity": 1, "price": 250, "productUrl": "…" } ],
  "total": "250.00",
  "currency": "UAH"
}
```

`delivery` variants: `np_branch`/`np_postomat` `{mode, source, city, warehouse,
warehouse_number}` · `np_courier` `{mode, source, city, street, building,
apartment?}` · `generic` (en) `{mode: "generic", country, state?, city, address}`.
`patronymic`, `comment`, `apartment`, `state` are omitted when empty. Cart lines,
`total`, `currency`, `locale` are byte-compatible with today (D-12 stays; the size
stays inside `title` per DEF-3).

**Rollout order (U6):** bot ships dual-accept (v1+v2 render) first → shop flips to
v2 (all three modes) → bot drops v1 in a bot-repo follow-up. Contract tests pin v2 on
both sides from the flip PR onward; the `x-relay-secret` sender (B2) must already be
live before this step.

## 6. Copy requirements (drafts — design-ratified in U2, dictionaries in U5)

- **Pre-submit expectations block** (both locales, ABOVE the submit button — today
  this truth is revealed only after ordering):
  - uk: «Онлайн-оплати на сайті немає — це волонтерський проєкт. Після оформлення
    менеджер зв'яжеться з вами, щоб узгодити оплату й підтвердити замовлення.
    Доставка — за тарифами Нової Пошти при отриманні.»
  - en: "There is no online payment — this is a volunteer project. After you place
    the order, our manager will contact you to arrange payment and confirm the
    order. Delivery is paid on receipt at carrier rates."
- **Consent line** (small text at the submit button, no checkbox — submitting IS the
  consent act; a checkbox adds friction without legal necessity for order
  fulfilment):
  - uk: «Надсилаючи замовлення, ви погоджуєтесь на обробку персональних даних для
    його виконання.»
  - en: "By placing the order you consent to your personal data being processed to
    fulfil it."
- **Fallback hint** (uk, when directory is unavailable): «Довідник Нової Пошти зараз
  недоступний — впишіть місто та відділення вручну.»
- Field labels/placeholders: real Ukrainian examples (no more John Wick / 555-0100):
  e.g. Ім'я «Марія», Прізвище «Шевченко», Телефон «+380 67 123 45 67», Місто
  «Львів», Відділення «Відділення №1 або поштомат». Final strings live in the
  dictionaries; uk and en key sets stay identical (the `typeof en` drift-guard),
  uk-only fields still carry en strings even if en never renders them.

## 7. Test requirements

- Units: phone normalization table (uk strict / en lenient), payload composition per
  mode (v2 shape pinned against this doc §5), NP proxy route (key-absent 503-or-
  equivalent signal, upstream error mapping, cache behavior, DenyToSelect filtering),
  new DS primitives (combobox states, chips radio semantics).
- Contract test: replaces/extends the current payload-key-set test; pins the v2
  discriminated envelope; the bot repo pins the identical shape (paired PR).
- e2e: uk-fallback is the blank-env deterministic default (NP key blanked in
  `yarn e2e` + CI alongside the existing three); uk-live covered by Playwright route
  interception of OUR proxy endpoints (never live NP); en-generic regression; the
  existing checkout 503 fixture stays.
- DEF folds: DEF-36 (limiter bucket isolation) lands with the e2e work here; DEF-37
  (relay-forwarding e2e via local stub relay) lands in U6; DEF-39 (cart decoder
  field validation + honest typing) lands in U5.

## 8. Deferred (explicitly not silently dropped)

- Street autocomplete for courier (`searchSettlementStreets`) — MVP keeps free-text;
  revisit on operator feedback.
- Укрпошта/Meest methods, ТТН automation, delivery-cost estimation
  (`getDocumentPrice`) — out per charter non-goals.
- en UA-flow (diaspora ordering to UA addresses) — only if real demand shows up.

## 9. Order summary on checkout — editable in place

Finding (user, 2026-08-05): the checkout summary is read-only — any cart edit forces
the hop through the header icon into the drawer. Requirement: edit where you decide.

- The summary column adopts the drawer's line anatomy — DS `CartLine` (media, title,
  `QuantityStepper`, line total, remove) + the existing remove `ConfirmDialog` and
  its `cart.remove_*` strings. No new DS primitives; sizing tuned for the aside.
- `CartLine` media fills the full line height (user finding 2026-08-05: the fixed
  64×64 frame floats small in a taller row). DS-internal change, lands with the U3
  DS window per the U2-ratified proportions; the drawer picks it up automatically.
- Edits mutate the store directly; the summary totals and the submitted payload
  `total` stay live (payload is composed at submit time from the store, as today).
- Removing the last line lands on the checkout screen's existing empty-cart state —
  already implemented, must be e2e-covered as a transition.
- While submit is pending, summary editing is locked (steppers + remove disabled) —
  the order must not mutate mid-flight.
- Applies to all three modes identically (the summary is mode-agnostic and
  locale-shared).
- Tests: e2e — quantity edit reflected in totals, remove-with-confirm, empty-out
  transition, locked-while-pending; units — none beyond `CartLine`'s existing ones.

## 10. Environment

One new optional key: `NOVA_POSHTA_API_KEY` (server-only; documented in
`.env.example`; blanked in `yarn e2e`/CI). No key → uk-fallback mode, by design.
Obtaining the real key from the operator's НП business cabinet = UAC-1 (needed live
only by U7).
