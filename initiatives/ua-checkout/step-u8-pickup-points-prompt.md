# Step U8 (shop half) — the villages get their pickup points back (executor prompt)

---

/feature The U7 browser gate found a live defect and the owner ruled the fix: **settlements
whose only Нова Пошта presence is a pickup point are told the directory is unavailable, and the
points they do have are never offered.** This store takes REAL volunteer orders and auto-deploys
`master`.

## Measured on the live carrier by the planner — take as given, do not re-probe (D-12)

`KNOWN_CATEGORIES` in `src/app/api/np/warehouses/directory.ts` is `["Branch", "Postomat",
"Cargo"]`. The real vocabulary is **six values**, sampled from a 500-row Kyiv page plus ten
village settlements:

| category | Kyiv (500 rows) | villages | what it is |
| --- | --- | --- | --- |
| `Branch` | 419 | common | відділення |
| `Postomat` | 63 | common | поштомат |
| `DropOff` | 16 | common | «Пункт №51878 (до 30 кг)» — a real customer pickup point |
| `Store` | — | common | «Пункт приймання-видачі (до 30 кг)» — a shop-hosted pickup point |
| `Fulfillment` | 2 | — | NP's merchant fulfilment warehouse, NOT a customer pickup point |
| `Cargo` | — | — | вантажне відділення (freight) |

**Both `DropOff` and `Store` arrive with `DenyToSelect: "0"` and `TotalMaxWeightAllowed: "30"`** —
the carrier marks them selectable, and 30 kg is far above any merch order.

**Reproduced against production:** `с. Романівка, Бердичівський р-н` reports
`warehouseCount: 3` from our own settlements route, and our warehouse route answers **503** for
both chips, because its page is `{DropOff: 1, Store: 1}` and D-15's "a page where NO category is
recognised ⇒ 503" arm fires. **2 of 10 sampled villages** that genuinely have points get this,
and in 5 more the `Store`/`DropOff` rows are silently dropped from lists that do work.

## Owner ruling

> «предлагаем конечно, мы делаем честный и чистый сервис»

Offer them. Showing «нічого не знайдено» where a pickup point exists is a lie to the buyer.

## Scope

**1. Widen what is RECOGNISED to all six.** `Fulfillment` and `Cargo` join the recognised set so
their pages stop looking like format drift — recognised is not the same as offered.

**2. Widen what is OFFERED.** The `Відділення` chip serves `Branch` + `DropOff` + `Store`; the
`Поштомат` chip serves `Postomat`. `Cargo` and `Fulfillment` stay recognised-and-never-offered —
a freight terminal and a merchant warehouse are not where a buyer collects a t-shirt.

**3. Retire D-15's "nothing recognised ⇒ 503" arm** — and this is the part that matters beyond
today's six values. That rule was meant to detect the carrier changing its format, but what it
actually detects is *a settlement using a category we had not enumerated*, which is a normal fact
about villages rather than an outage. **A page that yields rows is a successful page**; if none of
its rows are offerable, the honest answer is 200-empty, not "the directory is unavailable". Drift
detection stays with the arm that genuinely means it: a container that decodes to zero rows.
Every other failure mode in D-15 is unchanged and still collapses to one 503.

**4. The buyer must see what they are choosing.** The carrier's own `Description` already says
«Пункт приймання-видачі (до 30 кг)» / «Пункт №51878 (до 30 кг)», so the existing label pipeline
carries the truth. Do not invent a prettier label; do not strip the weight note.

**Bring to the plan gate, do not decide alone:** whether the `Відділення` chip's own copy should
change now that it serves pickup points too. My position is that it should NOT — the row
descriptions are explicit and the chip is a coarse category — but it is user-facing copy in the
owner's domain, so propose your answer and list any new string for veto in the PR body.

## Out of scope (hard fence)

The relay repo (`../utg-tg-order-bot`) — a paired PR there handles the Ukrainian message labels;
do not open, edit or stage anything in it. Also out: the rate limiter, the order-forward route,
the checkout UI beyond whatever the offered-set change genuinely requires, `ICartItem`, catalog
data, new dependencies, and the `place_order` envelope.

## Acceptance gates

- Full battery green: `yarn lint`, `yarn format`, `yarn typecheck` (BOTH programs), `yarn test`,
  zero-env `yarn build`, `yarn e2e`.
- **Fixtures must contain the categories that caused this.** The reason no test caught it is that
  every warehouse fixture held only `Branch`/`Postomat`. Add `DropOff`, `Store`, `Fulfillment` and
  a page made only of them.
- Unit coverage for: a `Store`-only page serving rows under the `Відділення` chip; a
  `Fulfillment`-only page answering an honest 200-empty rather than 503; the row cap applied per
  chip after the split; `DenyToSelect` still refused for every category.
- **Every change mutation-proven** on a COMMITTED tree: one surgical, typecheck-valid mutation per
  claim, each reported with the single named test it reddens, each reverted. If a mutation
  survives, ask whether the environment can produce the separating input before blaming the tests.
- The PR body carries the owner's verification checklist as `- [ ]` checkboxes, and names
  `с. Романівка, Бердичівський р-н` as the settlement to check by hand.

## Resource budget (WSL — mandatory)

Every heavy command inside `systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=1G --`,
`NODE_OPTIONS=--max-old-space-size=3072` on builds, strictly one at a time.

## Constraints

No comments in code; no skip flags; match the design-system seal; branch from `master`, PR against
`master`; English, first person, lowercase subject, no assistant signatures; never stage
`CLAUDE.md` or anything under `initiatives/`; **never call the live Нова Пошта API** — every
carrier fact you need is measured above.
