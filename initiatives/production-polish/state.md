# production-polish — state (the board)

**Updated:** 2026-08-02 (step 7 MERGED — the BOARD IS COMPLETE; close-out pending: Lighthouse perf/a11y check, the /step retro, the unparked bot phase)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here.**

## Board

| #     | Step                                                                             | Status                                                                                                                                                                                                                                                           | Pointer                              |
| ----- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 0     | Quick wins                                                                       | ✅ done — PR #2 squash-merged (`04fbbf9`)                                                                                                                                                                                                                        | PR #2                                |
| 1     | Rescue / de-Firebase + RSC                                                       | ✅ done — PR #3 squash-merged (`49acce7`); **prod verified alive** (images 200, SSG titles, en $-prices via Vercel-env rates)                                                                                                                                    | PR #3                                |
| 2     | Recoil → Zustand + cart fixes                                                    | ✅ done — PR #4 squash-merged (`e066ccc`)                                                                                                                                                                                                                        | PR #4                                |
| 3     | Next 16 + React 19                                                               | ✅ done — R1 browser gate passed by user, PR #5 squash-merged (`f3f79bf`)                                                                                                                                                                                        | PR #5                                |
| 4a    | Port design system (sealed, D-10)                                                | ✅ done — PR #6 + fix round squash-merged (`2e83503`); 6 seal layers proven                                                                                                                                                                                      | PR #6                                |
| D1    | Design system (Claude Design)                                                    | ✅ done — user approved; D-4 fully ratified                                                                                                                                                                                                                      | project `62bf007e-…` = visual SSOT   |
| D2    | Screen prototypes (Claude Design)                                                | SUPERSEDED by D-11 — kit screens are DS demos; real pages designed per-page in D3                                                                                                                                                                                | `kit-screens-reference.md`           |
| 4b    | DS alignment (NavOverlay + DEF-20)                                               | ✅ done — PR #7 squash-merged (`8d9a4ba`) incl. overflow fix round; DEF-20 CLOSED                                                                                                                                                                                | PR #7                                |
| D3    | Per-page screen designs (Claude Design)                                          | ✅ done — five page designs + the D3.6 lightbox addendum ratified & exported (MediaFigure/Lightbox DS additions sanctioned 07-27)                                                                                                                                | `design-export/screens/`             |
| 4c    | Implement Home per D3.1                                                          | ✅ done — PR #8 squash-merged (`dec9a78`) incl. 3-item fix round; prod live-verified                                                                                                                                                                             | PR #8                                |
| 4d–4g | Remaining pages (catalog/category → product → cart/checkout → reports/about/404) | 4d ✅ (PR #9) · 4e ✅ (PR #10) · 4f ✅ (PR #11) · 4g ✅ (PR #12) · 4h ✅ (PR #13, `71dbb63` — lightbox, aria-disabled ratified)                                                                                                                                  | `step-4d-catalog-category-prompt.md` |
| 5     | SEO pack                                                                         | ✅ done — PR #14 squash-merged (`095caad`) incl. review fix round; Lighthouse SEO 100 on every page (user devtools gate)                                                                                                                                         | plan.md                              |
| 6     | Tests + CI                                                                       | ✅ done — PR #15 squash-merged (`208e192`) incl. the D-13 Node-24 fix round; 265 units + 11 e2e; the PR proved its own CI green (charter acceptance); prod live-verified on Node 24                                                                              | PR #15                               |
| 6b    | DS hygiene (DEF-27/28/32/38)                                                     | ✅ done — PR #16 squash-merged (`7c9f89d`) incl. the adapt round (five DEF-27 focus regressions closed, Dialog-slot reversal ratified) + the open-on-add micro-round; 317 units; 9-point user browser gate passed; prod live-verified                            | PR #16                               |
| 7     | README + presentation                                                            | ✅ done — PR #17 squash-merged (`8591696`): cold-reader README with the D-3 initiative-system feature section, MIT LICENSE + NOTICE, 6 byte-reproducible screenshots, DEF-40 fixed & proven; ran as the /step pilot (16-finding review, 12-item truth fix round) | PR #17                               |

## Next action

1. INITIATIVE CLOSE-OUT: (a) the one charter criterion never explicitly
   measured — USER: Lighthouse mobile performance/accessibility (devtools) on
   home, a category and a product page; ≥ 90 closes the charter (SEO 100 was
   verified in step 5); (b) the /step pilot RETRO — user-parked discussion,
   material in the journal entry of 2026-08-02 (headless review-layer
   degradation, the tree-state protocol line, costs); (c) leftover
   housekeeping: Vercel dashboard → Node.js Version → 24.x (D-13
   belt-and-braces, still showing 20.x), Rich Results on a live product URL
   (optional).
2. UNPARKED (its condition — app steps 5–7 complete — is met): the bot-polish
   phase in `utg-tg-order-bot` (D-12/DEF-13 `currency` read); a dedicated
   phase, planned fresh when the user opens it.
3. Post-initiative windows for the remaining ledger: hardening (DEF-36 +
   DEF-37 + DEF-39), the next DS window (DEF-41), external (DEF-9), any React
   Compiler decision (DEF-18).

## Open decisions awaiting ratification

(none — D-1…D-13 all ratified)

## Live carry-forwards

Closed in step 7 (PR #17): DEF-40 (with a corrected disposition — see the
ledger). Opened: DEF-41 (DS Skeleton hidden-state coupling — next DS window).
Still live: DEF-9 (hero photo — external Firebase ticket), DEF-13 (bot
`currency` read — UNPARKED, the dedicated bot-polish phase is next), DEF-18
(react-hooks v6 — any React Compiler decision), DEF-36 + DEF-37 + DEF-39 (the
hardening window: e2e limiter-bucket isolation, relay-forwarding e2e, cart
decoder field validation + honest typing).

## Gotchas a resuming session must know

- **Prod is alive and takes real orders** (rescued by step 1) — every merged PR must leave it fully functional; Vercel auto-deploys `master`.
- The order-bot contract is fully known (`extracted/bot-contract-index.js`, bot repo is user's own `utg-tg-order-bot`); payload field shape is sacred.
- Catalog business data in `src/data/` is sacred (verbatim from `extracted/` sources) — never invent or "improve" it.
- The Claude Design project `62bf007e-1ea9-45bc-a40a-f64544314e8c` is the visual SSOT for 4a–4c (readable via DesignSync); implementation matches it, deviations need a new decision.
- `CLAUDE.md` and `initiatives/` are **tracked** (D-3) but planner-managed — executors never stage changes to them in feature PRs.
- Sequence is fixed: step 3 (Next 16 + React 19) lands BEFORE 4a so the component library is built once, on the final platform; Tailwind 3→4 happens inside 4a's shadcn init.
