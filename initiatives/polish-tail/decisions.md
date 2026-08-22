# polish-tail — decisions

D-numbered ratified decisions. Step-level calls that don't merit a full ADR live here;
cross-initiative architecture calls go to the project's ADR home if one exists.
**Promote here at every gate** — a decision that lives only in scratch or an external
chat is not durable. This file is the SSOT for "why."

**Status legend:** `RATIFIED` (decided + acted) · `OPEN` (awaiting ratification — do not
execute past it) · `SUPERSEDED` (replaced — kept for the trail).

## Index

| ID  | Topic                                                                | Status   |
| --- | -------------------------------------------------------------------- | -------- |
| D-1 | Home + packaging: new initiative, four windows, contract pair first | RATIFIED |
| D-2 | The carrier vocabulary is DERIVED from routing; the known set pinned both ways | RATIFIED |

---

### D-1 — the ledger tail gets its own initiative, drained in four windows, contract pair first and atomic

- **Status:** RATIFIED (owner, 2026-08-22).
- **Decision.** (a) The tail runs as a NEW initiative rather than as new rows on the
  production-polish board: that initiative is COMPLETE and its retro CLOSED (three
  rounds, journal 2026-08-02) — post-retro steps would undermine the closure. The
  canonical ledger REMAINS `../production-polish/deferred.md`; polish-tail only drives
  closures into it (the same pointer pattern ua-checkout used). (b) The tail is four
  windows — P1 contract pair, P2 hardening `/feature`, P3 policy decision + small
  change, P4 DS window — not one mega-step: two repos and three PRs in a single step
  degrade review quality and cost the contract pair its atomic merge. (c) P1 goes
  first: the ledger itself names UAC-27's vocabulary item "the one item here worth
  scheduling rather than filing", and it is the exact failure class U6/U8 spent
  themselves hunting.
- **Rationale.** Retro integrity; per-PR review quality; the paired-merge discipline;
  ledger-canon continuity.
- **Links.** journal 2026-08-22; `../production-polish/deferred.md` (inherited table);
  `../ua-checkout/state.md` (close-out).

### D-2 — the carrier vocabulary is DERIVED from routing, and the known set is pinned in both directions

- **Status:** RATIFIED (2026-08-22, P1 — reshaped twice by measurement).
- **Decision.** `KNOWN_CATEGORIES` is a derived expression over the two routing sources
  (`ROUTED_CATEGORIES`, `NEVER_OFFERED_CATEGORIES`) — no third hand-written list
  exists. The tripwire (`tripwire.ts`) takes the known set as an argument and holds no
  policy (D-7 intact). The derived set is exported for exactly one consumer — the pin
  test `recognises exactly the six categories the carrier vocabulary holds` — so
  growing EITHER source list without consciously moving that test is a red suite.
- **Rationale — measured, not aesthetic.** (a) The review's refuter ran the A/B on the
  U8 incident shape (a Branch+DropOff+Store page against a narrowed chip): the derived
  form warns twice, while the step-prompt's hand-written six-value list stays
  COMPLETELY SILENT — a literal-list tripwire would have been blind to the incident
  that motivated it. (b) The first shipped guard was one-sided: `"Locker"` into
  `NEVER_OFFERED_CATEGORIES` compiled and passed the whole route suite with the alarm
  off (review RF-2) — the pin closes that second door. (c) The compile-time typo
  diagnostics the old `satisfies` gave (TS2820 with a hint) are the accepted price;
  the same typo now reds 9 route tests instead of one compiler line.
- **Links.** PR #26 (`e48442a`); journal 2026-08-22; canonical ledger UAC-27/UAC-28.
