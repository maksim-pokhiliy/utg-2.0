# production-polish — journal

Append-only. One entry per session/step.

## 2026-07-17 (evening) — Firebase outage discovered, de-Firebase pivot, content rescued, step-0 plan approved

- User directed dropping Firebase ("проект отлично ездит на Vercel"); investigation revealed prod is partially down: Storage 402s every image (Spark plan stopped serving; user can't even export without paying), `GET /api/categories/[id]` 504s reproducibly. Only the top-level categories endpoint works.
- Content rescue: public `utg-1.0` GitHub repo contained ALL images (products, reports, about, favicon, logos) **plus the full catalog as static config** — richer than Firestore (descriptions, sizes, report captions). UTG logo recovered from Wayback (640px via Vercel optimizer cache). Only gap: home hero photo (DEF-9). Everything staged in `extracted/` with inventory README.
- Order-bot source recovered (public `utg-tg-order-bot` repo → `telegram-bot-server` on Vercel) — DEF-2 CLOSED: contract fully documented; current client payload matches it exactly.
- D-7 RATIFIED: no Neon — static typed catalog in repo (data never changed in project life), images in `public/`. Step 1 rescoped to Rescue/de-Firebase + RSC; charter acceptance criteria updated (zero Firebase footprint, env → 3 keys).
- Step-0 executor plan reviewed: on-spec, scope fence respected, honest verification plan. Its gate question (money fallback) resolved as option X = coefficient→1 (D-8); the wrong-symbol corner case explicitly reassigned to step 1's gates.
- New deferred: DEF-9 (hero), DEF-10 (t-shirt availability confirm), DEF-11 (CartItem quality={0}, executor finding).
- Blaze-window harvest cancelled: Firebase demands $30 prepay to unseal Storage; user filed a support ticket. Confirmed non-blocking — all step-1 inputs are already recovered; DEF-9 stopgap plan stands, DEF-10 falls back to user memory.
- DEF-10 CLOSED: user confirmed availability flags (t-shirts all out of stock, patches+stickers in stock).
- Design track added on user's initiative: D1 (system primitives) + D2 (screen prototypes) via Claude Design, running parallel to code steps 1–3, gating 4a–4c. Briefs written (`design-1-primitives-prompt.md`, `design-2-screens-prompt.md`). D-4 ratified at brief level (keep + sharpen brutalism); final gate = prototype review. D-9 RATIFIED: shadcn/ui on Tailwind as component layer (user delegated; retires Flowbite, notyf, body-scroll-lock, swiper).

## 2026-07-17 (night) — Step-0 PR planner-approved; step-1 prompt issued

- Step-0 PR #2 (7 commits, 18 files) reviewed by executor's max-level code review (2 real bugs found+fixed: 204-null-body crash, rate=0 pass-through) and an independent reviewer (approve, 4 minor findings). Planner re-verified independently: file list clean of planner artifacts, all key diffs read, `--frozen-lockfile` consistent, tsc/lint green, `yarn build` green with no `.env.local`, zero `setTimeout` left. Verdict: approve; merge delegated to user (squash recommended).
- Reviewer findings routed: details-leak → DEF-12 (scheduled step 1), rates-frozen-at-build fact → folded into step-1 revalidate work (DEF-1), $-glyph corner → already D-8 (step 1 is SSOT, not "step 2" as PR text says), coefficient-default nit → dies with Recoil in step 2.
- Bonus recovery: 1.0 repo carries **Ukrainian translations for product titles + t-shirt descriptions** — copied to `extracted/translations-1.0-{ua,en}.json`; the step-1 static catalog becomes properly bilingual (Firestore never was).
- New: DEF-13 (rates-down en checkout → `$` on UAH total in operator Telegram message; coordinated payload+bot fix later — bot repo is user's own).
- `step-1-rescue-prompt.md` written: static catalog + local images + RSC + de-Firebase + D-8 terminal money fix + DEF-8/DEF-12 + cart-key bump (stale carts hold dead firebasestorage URLs that would crash next/image after remotePattern removal).
- PR #2 squash-merged by user (`04fbbf9`), remote branch pruned. Step 0 CLOSED. CLAUDE.md refreshed to post-step-0 reality (env-tolerant boot, no setTimeout note, Vercel prod noted). Step 1 unblocked.

## 2026-07-17 (late night) — Claude Design delivered D1+D2 in one shot; planner file-review done

- User authorized DesignSync (`/design-login`); project `62bf007e-1ea9-45bc-a40a-f64544314e8c` "UTG Design System" connected (planner's stray `claude mcp add` reverted — DesignSync is the sanctioned interface).
- Claude Design consumed BOTH briefs from the uploaded folder (its readme cites `design-1-primitives-prompt.md`/`design-2-screens-prompt.md` + decisions D-4/D-9) and generated: full token set (shadcn CSS-var aliases, hex, light theme), 19 components (core/forms/commerce/layout incl. Icon wrapper), 17 guideline cards, vendored fonts, and a clickable bilingual storefront kit (all D2 screens except 404; EN via live switcher; About lives in Reports.jsx).
- Planner file-level review (readme, colors.css, typography.css, data.js, kit README): direction absorbed faithfully — warm paper #FFF9F6 / warm ink #181512, border=ink, ring=flag-blue, radius 0, claimed-AA pairs; type = Oswald 600 caps (display) + IBM Plex Sans (body) + IBM Plex Mono caps (meta/prices — "paperwork voice", smart addition); Lucide icons 2px stroke; amateur-photo treatment (1:1, 2px ink frame, out-of-stock 45% grayscale). Honest-tone guardrails held (no invented report captions).
- Data-faithfulness punch list issued to user for the design session: (1) «With You» patch is actually titled «Death» in the 1.0 catalog (only real violation); (2) uk tee titles must use Чорна/Зелена/Сіра per recovered translations, not English color words; (3) set title verbatim "Set of «Waiting, Welcome, Death»", not "Set of Three Patches"; (4) «Death» tees are missing their descriptions (1.0 has all six). Optional: 404 (DEF-15).
- New: DEF-14 (kit's good new UI copy → real dictionaries in 4b/4c), DEF-15 (404 design gap).
- Visual ratification of D-4 remains with the user in the Design UI (planner reviewed files, not pixels).
- User challenged the punch list ("текст не важен, вставим свой"); planner conceded the data-as-data half (items 1–2 dropped — implementation reads `extracted/`, not design `data.js`) and held the design-load half: prototype text is the layout's test data — the catalog's longest title (set) and longest descriptions (out-of-stock «Death» tees) must exist in the prototype or the review validates nothing. User accepted the trimmed 2-item list.
- Design session applied it: set title verbatim, all six tee descriptions, FPV caption re-anchored to report 3, «Death» patch self-corrected from source (the dropped item fixed itself via verbatim discipline), 404 built → DEF-15 CLOSED. Remaining: uk tee descriptions (the mount predates the translations extraction — planner process gap; Desktop copy refreshed, strings handed over via chat).

## 2026-07-17 (later) — Step-1 Gate A approved with one amendment

- Executor's research/design/plan reviewed: localized-views catalog module (canon {uk,en} → server resolves → flat views via props; category names move out of `dictionary.categories`), App-Router-literate 404 design (`dynamicParams=false` on `[lang]`, root-not-found fallback only if the build proves it needed — preserves per-locale `<html lang>`), faithful uk patch titles (= English strings, none invented), Reports/About stay client with URL swaps only, LoadingContainer deleted (dead after RSC), framer-motion orphan flagged not removed (4a), good pre-existing find: cross-locale money staleness (locale switch keeps the old coefficient — Recoil initializeState runs once; step-2 fixes).
- Amendment: copy ALL 13 product photos incl. `stickers1.JPG` — unused by the 1.0 catalog but referenced by the ratified design kit (sticker product card), and `public/` becomes the asset SSOT once `extracted/assets/` is deleted post-step-1; shipping 12 would strand 4b.

## 2026-07-18 — Step-1 PR #3 planner-approved

- Executor delivered 11 atomic commits (incl. stickers1 amendment); its max code-review fixed 4 findings (favicon middleware guard — real, self-introduced; summaries-vs-views payload slimming; dedup; Promise.all) and correctly rejected 4 with initiative context. Independent reviewer: approve, 5 low findings.
- Planner re-verified everything locally: tsc/lint green, `yarn build` with zero env green (45 static pages, catalog ●SSG, readable slugs `patches/waiting`…), zero firebase in tracked files, `firebase.json`/`.firebaserc` gone, cart key bumped to `utg-cart-v2`, `revalidate: 3600` present, no `details` in place_order 500. Runtime smoke on :3011: uk titles in view-source, `/en` with rates down shows ₴ only (the reviewer-visible `$12` matches are RSC flight-payload refs like `"error":"$12"`, verified not prices), `/fr/*` 404, unknown slug 404, favicon 200, `/api/categories` 404, «Death» tee page renders uk description + «Немає в наявності», all 13 product images shipped.
- Reviewer findings routed: (1) cart image relative path — REFUTED as issue: bot source (extracted/bot-contract-index.js) consumes only title/quantity/productUrl, image field is dead weight in the payload; (2)+(3) resolveLocale placement + error.tsx swallow → DEF-16 (step 2); (4) redirect-then-404 for `/fr` — accepted cosmetic; (5) stickers1 "unused" — intentional per Gate A amendment.
- Reviewer highlight worth keeping: step 1 incidentally fixed latent never-seeded `languageState` (en pages previously linked to /uk and formatted uk). DEF-1/DEF-8/DEF-12 CLOSED; DEF-17 new (framer-motion orphan → 4a). Merge delegated to user (squash).
- Merged as `49acce7` (−1731 net lines). **Prod rescue confirmed live** on ua-tactical-gear.com: Vercel auto-deployed master (deployment READY), planner smoke-tested production — uk titles in source, product images 200 direct + through optimizer, `/en` shows real USD (rates env live on Vercel), product pages 200. The outage (Firebase 402/504) is over; site fully functional for the first time since Storage was sealed.
- CLAUDE.md rewritten to post-step-1 architecture (static catalog, SSG pages, single API route, local assets, money model + known staleness quirk). `step-2-state-prompt.md` issued.

## 2026-07-18 — Design lane CLOSED; step-2 in flight

- Design session finished remaining items (uk tee descriptions pasted); user visually reviewed the full kit and approved. **D-4 fully RATIFIED**; the Claude Design project is the visual SSOT for 4a–4c. No further designer prompts — all surfaces incl. 404 exist; reopen point-wise only if 4b finds gaps.
- User proposed commissioning a "first page prototype" — planner corrected: prototypes already cover every page (approved minutes prior); nothing to commission. User's port-first instinct confirmed as the existing plan: 4a ports the system (shadcn init, tokens verbatim via DesignSync, primitives as owned components), 4b/4c compose ONLY those primitives — per-page styling is banned by scope fence.
- Plan refined: Tailwind 3→4 folded into 4a (shadcn init rebuilds the styling layer anyway; keeping step 3 = Next 16 + React 19 + DEF-6 only), framer-motion drop (DEF-17) assigned to 4a explicitly. Sequence stands: 2 → 3 → 4a → 4b → 4c.
- Step-2 executor running; awaiting its plan & design gate.
- D-3 RATIFIED by planner (user delegated, career lens): commit `initiatives/` + `CLAUDE.md` — public inspectable proof of disciplined AI-agent orchestration beats an unverifiable resume claim; step-7 README will frame it as a feature. Hygiene: probe junk pruned from `extracted/`, `extracted/assets/` gitignored, extracted README rewritten post-step-1. First docs commit pushed to master by planner.

## 2026-07-17 — Review, roadmap, initiative bootstrap, step 0 issued

- Planner reviewed the full codebase (48 files) + baseline checks: tsc green, lint green, `yarn build` **fails without env** (module-level Firebase init).
- Key findings: place_order route serializes the `Response` object (checkout always "succeeds", cart cleared on failed orders); artificial 1s `setTimeout` on all 4 data pages; all-client-side architecture (zero SEO, fetch waterfall, 4 route groups as metadata workaround); Recoil abandoned/React-19-incompatible; cart bugs (state mutation, index keys, quantity desync); fonts from Wix CDN; dead code (`useInitializeCart.ts`, `exchangeRatesState`, `dotenv`); no tests/CI; boilerplate README.
- Roadmap ratified by user as 10 steps, each one executor run in a separate Opus 4.8 tab (D-1, D-2, D-6). Initiative structure bootstrapped (mirrors film-dna/the-discipline-program convention).
- Step 0 (quick wins) prompt written: `step-0-quick-wins-feature-prompt.md`. Env-tolerant build folded into step 0 (was step 1) so executor PR verification is unblocked without secrets.
- Open: D-3 (git-track planner artifacts?), D-4 (visual direction), D-5 (deploy/live-shop/env facts).
