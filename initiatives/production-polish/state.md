# production-polish — state (the board)

**Updated:** 2026-07-21 (Home design ratified + exported; 4c prompt ready behind 4b)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here.**

## Board

| #     | Step                                                                             | Status                                                                                                                        | Pointer                            |
| ----- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 0     | Quick wins                                                                       | ✅ done — PR #2 squash-merged (`04fbbf9`)                                                                                     | PR #2                              |
| 1     | Rescue / de-Firebase + RSC                                                       | ✅ done — PR #3 squash-merged (`49acce7`); **prod verified alive** (images 200, SSG titles, en $-prices via Vercel-env rates) | PR #3                              |
| 2     | Recoil → Zustand + cart fixes                                                    | ✅ done — PR #4 squash-merged (`e066ccc`)                                                                                     | PR #4                              |
| 3     | Next 16 + React 19                                                               | ✅ done — R1 browser gate passed by user, PR #5 squash-merged (`f3f79bf`)                                                     | PR #5                              |
| 4a    | Port design system (sealed, D-10)                                                | ✅ done — PR #6 + fix round squash-merged (`2e83503`); 6 seal layers proven                                                   | PR #6                              |
| D1    | Design system (Claude Design)                                                    | ✅ done — user approved; D-4 fully ratified                                                                                   | project `62bf007e-…` = visual SSOT |
| D2    | Screen prototypes (Claude Design)                                                | SUPERSEDED by D-11 — kit screens are DS demos; real pages designed per-page in D3                                             | `kit-screens-reference.md`         |
| 4b    | DS alignment (NavOverlay + DEF-20)      | 🔵 active — plan gate approved (caption numbers OK; title="UTG" instead of wordmark deferral), implementing                                                     | `step-4b-ds-alignment-prompt.md`   |
| D3    | Per-page screen designs (Claude Design)                                          | 🔵 active — **Home RATIFIED + exported**; next brief (catalog/category) after 4c lands                                        | `design-export/screens/home/`      |
| 4c    | Implement Home per D3.1                                                          | 🟡 prompt ready — carry ONLY after 4b merges (both touch the DS)                                                              | `step-4c-home-prompt.md`           |
| 4d–4g | Remaining pages (catalog/category → product → cart/checkout → reports/about/404) | ⬜ pending — each gated on its D3 ratification                                                                                | plan.md                            |
| 5     | SEO pack                                                                         | ⬜ pending                                                                                                                    | plan.md                            |
| 6     | Tests + CI                                                                       | ⬜ pending                                                                                                                    | plan.md                            |
| 7     | README + presentation                                                            | ⬜ pending                                                                                                                    | plan.md                            |

## Next action

Current waits and order:

- **4b (DS alignment)** executor is running — plan gate → planner review → PR → merge.
- **4c (Home)** prompt is ready (`step-4c-home-prompt.md`) but carries ONLY after the
  4b merge — both steps touch `src/design-system/`; serial avoids DS conflicts.
- **Handoff** after the 4b merge per the standing plan: fresh planner session starts
  from the start prompt the planner will re-issue at that moment (the chat snapshot
  from before D-11 is stale — do not reuse it); it then reviews 4c's plan gate and
  drives the per-page loop (next design brief: catalog/category pages).

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
