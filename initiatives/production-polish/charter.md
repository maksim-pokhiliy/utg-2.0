# production-polish — charter

**Goal.** Bring UTG 2.0 from a working prototype to a production-grade storefront: modern Next.js architecture, correct core flows, polished UI/UX, SEO, tests, CI, and a presentable repo.

**Driving decision(s).** `decisions.md` D-1 (sequence), D-2 (execution model), D-6 (stack moves). No ADR system in this repo; initiative-level decisions are the top of the "why" stack.

**Acceptance criteria.**

- `yarn build` green both with and without `.env.local`.
- Zero Firebase footprint (D-7): no `firebase-admin` dependency, no `firebasestorage` URLs, no service-account env; runtime env reduces to `EXCHANGE_RATE_API_URL`, `EXCHANGE_RATE_API_KEY`, `PLACE_ORDER_URL`.
- Catalog pages are server-rendered: products/categories visible in page source, no client fetch waterfall, no artificial delays anywhere.
- Checkout reflects the real order outcome; a failed order never clears the cart or reports success.
- Recoil removed; client state is cart + sidebar only (Zustand); dictionary and money flow through server props with typed dictionaries.
- Next.js 16 + React 19.
- Lighthouse mobile ≥ 90 for performance/accessibility/SEO on home, category, and product pages.
- Unit + e2e suites exist and run green in GitHub Actions on every PR.
- README presents the project: description, stack, architecture sketch, screenshots, run instructions, badges.

**Scope.** The 10 steps in `plan.md`: quick wins → RSC migration → state migration → framework upgrade → visual redesign (system, screens, checkout) → SEO → tests+CI → README.

**Non-goals.**

- Payments, accounts/order history, admin panel, CMS, analytics.
- Changes to the external order bot service (`PLACE_ORDER_URL` backend) — treated as a black box.
- New product features beyond surfacing data that already exists (e.g. product sizes).
- Copywriting beyond what polish requires.

**Sacred (do not touch).**

- The checkout → bot payload contract (documented in `extracted/bot-contract-index.js`): field names/shape must not change without an explicitly ratified decision.
- Catalog business data (titles, prices, availability, sizes, descriptions): reproduce faithfully from the recovered sources in `extracted/` — never invent or "improve" it.
- The shop takes real orders: every merged PR leaves the site fully functional (step 1 _restores_ full function — see D-5 outage facts).
- Visual identity (black/military brutalism + Ukrainian flag accent colors): sharpen, don't replace — unless D-4 ratifies otherwise.
