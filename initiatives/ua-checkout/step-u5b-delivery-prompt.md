# Step U5b — Нова Пошта delivery, and the proxy stops owning the corpus (executor prompt)

---

/feature Step U5b of the ua-checkout initiative: give the uk checkout its real Нова Пошта delivery flow — method chips, settlement and warehouse comboboxes on our own proxy, courier fields, and a runtime fallback to free-text whenever the carrier is unreachable — and rewrite the warehouse proxy underneath it, because **the one we shipped in U4 cannot serve Kyiv and never could**. This store takes REAL volunteer orders and auto-deploys `master`. The `en` locale keeps the generic form untouched (D-1): it is a regression surface, not a redesign surface.

**Pre-step reconnaissance — measured live by the planner with the operator's key, before this prompt was written (D-12). Take these as given; do not re-derive them, and never call the Нова Пошта API yourself.**

| what | measured |
| --- | --- |
| Kyiv's own `Warehouses` count from `searchSettlements` | **12 298** points — about 25 pages of 500 against our 10-page cap |
| unpaced page-merge | page 1 succeeds, page 2 returns HTTP 200 with `success: false`, `errors: ["To many requests"]`, `info: ["Try again after 0.5 seconds"]` |
| paced at 600ms | pages 1–8 all succeed; page 9 dies on OUR 7s deadline, not on NP's limit |
| `FindByString` delegated search | ONE page, 0.9–3.2s: «Хрещатик» → 2 branches, «43» → 9 of 361 raw rows, «Оболонський» → 3 |
| `AddressDeliveryAllowed` on settlement rows | string `"1"`/`"0"`, and it genuinely varies — courier is not offered in every settlement |
| settlements with `Warehouses: 0` | they exist, and a branch or locker must not be offered there |

The conclusion is architectural, not a tuning problem: **the whole-city page-merge is impossible at any budget, and the search belongs to the carrier.** This is ratified as **D-14**, and `requirements.md` §4 has been amended with the measurements. UAC-13's earlier prescription ("pace or retry inside the 7s budget") is WRONG and is kept in the ledger only as the trail.

**Context (read, never edit or stage).** `initiatives/ua-checkout/` — `requirements.md` §1 (modes), §2 (field model), §3 (validation), **§4 (the NP contract, amended — read the measured block at its head first)**, §5 (the envelope; the three `np_*` delivery variants are what this step finally sends), §7 (test strategy — Playwright intercepts OUR proxy, never live NP), §9. Decisions: **D-14** (this step's contour), D-7 (filtering and caps are ours), D-8 (`Present` verbatim, string encodings, HTTP 200 on `success: false`), D-1, D-9, D-13. Carry-forwards due here: **UAC-13, UAC-15, UAC-9, UAC-10, UAC-16, UAC-17**. The ratified visual spec is `initiatives/ua-checkout/design-export/` (read-only) — U5a deliberately shipped a uk checkout that does NOT match it yet; this step is where it converges.

The code: `src/app/api/np/` (client, cache, both routes and their directory modules), `src/components/checkout/` (`CheckoutForm.tsx`, `fields.ts`, `validation.ts`, `payload.ts` — all rewritten by U5a, read them before touching), the dictionaries, and `src/design-system/` if a combobox primitive is needed.

**Process gate.** You run headless under a planner session. Stop after your plan & design stage and END YOUR TURN with the complete plan-gate summary. Expected proposals:

- **The new warehouse route contract**: its query shape, what an EMPTY query returns, the cache key and TTL, and what happens to the old per-city cache module. Say explicitly which failure modes still collapse to the single 503 and why that set is unchanged.
- **The combobox primitive.** Check what the sealed DS already has (U3 shipped a form window; U5a found `ChoiceChips` already there and needed nothing new). If a new primitive is genuinely required it goes INSIDE `src/design-system/` with a barrel export — never a raw `<input>` with a hand-rolled listbox in app land. Propose its keyboard contract: arrow navigation, Enter to select, Escape to close, and what a screen reader announces while results load.
- **Debounce and in-flight cancellation** for the per-keystroke search, now that every keystroke can reach the carrier. Say what happens to a stale response that arrives after a newer one.
- **How method availability is derived** from the settlement row (`Warehouses` count, `AddressDeliveryAllowed`) and what the UI does when the settlement has not been chosen yet.
- **The fallback state machine**: what exactly flips the form to free-text, what flips it back, and how a buyer who already typed a free-text address is treated if the directory recovers mid-session. Never a blocked form, never a spinner forever.
- **UAC-15's extraction shape** before the delivery block is added.
- Which of UAC-9, UAC-10, UAC-16, UAC-17 you fold in and which you leave.

**Scope, in this order:**

1. **UAC-15 first.** Extract from `CheckoutForm.tsx` (315 LOC against the manifesto's 300 bar) before adding anything. Presentational extractions only.
2. **The warehouse proxy is rewritten (UAC-13 / D-14).** Delegate the substring match to NP via `FindByString`; delete the page-merge and the ~24h whole-city cache; re-key the cache to `(city, method, query)` with a short TTL. **D-7 is not weakened**: the category filter, the row cap, the `DenyToSelect` refusal and every failure decision stay in our code — we delegate the search, never the policy. An empty query returns the first capped page so the control is never empty when it opens.
3. **The settlements proxy surfaces two more fields** — the `Warehouses` count and the address-delivery flag — minimized, not raw.
4. **The delivery UI** per §1/§2: method chips (`np_branch` / `np_postomat` / `np_courier`), settlement combobox, warehouse combobox filtered to the chosen method and searchable by number, courier street/building/optional apartment. A method the carrier does not offer in the chosen settlement renders **disabled with a short reason**, not hidden (D-14.5).
5. **Runtime fallback to free-text** on any proxy failure, with a hint. This is the sacred invariant of the whole initiative: no step may leave a Ukrainian volunteer unable to submit an order.
6. **The payload finally sends the `np_*` variants** per §5, including `source` (`np_directory` when the value came from the directory, `manual` when typed) and UAC-9's rejoin — `delivery.city` is `label + ", " + region`, never `label` alone, because a truncated city loses the raion that disambiguates same-named villages.
7. **Riders**: UAC-10 (`Present` edge guards), UAC-16 (the checkout polish pack — take what is cheap where you are already editing), UAC-17 (unify the two invisible-character patterns; `src/utils/phone.ts` has the complete `\p{Cf}` class, `np/settlements/directory.ts` has a subset missing U+061C and the three isolates — take the complete one).

**Out of scope (hard fence):** the `en` generic form beyond the envelope's delivery variant; `src/app/api/place_order/route.ts`; the relay repo; `ICartItem` (frozen, DEF-3); catalog data; new dependencies; NP street autocomplete (`searchSettlementStreets` — §8 defers it, street stays free-text). Never stage `CLAUDE.md` or anything under `initiatives/`.

**Acceptance gates (verify and report in the PR test plan):**

- The full battery green: `yarn lint`, `yarn format`, `yarn typecheck` (BOTH TS programs), `yarn test`, the zero-env `yarn build`, and `yarn e2e`. Every new e2e spec registers its own rate-limit identity in `e2e/support/app.ts` — an unregistered spec silently shares the socket-derived bucket.
- Unit coverage for the rewritten proxy: the delegated search, the category filter, the row cap, `DenyToSelect` refusal, the empty-query page, and **every failure mode still collapsing to one 503** — no key, timeout, upstream error, `success: false`, and a container that decodes to zero rows.
- e2e for both uk directory modes and for the courier mode, with Playwright intercepting OUR proxy (§7 — never live NP), plus **a fallback spec proving the form still submits when the proxy answers 503**.
- A contract test pinning each `np_*` variant against §5, mirroring the relay's own (`../utg-tg-order-bot/tests/support/contract.ts`).
- The `en` generic path unchanged (D-1).
- Zero-env build and boot: with `NOVA_POSHTA_API_KEY` blank the proxy answers 503 and the uk form must land in free-text fallback — that IS the deterministic e2e fixture.

**Resource budget (WSL — mandatory).** Every heavy command runs inside `systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=1G -- <cmd>`, with `NODE_OPTIONS=--max-old-space-size=3072` on builds. Heavy commands strictly one at a time — never a build and a test run concurrently.

**Constraints:**

- No comments in code; remove existing comments in any region you edit.
- No skip flags (`--no-verify`, …) — root-cause failures instead.
- Match the existing style, and the design-system seal absolutely: no raw colors, no raw text-size utilities, no deep imports past the barrel, no raw `<button>`/`<a>` in app land.
- Branch from `master`, PR against `master`. Commits and PR text in English, first person, no assistant signatures anywhere.
- **Never POST to the deployed relay, the shop, any Vercel URL, or the Нова Пошта API.** Tests run against stubs and intercepts; the planner owns every live probe.
