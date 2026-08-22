# polish-tail — state (the board)

**Updated:** 2026-08-22 — initiative opened; P1 is next.

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #  | Step                                                                              | Status                              | Pointer                                  |
| -- | --------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| P1 | Contract pair: channel-vocabulary value pin + relay currency-case + category warn | ⬜ pending — next                   | plan.md · D-1 · ledger UAC-27/UAC-26     |
| P2 | Directory + checkout hardening/hygiene pack                                       | ⬜ pending                          | ledger UAC-20/-14/-19/-21 + 16/22/23     |
| P3 | place_order policy (UAC-25)                                                       | ⬜ pending — mechanism decision first | ledger UAC-25                            |
| P4 | DS window (UAC-8 + the UAC-4 backport)                                            | ⬜ pending                          | ledger UAC-8/UAC-4                       |

## Next action

Run /step P1 — the contract pair. Both halves move in ONE paired step and merge
together: relay side (`../utg-tg-order-bot`) extends `tests/support/contract.ts` to pin
the channel VALUES + pins the currency-case read; shop side pins its emitted values in
its own contract test + adds the unrecognised-category warn (home: the currently-dead
`KNOWN_CATEGORIES`).

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
