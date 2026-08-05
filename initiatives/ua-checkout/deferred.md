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
| DEF-41 | DS Skeleton hidden-state coupling                                       | fold into U3 (the DS window)                                                                                                                     | CLOSED    |
| UAC-1  | NP business-cabinet API key: obtain from the operator, set in Vercel    | external dependency; needed live by U7 (fallback covers until then)                                                                              | OPEN      |
| UAC-2  | NP response fields re-verified against the official portal              | U4 re-check DONE via five substitute sources incl. captured API fixtures (the portal 403s, legacy devcenter dead) → three §4 corrections under D-8; residual live-key proof (string `Page`/`Limit`, a real multi-page Kyiv merge) moves to the U7 gate | SCHEDULED |
| UAC-3  | uk name placeholders in the ratified prototype dict are still John/Wick | U5 dictionaries use real UA examples per requirements §6 (e.g. Марія / Шевченко); no design impact                                               | SCHEDULED |
| UAC-4  | The Claude Design kit (`62bf007e`) lags the repo DS                     | after U3 merges: audit the full kit↔repo-DS delta (the U3 four + any 4d-era additions never backported) and backport in one `/design-sync` pass | OPEN      |
| UAC-5  | Combobox panel has no row budget (~23ms/hover at 1000 rows, measured)   | D-7: the proxy filters from its own cache and caps the response (~30 warehouse / ~10 settlement rows) — lands in U4                             | SCHEDULED |
| UAC-6  | `CartDrawer` `sizes="64px"` under-hints the stretched ~72–92px frame    | one-token consumer-side fix (`sizes="96px"` per the deep review's DPR math), rides U5                                                       | SCHEDULED |
| UAC-7  | Combobox adoption watch-list for U5's browser gate: panel `z-30` sits under the sticky header `z-40` when the anchor input scrolls beneath it (ruled not-a-defect, D-6.3); pointer can steal the active row from keyboard scroll (bounded to one steal) | watch at the U5 browser gate; promote to fixes only if they bite there (the Enter-during-debounce item was FIXED in the U3 review round — D-6.1 superseded prototype parity). PLUS the U5 integration contract from D-6.2: the combobox acknowledges a search via `loading` flip OR `options` identity change OR emptied query — a consumer that answers async, never raises `loading`, and returns a referentially identical array shows loading bars forever; and inline-built `options` arrays reset the active row on every parent re-render | SCHEDULED |
| UAC-8  | DS hygiene pair deferred from the U3 deep review: chip cva is forked from `SizeSelector` instead of promoted (RF-15); the 300ms settle fade is duplicated between `Skeleton` and `ReportsScreen` (RF-19) | one DS-hygiene window together with the UAC-4 kit backport: unify the chip base (SizeSelector composes it, gains its first tests), single fade-duration source (theme was frozen in U3)                | OPEN      |
| UAC-9  | U4→U5 integration handoff pack (D-8 consequences for the checkout rework) | U5 must: rejoin `delivery.city` as `label + ", " + region` (never `label` alone); treat only non-OK responses as capability-down (a blank `q` legitimately answers 200-empty — not a fallback trigger); browser-gate watch: «м.»/«с.» prefixes now sit inside `label` and village regions are two-part («…р-н, …обл.») in the right-aligned mono-caps meta slot — overflow risk | SCHEDULED |

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

- **DEF-41** (2026-08-05, U3 / PR #18) — `Skeleton` owns its settled state
  (`settled` prop: fade + pulse-stop internal); `ReportsScreen` dropped the
  `animate-none` knowledge of DS internals; `grep animate-none src/components/`
  is empty and unit+e2e guarded. Closed in the production-polish canonical
  ledger the same day.
