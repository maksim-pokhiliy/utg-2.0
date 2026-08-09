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
  strip separators AND invisible format characters (`\p{Cf}` — the same class the NP
  proxy already strips one field away), normalize to `+380XXXXXXXXX` (9 digits after
  380); anything else → inline field error. The bot receives only the normalized form.
  **Amended by D-13:** "mobile" is intent, not a rule — operator prefixes are NOT
  policed and landlines are accepted. A hardcoded prefix list goes stale the moment a
  carrier gets a new range and then silently rejects a valid volunteer's number, which
  costs a real order; a landline costs nothing.
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
  ("немає необхідності зберігати довідники"). The payload is nested:
  `data: [{TotalCount, Addresses[]}]` — an empty search is `TotalCount: 0`, not
  `data: []` (D-8; the U1 mirror typed this wrong). Rows carry `Present` — NP's
  own composed display string («м. Київ, Київська обл.», «с. Київець,
  Миколаївський р-н, Львівська обл.») — plus
  `MainDescription/Area/Region/Ref/DeliveryCity/Warehouses`. Display = `Present`
  verbatim (D-8 supersedes the earlier «МІСТО, область» recipe, which lost the
  raion that disambiguates same-named villages; the recipe stays as fallback);
  `DeliveryCity` is the city ref for the warehouse lookup.
- **Warehouses**: `calledMethod: "getWarehouses"`,
  `methodProperties: {CityRef, Page?, Limit?, Language?, TypeOfWarehouseRef?}` —
  rows carry `Description` («Відділення №N: адреса»), `Number`,
  `CategoryOfWarehouse` (Branch/Postomat…), `WarehouseStatus`, `DenyToSelect`,
  schedules, limits. NP's docs mandate keeping a cached copy refreshed daily.
  Values are string-encoded (`Number` `"1"`, `DenyToSelect` `"0"|"1"`, categories
  `"Branch"|"Postomat"`, `WarehouseStatus === "Working"`), and NP answers HTTP 200
  even on `success: false` — `response.ok` alone proves nothing (D-8).
- **MEASURED LIVE 2026-08-08 with the operator's key (D-14) — this supersedes the
  estimates below it.** Kyiv reports **12 298** warehouse points in its own
  `Warehouses` count, not the ~3000 D-8 estimated: ~25 pages of 500 against a 10-page
  cap, so the whole-city page-merge was never completable. Unpaced, NP rate-limits page
  2 immediately (`success: false`, `errors: ["To many requests"]`, `info: ["Try again
  after 0.5 seconds"]`, HTTP 200); paced at 600ms pages 1–8 all succeed and page 9 dies
  on OUR 7s deadline, not on NP's limit. **`FindByString` works**: one page, 0.9–3.2s,
  «Хрещатик» → 2 branches, «43» → 9 of 361 raw rows, «Оболонський» → 3.
  `searchSettlements` rows also carry `AddressDeliveryAllowed` (`"1"`/`"0"`, and it
  genuinely varies — courier is not offered everywhere) and `Warehouses` (a count;
  settlements with `0` exist and must not be offered a branch or a locker).
- **Our proxy** (`/api/np/*`): key server-side only; responses minimized to what the UI
  needs — no raw NP dumps to the client; same per-IP limiter posture as `place_order`
  (fail-open); `DenyToSelect`/non-selectable warehouses filtered out; postomat-vs-branch
  filtering by `CategoryOfWarehouse` server-side via a `method` query param (D-7).
  **The warehouse SEARCH delegates to the carrier via `FindByString` (D-14)** — one
  page per query, no page-merge, no 24h whole-city corpus. Caching moves to
  `(city, method, query)` with a short TTL; settlement searches stay minutes-cached.
  D-7 is unchanged in substance: the category filter, the row cap and every failure
  decision remain OUR code — what we delegate is the search, not the policy.
- **Failure budget**: settlement calls ~2.5s; a warehouse query gets the single-page
  budget (NP was measured at 0.9–3.2s, so the existing 7s deadline is generous rather
  than tight). Any failure flips the dependent fields to fallback free-text with a hint —
  never a blocked form, never a spinner-forever. No retries that delay the buyer.
- **Warehouse search UX** (D-7, amended by D-14): the proxy still caps the response
  (~30 rows; settlements ~10) and still owns the category filter, but the substring
  match itself is NP's. The original rationale "no dependence on unverified NP
  server-side filters" was falsified by measurement, and the other original rationale —
  keeping a 12 000-row city list away from the client — is served better by never
  fetching it at all. An empty query returns the first capped page so the control is
  never empty on open.

## 5. Payload contract v2 (resolves D-3)

One discriminated envelope for all three modes; `version: 2` marks the shape so the
bot can accept v1+v2 during the rollout window:

```json
{
  "version": 2,
  "idempotency_key": "3f2b8c1e-9a44-4d7e-8b2f-16c0a9e5d731",
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
**Which fields the RELAY may require (resolves the §3-vs-§5 ambiguity, B3 plan gate
Q12).** §3 governs requiredness; §5 governs shape and names. The `?` marks in §5 are
not the whole optional set — they describe the SHOP's emit contract, and a decoder
that treats every unmarked field as mandatory would reject real orders over
diagnostics. Concretely, the relay requires only what it cannot render an order
without: `delivery.mode`, and per mode `city` + (`warehouse` | `street`+`building` |
`address`), plus `customer.first_name`/`last_name`/`phone`. It must NOT reject on a
missing `source` (a verify-on-the-call hint — absent renders as "not stated"),
`warehouse_number` (already contained inside the `warehouse` string), or
`contact_channel` (a preference; the phone is mandatory anyway and §2 names a call
the universal fallback). The shop still sends all three — but a shop bug must cost a
hint, never a volunteer's order.

**`contact_channel` wire values** (B3 plan gate Q1): the shop emits exactly
`call` | `telegram` | `viber` (lowercase, `call` being §2's preselected default).
The relay accepts ANY non-empty string and renders it verbatim — no closed enum, no
display map: an enum mismatch would 400 the single most common order shape, and the
field is informational. The canonical triple is the shop's obligation, pinned by its
own contract test, not a gate the relay enforces.

**No cross-validation of `locale` against `delivery.mode`** (B3 plan gate Q9 — the
contract's least obvious trap): a rule like "generic ⟺ en" would reject EVERY real
order during the U5a window, because per D-9 `mode: "generic"` ships under
`locale: "uk"` by design until U5b lands the НП modes. Neither side may infer one
from the other, ever.

`idempotency_key` (D-11) is an optional top-level UUID the shop mints when the buyer
first submits and REUSES for every retry of that same order, resetting only on
success — so a retry after an ambiguous failure is recognizable as the same order
rather than a second one. It is optional in the envelope (a v2 body without it stays
valid), the relay must accept and carry it without requiring it, and no decoder on
either side may reject a v2 body for carrying fields it does not know.

`patronymic`, `comment`, `apartment`, `state` are omitted when empty. Cart lines,
`total`, `currency`, `locale` are byte-compatible with today (D-12 stays; the size
stays inside `title` per DEF-3). `delivery.city` carries NP's `Present` string
verbatim — under the D-8 proxy contract U5 rejoins it as `label + ", " + region`,
never `label` alone (a truncated city loses the raion).

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
