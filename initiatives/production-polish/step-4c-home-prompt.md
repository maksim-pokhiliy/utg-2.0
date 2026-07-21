# Step 4c — Implement the Home page per the ratified D3.1 design (executor prompt)

Precondition: the step-4b (DS alignment) PR is MERGED — do not start before; both steps touch the design system.
Invocation: paste everything below into the executor tab as one message.

---

/feature small Step 4c of the production-polish initiative: re-compose the Home page per the ratified page design. The design system is sealed and frozen — this step composes existing DS exports plus two sanctioned DS additions (a labeled icon-link treatment and a numbered category tile), and touches nothing else.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-10 + addendum, D-11), `deferred.md`. **The page spec is `initiatives/production-polish/design-export/screens/home/`** — `home-reference.md` (structure, verbatim copy, mapping notes) + `Home.dc.html` (the ratified prototype source; its inline styles are the medium — your implementation renders the same result from DS exports and token utilities). The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner.

**Scope:**

1. **Two DS additions** (barrel-exported, visual state fully DS-owned, per the prototype):
   - A labeled icon-link treatment (Instagram row: icon + mono-caps label, min-height 48px) — extend `IconLink` or add a sibling; your API call.
   - A **numbered category tile**: `utg-card`-spec link — square media on top, body row of mono caption number (ink-faint) + display-caps name (`--text-h3`, grows) + `arrow-right` icon. Reused by the catalog page in a later step.
2. **Home page** per the reference, replacing the current transitional composition (`HomeScreen`): hero (three-line `Ukrainian/Tactical/Gear` wordmark in the hero type, skull logo absolute right/bottom `clamp(120px,26vw,300px)`, heavy rule, stamp caption + mission paragraph left, accent `Button` with trailing `arrow-right` → **in-page anchor `#merch`** + Instagram labeled icon-link right), merch band (`id="merch"`, h2 title + band-muted counter caption), category grid (`auto-fit minmax(240px)` of numbered tiles, data + order from the catalog module — nothing hardcoded). Header/Footer unchanged (header logo renders ~38px tall — sizing polish, not a new component). Page stays a fully static server component; the anchor needs no JS.
   - The hero photo slot from the prototype (`heroPhotoSrc` swapping out the skull) is FUTURE (DEF-9) — ship the skull path only, structured so the swap is a trivial later change; do not add a prop surface for it now.
3. **Dictionary keys** (both locales, verbatim from the reference's copy table): hero stamp, hero mission (the split mission line), band counter. Reuse existing `main.get` (CTA) and `shared.merch` (band title); category names come from the catalog module. Remove any home-only keys the old composition leaves orphaned (grep before deleting).
4. **Image hygiene on this page**: tiles with proper `sizes` for the grid, logo `priority` (above the fold), no full-size overfetch.

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint / `prettier --check` / zero-env `yarn build` green; route table unchanged (all pages SSG); all six seal greps zero.
- View-source `/uk` and `/en`: wordmark, stamp, mission, counter, and all three category names server-rendered; no client fetch.
- Both locales in the browser: CTA scrolls to the band; tiles navigate to their categories; Instagram opens in a new tab; layout holds at 375px and 1200px+ (flex-wrap rows per the prototype); no hydration warnings.
- Only Home (+ the two DS additions + dictionaries) in the diff — no other screens, no chrome rework, no checkout/cart/catalog-data changes.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
