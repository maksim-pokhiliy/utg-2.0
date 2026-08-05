# ua-checkout — state (the board)

**Updated:** 2026-08-05

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #   | Step                                                     | Status                         | Pointer                                               |
| --- | -------------------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| U0  | PREREQ: bot-polish B2 (x-relay-secret sender, this repo) | ⬜ pending                     | `../utg-tg-order-bot/initiatives/bot-polish/`         |
| U1  | Requirements spec + contract draft (resolve D-3)         | ✅ done                        | `requirements.md` · D-3 RATIFIED · journal 2026-08-05 |
| U2  | Design pass (brief → Claude Design → export)             | ✅ done                        | `design-export/` · D-4 · journal 2026-08-05           |
| U3  | DS window: form primitives + DEF-41                      | ✅ done — PR #18 squash-merged `ac1b73a` incl. the D-6 fix round; prod live-verified; DEF-41 CLOSED | PR #18 · D-5 · D-6 · journal 2026-08-05 |
| U4  | NP proxy route + caching + env plumbing                  | 🔄 executor round open         | step-u4-np-proxy-prompt.md · D-7                      |
| U5  | Checkout rework (uk both modes, contacts, copy)          | ⬜ pending                     | plan.md                                               |
| U6  | Contract flip (paired shop+bot PRs)                      | ⬜ pending                     | plan.md · D-3                                         |
| U7  | Prod verify + close-out                                  | ⬜ pending                     | charter acceptance criteria                           |

## Next action

U4 review #2 delivered (deep, REQUEST-CHANGES: 88 pooled → 26 post-refutation,
no cap applied; sacred `place_order` proven byte-identical incl. a 300k-op
differential; reviewer #1's partial claim resolved — the fixture flags test
honesty, the real falsifiers are the unsourced Kyiv figure + the wrong cap
denominator). Fix round OPEN on the executor: 15 code items (page-merge dedup
IR-2, cap-exit refuses IR-3, decode-collapse guard IR-4+5, DenyToSelect trim
regression IR-8, negative TTL RF-5/IR-24, merge-concurrency cap IR-9,
settlement-cache sizing IR-10, zero-width strip IR-11, ref/number caps IR-12,
cityRef case IR-15, pins IR-6/7/16, dedup helpers IR-17/18, README/PR-body
truth IR-19/20). Planner-side: IR-1 (PRE-EXISTING null-key limiter forgery,
prod impact unknown) — curl-probe the Vercel preview at phase 6; IR-21 D-8
amendment done; IR-25 CLAUDE.md at close-out. Ledgered: UAC-10 (new),
UAC-9/UAC-2 amended. U0 (B2) still pending — must land before U6.

## Open decisions awaiting ratification

(none — D-1…D-8 ratified)

## Live carry-forwards

- Inherited, SCHEDULED into steps: DEF-36 + DEF-37 (e2e, → U4/U5/U6), DEF-39 (cart
  decoder, → U5). DEF-41 — CLOSED by U3 (both ledgers).
- **UAC-1** (OPEN) — real NP API key from the operator into Vercel env; needed live
  only by U7, fallback covers until then.
- **UAC-2** (SCHEDULED) — U4 re-check DONE via five substitute sources (the portal
  403s); residual live-key proof (string `Page`/`Limit`, multi-page Kyiv merge) → U7.
- **UAC-9** (SCHEDULED → U5) — D-8 handoff: `delivery.city` = `label + ", " +
  region` rejoined; 200-empty on blank `q` is not a fallback trigger; meta-slot
  overflow watch at the browser gate.
- **UAC-3** (SCHEDULED → U5) — uk name placeholders in the ratified dict are still
  John/Wick; dictionaries get real UA examples per requirements §6.
- **UAC-4** (OPEN) — the Claude Design kit lags the repo DS; one `/design-sync`
  backport pass after U3 merges (delta audit incl. 4d-era additions).
- **UAC-5/6/7** (SCHEDULED) + **UAC-8** (OPEN) — review riders: NP-proxy row cap (→ U4), drawer
  `sizes` hint + combobox adoption notes (→ U5).

## Gotchas a resuming session must know

- **Prod takes real orders** — NP integration must fail OPEN to free-text fields;
  no step may leave checkout unable to submit. Vercel auto-deploys `master`.
- **Zero-env invariant**: build/boot/e2e with no env vars; the NP key joins the three
  existing blanked keys in `yarn e2e` / CI, and the fallback mode IS the deterministic
  e2e fixture.
- **Requirements-first (D-2)**: don't inherit `country/state/city/address` thinking;
  the field model comes from `requirements.md`, the bot contract moves with us via
  paired steps (bot repo: `../utg-tg-order-bot`, mid bot-polish).
- **en locale keeps the generic form** (D-1.2) — the UA flow is uk-only; en is a
  regression surface, not a redesign surface.
- New form primitives belong INSIDE the sealed DS (`src/design-system/` + barrel);
  the seal lint has no escape hatch.
