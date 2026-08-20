# ua-checkout — state (the board)

**Updated:** 2026-08-20 (U6 merged as a pair and prod-smoked — the relay knows only v2 and
the order forward is bounded on both sides. **Only U7 remains, and it is the owner's gate**)

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
| U6  | Contract close-out (bot drops v1, tests pin v2)          | ✅ done — merged as a PAIR: relay `a81fa1e` (#5) + shop `700fca0` (#24); local end-to-end smoke BEFORE merge, prod smoke after | PR #5 · PR #24 · D-19…D-21 · journal 2026-08-20 |
| U7  | Prod verify + close-out                                  | ⬜ pending                     | charter acceptance criteria                           |

## Next action

**ONE STEP REMAINS, AND IT IS YOURS: U7.**

U6 merged as a pair on 2026-08-20 and is live. The relay accepts exactly one payload shape —
its v1 decoder, renderer and golden corpus are deleted, so a versionless or `version: 1` body
is now an ordinary 400. The shop's order forward is bounded on both sides: a 20s deadline
derived from the CALLEE's budgets, a 64 KiB inbound cap answering 413, `new URL()` instead of
string surgery, and the relay's STATUS mirrored while its body never is (D-19).

**Verified by real requests, twice.** Before the merge, both services were stood up locally —
the relay's compiled deploy entrypoint hosted on a port, the shop's built server pointed at it —
and curled: 401 without a secret, **400 on `version: 1` AND on a real versionless legacy body**,
200 on v2 with a Neon row at `schema_version = 2` and a Telegram message delivered. After the
merge, a live order through `www.ua-tactical-gear.com` returned 200 in **2.32 s** carrying
`application/json` + `nosniff` and a body of `{}`, with its Neon row confirmed and then deleted.

### U7 — prod verify + close-out (the only remaining step)

The owner's browser gate on ua-tactical-gear.com against the charter's eight acceptance
criteria, then `/initiative-close`. **Criteria 1–6 and 8 are already satisfied** by shipped,
prod-smoked work; **criterion 7 IS the gate** — "prod live-verified by a user browser gate" is
the one thing a planner cannot do on the owner's behalf. **UAC-7** is explicitly a browser-gate
watch-list and is what this gate exists to settle.

Worth watching in the Vercel logs during the gate, because it is the one thing no test can
reach: the pairing of "no `FUNCTION_INVOCATION_TIMEOUT`" with "no deadline log line for an order
that actually arrived" is the signal that 20s is not squeezing anyone. The single live data
point so far is 2.32 s against a 14.5 s theoretical worst case.

### Not blocking U7, but live

Relay-side, planner-owned: **BDEF-11** (the relay authenticates to Neon as the schema owner and
could `drop table orders`; it needs INSERT/SELECT/UPDATE only — an env update plus a redeploy of
the SERVING deployment, per the BDEF-1 lesson) and **BDEF-10** (B5 created a PII datastore with
no retention policy). **BDEF-8** (which Telegram width metric is actually enforced; ~980 units of
cart room) is a direct Bot API probe, any time. Owner-owned and unscheduled: the `DATABASE_URL`
password rotation — BDEF-11 retires that credential from the relay anyway.

## Open decisions awaiting ratification

(none — D-1…D-21 ratified)

## Live carry-forwards

- Inherited: DEF-36 — CLOSED by U4 (per-spec limiter identities); DEF-37 (relay
  forwarding e2e, → U6); DEF-39 (cart decoder, → U5). DEF-41 — CLOSED by U3.
  Both closures also recorded in the production-polish canonical ledger.
- **CLOSED by U5b** — UAC-9, UAC-10, UAC-13, UAC-15, UAC-17 and UAC-18 (all three debts of
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
- **UAC-7** (SCHEDULED → U7's browser gate) — the combobox adoption watch-list, plus the
  D-6.2 consumer contract. **UAC-8** (OPEN) pairs with UAC-4 in one DS-hygiene window.
- **UAC-25** (OPEN → U6) — promoted from the relay's BDEF-12 and re-verified in this repo:
  `/api/place_order` is public, attaches the relay secret for any caller, forwards with no
  abort signal and no duration bound, and its limiter is a per-lambda Map. Distinct from
  UAC-11, which asked whether the limiter's identity could be forged (no) — this asks
  whether a per-instance counter is a limit at all.
- **UAC-12**, **UAC-14**, **UAC-16**, **UAC-19**(1)(2)(3)(5) — open review sets from U0/U4/
  U5a and PR A, none a defect today; U6 is the natural window for the route-level ones.

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
