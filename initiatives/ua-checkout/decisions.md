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
| D-3 | Payload shape: clean v2 vs additive extension        | OPEN     |

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

### D-3 — Payload shape: clean v2 vs additive extension

- **Status:** OPEN — resolve in U1 with the field model on the table.
- **Question.** Redesign the payload cleanly around the new order-information model
  (v2: nested delivery/contact objects, drop dead fields like `state`), or extend the
  current flat shape additively (new optional keys, old keys kept for en)?
- **Constraints for the call.** en generic form keeps sending its field set either
  way; the bot renders one message template per shape; DEF-13 `currency` read must
  keep working; contract tests pin whatever is chosen on both sides.
