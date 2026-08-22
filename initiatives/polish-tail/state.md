# polish-tail — state (the board)

**Updated:** 2026-08-22 — P1 COMPLETE: the pair merged (relay `aa10f56` + shop `e48442a`) and prod-smoked. Next: P2.

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #  | Step                                                                              | Status                              | Pointer                                  |
| -- | --------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| P1 | Contract pair: channel-vocabulary value pin + relay currency-case + category warn | ✅ done — pair merged 2026-08-22: relay PR #7 `aa10f56` + shop PR #26 `e48442a`; 2 independent reviews, 3 fix rounds + 1 micro-round, prod-smoked | PR #7 · PR #26 · D-2 · bot BD-12 · journal 2026-08-22 |
| P2 | Directory + checkout hardening/hygiene pack                                       | ⬜ pending                          | ledger UAC-20/-14/-19/-21 + 16/22/23     |
| P3 | place_order policy (UAC-25)                                                       | ⬜ pending — mechanism decision first | ledger UAC-25                            |
| P4 | DS window (UAC-8 + the UAC-4 backport)                                            | ⬜ pending                          | ledger UAC-8/UAC-4                       |

## Next action

**P2 — the hardening window.** Contour first, then a full `/feature` executor (shop):
UAC-20 (abort chaining — the joiner/cache semantics are the plan-gate decision; D-20's
read/write asymmetry must survive), UAC-14 (the cart-drawer second door), UAC-19(2)(3)
closed or re-ratified with (1)(5) triaged, UAC-21 paid, triage of UAC-16/22/23, plus
UAC-28's RF-3 (widening the shared `invisibles.ts` class — adjacent to 19(3), same
files). P1's promotions are all landed: BDEF-13/14/15 + BD-12 in the bot repo, UAC-27
coupling + UAC-26 currency item closed in the canonical ledger, D-2 here.

## Open decisions awaiting ratification

(none — D-1, D-2 ratified)

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
