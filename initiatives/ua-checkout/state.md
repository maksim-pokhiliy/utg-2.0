# ua-checkout — state (the board)

**Updated:** 2026-08-08 (bot B4 shipped and its gate on U5a is LIFTED — D-12; U5a is the
next step and it is unblocked outright)

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
| U5a | Contacts + copy + editable summary; payload flips to v2   | ⬜ **NEXT — ungated** (bot B4 shipped, D-12) | plan.md · D-9 · D-11 · D-12 · requirements §5/§9      |
| U5b | Delivery: method chips, NP comboboxes, courier fields     | ⬜ pending                     | plan.md · D-9 · requirements §1/§4                    |
| U6  | Contract close-out (bot drops v1, tests pin v2)          | ⬜ pending                     | plan.md · D-3                                         |
| U7  | Prod verify + close-out                                  | ⬜ pending                     | charter acceptance criteria                           |

## Next action

**U5a — and it is unblocked outright.** Bot B4 shipped (bot PR #3 `7594e94`) and the gate
it held over U5a's merge is gone, because the danger it was gating against turned out not
to exist: a live probe falsified the Telegram width premise (bot BDEF-4 / journal
2026-08-08). Nothing in the shop's plan depended on that premise except the merge gate.

U5a's scope is unchanged: contacts + copy + editable summary, the payload flips to the v2
envelope with `delivery.mode: "generic"` for BOTH locales, and it mints the optional
`idempotency_key` (D-11). Riders due here: UAC-3 (real UA name placeholders), UAC-6,
UAC-9 (`delivery.city` rejoin, 200-empty is not a fallback trigger), UAC-10, DEF-39.

**Then B5** — the relay persists every decoded order before the Telegram send (D-11,
closes bot BDEF-3). It does NOT gate U5a; the ordering is a priority call recorded in
D-12, and the Neon provisioning request goes out now so it ripens in parallel. One thing
B4 sharpened for it: the RENDERED MESSAGE is lossy (truncation drops cart lines behind a
"+N more positions" marker), so the durable record must be the decoded PAYLOAD.

Then U5b → U6 → U7.

**D-12 already paid for itself.** Its rule — reconnaissance that gates a step runs BEFORE
the step prompt — was applied to Нова Пошта the same day: the operator's key went in and
the live Kyiv directory was probed against requirements §4 instead of waiting for the U7
gate. It found UAC-13, a defect no test in this repo can ever catch, one step before U5b
would have built comboboxes on top of it.

The UAC-4 + UAC-8 DS-hygiene/kit-backport window remains available between steps.

## Open decisions awaiting ratification

(none — D-1…D-12 ratified)

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
