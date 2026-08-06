# ua-checkout — journal

Append-only. One entry per session/step.

## 2026-08-05 — initiative born: scope ratified on four axes

- Scoping session grounded in a read of the current checkout
  (`CheckoutForm`/`fields.ts`), the recovered bot contract
  (`extracted/bot-contract-index.js`) and the dictionaries. Finding: the current form
  is a US-style international form with Ukrainian labels (`country/state/city/address`
  free-text, `555-0100` placeholder, dual-purpose "Телефон / Нік у Телеграм" field) —
  adaptation means replacing the delivery model, not decorating it.
- User ratified the four scope axes via Q&A → **D-1** (NP-only carriers; en keeps the
  generic form; full contact pack; live NP API via proxy with fail-open fallback), and
  issued the requirements-first directive → **D-2** (form fields and bot payload are
  movable; contract reshapes via paired shop+bot steps). **D-3** (payload v2 vs
  additive) left OPEN for U1.
- Charter + U0–U7 plan seeded. Production-polish ledger tails folded in as SCHEDULED:
  DEF-36/37 (e2e), DEF-39 (cart decoder), DEF-41 (DS window). UAC-1 opened for the
  external NP key dependency.
- `initiatives/ACTIVE` switched from `production-polish` (COMPLETE since 2026-08-02;
  its board already points at the bot repo for the bot phase) to `ua-checkout` — one
  genuinely-driven track in this repo. The B2 prereq (x-relay-secret) is carried here
  as U0 so the pointer survives the switch.

## 2026-08-05 — U1 done: requirements + design brief; D-3 ratified (payload v2)

- НП API contract verified against two independent SDK mirrors
  (`maddsua/NovaPoshtaREST` typings, `daaner/NovaPoshta` docs) — the official portal
  403s behind Cloudflare (UAC-2 opened for the U4 re-check). Confirmed:
  `searchSettlements` (online city search, `{CityName, Limit, Page}`) and
  `getWarehouses` (`{CityRef, …}`, `CategoryOfWarehouse`, `DenyToSelect`,
  daily-refresh guidance straight from НП's own docs — our 24h server cache follows
  it).
- `requirements.md` written: three modes (uk-live / uk-fallback / en-generic),
  operator-driven field model (patronymic uk-only, contact channel chips, no email,
  no НП refs), +380 normalization rules, fail-open budgets, copy drafts (pre-submit
  expectations block + consent line), test matrix with the DEF folds.
- **D-3 RATIFIED** (planner engineering call, veto open): payload v2 — one
  discriminated envelope (`version: 2`, `customer`/`delivery.mode`/`source`),
  rollout bot-dual-accept → shop-flip → v1 drop. `cart/total/currency/locale`
  byte-compatible.
- `design-brief.md` written for the U2 Claude Design session: form flow, two new DS
  primitives to spec (async Combobox, ChoiceChips), full state matrix incl.
  uk-fallback and mobile. **Next: user drives the brief through Claude Design.**

## 2026-08-05 — scope add before U2: editable summary on checkout

- User finding: the checkout summary is read-only — cart edits force the
  header-icon → drawer hop. Verified: `CheckoutSummary` renders static rows while
  the drawer already composes DS `CartLine` (stepper + remove + ConfirmDialog), so
  the fix is pattern reuse, zero new DS primitives.
- Folded before the design session consumed the brief: charter (scope bullet +
  acceptance #8), requirements new §9 (in-place editing, live totals, empty-out
  transition, locked-while-pending, e2e list), brief (context + task section +
  states). Lands in U5 with the checkout rework; U2 designs the aside states.

## 2026-08-05 — second scope add before U2 restart: CartLine media fills the line

- User stopped the first design session to fold new findings; screenshot finding:
  drawer cart photos sit in a fixed 64×64 frame while the line is taller. Verified
  in DS `cart-line.tsx` (`h-16 w-16` pin inside a `grid-cols-[64px_1fr]` row).
- Directive folded into the brief (CartLine media polish section: full-line-height
  frame, drawer + summary, proportions to ratify), requirements §9 bullet, charter
  DS-window bullet. Implementation: U3 DS window. **User restarts the design
  session with the updated brief.**

## 2026-08-05 — U2 done: design ratified and exported (D-4)

- The design session delivered against the full brief; user ratified («мне всё
  нравится»). Export pulled via DesignSync from project UTG
  (`01558ea9-…`) into `design-export/`: the three-mode Checkout screen (locale ×
  npDirectory × submitOutcome tweaks), the Combobox/ChoiceChips/CartLine-amendment
  spec addendum, the rebuilt cart drawer, the НП directory mock, the prototype
  catalog+dict plumbing, dc-runtime.
- Export review: covers every brief item (UA flow, editable summary at 56px scale
  with pending lock, CartLine full-height media at both scales, expectations box +
  consent line, redesigned success state, error toast); copy matches requirements §6
  verbatim; seal intact (no token changes — screens link the ratified DS's embedded
  copy). One gap: uk name placeholders still John/Wick → UAC-3, fixes in U5
  dictionaries.
- **D-4 RATIFIED** — export is the visual SSOT; engineering-binding details recorded
  (portal-less combobox with 250ms/140ms timings, 44px chips, one CartLine with
  64/56 presets, controls-only pending dim, Прізвище→Ім'я order).
- Next: U3 (DS window) via /step. U0/B2 still pending, needed before U6.

## 2026-08-05 — U3 shipped: PR #18 squash-merged (`ac1b73a`), prod-verified; DEF-41 closed

- Full /step pipeline. Executor (opus) ran /feature from
  `step-u3-ds-window-prompt.md`; plan gate triaged same day → D-5 (one skeleton
  cadence 1.4s superseding the addendum's inline 1.2s; the summary preset shipped
  COMPLETE incl. `IconSize` {16,18}; `loading` naming; a11y supersets accepted).
- Independent deep review: request-changes — 76 pre-cap candidates → 24 reported
  (honest empty tail), 14 CONFIRMED with runtime reproductions: stale-selectable
  rows during the round-trip, Enter escaping to the enclosing form while busy,
  the pointer-reopen dead end, disabled-chip hover inversion, armed-debounce
  leaks on disable/blur. Its independent mutation stand exposed the first
  round's thin test floor (14/18 "what the code does" mutations survived, incl.
  deleting CartLine `media`/`total`/quantity callback on the live drawer).
- Fix round (same executor): all 14 routed items landed under D-6 (combobox owns
  the keyboard while open — prototype parity superseded; stale-frame kill by
  construction via `SearchPhase idle|pending|awaiting` with explicit consumer
  acknowledgment; chips `disabled:pointer-events-none`; ChoiceChips composes an
  extended `Field`; exact class-set pins). Honest mutation stand rebuilt: 175
  mutations, 147 killed; the 11 top survivors closed — four were real bugs
  (nameless cart line, never-clicked remove, chip missing `type="button"` — a
  submit trap for the future checkout form, unacknowledgeable `loading` arm).
- Planner verification (phase 6, own runs): lint / typecheck / prettier,
  485/485 units, zero-env build, 12/12 e2e — all green under memory fences;
  invariant greps + diff fence clean (13 files, src+tests only); five key fixes
  spot-verified at source. CI battery + Vercel preview green.
- Infrastructure surfaced by the round: master CI had been red since Aug 2
  (prettier vs initiatives prose — the whole battery was masked). Fixed by
  excluding `initiatives/` from prettier (`e1343e0`); the PR run was re-triggered
  on a fresh merge ref via close/reopen (a plain rerun reuses the stale SHA).
- User merged (squash `ac1b73a`). Prod verified live: Vercel success on the
  merge commit, four pages 200, the U3 CSS fingerprint (`min-h-11`) served from
  prod. **DEF-41 CLOSED** in both ledgers.
- Ledger deltas of the step: UAC-5/6/7 (review riders → U4/U5), UAC-8 (chip-base
  unification + fade-duration dedup → the DS-hygiene window with UAC-4).
- Next: U4 contour (NP proxy). U0/B2 still pending — must precede U6.

## 2026-08-06 — U4 shipped: PR #19 squash-merged (`a17aa30`), prod-verified

- Full /step pipeline. Contour ratified D-7 (warehouse filtering + row caps move
  to the proxy — UAC-5 resolved server-side; a Kyiv-sized list never reaches the
  client). Executor ran /feature from `step-u4-np-proxy-prompt.md`.
- **UAC-2 discharged the hard way**: the official portal 403s (Cloudflare) and the
  legacy devcenter is dead, so the executor substituted five independent sources
  including captured API-response fixtures. Three §4 corrections followed →
  **D-8**: `searchSettlements` rows are nested (`data[0].Addresses`, empty search
  is `TotalCount: 0`, not `data: []` — the U1 mirror typed it wrong); NP ships its
  own composed `Present` string, which supersedes our «MainDescription, Area»
  recipe (the recipe lost the raion — the disambiguator for same-named villages);
  values are string-encoded and NP answers HTTP 200 even on `success:false`. The
  settlements contract widened to `{ref,label,region?}` (the ratified combobox row
  has a meta slot; `label + ", " + region` rejoins `Present` losslessly), and the
  warehouse page-merge got 7s/10 pages against the settlement 2.5s.
- Independent deep review #2 (attempt #1 died on a session limit with no report):
  **88 pooled → 26 after refutation, no cap applied**; 14 sent to refuters →
  10 confirmed, 3 refuted, 1 split. Sacred `place_order` proven byte-identical
  three ways, including a 300k-operation differential fuzz between the old and new
  limiter (zero divergence) — the one thing that could have cost a real buyer.
- One consolidated fix round, all 15 routed items landed: page-merge dedup by
  warehouse number (a `Page`-ignoring carrier could merge one page ten times);
  the 10-page cap exit now REFUSES like the deadline does (D-8.3 read literally —
  serving two thirds of a city and caching it for a day is worse); a non-empty
  container decoding to zero rows is capability-down on both directories (it used
  to answer a cheerful 200-empty, which UAC-9 says the checkout must NOT treat as
  a fallback trigger); `DenyToSelect` regained the trimming the previous fix cost
  it; 30s negative TTL; concurrent-merge cap of 4 (moved out of the cache loader
  by the executor's own judgment so a transient shed never gets negative-cached);
  settlement cache 200→2000; invisible-character strip; `ref`/`number` caps;
  lowercased city key; the 429 response and the label caps extracted to shared
  modules; six ratified constants, the shared NP bucket and per-city separation
  pinned with mutation-proven tests.
- Planner verification (phase 6, own runs): lint / prettier / typecheck, 590 units
  / 27 files, zero-env build (both routes `ƒ (Dynamic)`, zero `.body` under
  `api/`, zero carrier-host strings in client chunks), blank-env e2e 15/15 — all
  green under the WSL fences; `place_order`'s diff is one import plus the shared
  429 helper.
- **The executor's own D-i premise was falsified twice** (its evidence was
  metadata-convention files, not route handlers; the reviewer rebuilt with the
  export deleted and both routes still printed `ƒ (Dynamic)`). `force-dynamic`
  stays as cheap insurance; D-8 carries the correction.
- Merged by the planner on the owner's explicit delegation («сделай мерж»).
  Prod verified: four pages 200, both directory routes answer the constant 503
  (correct fail-open with no key in Vercel yet), a bad `method` answers 400 —
  400 and 503 from one path also prove nothing was baked static.
- Ledger deltas: **UAC-11** (pre-existing limiter identity forgery — an empty
  `x-forwarded-for` makes the limiter fail open; NOT verifiable on the PR preview,
  which 302s behind Deployment Protection → probe at the U7 prod gate),
  **UAC-10** (Present edge guards + `server-only` boundary → U5), UAC-2 and UAC-9
  amended. `CLAUDE.md` corrected (it still claimed one API route and three env
  keys) — IR-25 closed.
- Next: U5 (checkout rework) — the big one. U0/B2 still pending, must precede U6.

## 2026-08-06 — U0/B2 shipped: PR #20 merged (`bb3f866`); the relay now authenticates

- **D-9 first** (user ruling): the bot leads, and U5 splits into U5a (contacts,
  copy, editable summary — where the payload flips to v2 with an honest
  `delivery.mode: "generic"`) and U5b (delivery). The cut is by *what the payload
  can truthfully say*, not by UI area: a form change and its payload change cannot
  be separated without either breaking prod checkout or packing structured data
  into legacy strings (the D-2 hack).
- U0/B2 ran as `/feature small`. Three rounds, and each one earned its keep:
  1. The executor's own review caught that the first cut never validated the
     secret as a legal header value — CR/LF or anything above Latin-1 makes
     `fetch` throw inside the existing `try`, i.e. **500 on every order**, and the
     `TypeError` message embeds the secret, which the `catch` logs. A dashboard
     paste artifact would have taken ordering down and written the shared
     credential into runtime logs.
  2. It also proved a redirect leak (cross-origin 307 hands hop two the header
     AND the full order; a control `authorization` is correctly stripped) but
     refused to fix it blind, because nobody knew what `PLACE_ORDER_URL`
     resolves to. **The planner resolved it** — pulled the prod env: the value is
     the bare relay deployment URL, answering 405 with zero redirects. `redirect:
     "error"` ratified as D-10, and BD-5's standing unknown in the bot repo is
     retired.
  3. The independent review (22 → 18 after dedupe, no cap) returned merge-ready
     behind a blocking operator gate, which the planner discharged by measurement
     (no trailing slash on the URL — a stray one becomes `//place_order`, which
     Vercel 308-normalizes *before* app code and would be a total outage under
     the new redirect rule; the stored secret is 43 printable-ASCII chars). Its
     sharpest finding: adding a `/g` flag to the module-scope regex kept the whole
     suite green while a warm lambda would serve `[200, 503, 200, 503, …]` — the
     suite only ever did one POST per fresh module load, a shape production never
     has. Also that `toHaveBeenCalledWith` is undefined-blind, so a regression
     emitting the key with an `undefined` value would pass while putting the
     literal string `undefined` on the wire as our credential.
- All eight routed items landed with red-then-green mutation evidence, plus one
  granted fence extension: the same `redirect: "error"` on the NP client, whose
  POST body carries the NP key (there a wrong guess degrades safely — the
  directory is fail-open by construction).
- Planner verification: lint / prettier / typecheck, 611 units / 28 files,
  zero-env build, blank-env e2e 15/15, diff fence clean.
- **Rollout executed by the planner** (Vercel CLI installed into a user-local
  prefix; the dashboard has no MCP surface for env vars): secret generated
  server-side, written to a 600-mode scratch file, never echoed; set on `utg`
  Production as Sensitive BEFORE the merge so the merge deploy bound it; relay
  env set after the shop deploy went live.
- **INCIDENT (planner error, ~3 minutes, no customer impact).** To activate the
  relay's env I ran `vercel redeploy` against the first URL from `vercel ls
  --prod`, assuming newest-first. It was an ancient pre-B1 deployment: the alias
  moved to the legacy Express implementation and every `POST /place_order`
  answered 500 (`Cannot read properties of undefined (reading 'map')`,
  `Legacy server listening…`). Caught within seconds by the verification probes,
  restored with `vercel promote` back to `dpl_FhXuNF…`. **Verified by data, not
  assumption**: runtime logs grouped by status over six hours show exactly the ten
  requests the planner made and **zero 200s** — no real order touched the window.
  **Lesson: never redeploy by list position — resolve the deployment that is
  actually serving production (its logs carry `branch=master`) and redeploy that
  one by id.** The correct redeploy then activated enforcement.
- **Enforcement verified end to end without a single Telegram message**: the
  relay answers 401 with no header and with a wrong header, and 400 with the
  correct one (validation reached = auth passed); then an invalid probe payload
  POSTed to the PROD shop route came back **400, not 401** — proving the shop's
  header is accepted, while the payload was rejected before anything reached the
  operators' chat.
- Ledger: **DEF-13 CLOSED** (shop ledger — the currency read shipped in B1 and the
  B2 promotion is now live) and **BDEF-1 CLOSED** (bot ledger — the relay is no
  longer unauthenticated). New: UAC-12 (pre-existing unbounded upstream body
  buffering + verbatim `Content-Type` echo, surfaced by the review).
- Next: **B3 in the bot repo** — the relay dual-accepts v1 + v2 (requirements §5).
  It gates U5a. Then U5a → U5b → U6.
