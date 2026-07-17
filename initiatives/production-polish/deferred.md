# production-polish — deferred

Carry-forwards: findings/obligations not yet scheduled, with disposition + status.
**Promote here at every gate.**

**Status:** `OPEN` (live) · `SCHEDULED` (assigned to a step) · `CLOSED` (done) · `DROPPED` (decided not to).

| ID    | One-liner | Disposition | Status |
| ----- | --------- | ----------- | ------ |
| DEF-1 | Exchange-rates fetch: no caching/revalidation; step 0 only adds fail-safe fallback | shipped in step 1: `next: { revalidate: 3600 }` + step-0 guards | CLOSED |
| DEF-2 | Order payload has no explicit `currency` field; `total` is sent in display currency — bot contract semantics were unclear | bot source recovered (`extracted/bot-contract-index.js`): bot formats `total` via the same locale→currency map, so current client behavior matches the contract exactly; payload changes now possible in coordination (bot is user's own repo) but out of scope | CLOSED |
| DEF-3 | `IProduct.sizes` exists in data but has no UI; cart items don't carry size | size selector + size-aware cart identity in step 4b | SCHEDULED |
| DEF-4 | `POST /api/place_order` has no rate limiting / abuse protection (spam → Telegram) | decide in step 5/6 window whether in scope for a volunteer shop | OPEN |
| DEF-5 | `react-hooks/exhaustive-deps` disabled globally in `.eslintrc.json` | re-enable + fix violations in step 2 (hooks get reworked there) | SCHEDULED |
| DEF-6 | Build warns: browserslist caniuse-lite outdated | fold into step 3 upgrade | SCHEDULED |
| DEF-7 | Favicon hot-linked from Firebase Storage with token; no `public/` dir at all | local static assets in step 5 | SCHEDULED |
| DEF-8 | Unknown locale path (e.g. `/fr/...` typed directly) crashes `getDictionary` at runtime — no `dynamicParams = false` / fallback | shipped in step 1: `dynamicParams=false` + `notFound()`; `/fr/*` and unknown slugs verified 404 | CLOSED |
| DEF-9 | Home hero photo (`hero/utg-hero-3.JPG`) sealed in Firebase Storage (402; Blaze upgrade demands $30 prepay — user filed a support ticket instead) | step 1 ships a stopgap hero from recovered assets; original swapped in by a later commit if/when support releases the files; step 4a redesigns the hero regardless | OPEN |
| DEF-10 | 1.0 catalog marks all 6 t-shirts out of stock; patches+stickers available — is that still true? | user confirmed 2026-07-17: yes, current reality — static catalog ships these flags as-is | CLOSED |
| DEF-11 | `quality={0}` on the CartItem image (executor finding, step-0 plan review) | image hygiene pass in step 4b | SCHEDULED |
| DEF-12 | `place_order` 500 body leaks `details: errorMessage` (may contain relay host); upstream error bodies forwarded raw to browser (step-0 reviewer finding, pre-existing pattern) | shipped in step 1: `details` removed from client-facing 500 | CLOSED |
| DEF-16 | Step-1 reviewer nits for step-2 hygiene: `error.tsx` swallows the error object (add `console.error(error)`); `resolveLocale` lives in the data barrel (client error boundaries import `@root/data`) — move next to `formatPrice` or a `locale.ts` | fold into step 2 (locale/state rework touches both) | SCHEDULED |
| DEF-17 | framer-motion is now an unused dependency (LoadingContainer deleted in step 1) | remove with the D-9 dependency sweep in step 4a | SCHEDULED |
| DEF-13 | Rates-down + `en` checkout: payload sends UAH-magnitude `total` with `locale: en`, so the Telegram message renders it as `$` — operator-facing only, users see correct ₴ after step 1 | coordinated payload+bot `currency` field (bot is user's own repo); revisit after step 4c | OPEN |
| DEF-14 | Design kit invented good NEW UI copy that must flow into real dictionaries at implementation: mission line, out-of-stock message, order-success note (no online payment), reports intro, uk form labels, size/description labels | copy from `ui_kits/storefront/data.js` into `{uk,en}.json` during steps 4b/4c — do not re-invent | SCHEDULED |
| DEF-15 | 404 page not built in the design kit (honestly declared out of kit scope) | built by the design session on planner punch-list (band + uk copy + outline CTA, unknown routes land there) | CLOSED |

## Detail on the live ones

**DEF-9.** The hero renders at ~1000px on the home page. Firebase demands a $30 Blaze
prepayment to unseal Storage; user went the support-ticket route (2026-07-17), outcome
and timing unknown. Non-blocking by design: everything else the site needs is already
recovered (see inventory above) — the Blaze window would only have added the hero
original, a full-res logo, and Firestore doc verification. Step 1 must not wait for it.


**DEF-4.** The endpoint is an open relay to a Telegram chat. Low stakes (volunteer shop),
but a bot/spam pass could flood the order channel. Options when scheduled: naive
in-memory rate limit, Vercel WAF rule, or accept the risk and DROP.

## Closed history

(none yet)
