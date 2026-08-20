# ua-checkout — state (the board)

**Updated:** 2026-08-20 (U7 gate RUN and passed with one finding, which became U8. **U8 is
PARKED MID-STEP on two pushed branches** — read the Next action block before touching anything)

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
| U5b | Delivery: method chips, NP comboboxes, courier fields     | ✅ done — PR A `25c58d7` (carrier layer) + PR B `4348455` (the flow, 54 files); two independent reviews, four fix rounds, 25 mutation proofs; prod-smoked end to end | PR #22 · PR #23 · D-14…D-18 · journal 2026-08-11 |
| U6  | Contract close-out (bot drops v1, tests pin v2)          | ✅ done — merged as a PAIR: relay `a81fa1e` (#5) + shop `700fca0` (#24); local end-to-end smoke BEFORE merge, prod smoke after | PR #5 · PR #24 · D-19…D-21 · journal 2026-08-20 |
| U7  | Prod verify + close-out                                  | ⬜ pending                     | charter acceptance criteria                           |

## Next action

> **PARKED MID-STEP 2026-08-20.** The owner stopped the round to move the machine. Both
> executors were killed in flight and both halves of U8 are preserved on pushed branches.
> **Read this whole block before touching either repo.**

### Where U8 stands, exactly

**U8 exists because the U7 browser gate found a live defect.** The owner ran the full gate on
production and reported one finding: settlements whose only Нова Пошта presence is a pickup
point are told the directory is unavailable. Reproduced against prod — `с. Романівка,
Бердичівський р-н` reports `warehouseCount: 3` and our warehouse route answers 503, because its
page is `{DropOff: 1, Store: 1}` and `KNOWN_CATEGORIES` held only `["Branch","Postomat","Cargo"]`.
**2 of 10 sampled villages** hit this. Owner ruled: offer them («мы делаем честный и чистый
сервис»). Everything else in the gate passed.

| half | branch | HEAD | state |
| --- | --- | --- | --- |
| shop — pickup-point categories | `feat/np-pickup-points` | `8928b3f` | 3 commits, tree CLEAN, pushed, **no PR opened**. Killed just after "all 18 mutations proven, verifying the tree is restored" — the tree IS clean, so the mutations were reverted. Remaining: the heavy gates (`yarn build`, `yarn e2e`) and opening the PR. |
| relay — Ukrainian labels | `feat/ukrainian-operator-labels` | `65594da` | 2 commits, tree CLEAN, pushed, **no PR opened**. The second commit is a planner-authored WIP holding nine files that were uncommitted when the machine went down — **the executor is expected to reshape that history**, its plan puts a green-on-master commit first (`f8efcb2`, landed), then the substitution, then the goldens. |

**Both executors are dead.** Do not try to resume them — spawn fresh ones with continuation
prompts, and per the recovery protocol make each inspect what actually landed before it writes
anything. The step prompts are committed and current: `step-u8-pickup-points-prompt.md` here and
`initiatives/bot-polish/step-u8-ukrainian-labels-prompt.md` in the relay.

### Rulings already given that must survive into the continuation prompts

**Shop.** Recognised vocabulary widens to six (`Branch, Postomat, DropOff, Store, Fulfillment,
Cargo`); the `Відділення` chip serves `Branch + DropOff + Store`, `Поштомат` serves `Postomat`,
and `Cargo`/`Fulfillment` are recognised-and-never-offered. **D-15's "a page where NO category is
recognised ⇒ 503" arm is retired** — a page that yields rows is a successful page, and drift
detection stays with the arm that means it (a container decoding to zero rows). **Dedupe stays
PER CATEGORY and the categories merge after it** — the carrier reuses `Number` across categories,
so a cross-category dedupe would silently drop a real point; ordering is (exact-match rank, then
the category's index in the chip's array). Chip copy unchanged, zero new dictionary strings.
**The trap the executor found and that must not be undone: `DecodedWarehouse.category` stays a
bare `string`.** Moving recognition into `decodeWarehouse` makes an unknown category fail to
decode, which trips the SURVIVING drift arm and re-creates the 503 through the other door.

**Relay.** 21 labels + 12 further strings, all confirmed, apostrophe **U+2019**. Contact channels
map `call → Дзвінок`, `telegram → Telegram`, `viber → Viber`, any other value printed verbatim —
the shop's set is `["call","telegram","viber"] as const` (`fields.ts:118`), closed. The relay's
README currently documents the opposite ("rendered verbatim — the relay does not second-guess
it") and is rewritten in the same PR; the test `accepts a contact channel nobody pinned` is KEPT
and re-purposed as the fail-open proof. The omitted marker becomes `ще позицій: +N` — **it must
not decline**, because `omittedMarkerAllowance` measures the marker at n=0 and assumes only digit
count varies; a declining form under-reserves, the message passes 4096, Telegram rejects it and
the order is lost. `Відділення Нової Пошти` stays as the mode label (today's English
over-specifies identically, so the translation conserves rather than introduces).

**A correction to this initiative's own prompt, worth keeping:** the labels do NOT go through
`generatedField` — that wraps values only, and the labels are raw literals outside the
interpolation. Nothing escapes or clamps them, so a label containing `&`, `<` or `>` would corrupt
Telegram's HTML rather than be escaped, and labels have no length ceiling at all.

### After U8

**U7 is otherwise satisfied** — the owner ran the whole gate and reported no other finding, so
criterion 7 is met and this defect is the only debt it produced. When both U8 halves are merged
and prod-smoked, the initiative closes with `/initiative-close`. Nothing else remains.

### Not blocking, still live

Relay-side, planner-owned: **BDEF-11** (the relay authenticates to Neon as the schema owner and
could `drop table orders` — an env update plus a redeploy of the SERVING deployment resolved by id
from its logs, per the BDEF-1 lesson), **BDEF-10** (PII datastore with no retention), **BDEF-8**
(which Telegram width metric is enforced; ~980 units of cart room).

## Open decisions awaiting ratification

(none — D-1…D-21 ratified)

## Live carry-forwards

- Inherited: DEF-36 — CLOSED by U4 (per-spec limiter identities); DEF-37 (relay
  forwarding e2e, → U6); DEF-39 (cart decoder, → U5). DEF-41 — CLOSED by U3.
  Both closures also recorded in the production-polish canonical ledger.
- **CLOSED by U5b** — UAC-9, UAC-10, UAC-13, UAC-15, UAC-17 and UAC-18 (all three debts of
  delegating the search), UAC-19(4), and **UAC-11**, whose answer is that the limiter
  is NOT bypassable: a pacing-immune probe returned 60 × 200 then 10 × 429 for a forged
  identity and byte-identically for an honest one, because Vercel overwrites
  `x-forwarded-for` to prevent spoofing. Its ledger row keeps the trail of how the first
  probe was misread — two sequential runs share one sliding window, so the control was
  contaminated by the treatment.
- **UAC-1**, **UAC-2**, **UAC-3**, **UAC-6**, **DEF-39** — CLOSED earlier (2026-08-08).
- **NEW, all OPEN** — **UAC-20** (the client's abort is never linked to the upstream
  fetch, the real multiplier behind the fan-out debts; → U6), **UAC-21** (first-review
  tail: a 209-line hook, dead `INITIAL_DELIVERY` pinned by 7 assertions, duplicated
  `ERROR_KEYS`, no `maxLength` on free-text fields), **UAC-22** (11 below-the-cut items,
  named so the tail is durable), **UAC-23** (re-review set — chiefly the ruling that an
  unparseable success stays "distress", recorded WITH the reviewer's disagreement, to be
  re-read on carrier drift), **UAC-24** (one focus guard no environment can cover:
  neither jsdom nor Chromium fires `blur` on node removal, only Firefox does).
- **UAC-4** (OPEN) — the Claude Design kit lags the repo DS; one `/design-sync`
  backport pass after U3 merges (delta audit incl. 4d-era additions).
- **UAC-7** (SCHEDULED → U7's browser gate) — the combobox adoption watch-list, plus the
  D-6.2 consumer contract. **UAC-8** (OPEN) pairs with UAC-4 in one DS-hygiene window.
- **UAC-25** (OPEN → U6) — promoted from the relay's BDEF-12 and re-verified in this repo:
  `/api/place_order` is public, attaches the relay secret for any caller, forwards with no
  abort signal and no duration bound, and its limiter is a per-lambda Map. Distinct from
  UAC-11, which asked whether the limiter's identity could be forged (no) — this asks
  whether a per-instance counter is a limit at all.
- **UAC-12**, **UAC-14**, **UAC-16**, **UAC-19**(1)(2)(3)(5) — open review sets from U0/U4/
  U5a and PR A, none a defect today; U6 is the natural window for the route-level ones.

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
