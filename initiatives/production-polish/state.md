# production-polish — state (the board)

**Updated:** 2026-07-23 (D3.3 product ratified + exported; step-4e prompt issued)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here.**

## Board

| #     | Step                                                                             | Status                                                                                                                        | Pointer                              |
| ----- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 0     | Quick wins                                                                       | ✅ done — PR #2 squash-merged (`04fbbf9`)                                                                                     | PR #2                                |
| 1     | Rescue / de-Firebase + RSC                                                       | ✅ done — PR #3 squash-merged (`49acce7`); **prod verified alive** (images 200, SSG titles, en $-prices via Vercel-env rates) | PR #3                                |
| 2     | Recoil → Zustand + cart fixes                                                    | ✅ done — PR #4 squash-merged (`e066ccc`)                                                                                     | PR #4                                |
| 3     | Next 16 + React 19                                                               | ✅ done — R1 browser gate passed by user, PR #5 squash-merged (`f3f79bf`)                                                     | PR #5                                |
| 4a    | Port design system (sealed, D-10)                                                | ✅ done — PR #6 + fix round squash-merged (`2e83503`); 6 seal layers proven                                                   | PR #6                                |
| D1    | Design system (Claude Design)                                                    | ✅ done — user approved; D-4 fully ratified                                                                                   | project `62bf007e-…` = visual SSOT   |
| D2    | Screen prototypes (Claude Design)                                                | SUPERSEDED by D-11 — kit screens are DS demos; real pages designed per-page in D3                                             | `kit-screens-reference.md`           |
| 4b    | DS alignment (NavOverlay + DEF-20)                                               | ✅ done — PR #7 squash-merged (`8d9a4ba`) incl. overflow fix round; DEF-20 CLOSED                                             | PR #7                                |
| D3    | Per-page screen designs (Claude Design)                                          | 🔵 active — Home/catalog/category SHIPPED; **product (D3.3) RATIFIED & exported**                                             | `design-export/screens/`             |
| 4c    | Implement Home per D3.1                                                          | ✅ done — PR #8 squash-merged (`dec9a78`) incl. 3-item fix round; prod live-verified                                          | PR #8                                |
| 4d–4g | Remaining pages (catalog/category → product → cart/checkout → reports/about/404) | 4d ✅ done — PR #9 (`2d051b3`) incl. geometry fix round, prod live-verified; 4e next                                          | `step-4d-catalog-category-prompt.md` |
| 5     | SEO pack                                                                         | ⬜ pending                                                                                                                    | plan.md                              |
| 6     | Tests + CI                                                                       | ⬜ pending                                                                                                                    | plan.md                              |
| 7     | README + presentation                                                            | ⬜ pending                                                                                                                    | plan.md                              |

## Next action

1. User carries `step-4e-product-prompt.md` to a fresh executor tab. Planner reviews
   its plan gate (expected items: `SizeSelector` API, the cart-line/identity shape,
   and user approval of the required-size hint strings), then the PR, per the loop.
   DEF-3 rides this step; the payload contract stays byte-compatible.
2. After 4e merges: refresh the Desktop snapshot, write the D3.4 cart/checkout brief
   into the same cumulative dialog (the DEF-13 payload+bot `currency` decision lives
   in that window).

## Open decisions awaiting ratification

(none — D-1…D-11 all ratified)

## Live carry-forwards

DEF-4 (order endpoint abuse protection — decide later), DEF-9 (hero photo sealed in
Firebase; support ticket pending; non-blocking — the shipped Home carries a photo
slot), DEF-13 (rates-down `en` checkout renders `$` on UAH total in the operator's
Telegram message — scheduled to the 4f cart/checkout window), DEF-18 (react-hooks v6
rules off — revisit with any React Compiler decision).

## Gotchas a resuming session must know

- **Prod is alive and takes real orders** (rescued by step 1) — every merged PR must leave it fully functional; Vercel auto-deploys `master`.
- The order-bot contract is fully known (`extracted/bot-contract-index.js`, bot repo is user's own `utg-tg-order-bot`); payload field shape is sacred.
- Catalog business data in `src/data/` is sacred (verbatim from `extracted/` sources) — never invent or "improve" it.
- The Claude Design project `62bf007e-1ea9-45bc-a40a-f64544314e8c` is the visual SSOT for 4a–4c (readable via DesignSync); implementation matches it, deviations need a new decision.
- `CLAUDE.md` and `initiatives/` are **tracked** (D-3) but planner-managed — executors never stage changes to them in feature PRs.
- Sequence is fixed: step 3 (Next 16 + React 19) lands BEFORE 4a so the component library is built once, on the final platform; Tailwind 3→4 happens inside 4a's shadcn init.
