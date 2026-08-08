# ua-checkout — state (the board)

**Updated:** 2026-08-08 (U5a shipped and prod-smoked — the payload is v2 end to end;
U5b is next and it opens with two known defects to fix before any UI)

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #   | Step                                                     | Status                         | Pointer                                               |
| --- | -------------------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| U0  | PREREQ: bot-polish B2 (sender) + B3 (bot dual-accepts v2) | ✅ done — PR #20 `bb3f866` (secret enforced live) + bot PR #2 `66134ee` (v2 accepted); both prod-smoked | PR #20 · D-10 · journal 2026-08-06 |
| U1  | Requirements spec + contract draft (resolve D-3)         | ✅ done                        | `requirements.md` · D-3 RATIFIED · journal 2026-08-05 |
| U2  | Design pass (brief → Claude Design → export)             | ✅ done                        | `design-export/` · D-4 · journal 2026-08-05           |
| U3  | DS window: form primitives + DEF-41                      | ✅ done — PR #18 squash-merged `ac1b73a` incl. the D-6 fix round; prod live-verified; DEF-41 CLOSED | PR #18 · D-5 · D-6 · journal 2026-08-05 |
| U4  | NP proxy route + caching + env plumbing                  | ✅ done — PR #19 squash-merged `a17aa30` incl. the D-8 fix round; prod fail-open verified (503 + 400) | PR #19 · D-7 · D-8 · journal 2026-08-06 |
| U5a | Contacts + copy + editable summary; payload flips to v2   | ✅ done — PR #21 `9099402`, prod-smoked end to end through the live shop route | PR #21 · D-13 · journal 2026-08-08 |
| U5b | Delivery: method chips, NP comboboxes, courier fields     | ⬜ **NEXT** — opens with UAC-13 + UAC-15 before any UI | plan.md · D-9 · requirements §1/§4 · UAC-13/15/16/17 |
| U6  | Contract close-out (bot drops v1, tests pin v2)          | ⬜ pending                     | plan.md · D-3                                         |
| U7  | Prod verify + close-out                                  | ⬜ pending                     | charter acceptance criteria                           |

## Next action

**U5a CLOSED** (PR #21 `9099402`, squash-merged, deployed, prod-smoked end to end: a v2
envelope carrying an `idempotency_key` with `mode: "generic"` under `locale: "uk"` went
through the LIVE shop route → the secret injection → the relay → the operators' chat, 200).
The payload is now truthful for everything that does not involve Нова Пошта. Rulings and
the review outcome are D-13.

**U5b is next, and it does NOT open with UI.** Two things must land before a single
combobox exists, both found by probing rather than by reading:

1. **UAC-13** — the NP warehouse page-merge is broken against the live carrier API. Kyiv
   page 1 succeeds, page 2 comes back `"To many requests"`, and the proxy collapses it to
   503. Every multi-page city silently loses the directory. No test in this repo can ever
   catch it, because fixtures do not rate-limit.
2. **UAC-15** — `CheckoutForm.tsx` is already 315 LOC against a 300 bar, and U5b adds the
   whole delivery-method surface to that same file. Extract first; it is a rewrite after.

Then the UI: method chips, both NP comboboxes on the U4 proxy, runtime fallback, courier
fields. Riders that were always U5b's, never U5a's: **UAC-9** (rejoin `delivery.city` as
`label + ", " + region`; a 200-empty on a blank query is not a fallback trigger),
**UAC-10** (NP-proxy `Present` edge guards), **UAC-16**, **UAC-17**.

**Then B5** (bot repo) — orders become durable. D-13 puts a hard constraint on it: the
`idempotency_key` deliberately spans an order the buyer EDITED between retries, so
**dedupe must be on a content hash, never on the key alone** — key-only dedupe would
answer 200 to a corrected order that was never delivered, and the shop would show the
success screen and clear the cart.

Then U6 → U7.

## Open decisions awaiting ratification

(none — D-1…D-13 ratified)

## Live carry-forwards

- Inherited: DEF-36 — CLOSED by U4 (per-spec limiter identities); DEF-37 (relay
  forwarding e2e, → U6); DEF-39 (cart decoder, → U5). DEF-41 — CLOSED by U3.
  Both closures also recorded in the production-polish canonical ledger.
- **UAC-11** (SCHEDULED → U7) — the limiter can be disabled by a client sending an
  EMPTY `x-forwarded-for`/`x-real-ip` (pre-existing on master; fails open by
  design). Unverifiable on previews (Deployment Protection 302s them) — probe the
  live GET route at the prod gate; if real, tighten the directory bucket only,
  never `place_order`.
- **UAC-10** (SCHEDULED → U5) — NP-proxy polish: `Present` edge guards and the
  `server-only` import boundary (the package is absent from the repo).
- **UAC-13** (SCHEDULED → U5b, FIRST task) — **the NP warehouse page-merge is broken
  against the live API**: Kyiv page 1 succeeds, page 2 comes back `"To many requests" /
  "Try again after 0.5 seconds"`, and the proxy collapses it to 503. Every multi-page
  city — Kyiv, and by inference Харків/Одеса/Дніпро/Львів — silently falls back to
  free-text, i.e. the NP feature would never work where the orders are. Single-page
  cities work end to end. Fixtures never rate-limit, so U4's tests are green and always
  will be. Fix by pacing/retrying inside the existing 7s budget; never serve a partial
  list.
- **UAC-1** and **UAC-2** — **CLOSED 2026-08-08.** The operator's key is set on Vercel
  (Production, Sensitive; binds on the next natural deploy — nothing reads it until
  U5b), and the residual live-key reconciliation is done. Pulling both forward from U7
  per D-12 is what surfaced UAC-13, one step before it would have cost UI work.
- **UAC-2** (SCHEDULED) — U4 re-check DONE via five substitute sources (the portal
  403s); residual live-key proof (string `Page`/`Limit`, multi-page Kyiv merge) → U7.
- **UAC-9** and **UAC-10** (SCHEDULED → **U5b**, not U5a) — both are pure NP-directory
  concerns; an earlier version of this board listed them among U5a's riders, which
  contradicted D-9 and the step prompt. The prompt was right.
- **UAC-3**, **UAC-6**, **DEF-39** — **CLOSED 2026-08-08 by U5a.**
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
