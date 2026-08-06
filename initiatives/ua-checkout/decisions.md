# ua-checkout — decisions

D-numbered ratified decisions. Step-level calls that don't merit a full ADR live here;
cross-initiative architecture calls go to the project's ADR home (none kept — this file
is it). **Promote here at every gate** — a decision that lives only in scratch or an
external chat is not durable. This file is the SSOT for "why."

**Status legend:** `RATIFIED` (decided + acted) · `OPEN` (awaiting ratification — do not
execute past it) · `SUPERSEDED` (replaced — kept for the trail).

## Index

| ID  | Topic                                                             | Status   |
| --- | ----------------------------------------------------------------- | -------- |
| D-1 | MVP scope: the four ratified axes                                 | RATIFIED |
| D-2 | Requirements-first: form + bot contract are movable               | RATIFIED |
| D-3 | Payload v2: one discriminated envelope, bot dual-accept rollout   | RATIFIED |
| D-4 | U2 ratified: design-export is the visual SSOT                     | RATIFIED |
| D-5 | U3 plan-gate: one skeleton cadence; summary preset ships complete | RATIFIED |
| D-6 | U3 review round: Enter consumption supersedes prototype parity   | RATIFIED |
| D-7 | U4 contour: proxy-side warehouse filtering + row caps (UAC-5)     | RATIFIED |
| D-8 | U4 plan-gate: Present verbatim, region in the contract, 7s merge  | RATIFIED |
| D-9 | Bot-first sequencing; U5 splits into U5a (contacts) + U5b (delivery) | RATIFIED |

---

### D-1 — MVP scope: NP-only · en generic · full contact pack · live NP API with fail-open fallback

- **Status:** RATIFIED (user, 2026-08-05, scoping Q&A).
- **Decision.**
  1. **Carriers:** Нова Пошта only (відділення / поштомат / кур'єр); "хочу Укрпоштою"
     goes into the comment field.
  2. **en locale:** keeps the current generic international form (country / city /
     address free-text); the UA flow ships on uk only.
  3. **Contact pack — all four:** +380 mask/normalization/validation; contact-channel
     chips (дзвінок / Telegram / Viber); optional по батькові; personal-data consent
     one-liner.
  4. **NP directory:** live API through our server-side proxy (key in env, cached),
     with automatic free-text fallback when the key is absent or the API fails.
- **Rationale.** NP covers ~95% of the market and is the only carrier with a
  practically obtainable free API key; en buyers are arranged manually by the operator
  anyway; the dual-purpose "Телефон / Нік у Телеграм" field made operators guess the
  channel; a live directory is the only one that survives wartime branch churn, and
  fail-open keeps ordering alive on a prod that takes real orders.
- **Links.** journal 2026-08-05; charter.

### D-2 — Requirements-first: the current form fields and bot payload are not constraints

- **Status:** RATIFIED (user, 2026-08-05: "нет ничего замороженного, отталкиваемся от
  требований к чекауту, а не к написанному коду").
- **Decision.** The order-information model is derived from what the operator needs to
  fulfil a Ukrainian order — not from the recovered 1.0 field set
  (`country/state/city/address`). The bot contract is ours to reshape: changes land as
  paired shop+bot steps with contract tests on both sides, never by packing structured
  data into legacy string fields.
- **Rationale.** The bot is the user's own repo and is mid-rewrite (bot-polish B1
  shipped) — this is the one window where an honest contract costs almost nothing;
  packing "НП №23" into `address` would freeze a hack into a sacred contract.
- **Links.** journal 2026-08-05; production-polish D-12 (currency field precedent).

### D-3 — Payload v2: one discriminated envelope for all modes, bot dual-accept rollout

- **Status:** RATIFIED (planner engineering call, 2026-08-05; user veto open — flag
  raised in the session summary).
- **Decision.** The order payload becomes a v2 envelope (`version: 2`) with
  `customer{first_name,last_name,patronymic?,phone,contact_channel}` and a
  discriminated `delivery.mode`: `np_branch`/`np_postomat` (city, warehouse,
  warehouse_number), `np_courier` (city, street, building, apartment?), `generic`
  (en: country, state?, city, address) — plus `delivery.source:
"np_directory"|"manual"`. `cart`/`total`/`currency`/`locale` stay byte-compatible
  (D-12, DEF-3 size-in-title). No НП refs, no email (requirements §2). Rollout: bot
  ships dual-accept (v1+v2) → shop flips all three modes to v2 → bot drops v1 in a
  follow-up. Exact shape: `requirements.md` §5.
- **Rationale.** Additive extension would carry dead fields (`state`, a hardcoded
  `country` for uk) and invite packing structured data into legacy strings — the
  exact hack D-2 forbids; a discriminated union gives the bot one trivial template
  per mode and gives contract tests one honest shape to pin; the bot mid-rewrite
  (B1 shipped) makes dual-accept nearly free, and `version` makes the rollout
  window explicit instead of key-sniffing.
- **Links.** requirements.md §5; journal 2026-08-05; production-polish D-12, DEF-3.

### D-4 — U2 ratified: the design export is the visual SSOT for U3/U5

- **Status:** RATIFIED (user, 2026-08-05: «дизайнер отработал, мне всё нравится»;
  export pulled the same day).
- **Decision.** `design-export/` in this directory is the visual SSOT for the DS
  window (U3) and the checkout rework (U5). Engineering-binding details ratified with
  it: the Combobox is **portal-less** (in-flow panel, border-fuse `margin-top:-2px`,
  debounce 250ms, blur-grace 140ms, focus-opens-list); ChoiceChips are radio-semantic
  chips at 44px touch height; **one CartLine, two scale presets** (drawer 64px /
  summary 56px), media frame stretches to full line height; the summary's pending
  lock dims controls only (opacity .45); uk field order is Прізвище → Ім'я; the
  success screen gains the flag-yellow check tile; submit errors surface as the
  existing error Toast bottom-center. Copy in the prototype dict = ratified strings
  (matches requirements §6), except the uk name placeholders (UAC-3).
- **Rationale.** Same regime that made 4a–4h converge in production-polish: one
  ratified visual source, implementation matches it, deviations need a new decision —
  prevents per-PR design relitigating.
- **Links.** design-export/README.md; component-specs-addendum.md; journal
  2026-08-05.

### D-5 — U3 plan-gate rulings: one skeleton cadence; the summary preset ships complete

- **Status:** RATIFIED (planner, 2026-08-05, U3 plan-gate triage; digest to the user
  the same day).
- **Decision.**
  1. The Combobox panel's loading bars compose the DS `Skeleton` at its shipped
     **1.4s** cadence; the addendum's inline **1.2s** is SUPERSEDED. One pulse
     system-wide — the DEF-41 principle (no skeleton forks) applied forward. Named
     in the PR body as a knowing D-4 deviation.
  2. `CartLine scale="summary"` ships **complete** in U3 per the addendum's summary
     note — py-2.5 rhythm, gap-1.5, `type-small` title, 28px remove control with a
     16px icon (`IconSize` widens by {16, 18}) — overruling the executor's
     ship-geometry-only recommendation. A half-preset would force U5 to reopen the
     sealed DS to finish it (scope smear over two steps), and the values are
     ratified export constants, not invented pixels. Visual confirmation still
     lands at the U5 browser gate.
  3. Minor: the async-state prop is `loading` (codebase dialect, matches `Button`);
     no `helper` passthrough on Combobox (additive later if U5 wants it);
     executor's a11y supersets accepted (aria-activedescendant, WAI roving
     tabindex on chips, keyboard-gated scrollIntoView, panel anchored to the input
     wrapper so the border fuse survives an error line).
- **Links.** step-u3-ds-window-prompt.md; addendum §Combobox/§CartLine + summary
  note; D-4; journal (U3 close-out).

### D-6 — U3 review-round rulings: correctness beats prototype parity

- **Status:** RATIFIED (planner, 2026-08-05, routing the deep review of PR #18).
- **Decision.**
  1. **The combobox owns the keyboard while its panel is open**: Enter never
     reaches the enclosing form (busy, empty, or with rows — select only when an
     active row exists), arrows never scroll the page. This supersedes the
     ratified prototype's behavior (Enter during the debounce window submitted
     the form) — a mock artifact, not design intent; the reviewer browser-proved
     it submitting the real checkout form shape. UAC-7 amended accordingly.
  2. **The stale-results kill must live inside the component**: the
     required-`loading` contract is insufficient (async `onSearch`,
     `setQuery`+`useEffect`, and `startTransition` consumers all leave a rendered
     clickable frame of the previous query's rows — reviewer-reproduced). The
     internal pending state persists from dispatch until the consumer
     acknowledges (`loading` flips true, `options` identity changes, or the
     query empties).
  3. **Panel `z-30` under the sticky header (`z-40`) is not a defect**: the
     overlap only occurs once the anchor input itself is under the header, where
     the control is already unusable; raising the panel above site chrome would
     be worse. Watch at the U5 browser gate (UAC-7).
  4. **Deferred, not silently dropped**: RF-15 (chip cva forked from
     SizeSelector — the addendum's "promoted" intent) and RF-19 (300ms settle
     fade duplicated between Skeleton and ReportsScreen) go to UAC-8, one DS
     hygiene window with the UAC-4 kit backport — theme/tokens were frozen in
     U3 and SizeSelector is untested, so touching it now would widen the fence
     at the end of a long round.
  5. `ChoiceChips` composes an extended `Field` (additive optional wiring for a
     non-input labelled group) instead of carrying byte-copied internals —
     manifesto "extract on the second instance"; existing `Field` consumers stay
     byte-identical.
- **Links.** PR #18 deep review (journal, U3 close-out); D-4; D-5; UAC-7/UAC-8.

### D-7 — U4 contour: warehouse filtering moves to the proxy (UAC-5 resolution)

- **Status:** RATIFIED (planner engineering call in the U4 contour; user approved
  2026-08-05 «контур ок»; amends requirements §4).
- **Decision.** The warehouse number/substring filtering happens at OUR proxy,
  inside OUR cached per-city list, and the response is capped (~30 warehouse rows;
  settlement search likewise capped ~10). This supersedes §4's original
  "client-side filtering within the fetched list" bullet. Postomat-vs-branch
  filtering is server-side too, via a `method` query param mapped to
  `CategoryOfWarehouse`. The proxy's minimized response shapes
  (`{ref, label}` settlements / `{number, label}` warehouses) are the U4↔U5
  contract, pinned by route units. The in-memory per-instance cache is accepted as
  best-effort (Fluid Compute instance reuse makes it real; no external store —
  "no database" is sacred).
- **Rationale.** Both rationales of the original client-side bullet survive: no
  per-keystroke NP calls (the ~24h cache serves) and no dependence on unverified
  NP server-side filters (the filter is our code over our cache). What changes is
  who holds the full list: a big-city list (Kyiv ~3000 warehouses) never reaches
  the client — UAC-5's measured row budget (~23ms/hover at 1000 rows) is enforced
  in one place, the server, instead of leaking into U5 consumer code and hundreds
  of kilobytes of payload.
- **Links.** UAC-5; requirements §4 (amended bullet); step-u4-np-proxy-prompt.md;
  journal (U4).

### D-8 — U4 plan-gate rulings: NP truth over U1 mirrors; the contract widens by one field

- **Status:** RATIFIED (planner, 2026-08-05, U4 plan-gate triage; digest to the user
  the same day). Grounded in the executor's UAC-2 re-check: the official portal
  403s (Cloudflare) and legacy devcenter is dead — substituted by five independent
  sources incl. captured API response fixtures.
- **Decision.**
  1. **The settlements contract is `{ref, label, region?}`** (warehouses stay
     `{number, label}`) — amends D-7's two-field shape. The ratified addendum's
     city rows show a right-aligned region meta (the DS `ComboboxOption` already
     carries a `meta` slot), and the split is lossless: `label + ", " + region`
     reproduces NP's `Present` verbatim — exactly the string §5 puts in
     `delivery.city`. U5 could not widen a shipped route contract without
     reopening it.
  2. **NP's own `Present` string supersedes §4's «MainDescription, Area» recipe**
     (split on the first `", "`; recipe stays as fallback when `Present` is
     absent). The recipe lost the raion — the load-bearing disambiguator for
     same-named villages; zero invented composition remains anywhere in the stack.
  3. **The warehouse page-merge gets a 7s deadline + 10-page hard cap**
     (settlements keep ~2.5s) — amends §4's blanket «~2–3s». Kyiv ≈ 3000
     warehouses over 6–7 sequential 500-row pages; a 2.5s whole-merge budget
     denies the largest cities autocomplete forever. Paid once per city per 24h
     behind the combobox loading bars; a partial merge is refused (503, nothing
     cached).
  4. Bundle accepted with the executor's design: `export const dynamic =
     "force-dynamic"` on both routes (verified: a GET-only route module in Next 16
     is statically prerenderable — the blank-env CI build would bake the 503 into
     the deploy artifact and keep serving it after the key lands in Vercel);
     blank/short `q` answers 200-empty, never 400 (the combobox fires a
     focus-search with an empty value — a 400 would trip U5's fallback flip on
     plain focus); limiter: one shared NP bucket at 60/60s, `place_order`
     byte-identical at 5/60s with import-line-only test edits as the proof;
     DEF-36 via per-spec `x-forwarded-for` identities in one frozen record with an
     import-time uniqueness throw (source-verified: Next's `??=` lets an explicit
     header win — the limiter was already live in the battery, one shared bucket);
     the blank-env e2e spec ships — 400 and 503 from the same path is the only
     runtime proof a static body wasn't baked; cache single-flight with rejection
     cleanup (acceptance item), settlement empties cached, warehouse empties NOT
     cached (an attacker-supplied ref would evict the real cities for a day);
     README corrected in the PR, `CLAUDE.md` left to the planner's close-out.
  5. One PR, no warehouse split — 26 files sits within /feature size; the extra
     round trip costs more than the smaller review saves.
- **Amendment (2026-08-06, PR #19 deep review IR-21).** The D-i premise in ¶4
  («a GET-only route module in Next 16 is statically prerenderable») was
  FALSIFIED twice over: the executor's own review round showed its original
  evidence was metadata-convention files, not route handlers, and the
  independent reviewer rebuilt with the export deleted — both routes still print
  `ƒ (Dynamic)` on Next 16.2.10, no `.body` artifacts. `force-dynamic` stays as
  cheap insurance against future Next behavior changes, but the premise is not
  verified fact; the commit body of `27ad0d1` carries the stale claim (pushed
  history, left as-is).
- **Links.** D-7; requirements §4/§5 (amended same day); UAC-2 (residual → U7);
  UAC-9 (U5 handoff pack); step-u4-np-proxy-prompt.md; journal (U4).

### D-9 — Bot-first sequencing, and U5 splits by payload truthfulness

- **Status:** RATIFIED (user, 2026-08-06, post-U4 contour Q&A: «сначала бот» +
  «резать на два»).
- **Decision.**
  1. **The bot leads.** Nothing in the shop that changes the order payload merges
     before the relay accepts it. Order of work: **U0/B2** (shop-side
     `x-relay-secret` sender — payload-neutral, merges immediately) → **B3, new in
     bot-polish** (relay dual-accepts v1 + v2 per requirements §5) → U5a → U5b →
     U6 (now shrunk to: bot drops v1, contract tests pinned on both sides).
  2. **U5 splits into two steps, cut so that each PR ships a TRUTHFUL payload** —
     not by UI area:
     - **U5a — contacts, copy, summary**: recipient names in the ratified order,
       uk-only patronymic, +380 normalization (§3), contact-channel chips, consent
       line, pre-submit expectations block, dictionaries with real UA placeholders
       (UAC-3), the editable order summary (§9) with the pending lock, plus riders
       DEF-39 and UAC-6. **This is where the payload flips to the v2 envelope**,
       with `delivery.mode: "generic"` for BOTH locales — which is the literal
       truth at that point, since uk delivery is still the generic free-text set.
     - **U5b — delivery**: method chips, the two NP comboboxes on the U4 proxy,
       runtime per-capability fallback (§1), courier fields, and the `np_branch` /
       `np_postomat` / `np_courier` delivery variants with the `source` flag —
       plus riders UAC-7, UAC-9, UAC-10.
- **Rationale.** A form change and its payload change cannot be separated without
  either breaking prod checkout or packing structured data into legacy string
  fields — the exact hack D-2 forbids. Cutting by *what the payload can honestly
  say* means every merge point is shippable to a prod that takes real orders:
  U5a's `generic` mode is not a placeholder, it describes the delivery model the
  uk form still has. The alternative cut (delivery first) would have forced either
  an invented `contact_channel` or a v1 bridge. Splitting also halves the review
  surface — U3 produced 76 pre-cap candidates at half of U5's scope.
- **Links.** D-2; D-3 (rollout order); requirements §1/§5/§9; bot-polish plan
  (B2, and B3 to be opened there); journal 2026-08-06.
