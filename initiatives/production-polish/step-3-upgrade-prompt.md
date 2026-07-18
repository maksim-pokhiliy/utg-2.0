# Step 3 — Upgrade: Next 14 → 16, React 18 → 19 (executor prompt)

Precondition: PR #4 (step 2) is merged; branch from fresh `master`.
Invocation: paste everything below into the executor tab as one message.

---

/upgrade next — major upgrade Next.js 14.2 → 16 (current stable), which carries React 18 → 19 with it. Step 3 of the production-polish initiative.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-6 ratified this upgrade; Recoil — the React-19 blocker — was removed in step 2), `deferred.md` (DEF-6 lands here). This is a pure platform upgrade: no new features, no redesign, no dependency swaps beyond what the upgrade itself forces. The design-system step (4a) follows this and will handle Tailwind 3→4, `next/font`, and replacing Flowbite/notyf/body-scroll-lock/swiper — none of that happens here.

**Process gate.** After your research + migration plan stages, stop and present the plan to the user for approval before touching code. The user will relay it to the planner.

**Scope:**

1. Upgrade `next` to the latest stable 16.x, `react`/`react-dom` to 19.x, `eslint-config-next` and `@types/react`/`@types/react-dom` to match. Research the official Next 15 and 16 upgrade guides and use the official codemods where they apply.
2. Known migration surfaces in this repo (verify each against the guides, don't assume the list is complete):
   - Async request APIs: `params` in pages/layouts/`generateMetadata` become Promises — every file under `src/app/[lang]/` takes `params: { lang }` today.
   - `next lint` retirement: the `lint`/`lint:fix` scripts use `next lint` — migrate to the ESLint CLI per the guide, keeping `next/core-web-vitals` rules (incl. active `react-hooks/exhaustive-deps`) working.
   - Caching-default changes between 14 and 15/16: our catalog pages are pure SSG from a static module (no fetches) and must stay fully static; the layout's rates fetch must keep its `revalidate: 3600` semantics.
   - Middleware, `dynamicParams = false`, `generateStaticParams`, `metadata`/`viewport` exports — confirm against the guides.
   - DEF-6: update browserslist/caniuse-lite (the build warns it's outdated).
3. Dependency compatibility sweep for React 19 peers: `flowbite-react` (checkout forms use it), `zustand@5`, `swiper`, `notyf`, `body-scroll-lock`, `classnames`, `@formatjs/intl-localematcher`, `negotiator`. Minor/patch bumps to gain React-19 support are allowed; wholesale replacement is NOT (that is 4a's job, D-9). If a library is fundamentally React-19-incompatible with no compatible version, stop and surface it at the plan gate instead of improvising.
4. Fix whatever the upgrade breaks (types, APIs, config) — surgically, matching existing style. If Turbopack becomes the default dev bundler, verify `yarn dev` works; keep the build working without custom bundler config if possible.

**Acceptance gates (verify and report in the PR test plan):**

- `npx tsc --noEmit`, lint (migrated command), `yarn build` with zero env — all green on Next 16/React 19.
- Build output: same route table as before — all catalog pages + about/reports/checkout static/SSG, only `/api/place_order` dynamic; no new dynamic routes, no build warnings introduced (browserslist warning gone).
- `yarn dev` smoke: home → category → product → add to cart → drawer → checkout form renders; locale switch updates strings and prices; `/fr/x` → 404; no hydration warnings or React 19 console errors on any of those pages with a non-empty persisted cart.
- Checkout with `PLACE_ORDER_URL` unset → error toast, cart intact; payload shape untouched.
- Cart persisted by the pre-upgrade build (`utg-cart-v2` raw array) still loads.
- `package.json` shows next 16.x / react 19.x; `yarn.lock` has no residual react-18 resolution for runtime deps.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- No feature work, no visual changes, no Tailwind 4, no `next/font`, no dependency replacements (only version bumps needed for compatibility).
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
- Never stage changes to `CLAUDE.md` or `initiatives/` — planner-managed (they are tracked now; your diff must not touch them).
