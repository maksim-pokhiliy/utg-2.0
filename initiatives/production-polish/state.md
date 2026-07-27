# production-polish — state (the board)

**Updated:** 2026-07-27 (step 5 MERGED — PR #14 `095caad`, Lighthouse SEO 100 user-verified; next: step-6 prompt)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here.**

## Board

| #     | Step                                                                             | Status                                                                                                                            | Pointer                              |
| ----- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 0     | Quick wins                                                                       | ✅ done — PR #2 squash-merged (`04fbbf9`)                                                                                         | PR #2                                |
| 1     | Rescue / de-Firebase + RSC                                                       | ✅ done — PR #3 squash-merged (`49acce7`); **prod verified alive** (images 200, SSG titles, en $-prices via Vercel-env rates)     | PR #3                                |
| 2     | Recoil → Zustand + cart fixes                                                    | ✅ done — PR #4 squash-merged (`e066ccc`)                                                                                         | PR #4                                |
| 3     | Next 16 + React 19                                                               | ✅ done — R1 browser gate passed by user, PR #5 squash-merged (`f3f79bf`)                                                         | PR #5                                |
| 4a    | Port design system (sealed, D-10)                                                | ✅ done — PR #6 + fix round squash-merged (`2e83503`); 6 seal layers proven                                                       | PR #6                                |
| D1    | Design system (Claude Design)                                                    | ✅ done — user approved; D-4 fully ratified                                                                                       | project `62bf007e-…` = visual SSOT   |
| D2    | Screen prototypes (Claude Design)                                                | SUPERSEDED by D-11 — kit screens are DS demos; real pages designed per-page in D3                                                 | `kit-screens-reference.md`           |
| 4b    | DS alignment (NavOverlay + DEF-20)                                               | ✅ done — PR #7 squash-merged (`8d9a4ba`) incl. overflow fix round; DEF-20 CLOSED                                                 | PR #7                                |
| D3    | Per-page screen designs (Claude Design)                                          | ✅ done — five page designs + the D3.6 lightbox addendum ratified & exported (MediaFigure/Lightbox DS additions sanctioned 07-27) | `design-export/screens/`             |
| 4c    | Implement Home per D3.1                                                          | ✅ done — PR #8 squash-merged (`dec9a78`) incl. 3-item fix round; prod live-verified                                              | PR #8                                |
| 4d–4g | Remaining pages (catalog/category → product → cart/checkout → reports/about/404) | 4d ✅ (PR #9) · 4e ✅ (PR #10) · 4f ✅ (PR #11) · 4g ✅ (PR #12) · 4h ✅ (PR #13, `71dbb63` — lightbox, aria-disabled ratified)   | `step-4d-catalog-category-prompt.md` |
| 5     | SEO pack                                                                         | ✅ done — PR #14 squash-merged (`095caad`) incl. review fix round; Lighthouse SEO 100 on every page (user devtools gate)          | plan.md                              |
| 6     | Tests + CI                                                                       | ⬜ pending                                                                                                                        | plan.md                              |
| 7     | README + presentation                                                            | ⬜ pending                                                                                                                        | plan.md                              |

## Next action

1. NEXT SESSION: planner writes the step-6 prompt (tests + CI: Vitest+RTL for
   the store/money/checkout logic, a Playwright happy path, GitHub Actions on
   every PR; riders scheduled to its window: DEF-33+DEF-34 as one drift-guard
   family — dimensions into the typed catalog schema + a header-check test,
   DEF-35 LOCALES export; decide there: the DS hygiene trio DEF-27/28/32 —
   ride step 6 or a dedicated window). Rich Results on the live product URL is
   a lingering optional user check (post-deploy, non-blocking).
2. PARKED by user sequencing (2026-07-27): the `utg-tg-order-bot` `currency`
   read (D-12/DEF-13) waits until the app work (steps 5-7) completes — a
   dedicated bot-polish phase follows the initiative.

## Open decisions awaiting ratification

(none — D-1…D-12 all ratified)

## Live carry-forwards

Closed in step 5 (PR #14): DEF-4, DEF-22, DEF-25, DEF-30, DEF-31. Still live:
DEF-9 (hero photo — Firebase ticket pending), DEF-13 (bot `currency` read —
PARKED to the post-app bot phase by user sequencing), DEF-18 (react-hooks v6 —
any React Compiler decision), DEF-27/DEF-28/DEF-32 (DS hygiene — one sanctioned
window, step 6 decides), DEF-33+DEF-34 (image-dimensions drift-guard family —
step 6), DEF-35 (LOCALES export — step 6).

## Gotchas a resuming session must know

- **Prod is alive and takes real orders** (rescued by step 1) — every merged PR must leave it fully functional; Vercel auto-deploys `master`.
- The order-bot contract is fully known (`extracted/bot-contract-index.js`, bot repo is user's own `utg-tg-order-bot`); payload field shape is sacred.
- Catalog business data in `src/data/` is sacred (verbatim from `extracted/` sources) — never invent or "improve" it.
- The Claude Design project `62bf007e-1ea9-45bc-a40a-f64544314e8c` is the visual SSOT for 4a–4c (readable via DesignSync); implementation matches it, deviations need a new decision.
- `CLAUDE.md` and `initiatives/` are **tracked** (D-3) but planner-managed — executors never stage changes to them in feature PRs.
- Sequence is fixed: step 3 (Next 16 + React 19) lands BEFORE 4a so the component library is built once, on the final platform; Tailwind 3→4 happens inside 4a's shadcn init.
