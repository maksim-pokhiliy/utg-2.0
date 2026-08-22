# Step P1 (shop half) — the carrier vocabulary gets a tripwire (executor prompt)

The relay half is a PAIRED PR in `../utg-tg-order-bot` (its prompt lives in that repo's
`initiatives/bot-polish/step-p1-contract-values-prompt.md`); the two merge in the same
window.

---

/feature small One item from UAC-27's shop tail: the accepted rename residual gets a
detector. No behavior change anywhere — the response bytes stay identical. This store
takes REAL volunteer orders and auto-deploys `master`.

## Verified by the planner on the current tree — take as given

- `KNOWN_CATEGORIES` in `src/app/api/np/warehouses/directory.ts` is the six-value list
  (`Branch, Postomat, DropOff, Store, Fulfillment, Cargo`); `WarehouseCategory` derives
  from it, so it is **runtime-dead today** (the type erases at compile) — UAC-27 names
  it the natural home for the missing detector.
- The U8 incident this detects: `KNOWN_CATEGORIES` held three values while the carrier
  served six, and 2 of 10 sampled villages were told the directory was unavailable. The
  residual accepted at U8 close: a rename or a NEW value in the carrier's vocabulary is
  silently not-offered with **no log line at all** — UAC-27: "a `console.warn` on an
  unrecognised category is zero-risk and would have caught the original incident".
- D-22 stands: a page that yields rows is a successful page; `DecodedWarehouse.category`
  stays a bare `string` ON PURPOSE — narrowing it makes an unknown category fail to
  decode and re-creates the 503 through the drift arm. Your change must not move either.
- The shop's channel-value pin ALREADY EXISTS:
  `tests/components/checkout/payload.test.ts` asserts `CONTACT_CHANNELS` equals the
  literal triple ("offers exactly the call, telegram and viber triple §5 pins"). Part of
  your gates is CONFIRMING it by mutation — the evidence line the paired relay PR will
  cite.

## Scope

**1. The detector.** Where the classification path meets a `category` value outside
`KNOWN_CATEGORIES`, emit `console.warn` — once per distinct unrecognised value per
module lifetime (module-level `Set`; the cardinality is carrier-controlled, so the set
is bounded). The message carries the raw value (it has already passed `readString`'s
`\p{Cf}` strip) and enough context to grep. `KNOWN_CATEGORIES` gains its runtime job
back as the membership source. NO behavior change: the row stays unoffered exactly as
today, the response bytes are identical, no type narrows, decode cannot start failing.

**2. Mutation-confirm the existing channel pin.** Rename `call` in `CONTACT_CHANNELS`
(`src/components/checkout/fields.ts`) on the committed tree → report the single named
test that reddens → revert. This is evidence for the pair, not new code.

**Bring to the plan gate:** the warn's exact wording and the dedupe shape. Anything that
would change response bytes = stop and ask.

## Out of scope (hard fence)

The relay repo (`../utg-tg-order-bot`) — its half is a paired PR; do not open, edit or
stage anything there. The checkout UI; the chips and the offered-set policy; the
`categoryPriority` refactor and every other UAC-27 hygiene-tail item (they stay on the
row); the rate limiter; the `place_order` envelope and route; `ICartItem`; catalog data;
new dependencies.

## Acceptance gates

- Full battery green: `yarn lint`, `yarn format`, `yarn typecheck` (BOTH programs),
  `yarn test`, zero-env `yarn build`, `yarn e2e`. Note: e2e CANNOT exercise the detector
  (the key is blanked, `CARRIER_REFUSED` returns before category logic runs — recorded
  in UAC-27); e2e is a no-regression gate here, units carry the coverage.
- Units: an unrecognised category warns exactly once per distinct value; recognised
  categories never warn; a mixed recognised/unrecognised page returns a 200 body
  byte-identical to the same page before your change.
- **Every change mutation-proven** on a COMMITTED tree: delete the warn call → named
  test reddens; break the dedupe → named test reddens; each mutation surgical,
  typecheck-valid, reverted after.
- The PR body carries the owner's verification checklist as `- [ ]` checkboxes and names
  the paired relay PR.

## Resource budget (WSL — mandatory)

Every heavy command inside
`systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=1G --`,
`NODE_OPTIONS=--max-old-space-size=3072` on builds, strictly one at a time.

## Constraints

No comments in code; no skip flags; match the design-system seal; branch from `master`,
PR against `master`; English, first person, lowercase subject, no assistant signatures;
never stage `CLAUDE.md` or anything under `initiatives/`; **never call the live Нова
Пошта API** — every carrier fact you need is stated above.
