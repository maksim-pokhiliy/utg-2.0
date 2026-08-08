# Step U5a — the payload becomes truthful (executor prompt)

---

/feature Step U5a of the ua-checkout initiative: give the checkout its real recipient and contact fields, make the order summary editable in place, and flip the submitted payload from today's v1 shape to the **v2 envelope**. This is the half of U5 that can be done without touching Нова Пошта — the delivery UI stays exactly as it is and `delivery.mode` is always `"generic"`, for BOTH locales. The store takes REAL volunteer orders and deploys `master` automatically: a regression here means a Ukrainian volunteer cannot order, or orders and nobody receives it.

**Pre-step reconnaissance — done by the planner, take as given.** The target shape was verified against the LIVE production relay before this prompt was written, not assumed from documents: a v2 envelope carrying `idempotency_key`, with `delivery.mode: "generic"` under `locale: "uk"`, was POSTed to the prod relay and came back **HTTP 200, delivered to the operators' chat**. So both of this step's external unknowns are closed — the relay accepts the key, and it does not cross-validate locale against mode. You do not need to re-derive this, and you must never POST to any deployed URL yourself.

**Context (read, never edit or stage).** `initiatives/ua-checkout/` — `requirements.md` is the behavioral SSOT and the sections that govern you are **§2** (what the operator must receive), **§3** (validation and normalization), **§5** (the envelope — canon, read it verbatim, including the three clarifying paragraphs after the JSON), **§6** (copy drafts), **§9** (the editable summary, a user finding with its own acceptance list). Decisions: D-1 (en keeps the generic form), D-3 (the v2 shape), D-9 (why U5 split in two), D-11 (`idempotency_key` lifecycle), D-12 (probe external ceilings before speccing). Carry-forwards due here: **UAC-3**, **UAC-6**, **DEF-39**. The ratified visual spec is `initiatives/ua-checkout/design-export/` (read-only).

The code you are changing: `src/components/checkout/` (`CheckoutForm.tsx` is the sender truth, plus `CheckoutField.tsx`, `fields.ts`, `CheckoutSummary.tsx`), the checkout screen under `src/components/pages/`, the dictionaries in `src/app/[lang]/dictionaries/{uk,en}.json`, and the existing payload contract test. `src/app/api/place_order/route.ts` forwards the body verbatim and should NOT need changes — if you find it does, say so at the plan gate rather than editing it quietly.

**Process gate.** You run headless under a planner session. Stop after your plan & design stage and END YOUR TURN with the complete plan-gate summary. Expected proposals:

- **Where the v2 composer lives** and how the payload is assembled at submit time from the store, keeping §9's requirement that summary edits stay live in `total`.
- **Phone normalization** (§3): the exact accepted uk input forms, the normalized output, where the util lives, and what it does with input it cannot normalize. Name the rejection cases you will pin.
- **The contact-channel control.** It is a required single-select with `call` preselected. Propose which existing DS primitive carries it — and if none fits, say so plainly: a new one goes INSIDE `src/design-system/` with a barrel export, never a raw `<input type="radio">` in app land. The seal has no escape hatch and there are no eslint-disable comments in this repo.
- **The `idempotency_key` lifecycle** (D-11), which is the subtlest thing in this step: minted when the buyer first submits, REUSED for every retry of that same order, reset only on success. Say where it lives so it survives a failed submit — component state resets on remount, and a key that changes between retries is worse than no key at all, because it makes a duplicate look like a new order. Say what happens on reload and on cart mutation between retries.
- **The editable summary** (§9): how it reuses DS `CartLine` + `QuantityStepper` + the existing `cart.remove_*` `ConfirmDialog` without introducing new primitives, and the mechanism that locks it while submit is pending.
- **The contract test migration.** The existing payload test pins today's v1 key set against the bot contract index. Propose how it becomes a v2 contract test pinned against §5 — this test is the shop's half of a two-sided contract; the relay already pins the other half.
- Which §6 strings change, and the UAC-3 replacements.

**Scope:**

1. **Recipient and contact fields** per §2/§3: last name + first name required; patronymic optional and **uk-only** (not rendered on en); phone required; contact channel required.
2. **Phone normalization** per §3: uk accepts `0XXXXXXXXX` / `380…` / `+380…` with spaces, dashes and parens and normalizes to `+380XXXXXXXXX`; en strips separators and requires `+` with 8–15 digits. The relay receives only the normalized form. Validation keeps the existing pattern — inline per-field errors on submit attempt, focus jumps to the first invalid field, `noValidate`.
3. **Contact channel**: single-select дзвінок / Telegram / Viber, «Дзвінок» preselected, wire values exactly `call` | `telegram` | `viber` (lowercase).
4. **Editable order summary** per §9, including its own acceptance list: edits mutate the store directly, totals and the submitted `total` stay live, removing the last line lands on the existing empty-cart state, and editing is locked while submit is pending.
5. **The payload flips to v2** per §5: `version: 2`, `customer{}`, `delivery.mode: "generic"` for **both** locales carrying today's country/state/city/address, `comment` for today's `additional`, cart lines and `total`/`currency`/`locale` byte-compatible with today, optional fields omitted when empty (never sent as `""`), and the minted `idempotency_key`.
6. **Copy and dictionaries** per §6, plus **UAC-3**: the uk placeholders in the ratified dictionary are still John/Wick and must become real Ukrainian examples.
7. **Riders**: **UAC-6** (`CartDrawer` `sizes="64px"` under-hints the stretched frame — one token, `sizes="96px"`), **DEF-39** (cart decoder field validation and honest typing — this step rewrites that decoder anyway).

**Out of scope (hard fence).** No Нова Пошта UI of any kind — no method chips, no settlement or warehouse comboboxes, no courier fields; that is U5b. **`delivery.mode` is ALWAYS `"generic"` in this step**, including uk. Do not touch the NP proxy routes under `src/app/api/np/` — they carry a known live defect (UAC-13, the multi-page merge is rate-limited by the carrier) which is U5b's first task and not yours. **Never cross-validate `locale` against `delivery.mode`** — §5 calls this the contract's least obvious trap, and a rule like "generic ⟺ en" would reject every real order for this entire window. `ICartItem` is frozen (DEF-3): the size stays inside `title`, and a new field on it is a compile error by design. Catalog data under `src/data/` is sacred. No new dependencies. Never stage `CLAUDE.md` or anything under `initiatives/`.

**Acceptance gates (verify and report in the PR test plan):**

- The full battery green: `yarn lint`, `yarn format`, `yarn typecheck` (BOTH TS programs), `yarn test`, the zero-env `yarn build`, and `yarn e2e`. Every new e2e spec must register its own rate-limit identity in `e2e/support/app.ts` — the limiter is live in the battery, and an unregistered spec silently shares the socket-derived bucket.
- Phone normalization units covering every accepted uk form and the rejections, plus the en path.
- A contract test pinning the v2 envelope against §5, including: `mode: "generic"` under `locale: "uk"`, optional fields ABSENT rather than empty strings, and the `call|telegram|viber` triple.
- e2e for §9: quantity edit reflected in totals, remove-with-confirm, the empty-out transition, and summary editing locked while submit is pending.
- The `idempotency_key` is stable across a retry of the same order and resets after a success — pinned by a test, not by inspection.
- **en is a regression surface, not a redesign surface** (D-1): the generic form must behave exactly as today apart from the envelope version.
- Checkout still submits with zero env vars — the relay's 503 stays the deterministic error fixture.

**Resource budget (WSL — mandatory).** Every heavy command runs inside `systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=1G -- <cmd>`, with `NODE_OPTIONS=--max-old-space-size=3072` on builds. Heavy commands strictly one at a time — never a build and a test run concurrently. If `systemd-run --user` is unavailable, say so in your report and apply the diet plus sequencing alone.

**Constraints:**

- No comments in code; remove existing comments in any region you edit.
- No skip flags (`--no-verify`, …) — root-cause failures instead.
- Match the existing style exactly, and the design system seal absolutely: no raw colors, no raw text-size utilities, no deep imports past the barrel, no raw `<button>`/`<a>` in app land.
- Branch from `master`, PR against `master`. Commits and PR text in English, first person, no assistant signatures anywhere.
- **Never POST to the deployed relay, the shop, or any Vercel URL, and never call the Нова Пошта API.** Tests run locally against stubs and Playwright intercepts OUR proxy, never live NP; the planner owns every live probe.
