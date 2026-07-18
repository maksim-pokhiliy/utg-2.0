# production-polish — state (the board)

**Updated:** 2026-07-17 (night — step-0 PR approved, step-1 prompt issued)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here.**

## Board

| #   | Step                              | Status                                                                                                                        | Pointer                            |
| --- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 0   | Quick wins                        | ✅ done — PR #2 squash-merged (`04fbbf9`)                                                                                     | PR #2                              |
| 1   | Rescue / de-Firebase + RSC        | ✅ done — PR #3 squash-merged (`49acce7`); **prod verified alive** (images 200, SSG titles, en $-prices via Vercel-env rates) | PR #3                              |
| 2   | Recoil → Zustand + cart fixes     | ✅ done — PR #4 squash-merged (`e066ccc`)                                                                                     | PR #4                              |
| 3   | Next 16 + React 19                | ✅ done — R1 browser gate passed by user, PR #5 squash-merged (`f3f79bf`)                                                     | PR #5                              |
| 4a  | Port design system (shadcn, D-9)  | 🔵 next — planner exporting tokens/specs via DesignSync, prompt in progress                                                   | `design-export/`                   |
| D1  | Design system (Claude Design)     | ✅ done — user approved; D-4 fully ratified                                                                                   | project `62bf007e-…` = visual SSOT |
| D2  | Screen prototypes (Claude Design) | ✅ done — all surfaces incl. 404, verbatim strings fixed, user approved                                                       | `ui_kits/storefront/`              |
| 4b  | Implement screens                 | ⬜ pending — gated on 4a                                                                                                      | plan.md                            |
| 4c  | Implement cart/checkout           | ⬜ pending — gated on D2                                                                                                      | plan.md                            |
| 5   | SEO pack                          | ⬜ pending                                                                                                                    | plan.md                            |
| 6   | Tests + CI                        | ⬜ pending                                                                                                                    | plan.md                            |
| 7   | README + presentation             | ⬜ pending                                                                                                                    | plan.md                            |

## Next action

Single lane now — design lane is CLOSED (D-4 fully ratified; the Claude Design project
is the visual SSOT for 4a–4c; reopen only point-wise if 4b implementation finds gaps).

**Code lane**: planner writes the 4a prompt — pulls tokens + component specs from the
design project via DesignSync into `initiatives/production-polish/design-export/`
(committed), then issues `step-4a-design-system-prompt.md`. User re-checks checkout on
prod after the `f3f79bf` Vercel deploy when convenient.

Still owed by user: D-3 (commit planner artifacts?).

## Open decisions awaiting ratification

(none — D-1…D-9 all ratified)

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
