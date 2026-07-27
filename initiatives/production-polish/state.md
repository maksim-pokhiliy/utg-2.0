# production-polish — state (the board)

**Updated:** 2026-07-27 (step-5 SEO prompt ISSUED with DEF-4/24/29 rulings; bot phase parked after app work)

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
| 5     | SEO pack                                                                         | ⬜ pending                                                                                                                        | plan.md                              |
| 6     | Tests + CI                                                                       | ⬜ pending                                                                                                                        | plan.md                              |
| 7     | README + presentation                                                            | ⬜ pending                                                                                                                        | plan.md                              |

## Next action

1. USER: carry step 5 to a fresh executor tab — "Run
   initiatives/production-polish/step-5-seo-prompt.md — read that file and
   execute it as your full prompt, verbatim." Planner reviews the plan gate
   (expected OQs: metadata architecture, og:image strategy, meta-description
   sourcing for owner ratification, sitemap list, DEF-31 approach, DEF-4
   numbers), then the PR. Rulings baked into the prompt: DEF-4 in-route rate
   limit, DEF-24 DROPPED, DEF-29 soft-404 ACCEPTED.
2. PARKED by user sequencing (2026-07-27): the `utg-tg-order-bot` `currency`
   read (D-12/DEF-13) waits until the app work (steps 5-7) completes — a
   dedicated bot-polish phase follows the initiative.

## Open decisions awaiting ratification

(none — D-1…D-12 all ratified)

## Live carry-forwards

Riding the issued step-5 prompt: DEF-4 (rate limit, ruled), DEF-22
(`getCategoryName`), DEF-25 (autoComplete), DEF-30 (`shared.close`), DEF-31
(lightbox loading). Ruled 2026-07-27: DEF-24 DROPPED, DEF-29 DROPPED-as-accepted.
Still live: DEF-9 (hero photo — Firebase ticket pending), DEF-13 (bot `currency`
read — PARKED to the post-app bot phase by user sequencing), DEF-18 (react-hooks
v6 — any React Compiler decision), DEF-27/DEF-28/DEF-32 (DS hygiene — one
sanctioned window, step 5/6), DEF-33 (REPORT_DIMENSIONS drift-guard — step 6).

## Gotchas a resuming session must know

- **Prod is alive and takes real orders** (rescued by step 1) — every merged PR must leave it fully functional; Vercel auto-deploys `master`.
- The order-bot contract is fully known (`extracted/bot-contract-index.js`, bot repo is user's own `utg-tg-order-bot`); payload field shape is sacred.
- Catalog business data in `src/data/` is sacred (verbatim from `extracted/` sources) — never invent or "improve" it.
- The Claude Design project `62bf007e-1ea9-45bc-a40a-f64544314e8c` is the visual SSOT for 4a–4c (readable via DesignSync); implementation matches it, deviations need a new decision.
- `CLAUDE.md` and `initiatives/` are **tracked** (D-3) but planner-managed — executors never stage changes to them in feature PRs.
- Sequence is fixed: step 3 (Next 16 + React 19) lands BEFORE 4a so the component library is built once, on the final platform; Tailwind 3→4 happens inside 4a's shadcn init.
