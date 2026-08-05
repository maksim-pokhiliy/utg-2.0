# ua-checkout — deferred

Carry-forwards: findings/obligations not yet scheduled, with disposition + status.
**Promote here at every gate** — a WARNING that lives only in scratch is not durable and
gets lost.

**Status:** `OPEN` (live) · `SCHEDULED` (assigned to a step) · `CLOSED` (done — kept for
the trail) · `DROPPED` (decided not to).

The DEF-3x/4x ids below are **inherited** from the production-polish ledger
(`../production-polish/deferred.md` stays their canonical home — close them there too
when they close here).

| ID     | One-liner                                                               | Disposition                                                                                                                                      | Status    |
| ------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| DEF-36 | e2e limiter-bucket isolation (rate-limit state bleeds between specs)    | fold into the e2e work of U4/U5                                                                                                                  | SCHEDULED |
| DEF-37 | relay-forwarding e2e (proxy route forwarding never exercised e2e)       | fold into U6 (contract flip proves forwarding)                                                                                                   | SCHEDULED |
| DEF-39 | cart decoder field validation + honest typing                           | fold into U5 (checkout rework touches the same decoder)                                                                                          | SCHEDULED |
| DEF-41 | DS Skeleton hidden-state coupling                                       | fold into U3 (the DS window)                                                                                                                     | SCHEDULED |
| UAC-1  | NP business-cabinet API key: obtain from the operator, set in Vercel    | external dependency; needed live by U7 (fallback covers until then)                                                                              | OPEN      |
| UAC-2  | NP response fields re-verified against the official portal              | U1 verified via two SDK mirrors (requirements §4); the U4 executor re-checks on the Cloudflare-gated portal                                      | OPEN      |
| UAC-3  | uk name placeholders in the ratified prototype dict are still John/Wick | U5 dictionaries use real UA examples per requirements §6 (e.g. Марія / Шевченко); no design impact                                               | SCHEDULED |
| UAC-4  | The Claude Design kit (`62bf007e`) lags the repo DS                     | after U3 merges: audit the full kit↔repo-DS delta (the U3 four + any 4d-era additions never backported) and backport in one `/design-sync` pass | OPEN      |

## Detail on the live ones

- **UAC-4** — user-directed 2026-08-05 («пишем в debt»). The kit project is the
  visual origin/donor; the repo DS is the implementation canon; design prototypes
  hand-roll what the kit lacks (by design — same mechanism as the 4d-era
  ProductCard), so the kit accumulates lag. The backport keeps future design
  sessions composing real components instead of re-inlining them. Scope: Combobox,
  ChoiceChips, CartLine amendment, Skeleton settled state, plus whatever the delta
  audit finds from the 4d era.

- **UAC-1** — the live-autocomplete acceptance criterion needs a real
  `NOVA_POSHTA_API_KEY` in Vercel env before the U7 prod gate. Everything up to U7
  ships and verifies without it (fail-open fallback is a first-class mode, D-1.4). If
  the key slips, U7's live-autocomplete check moves to a follow-up verification — the
  initiative does not block on it.

## Closed history

(none yet)
