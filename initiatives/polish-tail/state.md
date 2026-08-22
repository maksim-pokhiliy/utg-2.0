# polish-tail — state (the board)

**Updated:** 2026-08-22 — P1 in flight: relay PR #7 open (CI green), deep review running; shop half queued behind it.

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #  | Step                                                                              | Status                              | Pointer                                  |
| -- | --------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| P1 | Contract pair: channel-vocabulary value pin + relay currency-case + category warn | 🔵 active — relay PR #7 open (`0fce526`, CI green), deep review in flight; shop executor queued (one heavy agent at a time) | plan.md · D-1 · ledger UAC-27/UAC-26 · bot PR #7 |
| P2 | Directory + checkout hardening/hygiene pack                                       | ⬜ pending                          | ledger UAC-20/-14/-19/-21 + 16/22/23     |
| P3 | place_order policy (UAC-25)                                                       | ⬜ pending — mechanism decision first | ledger UAC-25                            |
| P4 | DS window (UAC-8 + the UAC-4 backport)                                            | ⬜ pending                          | ledger UAC-8/UAC-4                       |

## Next action

P1 mid-flight. Relay PR #7 is open and under deep review; when the review round settles,
route findings, then run the SHOP executor
(`step-p1-category-warn-prompt.md`) — one heavy agent at a time. Merge as a pair, prod
smoke, then the close-out promotes: the plan-gate falsification (U8's test already
reddens map-key renames — the prompt premise was stale; the real gap was the named
fixture), the executor's relay carry-forwards → bot ledger as BDEF-13 (the same
rejection class is FATAL on `delivery.mode`: `"NP_BRANCH"` → 400 → order lost), BDEF-14
(no telemetry when the relay absorbs a shop bug — both lenses want a 3-line handler
warn), BDEF-15 (hygiene: `generatedField` relies on ICU output being clean, no branded
currency type, three-decimal currencies like BHD render mispriced). Full detail is
durable in PR #7's body; the bot tree is NOT to be touched while its review round is
open.

## Open decisions awaiting ratification

(none — D-1 ratified)

## Live carry-forwards

None local yet. The worked set lives in the CANONICAL ledger
`../production-polish/deferred.md` (inherited UAC table; window assignments stamped in
its Status column) — closures are recorded THERE. This initiative's own `deferred.md`
holds only debts born inside polish-tail steps.

## Gotchas a resuming session must know

- **Prod takes real orders**; Vercel auto-deploys `master`; zero-env invariant; the
  fail-open checkout is sacred — no step may leave it unable to submit.
- **Paired-step discipline**: the v2 envelope and the channel vocabulary move in both
  repos in one step, merged as a pair (U6/U8 precedent). The relay PR rides THIS
  initiative's step — do not reopen bot-polish (COMPLETE; its planner-ops tail
  BDEF-8/10/11 is unrelated).
- **The relay's decoder must NOT gain a closed channel enum** (B3-Q1, requirements §5):
  unknown values render verbatim by design (`CONTACT_CHANNEL_TEXTS.get(value) ?? value`);
  the pin is test-level on both sides.
- Executors never edit `initiatives/` or `CLAUDE.md`, and never stage them into PRs.
