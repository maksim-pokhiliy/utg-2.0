# ua-checkout — state (the board)

**Updated:** 2026-08-11 (U5b DONE — the uk checkout ships its Нова Пошта delivery flow,
merged and prod-smoked end to end; UAC-11 closed by measurement, the hole is not live)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #   | Step                                                     | Status                         | Pointer                                               |
| --- | -------------------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| U0  | PREREQ: bot-polish B2 (sender) + B3 (bot dual-accepts v2) | ✅ done — PR #20 `bb3f866` (secret enforced live) + bot PR #2 `66134ee` (v2 accepted); both prod-smoked | PR #20 · D-10 · journal 2026-08-06 |
| U1  | Requirements spec + contract draft (resolve D-3)         | ✅ done                        | `requirements.md` · D-3 RATIFIED · journal 2026-08-05 |
| U2  | Design pass (brief → Claude Design → export)             | ✅ done                        | `design-export/` · D-4 · journal 2026-08-05           |
| U3  | DS window: form primitives + DEF-41                      | ✅ done — PR #18 squash-merged `ac1b73a` incl. the D-6 fix round; prod live-verified; DEF-41 CLOSED | PR #18 · D-5 · D-6 · journal 2026-08-05 |
| U4  | NP proxy route + caching + env plumbing                  | ✅ done — PR #19 squash-merged `a17aa30` incl. the D-8 fix round; prod fail-open verified (503 + 400) | PR #19 · D-7 · D-8 · journal 2026-08-06 |
| U5a | Contacts + copy + editable summary; payload flips to v2   | ✅ done — PR #21 `9099402`, prod-smoked end to end through the live shop route | PR #21 · D-13 · journal 2026-08-08 |
| U5b | Delivery: method chips, NP comboboxes, courier fields     | ✅ done — PR A `25c58d7` (carrier layer) + PR B `4348455` (the flow, 54 files); two independent reviews, four fix rounds, 25 mutation proofs; prod-smoked end to end | PR #22 · PR #23 · D-14…D-18 · journal 2026-08-11 |
| U6  | Contract close-out (bot drops v1, tests pin v2)          | ⬜ pending                     | plan.md · D-3                                         |
| U7  | Prod verify + close-out                                  | ⬜ pending                     | charter acceptance criteria                           |

## Next action

**U5b IS DONE AND LIVE. The next step is B5, and it is in the OTHER repo.**

The uk checkout now asks the carrier instead of asking the buyer to type: settlement and
warehouse comboboxes on our own proxy, a three-way method chip row, courier fields, and a
runtime fallback to free text that no directory failure can defeat. Prod-smoked end to end
2026-08-11 — a live `np_postomat` envelope through the real route returned
`{"status":"success"}` 200, and the live directory answers Київ with 12 380 points, the
exact locker by number, and a 30-row capped branch page. Rulings: **D-16** (the negative
cache stores the carrier's word, never our own), **D-17** (distress is read by `errorCode`,
never by prose), **D-18** (`method` leaves the cache key; an option id is not the carrier's
ref).

**UAC-11 is CLOSED and the answer is "no hole"** — see its ledger row for the probe and,
more usefully, for how the FIRST probe was misread. It no longer gates anything.

### Next: B5 — orders become durable (bot repo `../utg-tg-order-bot`, initiative bot-polish)

Nothing in the shop repo blocks it. `DATABASE_URL` is already live on the bot's Vercel
project (Neon pooler) and nothing reads it yet. The hard constraint is **D-13 / BDEF-9**:
the shop mints `idempotency_key` on first submit and resets it only on success, so the key
deliberately SPANS an order the buyer EDITED between retries. **Dedupe on a content hash
within a time window; treat the key as a hint, never as an identity.** Key-only dedupe
would answer 200 to an order that was never delivered, and the shop would show the success
screen and clear the cart — the buyer loses their cart believing the corrected order was
accepted. Also live in that repo: BDEF-8 (the enforced Telegram metric is still unknown
between raw code points and parsed length; settling it needs a direct Bot API call and
would reclaim ~980 units of cart room) and BDEF-6/7 (structural tails that resolve as a
side effect of the step that DROPS v1).

Then **U6** — contract close-out, the bot drops v1 and the tests pin v2 on both sides in
one paired step; UAC-20 and the UAC-21/23 polish sets are scheduled into that window.
Then **U7** — prod verify and close-out.

## Open decisions awaiting ratification

(none — D-1…D-18 ratified)

## Live carry-forwards

- Inherited: DEF-36 — CLOSED by U4 (per-spec limiter identities); DEF-37 (relay
  forwarding e2e, → U6); DEF-39 (cart decoder, → U5). DEF-41 — CLOSED by U3.
  Both closures also recorded in the production-polish canonical ledger.
- **CLOSED by U5b** — UAC-9, UAC-10, UAC-13, UAC-17 and UAC-18 (all three debts of
  delegating the search), UAC-19(4), and **UAC-11**, whose answer is that the limiter
  is NOT bypassable: a pacing-immune probe returned 60 × 200 then 10 × 429 for a forged
  identity and byte-identically for an honest one, because Vercel overwrites
  `x-forwarded-for` to prevent spoofing. Its ledger row keeps the trail of how the first
  probe was misread — two sequential runs share one sliding window, so the control was
  contaminated by the treatment.
- **UAC-1**, **UAC-2**, **UAC-3**, **UAC-6**, **DEF-39** — CLOSED earlier (2026-08-08).
- **NEW, all OPEN** — **UAC-20** (the client's abort is never linked to the upstream
  fetch, the real multiplier behind the fan-out debts; → U6), **UAC-21** (first-review
  tail: a 209-line hook, dead `INITIAL_DELIVERY` pinned by 7 assertions, duplicated
  `ERROR_KEYS`, no `maxLength` on free-text fields), **UAC-22** (11 below-the-cut items,
  named so the tail is durable), **UAC-23** (re-review set — chiefly the ruling that an
  unparseable success stays "distress", recorded WITH the reviewer's disagreement, to be
  re-read on carrier drift), **UAC-24** (one focus guard no environment can cover:
  neither jsdom nor Chromium fires `blur` on node removal, only Firefox does).
- **UAC-4** (OPEN) — the Claude Design kit lags the repo DS; one `/design-sync`
  backport pass after U3 merges (delta audit incl. 4d-era additions).
- **UAC-5/6/7** (SCHEDULED) + **UAC-8** (OPEN) — review riders: NP-proxy row cap (→ U4), drawer
  `sizes` hint + combobox adoption notes (→ U5).

## Gotchas a resuming session must know

- **Prod takes real orders** — NP integration must fail OPEN to free-text fields;
  no step may leave checkout unable to submit. Vercel auto-deploys `master`.
- **Zero-env invariant**: build/boot/e2e with no env vars; the NP key joins the three
  existing blanked keys in `yarn e2e` / CI, and the fallback mode IS the deterministic
  e2e fixture.
- **Requirements-first (D-2)**: don't inherit `country/state/city/address` thinking;
  the field model comes from `requirements.md`, the bot contract moves with us via
  paired steps (bot repo: `../utg-tg-order-bot`, mid bot-polish).
- **en locale keeps the generic form** (D-1.2) — the UA flow is uk-only; en is a
  regression surface, not a redesign surface.
- New form primitives belong INSIDE the sealed DS (`src/design-system/` + barrel);
  the seal lint has no escape hatch.
