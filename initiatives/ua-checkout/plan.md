# ua-checkout — plan

Phased. Each step ships via its mechanism — planner doc session, design pass, or a
`/step` pipeline run (planner/executor split per the Project addenda). Expect multiple
sessions.

| #   | Step                                                                                                                            | Mechanism                                    | Gate (how it's accepted)                                                                       | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| U0  | PREREQ (bot-polish B2 + B3): `x-relay-secret` sender here; relay dual-accepts v1+v2 there                                       | `/feature small` here + a bot-repo step      | header sent when env present; relay 401s header-less callers; relay renders a v2 order          | ✅ done (2026-08-06, PR #20 + bot PR #2, both prod-smoked) |
| U1  | Requirements spec + contract draft: order-information model, NP API methods verified against official docs, env key names, D-3 | planner doc session                          | `requirements.md` ratified; D-3 (payload shape) RATIFIED                                        | ✅ done (2026-08-05) |
| U2  | Design pass: `design-brief.md` → Claude Design (user drives) → ratify → DesignSync export                                       | design pass                                  | exported screens (uk-live, uk-fallback, en-check) + new-DS-component specs ratified             | ✅ done (2026-08-05, D-4) |
| U3  | DS window: new form primitives per ratified design + DEF-41 fold-in                                                             | `/step`                                      | primitives inside the sealed DS with units; seal lint green                                     | ✅ done (2026-08-05, PR #18) |
| U4  | NP directory proxy route(s) + caching + env plumbing (`.env.example`, e2e blanking)                                             | `/step`                                      | route units incl. fail-open paths; blank-env build + e2e green                                  | ✅ done (2026-08-06, PR #19) |
| U5a | Contacts + copy + editable summary; payload flips to the v2 envelope (`delivery.mode: "generic"`, both locales) + mints `idempotency_key` (D-11) | `/step`                                      | +380 normalization units; v2 contract test; summary-editing e2e; the key survives a retry and resets on success; a real order renders in the bot | ✅ done (2026-08-08, PR #21, prod-smoked end to end) |
| U5b | Delivery: method chips, both NP comboboxes on the U4 proxy, runtime fallback, courier fields, the `np_*` delivery variants      | `/step`                                      | units + e2e for both uk modes; en generic regression green                                      | ✅ done (2026-08-11, PR #22 + PR #23, two reviews, 25 mutation proofs, prod-smoked) |
| U6  | Contract close-out: bot drops v1; contract tests pin v2 on both sides                                                           | bot-repo step + a shop contract test         | both contract tests pin the same shape; no v1 path left                                         | ✅ done (2026-08-20, PR #24 + relay PR #5, merged as a pair, smoked locally before and in prod after) |
| U7  | Prod verify + close-out                                                                                                         | user browser gate + `/initiative-close`      | charter acceptance criteria checked off; boards/ledgers updated incl. production-polish closures | ✅ done (2026-08-21, owner browser gate run end to end — one finding, which became U8) |
| U8  | Pickup-point categories (the U7 gate's finding) + the operator message speaks Ukrainian                | `/step`, paired shop+relay                    | villages with only a pickup point list it instead of a false outage; the message is Ukrainian | ✅ done (2026-08-21, PR #25 + relay PR #6, merged as a pair, prod-verified) |

Open design details deferred to their step (not silently decided early):

- ~~exact NP endpoints/methods~~ — verified in U1 via two SDK mirrors
  (requirements §4); U4 executor re-checks response fields against the official
  portal (UAC-2);
- ~~payload shape~~ — D-3 RATIFIED: v2 discriminated envelope (requirements §5);
  the flip lands in U5a, gated on the bot dual-accepting first (D-9);
- combobox interaction pattern (async search, loading/empty/error, keyboard nav) — U2/U3;
- ~~patronymic/courier field visibility~~ — fixed in requirements §2 (per-method
  conditionals; patronymic uk-only), U2 designs the states;
- NP proxy cache strategy + TTLs (route revalidate vs in-memory) and its rate-limit
  posture — U4 (requirements §4 sets the budgets: ~24h warehouses, minutes for
  settlement search, 2–3s timeout, fail-open);
- consent-line wording uk/en — drafted in requirements §6, U2 ratifies placement;
- e2e strategy for the mocked-live NP mode — requirements §7 mandates Playwright
  interception of OUR proxy (never live NP); exact fixtures — U5.
