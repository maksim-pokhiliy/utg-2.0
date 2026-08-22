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
