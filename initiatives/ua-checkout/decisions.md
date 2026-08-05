# ua-checkout — decisions

D-numbered ratified decisions. Step-level calls that don't merit a full ADR live here;
cross-initiative architecture calls go to the project's ADR home (none kept — this file
is it). **Promote here at every gate** — a decision that lives only in scratch or an
external chat is not durable. This file is the SSOT for "why."

**Status legend:** `RATIFIED` (decided + acted) · `OPEN` (awaiting ratification — do not
execute past it) · `SUPERSEDED` (replaced — kept for the trail).

## Index

| ID  | Topic                                                | Status   |
| --- | ---------------------------------------------------- | -------- |
| D-1 | MVP scope: the four ratified axes                    | RATIFIED |
| D-2 | Requirements-first: form + bot contract are movable  | RATIFIED |
| D-3 | Payload v2: one discriminated envelope, bot dual-accept rollout | RATIFIED |
| D-4 | U2 ratified: design-export is the visual SSOT                   | RATIFIED |

---

### D-1 — MVP scope: NP-only · en generic · full contact pack · live NP API with fail-open fallback

- **Status:** RATIFIED (user, 2026-08-05, scoping Q&A).
- **Decision.**
  1. **Carriers:** Нова Пошта only (відділення / поштомат / кур'єр); "хочу Укрпоштою"
     goes into the comment field.
  2. **en locale:** keeps the current generic international form (country / city /
     address free-text); the UA flow ships on uk only.
  3. **Contact pack — all four:** +380 mask/normalization/validation; contact-channel
     chips (дзвінок / Telegram / Viber); optional по батькові; personal-data consent
     one-liner.
  4. **NP directory:** live API through our server-side proxy (key in env, cached),
     with automatic free-text fallback when the key is absent or the API fails.
- **Rationale.** NP covers ~95% of the market and is the only carrier with a
  practically obtainable free API key; en buyers are arranged manually by the operator
  anyway; the dual-purpose "Телефон / Нік у Телеграм" field made operators guess the
  channel; a live directory is the only one that survives wartime branch churn, and
  fail-open keeps ordering alive on a prod that takes real orders.
- **Links.** journal 2026-08-05; charter.

### D-2 — Requirements-first: the current form fields and bot payload are not constraints

- **Status:** RATIFIED (user, 2026-08-05: "нет ничего замороженного, отталкиваемся от
  требований к чекауту, а не к написанному коду").
- **Decision.** The order-information model is derived from what the operator needs to
  fulfil a Ukrainian order — not from the recovered 1.0 field set
  (`country/state/city/address`). The bot contract is ours to reshape: changes land as
  paired shop+bot steps with contract tests on both sides, never by packing structured
  data into legacy string fields.
- **Rationale.** The bot is the user's own repo and is mid-rewrite (bot-polish B1
  shipped) — this is the one window where an honest contract costs almost nothing;
  packing "НП №23" into `address` would freeze a hack into a sacred contract.
- **Links.** journal 2026-08-05; production-polish D-12 (currency field precedent).

### D-3 — Payload v2: one discriminated envelope for all modes, bot dual-accept rollout

- **Status:** RATIFIED (planner engineering call, 2026-08-05; user veto open — flag
  raised in the session summary).
- **Decision.** The order payload becomes a v2 envelope (`version: 2`) with
  `customer{first_name,last_name,patronymic?,phone,contact_channel}` and a
  discriminated `delivery.mode`: `np_branch`/`np_postomat` (city, warehouse,
  warehouse_number), `np_courier` (city, street, building, apartment?), `generic`
  (en: country, state?, city, address) — plus `delivery.source:
  "np_directory"|"manual"`. `cart`/`total`/`currency`/`locale` stay byte-compatible
  (D-12, DEF-3 size-in-title). No НП refs, no email (requirements §2). Rollout: bot
  ships dual-accept (v1+v2) → shop flips all three modes to v2 → bot drops v1 in a
  follow-up. Exact shape: `requirements.md` §5.
- **Rationale.** Additive extension would carry dead fields (`state`, a hardcoded
  `country` for uk) and invite packing structured data into legacy strings — the
  exact hack D-2 forbids; a discriminated union gives the bot one trivial template
  per mode and gives contract tests one honest shape to pin; the bot mid-rewrite
  (B1 shipped) makes dual-accept nearly free, and `version` makes the rollout
  window explicit instead of key-sniffing.
- **Links.** requirements.md §5; journal 2026-08-05; production-polish D-12, DEF-3.

### D-4 — U2 ratified: the design export is the visual SSOT for U3/U5

- **Status:** RATIFIED (user, 2026-08-05: «дизайнер отработал, мне всё нравится»;
  export pulled the same day).
- **Decision.** `design-export/` in this directory is the visual SSOT for the DS
  window (U3) and the checkout rework (U5). Engineering-binding details ratified with
  it: the Combobox is **portal-less** (in-flow panel, border-fuse `margin-top:-2px`,
  debounce 250ms, blur-grace 140ms, focus-opens-list); ChoiceChips are radio-semantic
  chips at 44px touch height; **one CartLine, two scale presets** (drawer 64px /
  summary 56px), media frame stretches to full line height; the summary's pending
  lock dims controls only (opacity .45); uk field order is Прізвище → Ім'я; the
  success screen gains the flag-yellow check tile; submit errors surface as the
  existing error Toast bottom-center. Copy in the prototype dict = ratified strings
  (matches requirements §6), except the uk name placeholders (UAC-3).
- **Rationale.** Same regime that made 4a–4h converge in production-polish: one
  ratified visual source, implementation matches it, deviations need a new decision —
  prevents per-PR design relitigating.
- **Links.** design-export/README.md; component-specs-addendum.md; journal
  2026-08-05.
