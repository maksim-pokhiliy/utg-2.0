# production-polish — state (the board)

**Updated:** 2026-07-21 (4b prompt amended with NavOverlay fidelity; D2 pending user screen pass)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here.**

## Board

| #   | Step                                  | Status                                                                                                                                                             | Pointer                            |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| 0   | Quick wins                            | ✅ done — PR #2 squash-merged (`04fbbf9`)                                                                                                                          | PR #2                              |
| 1   | Rescue / de-Firebase + RSC            | ✅ done — PR #3 squash-merged (`49acce7`); **prod verified alive** (images 200, SSG titles, en $-prices via Vercel-env rates)                                      | PR #3                              |
| 2   | Recoil → Zustand + cart fixes         | ✅ done — PR #4 squash-merged (`e066ccc`)                                                                                                                          | PR #4                              |
| 3   | Next 16 + React 19                    | ✅ done — R1 browser gate passed by user, PR #5 squash-merged (`f3f79bf`)                                                                                          | PR #5                              |
| 4a  | Port design system (sealed, D-10)     | ✅ done — PR #6 + fix round squash-merged (`2e83503`); 6 seal layers proven                                                                                        | PR #6                              |
| D1  | Design system (Claude Design)         | ✅ done — user approved; D-4 fully ratified                                                                                                                        | project `62bf007e-…` = visual SSOT |
| D2  | Screen prototypes (Claude Design)     | 🟡 exists + punch-list-fixed, but user's visual pass over the screens is UNCONFIRMED — user clicks through `ui_kits/storefront` in parallel with the 4b plan phase | `kit-screens-reference.md`         |
| 4b  | Implement screens (kit + DEF-3/14/20) | 🔵 active — prompt ready to carry, kit screens exported                                                                                                            | plan.md                            |
| 4c  | Implement cart/checkout               | ⬜ pending — gated on D2                                                                                                                                           | plan.md                            |
| 5   | SEO pack                              | ⬜ pending                                                                                                                                                         | plan.md                            |
| 6   | Tests + CI                            | ⬜ pending                                                                                                                                                         | plan.md                            |
| 7   | README + presentation                 | ⬜ pending                                                                                                                                                         | plan.md                            |

## Next action

Two parallel micro-lanes:

- **Code lane**: user carries the amended `step-4b-screens-prompt.md` to a fresh
  executor tab (one-liner: "Run initiatives/production-polish/step-4b-screens-prompt.md
  — read that file and execute it as your full prompt, verbatim."). Plan-gate review by
  planner as usual.
- **Design lane (10 min, parallel)**: user opens the Claude Design project and clicks
  through `ui_kits/storefront` (the clickable prototype) in both locales — this is the
  D2 visual pass that may never have happened. Changes, if any, fold in at the 4b plan
  gate; approval upgrades D2 back to done.

After the 4b PR merges: **planner handoff** — user starts a fresh planner session with
the start prompt delivered in chat (= `planner-handoff-prompt.md` + current-position
snapshot).

## Open decisions awaiting ratification

(none — D-1…D-10 all ratified)

## Live carry-forwards

DEF-4 (order endpoint abuse protection — decide later), DEF-9 (hero photo sealed in
Firebase; support ticket pending; non-blocking — typographic hero stopgap in step 1),
DEF-13 (rates-down `en` checkout renders `$` on UAH total in the operator's Telegram
message — coordinated payload+bot fix, after 4c).

## Gotchas a resuming session must know

- **Prod is alive and takes real orders** (rescued by step 1) — every merged PR must leave it fully functional; Vercel auto-deploys `master`.
- The order-bot contract is fully known (`extracted/bot-contract-index.js`, bot repo is user's own `utg-tg-order-bot`); payload field shape is sacred.
- Catalog business data in `src/data/` is sacred (verbatim from `extracted/` sources) — never invent or "improve" it.
- The Claude Design project `62bf007e-1ea9-45bc-a40a-f64544314e8c` is the visual SSOT for 4a–4c (readable via DesignSync); implementation matches it, deviations need a new decision.
- `CLAUDE.md` and `initiatives/` are **tracked** (D-3) but planner-managed — executors never stage changes to them in feature PRs.
- Sequence is fixed: step 3 (Next 16 + React 19) lands BEFORE 4a so the component library is built once, on the final platform; Tailwind 3→4 happens inside 4a's shadcn init.
