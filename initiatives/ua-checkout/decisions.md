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
| D-10 | U0/B2 rulings: the relay fetch refuses redirects; secret scope Production-only | RATIFIED |
| D-11 | Orders become durable: relay persistence (bot B4) + `idempotency_key` from U5a | RATIFIED |
| D-12 | B4 closed on a falsified premise; probe external ceilings before speccing | RATIFIED |
| D-13 | U5a rulings: payload truth ships, and three tests that lied get killed | RATIFIED |
| D-14 | U5b contour: the warehouse search delegates to the carrier | RATIFIED |
| D-15 | U5b PR A: split the step, strip at the boundary, recognise ≠ offer | RATIFIED |
| D-16 | The negative cache stores the carrier's word, never our own | RATIFIED |
| D-17 | Carrier distress is read by `errorCode`, never by English prose | RATIFIED |
| D-18 | `method` leaves the cache key; an option id is not the carrier's ref | RATIFIED |
| D-19 | The forwarding route mirrors the relay's STATUS and never its body | RATIFIED |
| D-20 | A read may inherit the client's abort; a write may not | RATIFIED |
| D-21 | A deletion is authorised structurally; a bound comes from the callee | RATIFIED |
| D-22 | A page that yields rows is a successful page; pickup points are offered | RATIFIED |

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

### D-10 — U0/B2 rulings: the relay fetch refuses redirects; the secret is Production-only

- **Status:** RATIFIED (planner, 2026-08-06, U0/B2 review-round triage).
- **Decision.**
  1. **`redirect: "error"` on the relay fetch.** The executor proved that a
     cross-origin 307 hands hop two both the `x-relay-secret` header AND the full
     order payload (name, phone, address, cart), while a control `authorization`
     header is correctly dropped — so the platform's own protection does not cover
     our header. It flagged the fix as too risky to apply blind because nobody knew
     what `PLACE_ORDER_URL` resolves to. **The planner resolved it:** the value is
     the bare Vercel deployment URL `https://telegram-bot-server-maksim-pokhiliys-projects.vercel.app`
     (no custom domain, no apex→www hop), and it answers `405` on the exact relay
     path with zero redirects — measured. The legitimate path never redirects, so
     refusing redirects costs nothing and closes a real leak. A future redirect
     (custom domain, protection page) now fails loudly as a 500 with the cart
     preserved instead of silently shipping a customer's order to another host.
     This also retires the bot-repo BD-5 uncertainty («the live `PLACE_ORDER_URL`
     value is recorded nowhere») — it is recorded here now; it is a public URL,
     not a secret.
  2. **Trim over verbatim** (superseding the step prompt's "forwarded verbatim"):
     `fetch` strips surrounding whitespace before the wire and the relay trims
     again, so both paths put the identical string on the wire; carrying two
     variables for one result is worse.
  3. **The printable-ASCII guard stays tight** (stricter than the Latin-1 the wire
     allows): our secret is generated `token_urlsafe`, so the strictness costs
     nothing and the guard exists to stop a paste artifact from writing the shared
     secret into runtime logs via a `TypeError` message.
  4. **README and `.gitignore` scope accepted**: three README statements were
     about to start lying, and `.env*` (keeping `.env.example`) closes a
     committable `cp .env.example .env` — now carrying a fifth credential.
  5. **The secret is set on Production only** (planner set it in Vercel the same
     day, project `utg`, marked Sensitive). Consequence accepted knowingly: once
     the relay enforces, checkout on preview deployments answers 401 — which also
     stops previews from posting test orders into the operators' real chat.
     Reversible with one command if a browser gate ever needs preview checkout.
- **Recorded consequence (PR #20 review, RF-11).** With `redirect: "error"` the
  relay's own `3xx` responses — 301/302/303/307/308, with or without a `Location`
  header — now surface as our 500 with the cart preserved, where master forwarded
  them to the browser. Measured clean: `300` and `304` are not redirect statuses,
  so the null-body branch (204/205/304) is untouched, and 401/405 still forward
  verbatim. Accepted: the relay is a JSON API that has no reason to redirect, and
  a loud failure beats a silent hand-off of a customer's order to another host.
- **Gate discharged (2026-08-06).** The review made the merge conditional on two
  dashboard values nobody had read. Planner measured both from the pulled
  production env: `PLACE_ORDER_URL` carries no trailing slash (a stray one would
  become `//place_order`, which Vercel's CDN 308-normalizes BEFORE app code runs —
  a total checkout outage under `redirect: "error"`, a class master silently
  self-healed), and the stored `ORDER_RELAY_SECRET` is 43 printable-ASCII
  characters equal to its own trim. A defensive trailing-slash strip ships anyway:
  the field is human-editable and the failure mode is 100% of orders.
- **Links.** PR #20; bot-polish BD-4 (enablement order), BD-5 (now resolved);
  UAC-11 (the fail-open limiter now guards an authenticated path); UAC-12 (the
  pre-existing body/Content-Type forwarding, surfaced by the same review);
  journal.

### D-11 — Orders become durable: the relay persists them, and U5a mints an idempotency key

- **Status:** RATIFIED (user, 2026-08-06, after correcting the planner: «никакой базы»
  was never a project law — the owner has managed Postgres (Neon, paid) available;
  the planner had wrongly imported this initiative's `any database` non-goal into the
  bot repo as an axiom and used it to justify deferring BDEF-3).
- **Decision.**
  1. **The relay will persist every decoded order** — bot-polish step **B4**, after
     B3. Write first, then send to Telegram. **The store must never gate the send**:
     a database that is down costs an audit row, never an order. Fail-open is not a
     nicety here, it is the whole safety argument for touching the sacred path at all.
  2. **The v2 envelope gains an optional top-level `idempotency_key`** (UUID),
     minted by the shop when the buyer first submits and REUSED across retries of
     that same order, reset only on success. Emitted by **U5a** — the step already
     rewriting the payload composer — even though nothing consumes it until B4. The
     relay decodes and carries it from B3 onward.
  3. **No decoder on either side may reject a v2 body for unknown fields.** Unknown
     keys are ignored; known keys are validated strictly. Without this rule every
     future additive field becomes a breaking paired change.
- **Rationale.** The motive is not deduplication — it is that **a delivered order is
  durable nowhere today**. Its only trace is a message in a Telegram chat, and one
  operators' chat has already died once (bot journal, 2026-08-03), taking its history
  with it; if a send fails, the buyer sees an error and the order simply evaporates
  with no replay path. A duplicate order costs a phone call; a lost one costs a
  volunteer donation. Persistence also makes BDEF-3 nearly free (a unique index over
  the key, or a content hash within a time window). Emitting the key in U5a rather
  than later is close to zero cost — the shop rewrites that composer anyway and the
  relay ignores unknown fields — while deciding it later would mean a second paired
  shop+bot change.
- **Links.** requirements.md §5; bot-polish BDEF-3 and its B4 step;
  D-3 (the v2 envelope); journal 2026-08-06.

### D-12 — B4 closed on a falsified premise; the U5a gate lifts; probe external ceilings before speccing

- **Status:** RATIFIED (user, 2026-08-08 — "мержим, все решения зафиксированы"; the
  user also named the process defect first: "шаг выполнен, после чего проведена
  разведка под этот шаг").
- **Decision.**
  1. **The B4 gate on U5a's merge is LIFTED.** Bot B4 shipped (bot PR #3 `7594e94`),
     and the width danger it was gating against turned out not to exist. **U5a is
     unblocked outright** — build and merge on its own schedule.
  2. **B5 (persistence) does NOT gate U5a.** U5a leaves orders exactly as durable as
     they are today, so this is a priority call, not a correctness gate. Ruling:
     **U5a next, B5 immediately after**, because U5a is the initiative's purpose and is
     fully unblocked, while B5 carries an external dependency (a provisioned Neon
     database and its connection string) that needs owner wall-clock time anyway — so
     that request goes out NOW and ripens in parallel. Note the counter-argument on the
     record: U5a's deploy is the riskiest moment in this initiative, and persistence
     would make a bad new-shape order recoverable rather than lost.
  3. **Reconnaissance that gates a step runs BEFORE the step prompt.** When a step's
     justification rests on an external system's behavior — a carrier API, a messenger's
     limits, a platform's semantics — the planner probes that system live before writing
     the prompt, and cites the probe in it. A documented contract is a hypothesis; a live
     response is evidence. This binds every remaining step.
  4. **Applied immediately to Нова Пошта.** U4 was built against substitute fixtures
     because the portal 403s, and UAC-1/UAC-2 scheduled the live-key proof at U7 — i.e.
     AFTER U5b builds comboboxes on an unverified response shape. The key request goes to
     the operator now, and the live Kyiv directory is probed and reconciled against
     requirements §4 **before U5b starts**, not at the prod gate.
- **Rationale.** B4's whole case was a table the planner measured personally: a saturated
  v1 order at 4092–4203 raw UTF-16 against Telegram's 4096. The measurement was correct
  and the ceiling was assumed — the Bot API applies 4096 AFTER entities parsing, and ~980
  units of our message are markup that parsing consumes. A single live POST (4178 raw
  UTF-16, delivered, relay 200) falsified it, and it was run last, after an executor
  round, an xhigh review round and a fix round. Measuring one side of an inequality to
  the unit while assuming the other is worth nothing. The fix still merged, on the
  narrower claim that raw UTF-16 upper-bounds all four candidate metrics — but the
  ordering it justified (B4 ahead of persistence) was a planner error, and it cost
  orders a round of non-durability.
- **Links.** bot-polish journal 2026-08-08, BDEF-4 (falsification trail), BDEF-8 (the
  metric the probe could not discriminate, worth ~980 units of cart room); D-9, D-11;
  UAC-1, UAC-2.

### D-13 — U5a rulings: payload truth ships, and three tests that lied get killed

- **Status:** RATIFIED (user, 2026-08-08 — "мержим"). Shipped as PR #21 `9099402`,
  prod-smoked end to end through the live shop route (200, v2 + `idempotency_key` +
  `generic` under `locale: "uk"`, delivered to the operators' chat).
- **Decision (plan-gate rulings).**
  1. **No live phone mask** — a masked placeholder only. A mask is a caret/paste/autofill
     bug farm that fights `type="tel"`, and the normalizer already accepts every form a
     mask would produce. NOT carried forward as debt: if wanted, decide it against the
     form's final shape after U5b.
  2. **`cart.phone_invalid` added.** «Обов'язкове поле» on a filled field is the form
     lying to a volunteer about what is wrong — a defect, not a copy preference.
  3. **en placeholder `+1 202 555 0100`.** The ratified `555-0100` is rejected by the
     new en rule; a field must not advertise a value it refuses.
  4. **Ratified copy verbatim, except the en expectations ending takes §6's "at carrier
     rates".** The prototype's "at Nova Poshta rates" states something false for an
     en-generic order. Prototype wins on style, requirements win on fact.
  5. **The README screenshot is NOT regenerated** — U5a deliberately ships a uk checkout
     that is not the ratified design (generic delivery until U5b), so regenerating buys
     one stale screenshot replaced by another a step later. It regenerates with U5b.
  6. **UAC-12 defers to U6** on revert-unit hygiene: U5a's deploy is the riskiest moment
     in this initiative, and an unrelated proxy hardening sharing its revert unit means
     rolling back one rolls back both.
  7. **The design export has no authority over a validation rule.** Its uk check
     ("≥12 digits") rejects `0671234567`, the commonest national form; `requirements.md`
     §3 is the SSOT and wins. The export governs the visual, not the contract.
- **Decision (review-round rulings).** The independent review pooled 70 raw candidates →
  28 distinct → 21 reported, no cap binding. Four were blocking and all are fixed:
  1. **A raw NUL byte made the phone contract a binary file.** Invisible to `git diff`,
     to the web diff, to `git log -S` and to `grep` — the 161-line table deciding who may
     place an order was the one file in the PR no human could read, and lint, prettier and
     vitest all passed over it. **CI structurally cannot catch this class.**
  2. **An unbounded cart quantity lost the order.** A 19-digit quantity pushed `total`
     into exponential notation (`1.2e+21`), which the relay's `isPlainDecimal` rejects
     outright — a hard 400 behind a generic toast. Clamped at `normalizeQuantity`, the one
     funnel every entry point passes through, mirroring the relay's `MAX_QUANTITY`.
  3. **Three tests stayed green over broken code** — the phone table did not pin the
     trunk-prefix rule, the e2e quantity lock proved an attribute rather than a guard
     (React drops `onClick` on a real `disabled` button), and a test named for "hydration
     always finishes" left the one hole that makes the name false. All three are now
     mutation-proven red before being restored.
  4. **The phone normalizer must strip `\p{Cf}`.** The decisive argument was not the
     character class but that this codebase ALREADY strips invisibles one field away
     (`np/settlements/directory.ts`), so the same paste cleans the city and is refused by
     the phone — and the refusal is STICKY, because the form never rewrites the value.
- **Decision (a hard constraint on B5).** The `idempotency_key` deliberately spans an
  order the buyer EDITED between retries: D-11 says reset only on success, and re-minting
  on a cart change would resurrect the exact duplicate the key exists to prevent.
  Therefore **B5 must never deduplicate on the key alone.** Key-only dedupe would answer
  200 to a corrected order that was never delivered, and the shop would show the success
  screen and clear the cart. Dedupe on a content hash within a time window; the key is a
  hint, not an identity.
- **Also ruled:** the uk phone rule accepts landlines and does NOT police operator
  prefixes (§3 amended — a stale prefix list rejects a valid volunteer's number, which
  costs a real order, while a landline costs nothing).
- **Links.** PR #21; requirements §2/§3/§5/§6/§9; D-1, D-9, D-11, D-12; UAC-14…UAC-17.

### D-14 — U5b contour: the warehouse search delegates to the carrier

- **Status:** RATIFIED (user, 2026-08-08 — "подтверждаю контур").
- **Evidence first, because it overturns a ledgered fix.** UAC-13 recorded the Kyiv
  page-merge failure and prescribed "pace or retry inside the existing 7s budget".
  A live probe with the operator's key, run BEFORE this step was specced (D-12), shows
  that prescription is wrong: pacing at 600ms does clear NP's rate limit — pages 1–8 all
  succeed where page 2 previously failed — but **Kyiv reports 12 298 warehouse points**,
  about 25 pages against a 10-page cap, and page 9 dies on OUR deadline rather than NP's
  limit. The merge is not slow, it is impossible: D-8's "Kyiv ≈ 3000 warehouses" estimate
  was low by 4×. Meanwhile `FindByString` answers in one page in 0.9–3.2s.
- **Decision.**
  1. **The warehouse proxy stops owning the corpus.** Delete the page-merge and the ~24h
     whole-city cache; delegate the substring match to NP via `FindByString`; cache by
     `(city, method, query)` with a short TTL. **Superseded in part by D-18**: `method`
     was never in the upstream body, so the key dropped to `(city, query)` and one cached
     page now serves both chips.
  2. **D-7 stands and is not weakened.** The category filter, the row cap, the
     `DenyToSelect` refusal and every failure decision stay in our code. What moves to
     the carrier is the SEARCH, not the policy. The original D-7 rationale "no dependence
     on unverified NP server-side filters" is retired — the filter is now verified — and
     the other rationale, keeping a huge city list off the client, is served better by
     never fetching it.
  3. **The settlements proxy surfaces two more fields**: the `Warehouses` count and
     `AddressDeliveryAllowed`. Without them the UI cannot honestly say which delivery
     methods exist in the chosen settlement, and both genuinely vary in live data.
  4. **UAC-15 lands before any delivery UI.** `CheckoutForm.tsx` is 315 LOC against a
     300 bar and U5b adds a whole delivery surface to it; extracting first costs nothing,
     extracting after is a rewrite.
  5. **Product rulings** (recommended in the contour, ratified with it; owner may veto
     either at the browser gate): an empty warehouse query returns the first capped page
     rather than requiring two characters, so a buyer who does not know their branch
     number never meets an empty control; and a method the carrier does not offer in that
     settlement renders DISABLED WITH A SHORT REASON rather than hidden — a missing chip
     reads as a bug, a disabled one with a line of text reads as a fact about the city.
- **Rationale.** This is the second time in two days that probing an external system
  before writing the prompt changed the step rather than confirming it (the first was
  B4's falsified width premise). The cost of the probe was minutes; the cost of speccing
  the ledgered fix would have been a full round producing a proxy that still cannot serve
  Kyiv, discovered at the browser gate or, worse, in production.
- **Links.** UAC-13 (corrected in place); requirements §4 (amended with the measurements);
  D-7, D-8, D-12; journal 2026-08-08.

### D-15 — U5b PR A rulings: split the step, strip at the boundary, recognise ≠ offer

- **Status:** RATIFIED (planner rulings inside the ratified D-14 contour; user merged PR A
  2026-08-08, "мержи А"). Shipped as PR #22 `25c58d7`, prod-verified.
- **Decision.**
  1. **U5b ships as TWO PRs.** The executor leaned to one at ~50 files; overruled. Its
     strongest counter — "two browser gates" — does not survive: PR A has no UI, so it
     needs no browser gate at all. The real cost is one extra review round, and this
     initiative's evidence is that the review round is where order-loss defects surface
     (U5a's review found a 400-on-submit path in a 28-file diff). Review quality degrades
     with diff size. PR A also deploys as a pure no-op because nothing consumes the
     routes, so it carries near-zero deploy risk.
  2. **Invisible characters are stripped at `readString`, not at the call sites.** The
     ledger's UAC-17 rationale was about the CARRIER's labels, not our queries: D-8's
     "`Present` verbatim" means *do not recompose it from parts*, never *forward bidi
     controls into a combobox where they can reorder a branch number in front of the
     buyer*. The relay's B4 sanitizer closes this from the operator's side; this closes
     it from the buyer's. Placing it in `readString` — whose every consumer is
     carrier-derived, verified — covers future fields by construction.
  3. **Recognising a category and offering it are different things.** Offered stays
     `Branch` + `Postomat`. Recognised adds `Cargo`, attested by a repo fixture rather
     than invented. So a page of only-`Cargo` rows is an honest 200-empty, and a page
     where NOTHING is recognised is a 503 — the carrier changed under us. **RETIRED by D-22, 2026-08-21:** it was meant to detect the carrier changing its format, and what it actually detected was a settlement using a category nobody had enumerated — a normal fact about villages. It cost 2 of 10 sampled villages a false outage. The rest of item 3 stands: recognising and offering remain different things. Without that
     split, a vocabulary change would answer an empty list forever, with PR B's
     fallback never tripping because it keys on 503.
  4. **`number | null` over a `-1` sentinel** for the warehouse count: an in-band
     sentinel in a numeric field renders by accident ("-1 відділень"), `null` is
     compile-enforced at the consumer.
- **The merge gate, and a correction I owe the ledger.** The reviewer refused the PR's
  "pure no-op deploy" claim: merging binds the operator's paid carrier key behind a
  limiter UAC-11 records as possibly bypassable. Investigating it showed the exposure
  already existed — **the key bound at U5a's deploy an hour after I set it**, not "when
  U5b needs it" as UAC-1 claimed. The claim was literally true and wrong in consequence.
  Resolution: merge on merits (PR A reduces harm — it fixes a live prod 503), and
  **UAC-11 moves from the U7 gate to before PR B merges**, because PR B is what brings
  real buyer traffic. The limiter is confirmed alive for honest clients: 59 × 200 then
  429 with `retry-after: 34`.
- **Links.** PR #22; D-14, D-7, D-8; UAC-1 (corrected), UAC-10/13/17 (closed),
  UAC-11 (rescheduled), UAC-18, UAC-19; journal 2026-08-08.

### D-16 — The negative cache stores the carrier's word, never our own

- **Context.** PR B's first fix round made an over-cap or damped refusal answer with the
  same value a real carrier failure carries. It became a 30s negative cache entry, so our
  own load-shedding was served back as "Нова Пошта is down" — while the carrier sat idle
  and healthy. Three amplifications nobody had priced: it crossed routes (a warehouse
  burst black-holed the settlements route's hottest query), it outlived the damper by up
  to 30s, and two to three concurrent buyers reach the fan-out cap at the measured 3.2s
  upstream latency. The client's one-way latch turned that into a whole session in free
  text.
- **This overturns a planner ruling made one round earlier.** At the plan gate the
  planner accepted negative-cached refusals on the reasoning that a refusal correlates
  with an outage. For the fan-out cap that is simply false — there is no outage at all,
  only us declining to spend. The reviewer did not re-litigate the ruling; it brought new
  information, which is the right way to reopen one.
- **Decision.** The negative cache stores what the CARRIER said about a key. It must
  never store what WE decided about ourselves. An over-cap refusal, a damped refusal and
  the missing-key path answer 503 and write nothing. A genuine carrier verdict about that
  key — "City not found" included — and a transport failure stay negative-cacheable,
  because both reached the wire and taught us something.
- **Made structural, not remembered.** Refusal is a distinct `CARRIER_REFUSED` symbol
  (`src/app/api/np/refusal.ts`) that the cache is type-incapable of storing; the
  directories collapse it to `null` only AFTER the cache has been passed. Verified by the
  re-reviewer: deleting the `isCarrierRefused` guard in `cache.ts` is a compile error
  (TS2345), so this is enforced by the compiler rather than by discipline.
- **And the client must be able to recover.** The hook latched `source` to `"manual"`
  with no path back — and the literal fix was dead code, because `onSearch` is wired only
  into the combobox, so a field that has flipped to free text can never issue another
  request. Three seams close it: the transport retries ONCE on a 503 or a connection that
  never landed (never on a 429 or an abort); a free-text field probes on blur; and a
  search that returns ROWS un-latches its own channel. Rows, not merely a 200 — in free
  text the buyer has usually typed a whole address that matches nothing, and an empty
  answer proves the route replied, not that the directory can serve them.
- **Cost, stated rather than discovered later.** During an outage the retry doubles load
  on OUR route and spends the buyer's 60/60s bucket twice as fast. Bounded, because those
  retries are answered locally by the damper or the negative cache — the carrier sees no
  amplification at all.
- **Links.** PR #23; RF-1a/RF-1b; D-17, D-18; UAC-23; journal 2026-08-11.

### D-17 — Only the carrier's own distress may damp our calls, and it is read by error code

- **Context.** `NpResult.isSuccess` collapsed transport failure and *the carrier
  rejecting our own input* into one flag, so three bogus-but-well-shaped city refs armed
  a global 30s blackout of both routes. Worse, because no attempt runs while damped, no
  success could reset it — roughly six requests a minute held the whole directory dark
  indefinitely. The commit message already claimed "three consecutive TRANSPORT failures";
  the code could not mean it.
- **This overturns a second planner ruling from the same gate.** The planner approved
  arming on `success:false` because it was "the one outage signal we have actually
  measured". A live probe then found we do not have to guess.
- **Measured live, 2026-08-11, production API with the operator's key.** A well-shaped
  bogus `CityRef` answers `success:false` / `errors:["City not found"]` /
  **`errorCodes:["20000900768"]`**. The very next call ~1s later answers `success:false` /
  `errors:["To many requests"]` / **`errorCodes:["20000401501"]`** — the carrier throttles
  from the SECOND rapid call, confirming UAC-13's measurement, and it returns
  machine-readable codes.
- **Decision.** Classify on the code, never on English prose. `NpResult` is three-way —
  rows, **distress**, **rejected** — and only distress arms the damper. Distress:
  timeout, network throw, any 5xx, HTTP 429, an unparseable payload, and `success:false`
  carrying `20000401501` (code primary, its literal accepted as a fallback). Rejected:
  every other `success:false`, `20000900768` included, **and every non-429 4xx** — a 4xx
  about our own request is the same class in HTTP form. A rejected answer resets the
  consecutive count, because a carrier that answers us is demonstrably not down.
- **The conservative direction is mandatory.** An unknown throttle code means we fail to
  arm and keep hammering — bounded by the fan-out cap, which is merely the pre-damper
  behaviour. The opposite error blacks out the directory for every buyer. **Never widen
  this classifier to "unknown code ⇒ outage".**
- **One residue, ruled and recorded rather than quietly taken.** `success:true` with a
  `data` we cannot parse stays distress: a carrier whose successful responses we cannot
  parse is one we cannot serve any buyer from, so damping costs nothing and saves calls we
  could not have used. The re-reviewer disagreed, holding that the conservative direction
  admits no exception. Kept as a decision with the disagreement attached — see UAC-23(1),
  which is the row to re-read the day Нова Пошта changes a response shape.
- **Links.** PR #23; RF-2; D-16, D-18; UAC-13, UAC-23; requirements §4; journal 2026-08-11.

### D-18 — `method` leaves the cache key, and the option id stops being the carrier's ref

- **Context.** Two independent findings, both about identity.
- **Decision 1 — the warehouse cache keys on `(city, query)`.** `method` was in the key
  but never in the upstream body, so flipping the delivery chip re-downloaded a
  byte-identical page. One cached entry now holds both categories' final answers and the
  split happens on read; the row cap applies PER CATEGORY after the split, so a city whose
  first rows are all branches still yields its lockers. Entry cap 500 → 250, because an
  entry doubles from ≤30 rows to ≤60 — the worst-case footprint is unchanged.
- **Decision 2 — the cache key is length-prefixed.** Dropping `method` did not merely void
  UAC-19(4)'s separator proof, it opened a real attacker↔BUYER collision: a buyer
  searching `q=a|b` in city `uuid` and an attacker sending `city=uuid|a&q=b` produce the
  same joined key. `composeCacheKey` now length-prefixes every component, injective by
  construction — verified by the re-reviewer by constructing a decoder over 1 126 366
  round trips. The `city` shape guard is the second, independent barrier.
- **Decision 3 — a settlement row's option id is not its carrier ref.** `ref` is
  `DeliveryCity`, a CITY-level id several settlements can legitimately share, and the
  click was resolved by it — first match wins. A review captured a courier order posted to
  the wrong OBLAST carrying `source: "np_directory"`, i.e. "no need to verify". Fixed at
  the UI seam with one shared encoder composing the id from row index and ref, never by
  deduping: deduping would drop a legitimately distinct settlement, and the shared ref is
  CORRECT for the warehouse lookup, which is city-level.
- **Reachability measured, and it is not observed.** `searchSettlements` at the production
  `Limit:10` over eight of Ukraine's most common village names — Іванівка, Новоселівка,
  Мирне, Степове, Петрівка, Романівка, Богданівка, Слобідка — returned **80 rows with
  `DeliveryCity` distinct in every one**, including two rows carrying `Warehouses: 0`
  (the only shape that could collide). `Ref != DeliveryCity` in all 80. The fix ships as
  precautionary: the mechanism is proven even where the trigger is not, and the downside
  is a wrong-oblast order that looks verified.
- **Links.** PR #23; RF-3, UAC-18(3), UAC-19(4); D-14 (superseded in part); journal
  2026-08-11.

### D-19 — The forwarding route mirrors the relay's STATUS and never its body

- **Context.** U6's shop half bounded `POST /api/place_order` with a deadline, a body cap and a
  sealed content type, and to do it grew a hand-rolled streaming reader over the relay's answer.
  The independent review then asked one question nobody had: **who reads that body?**
- **Measured answer: nobody.** `CheckoutForm.tsx` is the only caller and reads `response.ok`
  alone — no `.json()`, no `.text()`, no header. No e2e asserts on it. Nothing in either repo
  consumes it.
- **Decision.** The status is the relay's to give; the body is always ours. The relay's body is
  never read — it is cancelled on the spot. Every answer the route emits carries
  `application/json` + `X-Content-Type-Options: nosniff`.
- **What that deleted.** Nine of the review's twenty-seven findings existed only because we read
  a body nobody looks at — including a real defect where a body-read rejection unwound past an
  already-captured `status`, so a relay that had **explicitly accepted the order with 200** was
  reported to the buyer as a failure (5/5 reproducible). With the reader gone the defect is
  unreachable, along with the multi-chunk assembly, the content-type allowlist and the whole
  "we print a JSON label over someone else's bytes" class.
- **Consistency, not novelty.** `CLAUDE.md` already said this route's 500 body "carries no
  internal details". D-19 makes the posture total instead of partial.
- **Links.** PR #24; RF-1, RF-2, RF-8, RF-12…RF-14, RF-17…RF-20, RF-26; journal 2026-08-20.

### D-20 — A read may inherit the client's abort; a write may not

- **Decision.** The buyer's `request.signal` is deliberately NOT chained into the order forward.
  A buyer who closes the tab has not said "cancel my order" — and since B5 the relay persists
  every decoded order BEFORE its Telegram send, so an abort mid-forward would abandon work that
  is already durable on the other side.
- **The symmetry is the point.** UAC-20 records the OPPOSITE disposition for the Нова Пошта
  directory reads, where an abandoned keystroke SHOULD stop costing a carrier call. One rule,
  two directions: cancelling a lookup loses nothing, cancelling a write loses an order.
- **Links.** PR #24; UAC-20; D-11, D-13; journal 2026-08-20.

### D-21 — A deletion is authorised structurally; a number that bounds a call comes from the callee

- **Context.** U6 deleted the relay's v1 path outright — no shim, no deprecation window, no
  "v1 answers an error for a while" phase (owner ruling: *«удаляй агрессивно и сразу»*).
- **What authorised it, and what did NOT.** The safety argument is structural: `isAuthorized`
  runs BEFORE `readBody`, `ORDER_RELAY_SECRET` is set in production, and the one secret-holder
  has sent v2 only since U5a. **The `orders` table was NOT evidence** — it holds zero rows by
  design (B5 deleted its smoke rows), and forensic counters confirm it: identity high-water 9,
  lifetime 6 inserts / 6 deletes. An empty audit table is not evidence of absence, and the step
  prompt says so in as many words.
- **The invariant a deletion leans on must be pinned in the tree that deletes.** "Auth precedes
  the body" was unpinned: moving `isAuthorized` below the decode left 389/389 green. It is now
  a test (`never reads the body of a caller it is about to reject`).
- **Numbers come from the callee.** The forward's deadline was first set at 10s from "a buyer's
  patience". Measured against the relay's own constants — store 2 000 + Telegram 10 000 +
  mark 2 500 ≈ **14 500 ms worst-case SUCCESSFUL path** under its own `maxDuration: 30` — 10s
  would have converted slow successes into false failures. Ruled to 20s with `maxDuration` 25,
  strictly above, so the party that knows the work is the one that gives up on it. Live
  confirmation after merge: a real prod order round-tripped in **2.32 s**.
- **Links.** PR #5, PR #24; D-19, D-20; BDEF-9; journal 2026-08-20.

### D-22 — A page that yields rows is a successful page, and pickup points are offered

- **Context.** The U7 browser gate found this on PRODUCTION, not in a test. Settlements whose only
  Нова Пошта presence is a pickup point were told the directory is unavailable:
  `с. Романівка, Бердичівський р-н` reports `warehouseCount: 3` from our settlements route while
  our warehouse route answered **503**, because its page is `{DropOff: 1, Store: 1}` and the
  recognised set held only `["Branch","Postomat","Cargo"]`. **2 of 10 sampled villages** hit it;
  in 5 more, `Store`/`DropOff` rows were silently dropped from lists that did work.
- **Owner ruling.** Offer them — «мы делаем честный и чистый сервис». Saying «нічого не знайдено»
  where a pickup point exists is a lie to the buyer.
- **Decision.** The recognised vocabulary is the six values measured live (`Branch, Postomat,
  DropOff, Store, Fulfillment, Cargo`). `Відділення` serves **Branch + DropOff + Store**;
  `Поштомат` serves `Postomat`; `Cargo` and `Fulfillment` are recognised-and-never-offered — a
  freight terminal and a merchant warehouse are not where a buyer collects a t-shirt. Measured on
  the live carrier: both `DropOff` and `Store` carry `DenyToSelect: "0"`,
  `WarehouseStatus: "Working"`, a usable `Number` and a 30 kg cap.
- **D-15 item 3's "nothing recognised ⇒ 503" arm is RETIRED, and that is what outlives today's six
  values.** It was meant to catch format drift; it caught a village. **A page that yields rows is a
  successful page** — if none are offerable, the honest answer is 200-empty. Drift detection stays
  with the arm that means it: a container decoding to zero rows.
- **Dedupe stays PER CATEGORY, the categories merge after it.** One chip serving three categories
  makes `Branch №5` and `DropOff №5` meet for the first time; a cross-category dedupe would
  silently drop a real point. Ordering is (exact-match rank, then the category's index in the
  chip's array) — rank dominates, so an exact match on a `Store` outranks a non-matching `Branch`.
- **The invariant that must not be undone.** `DecodedWarehouse.category` stays a bare `string`.
  Narrowing it makes an unknown category fail to decode → `decoded.length === 0` with
  `rows.length > 0` → the SURVIVING drift arm fires → the 503 returns through the other door,
  silently reversing this decision. Guarded twice: the naive half is a compile error, and the full
  edit reddens two named tests — verified independently by the planner and by the reviewer.
- **Accepted residual, eyes open.** Retiring the arm removes the only detector of the carrier
  RENAMING its vocabulary; a case-drift now yields a silent 200-empty where master gave a loud 503.
  Accepted on D-17's asymmetry — a wrongly-armed detector blacks out the directory for every buyer,
  a missing one costs bounded degradation to free text. The measured drift was an extension, not a
  rename.
- **Links.** PR #25; D-7, D-14, D-15 (item 3 partly superseded), D-17, D-18; UAC-27; journal
  2026-08-21.

