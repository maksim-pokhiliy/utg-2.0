# polish-tail — plan

Phased. Each code window ships through the /step planner-executor pipeline. Expect
multiple sessions.

| #   | Step                                                                                                                                                                     | Mechanism                                                                              | Gate (how it's accepted)                                                                                                                                                                             | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| P1  | Contract pair: pin the channel vocabulary at value level (shop emit + relay display map, per-repo fixtures), pin the relay's currency case, add the shop's category warn | /step → paired `/feature small` ×2 (shop + `../utg-tg-order-bot`), atomic merge (U6/U8 discipline) | Mutation proof both ways: rename `call` in either repo → that repo's suite reddens; a currency case flip is caught by a relay test; the unrecognised-category warn is unit-pinned; the pair merges together; prod smoke | pending |
| P2  | Directory + checkout hardening/hygiene: UAC-20, UAC-14, UAC-19(2)(3) with (1)(5) triage, UAC-21, triage of UAC-16/22/23                                                  | /step → `/feature` (shop)                                                               | Each row CLOSED/DROPPED in the canonical ledger with its reason; UAC-20's abort chaining proven not to poison the cache or single-flight joiners; the fail-open fallback e2e stays green               | pending |
| P3  | place_order policy: UAC-25 (origin check + a rate limit that is not a per-lambda `Map`)                                                                                  | contour decision (mechanism) + `/feature small` or ops                                  | The mechanism ratified as a D-row with its probe; the origin check live-verified; the limiter half landed or DROPPED with rationale                                                                    | pending |
| P4  | DS window: UAC-8 + the UAC-4 kit backport                                                                                                                                | /step → `/feature small`, then /design-sync                                             | One chip base (`SizeSelector` composes it, gains its first tests); one fade-duration source; the kit delta audited and backported                                                                      | pending |

Open design details deferred to their step (not to be silently decided early):

- **P1:** the exact fixture shape of the value pin in each repo (executor plan gates).
  FENCED: the relay's verbatim fallback for unknown values stays — B3-Q1; no decoder
  enum on either side.
- **P2:** UAC-20 abort semantics (joiner refcount vs waiter-detach — the D-20 read/write
  asymmetry must survive; whoever wires it must not "unify" the two directions);
  UAC-19(3) re-pricing (per-row drop vs threshold vs re-ratified status quo).
- **P3:** the limiter mechanism (Vercel WAF vs external state vs accepted per-instance,
  each probed before ratifying).
