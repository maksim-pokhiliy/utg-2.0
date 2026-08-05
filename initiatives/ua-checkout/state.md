# ua-checkout — state (the board)

**Updated:** 2026-08-05

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #   | Step                                                   | Status     | Pointer                                  |
| --- | ------------------------------------------------------ | ---------- | ---------------------------------------- |
| U0  | PREREQ: bot-polish B2 (x-relay-secret sender, this repo) | ⬜ pending | `../utg-tg-order-bot/initiatives/bot-polish/` |
| U1  | Requirements spec + contract draft (resolve D-3)       | 🔵 active  | `requirements.md` (being written)        |
| U2  | Design pass (brief → Claude Design → export)           | ⬜ pending | `design-brief.md` → `design-export/`     |
| U3  | DS window: form primitives + DEF-41                    | ⬜ pending | plan.md                                  |
| U4  | NP proxy route + caching + env plumbing                | ⬜ pending | plan.md                                  |
| U5  | Checkout rework (uk both modes, contacts, copy)        | ⬜ pending | plan.md                                  |
| U6  | Contract flip (paired shop+bot PRs)                    | ⬜ pending | plan.md · D-3                            |
| U7  | Prod verify + close-out                                | ⬜ pending | charter acceptance criteria              |

## Next action

Finish U1: write `requirements.md` (order-information model + payload draft, NP API
methods verified against official docs) and `design-brief.md`; ratify D-3. Then the
user drives the brief through Claude Design (U2). U0 (B2) can run in parallel any time
— it must land before U6.

## Open decisions awaiting ratification

- **D-3** — payload shape: clean v2 vs additive extension (resolve in U1).

## Live carry-forwards

- Inherited, SCHEDULED into steps: DEF-36 + DEF-37 (e2e, → U4/U5/U6), DEF-39 (cart
  decoder, → U5), DEF-41 (DS Skeleton, → U3).
- **UAC-1** (OPEN) — real NP API key from the operator into Vercel env; needed live
  only by U7, fallback covers until then.

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
