# ua-checkout — state (the board)

**Updated:** 2026-08-05

A scannable board, not prose. Narrative → `journal.md`; why → `decisions.md`;
carry-forwards → `deferred.md`. **Resume here** (the SessionStart hook force-loads it).

## Board

| #   | Step                                                     | Status                         | Pointer                                               |
| --- | -------------------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| U0  | PREREQ: bot-polish B2 (sender) + B3 (bot dual-accepts v2) | ✅ B2 done — PR #20 `bb3f866`, enforcement LIVE and verified end-to-end; ⬜ B3 next (bot repo) | PR #20 · D-10 · journal 2026-08-06 |
| U1  | Requirements spec + contract draft (resolve D-3)         | ✅ done                        | `requirements.md` · D-3 RATIFIED · journal 2026-08-05 |
| U2  | Design pass (brief → Claude Design → export)             | ✅ done                        | `design-export/` · D-4 · journal 2026-08-05           |
| U3  | DS window: form primitives + DEF-41                      | ✅ done — PR #18 squash-merged `ac1b73a` incl. the D-6 fix round; prod live-verified; DEF-41 CLOSED | PR #18 · D-5 · D-6 · journal 2026-08-05 |
| U4  | NP proxy route + caching + env plumbing                  | ✅ done — PR #19 squash-merged `a17aa30` incl. the D-8 fix round; prod fail-open verified (503 + 400) | PR #19 · D-7 · D-8 · journal 2026-08-06 |
| U5a | Contacts + copy + editable summary; payload flips to v2   | ⬜ pending — gated on bot B3    | plan.md · D-9 · requirements §5/§9                    |
| U5b | Delivery: method chips, NP comboboxes, courier fields     | ⬜ pending                     | plan.md · D-9 · requirements §1/§4                    |
| U6  | Contract close-out (bot drops v1, tests pin v2)          | ⬜ pending                     | plan.md · D-3                                         |
| U7  | Prod verify + close-out                                  | ⬜ pending                     | charter acceptance criteria                           |

## Next action

U4 CLOSED (merged, prod-verified, docs promoted, CLAUDE.md corrected). **D-9
ratified: the bot leads, and U5 splits into U5a/U5b by payload truthfulness.**

U0/B2 CLOSED: PR #20 merged, both Vercel projects carry `ORDER_RELAY_SECRET`
(Production, Sensitive), the relay enforces it, and the chain was proven live —
relay 401s header-less callers, 400s the shop's authenticated probe. DEF-13 and
BDEF-1 closed.

**Next: B3 in the bot repo** (`../utg-tg-order-bot`, initiative `bot-polish`) —
the relay dual-accepts v1 + v2 per requirements §5. It gates U5a, which is where
the shop's payload flips. Then U5a → U5b → U6. The UAC-4 + UAC-8 DS-hygiene
window remains available between steps.
The UAC-4 + UAC-8 DS-hygiene/kit-backport window remains available between steps.

## Open decisions awaiting ratification

(none — D-1…D-8 ratified)

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
