# production-polish — decisions

D-numbered decisions. **Promote here at every gate** — a decision that lives only in
chat is not durable. This file is the SSOT for "why."

**Status legend:** `RATIFIED` (decided + acted) · `OPEN` (awaiting ratification — do not
execute past it) · `SUPERSEDED` (replaced — kept for the trail).

## Index

| ID   | Topic                                                                                                                                      | Status   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| D-1  | Foundation-before-visual step sequence                                                                                                     | RATIFIED |
| D-2  | Planner/executor execution model                                                                                                           | RATIFIED |
| D-3  | Track `initiatives/` + `CLAUDE.md` in git, or keep untracked                                                                               | RATIFIED |
| D-4  | Visual direction for steps 4a–4c                                                                                                           | OPEN     |
| D-5  | Deploy target, live-shop status, env values                                                                                                | RATIFIED |
| D-6  | Stack moves: Recoil→Zustand, Next 14→16 + React 19                                                                                         | RATIFIED |
| D-7  | Drop Firebase entirely; catalog as static in-repo config, images in `public/`                                                              | RATIFIED |
| D-8  | Step-0 money fallback: coefficient→1 (option X); terminal currency fix lands in step 1                                                     | RATIFIED |
| D-9  | Component layer: shadcn/ui on Tailwind (drop Flowbite, notyf, body-scroll-lock, swiper)                                                    | RATIFIED |
| D-10 | The design system is a sealed module: single-barrel API, colors/font-sizes exist only inside, Typography + Container for the outside world | RATIFIED |

---

### D-1 — Foundation before visual polish

- **Status:** RATIFIED (user approved roadmap, 2026-07-17).
- **Decision.** Sequence: quick wins → RSC migration → state migration → framework upgrade → visual redesign → SEO → tests/CI → README. Visual work lands only after the component tree is reshaped.
- **Rationale.** The dominant UX problem (spinners, fake 1s delay, slow loads, zero SEO) is the client-fetch architecture itself. Restyling client-fetch screens first would be rewritten by the RSC migration — double work. Step 0 quick wins deliver immediate demo value while foundations land.

### D-2 — Planner/executor execution model

- **Status:** RATIFIED (2026-07-17).
- **Decision.** Each plan step = one executor run (`/feature`, `/feature small`, or `/upgrade`) in a separate Opus 4.8 tab = one PR against `master`. The planner session writes step prompts (saved as `step-N-*-prompt.md` here), reviews the executor's plan & design gate output, and reviews the final PR. Executors do not edit initiative files.
- **Rationale.** Keeps each PR reviewable and scoped; keeps process state in one writer's hands; prompt files survive context resets and are auditable.

### D-3 — Git tracking of planner artifacts

- **Status:** RATIFIED (user delegated the call 2026-07-18; planner decided: track both).
- **Decision.** `initiatives/` and `CLAUDE.md` are committed to the repo. Hygiene: `extracted/assets/` gitignored (binaries; `public/` is the asset SSOT), dead probe files pruned. Executors still never stage _changes_ to these paths in feature PRs — they are planner-managed.
- **Rationale (career lens, per delegation).** In 2026 the differentiating skill is disciplined AI-agent orchestration; this directory is a rare public, inspectable proof of it (charter → D-numbered decisions with rationale → gate reviews → honest deferred/journal trail) versus an unverifiable resume claim. The repo's most distinctive artifact should be visible, not hidden for the shrinking minority of AI-skeptic reviewers; step 7's README will frame it explicitly as a feature. `CLAUDE.md` is standard practice and doubles as crisp architecture docs.

### D-4 — Visual direction for the redesign (steps 4a–4c)

- **Status:** RATIFIED — fully (final gate passed 2026-07-18: user visually reviewed and approved the complete system + all screen prototypes; planner had reviewed files earlier).
- **Decision.** Keep + sharpen the existing identity: black/military brutalism on warm off-white, hard edges, condensed display type, flag yellow/blue as rare accents. The ratified concrete language lives in the Claude Design project `62bf007e-1ea9-45bc-a40a-f64544314e8c`: tokens (`tokens/*.css`), component specs (`components/**`), guidelines, and the approved screen kit (`ui_kits/storefront/`). That project is now the visual SSOT for steps 4a–4c; implementation matches it, deviations need a new decision.
- **Rationale.** It is the project's authentic identity (volunteer gear shop for a fighting unit) and a coherent, ownable direction; a generic-pretty rebrand would erase what makes it distinct.

### D-5 — Deploy target, live-shop status, env availability

- **Status:** RATIFIED (facts established 2026-07-17).
- **Facts.** Prod = Vercel project `utg` (team maksim-pokhiliys-projects), domains `ua-tactical-gear.com` / `www` / `utg.vercel.app`; `firebase.json` hosting config is vestigial. The order bot is the user's own public repo (`utg-tg-order-bot`), deployed as Vercel project `telegram-bot-server`. **Prod is partially down**: Firebase Storage serves 402 on all images (Spark plan), `GET /api/categories/[id]` 504s reproducibly — category/product pages are empty, no images load anywhere on the site.
- **Impact.** The initiative gained a rescue dimension: step 1 (de-Firebase) restores a fully working site. Remaining env need shrinks to `EXCHANGE_RATE_API_*` + `PLACE_ORDER_URL` after step 1; user-provided values still wanted for checkout e2e verification.

### D-7 — Drop Firebase; static in-repo catalog, local assets

- **Status:** RATIFIED (user directed the Firebase exit 2026-07-17 and delegated the storage choice "Neon or local config"; planner resolved: static config).
- **Decision.** Remove Firebase entirely (Firestore, Storage, firebase-admin, service-account env, `firebase.json`/`.firebaserc`). The catalog becomes a typed static module in the repo (recovered 1.0 data incl. descriptions/sizes); all images move to `public/` (recovered originals in `extracted/assets/`). No Neon/database.
- **Rationale.** The catalog (~12 products) has never changed in the project's life; a database for immutable data is pure overhead (infra, cold starts, another failure mode — and Firebase's failure mode is literally today's outage). Static config is versioned, type-checked at build time, enables full static rendering, and catalog edits get a git audit trail. Revisit only if runtime editing by non-developers ever becomes a requirement.
- **Links.** `extracted/README.md` (recovered content inventory + prod outage evidence).

### D-8 — Step-0 money fallback: option X (coefficient→1)

- **Status:** RATIFIED (planner approved executor's plan-gate question, 2026-07-17).
- **Decision.** In step 0, when the rates API fails, price coefficient falls back to 1 (never NaN). Accepted narrow defect: with a live catalog + rates down + `en` locale, UAH magnitudes render with a `$` symbol. The terminal fix (rates revalidate + last-known-good + force-UAH display when no rates) is a **step 1 gate**, not step 2 as the executor's PR text may say — step 1 rebuilds the money flow anyway (D-7 made "catalog alive + rates down" a real scenario, since a static catalog is always alive).
- **Rationale.** Option Y (thread currency through 5 call sites) inflates a quick-wins PR with work step 1 restructures days later; X ships the crash/NaN safety now with a 2-file diff and an explicitly scheduled owner for the corner case.

### D-9 — Component layer: shadcn/ui on Tailwind

- **Status:** RATIFIED (user delegated the library choice to planner recommendation, 2026-07-17).
- **Decision.** Tailwind stays as the styling engine; shadcn/ui becomes the component layer (copied-in components, CSS-variable theming, Radix primitives underneath). Adopted in step 4a per the Claude Design system. Retired along the way: Flowbite React (forms/buttons → shadcn), notyf (toasts → Sonner), body-scroll-lock (Radix Dialog/Sheet handles scroll locking), swiper (reports carousel → shadcn/embla Carousel).
- **Rationale.** It is not "Tailwind vs a library" — shadcn _is_ Tailwind with owned code: no runtime CSS-in-JS, full restylability (brutalist zero-radius theming is trivial), accessibility solved by Radix, first-class Next.js App Router/RSC fit, and CSS-variable tokens map 1:1 to what Claude Design produces. Replaces four dated dependencies with a coherent single system; also the stack recruiters recognize in 2026. Alternatives rejected: Flowbite (status quo — dated, weak primitives), Mantine/Chakra/HeroUI (parallel styling systems pulling away from Tailwind), raw Radix (shadcn minus the leverage).

### D-10 — The design system is a sealed module

- **Status:** RATIFIED (user directive, 2026-07-18).
- **Decision.** The design system lives as one coherent module (`src/design-system/`) and is the sole styling authority. Concretely: (1) **single public API** — one barrel export; deep imports into module internals are lint-banned; (2) **colors are sealed** — raw color values (hex/rgb/hsl/oklch) exist ONLY in the DS theme definition; Tailwind's default palette is wiped from the theme so non-token color utilities (`bg-zinc-900`, `text-gray-700`…) do not exist at all; app code sees only semantic token utilities/components; (3) **typography is sealed** — font-size/leading values and utilities live only inside the DS; app code renders all text through a variant-based `Typography` component; (4) a `Container` component (MUI-style `maxWidth` prop, built-in gutters) owns page width. App code composes DS components + token utilities, nothing else.
- **Rationale.** Consistency by construction instead of by convention: drift becomes mechanically impossible (utilities don't exist) or mechanically detectable (grep/lint gates), so no future contributor — human or agent — can restyle ad hoc at call sites. Requested by the user verbatim ("запечатана и обтянута колючей проволокой").
- **Enforcement — mechanical, not by agreement** (user: "компиллер кричал матом"). Three layers, all hard failures: (1) the Tailwind-4 theme wipe makes non-token color/size utilities produce no CSS at all; (2) ESLint **errors** scoped to everything outside `src/design-system/`: `no-restricted-imports` on DS internals + `no-restricted-syntax` patterns banning color literals (hex/rgb/hsl/oklch) and raw palette/text-size utility classnames in source — `yarn lint` fails on violation; (3) TypeScript unions on `Typography` variants / `Container` maxWidth make invalid usage a compile error. The repo's no-comments rule closes the escape hatch: an `eslint-disable` is a comment and therefore itself a violation visible in any diff. Review greps remain as a fourth, human-side net. **Addendum (2026-07-18, post-4a fix round):** two more sealed layers — (4) control ownership: styled interactive elements (buttons, text-like links/tabs) exist only as DS components; raw `<button>`/`<a>` JSX outside the DS is an ESLint error (layout containers remain app-land); (5) composite patterns (Dialog, ConfirmDialog, future drawers/cards) are exported as closed intent-API compositions — building blocks stay internal; the DS exports intents, not constructors.

### D-6 — Stack moves: Zustand and Next 16

- **Status:** RATIFIED (approved with roadmap sign-off, 2026-07-17).
- **Decision.** Replace Recoil with Zustand (cart + sidebar only; dictionary/rates move to server props in step 1). Upgrade Next 14 → 16 with React 19 after Recoil is out.
- **Rationale.** Recoil is abandoned by Meta and incompatible with React 19 — both a real blocker for upgrades and a dated-stack signal. Zustand is the lightweight standard for this size of client state. Upgrade ordering is forced: Recoil must leave before React 19 arrives.
