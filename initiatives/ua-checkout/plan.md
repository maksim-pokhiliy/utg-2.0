# ua-checkout — plan

Phased. Each step ships via its mechanism — planner doc session, design pass, or a
`/step` pipeline run (planner/executor split per the Project addenda). Expect multiple
sessions.

| #   | Step                                                                                                                            | Mechanism                                    | Gate (how it's accepted)                                                                       | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------- |
| U0  | PREREQ (external, bot-polish B2): `x-relay-secret` sender ships in this repo                                                    | `/feature small` per the bot-polish plan     | DEF-13 closed; relay authenticated                                                              | pending |
| U1  | Requirements spec + contract draft: order-information model, NP API methods verified against official docs, env key names, D-3 | planner doc session                          | `requirements.md` ratified; D-3 (payload shape) RATIFIED                                        | pending |
| U2  | Design pass: `design-brief.md` → Claude Design (user drives) → ratify → DesignSync export                                       | design pass                                  | exported screens (uk-live, uk-fallback, en-check) + new-DS-component specs ratified             | pending |
| U3  | DS window: new form primitives per ratified design + DEF-41 fold-in                                                             | `/step`                                      | primitives inside the sealed DS with units; seal lint green                                     | pending |
| U4  | NP directory proxy route(s) + caching + env plumbing (`.env.example`, e2e blanking)                                             | `/step`                                      | route units incl. fail-open paths; blank-env build + e2e green                                  | pending |
| U5  | Checkout rework: uk flow both modes, contact block, pre-submit copy, dictionaries                                               | `/step`                                      | units + e2e for both uk modes; en generic form regression green                                 | pending |
| U6  | Contract flip: paired shop+bot PRs, contract tests on both sides                                                                | `/step` here + paired bot-repo step          | structured order smoked in operator TG; both contract tests pin the same shape                  | pending |
| U7  | Prod verify + close-out                                                                                                         | user browser gate + `/initiative-close`      | charter acceptance criteria checked off; boards/ledgers updated incl. production-polish closures | pending |

Open design details deferred to their step (not silently decided early):

- exact NP endpoints/methods + response fields — verified against official docs in U1;
- payload shape: clean v2 vs additive extension of the current field set — D-3, U1;
- combobox interaction pattern (async search, loading/empty/error, keyboard nav) — U2/U3;
- whether patronymic and courier-address fields show per delivery method or always — U2;
- NP proxy cache strategy + TTLs (route revalidate vs in-memory) and its rate-limit
  posture — U4;
- consent-line wording uk/en — U1 draft, U2 placement;
- e2e strategy for the mocked-live NP mode (route mock vs fixture server) — U5.
