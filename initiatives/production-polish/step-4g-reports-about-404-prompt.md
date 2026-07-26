# Step 4g — Implement reports + about + 404 per the ratified D3.5 designs; swiper dies (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature small Step 4g of the production-polish initiative: re-compose the reports, about, and 404 pages per the ratified D3.5 designs, remove the swiper dependency for good, and fold in four scheduled riders (error-page alignment, the Home band retrofit, the drawer-focus fix, the eslint ignore for `initiatives/`). These are the last three unstyled surfaces — after this step every page of the live shop renders through the sealed design system. Zero DS additions are ratified for this step.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-9 — swiper's death warrant, D-10 + addendum, D-11), `deferred.md` (DEF-21, DEF-23, DEF-26 are this step's riders; DEF-14 covers the new copy). **The specs are `initiatives/production-polish/design-export/screens/reports/`, `screens/about/`, and `screens/404/`** — each holds a distilled `*-reference.md` (structure, verbatim copy incl. one RATIFIED copy change, mapping notes) + the ratified prototype source (`*.dc.html`; inline styles and kit classes are the medium — your implementation renders the same result from DS exports and token utilities; strings in `screens/data/catalog.js`). The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. Expected plan-gate items: the dictionary key shape for the about closing-line link (the sentence wraps an inline link — pre-text + label keys, component interpolation, or your better idea; the rendered sentence must byte-match the reference in both locales), where the 404/error strings live (the current `not-found.tsx` carries a hardcoded `messages` const — investigate whether the dictionary context is reachable there and propose), the DEF-23 focus mechanism finding (see rider 7), and the report-image a11y stance (empty alt + visible numbered captions vs alt text) plus first-row eagerness.

**Scope:**

1. **Reports** re-composition (`ReportsScreen.tsx`) per the reports reference: `SectionBand` title «звіти» + derived meta `01–08`; intro paragraph below the band (body, ink-soft, max 46ch); auto-fill grid (min 260px) of square figures — 2px ink border, white matte, lazy images; mono-caps figcaptions: index in ink-faint, and the FPV caption on report #3 ONLY (honesty rule is hard: the other seven get bare numbers; never invent captions). The swiper carousel dies here.
2. **swiper leaves the repo** (D-9 completes): dependency out of `package.json` + lockfile, both `swiper/css` imports gone, zero `swiper` references repo-wide.
3. **About** re-composition (`AboutScreen.tsx`) per the about reference: band «про нас»; reading column max 760px; two body paragraphs; photo constrained to 520px (2px ink border, white matte, 1:1 crop, lazy — the double `mt-10` bug dies with the recompose).
4. **The RATIFIED copy change** (owner decision 2026-07-27, both dictionaries): en P1 adopts "…the unit we support." (the "under-boss" translation dies); P2's closing sentence is REPLACED in both locales with the reports pointer carrying an inline flag-blue link → `/reports` (exact strings in the about reference; link styling per the drawer «тут» precedent — `NavLink` + `text-flag-blue`). The old future-tense sentence dies from both dictionaries. New reports keys land too: intro + the report-3 caption (verbatim from the reports reference).
5. **404** re-composition (`not-found.tsx`) per the notfound reference: `SectionBand` kicker `/ 404` + title «Сторінку не знайдено»; column max 560px; nfBody paragraph in ink-soft; outline `Button` «До мерчу» → `/category` (target changes from home — ratified). The hero-size "404" numeral dies. Native Next behavior stays — `notFound()` renders at the URL, no redirects.
6. **Error page rider**: `error.tsx` aligns to the same composition — band pattern + column, existing «Щось пішло не так» strings, outline retry button. No separate design; keep it visually consistent with the 404.
7. **DEF-23 rider — drawer auto-open focus**: the layout-mounted controlled Sheet drops keyboard/SR focus to `<body>` when add-to-cart auto-opens it. Investigate the Radix mechanism first (controlled open without a trigger should still focus content — find why it doesn't), then fix minimally: DS `sheet.tsx` internals or a layout ref are the sanctioned touchpoints. Prove with a keyboard run: add to cart → Tab lands inside the drawer, Esc closes and returns focus sanely.
8. **DEF-26 rider**: eslint ignores `initiatives/` (one entry in `eslint.config.mjs`) — the planner-exported `cart-drawer.js` warning dies; `yarn lint` output goes fully clean.
9. **DEF-21 rider — Home band retrofit**: Home's merch band (4c inline composition) moves onto the extended `SectionBand` (title + meta, the 4d API). Mechanical swap, ZERO visual delta expected — prove it (rendered-markup diff or screenshot pair).

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint (0 errors, 0 warnings — DEF-26 makes clean attainable) / `prettier --check` / zero-env `yarn build` green; route table unchanged (all pages SSG); all six seal greps zero.
- `swiper` grep across the repo (source + package.json + lockfile): zero.
- View-source `/uk/reports` + `/en/reports`: band title + intro + all 8 figures server-rendered; exactly ONE caption text present (element-boundary grep, both locales).
- View-source `/uk/about` + `/en/about`: the NEW closing sentence with a working link → `/{lang}/reports`; the old sentence's discriminator («з'явиться ще один розділ» / "another section with reports will appear") greps ZERO across `src/`.
- A dead URL (`/uk/category/nope`) renders the new 404: kicker `/ 404`, nfBody, outline CTA → `/uk/category`; locale respected on `/en/...`.
- Home renders byte-equivalent after the SectionBand retrofit (show the proof).
- Focus proof for DEF-23 (keyboard run described above).
- Browser gates for the user, listed explicitly in the PR: reports grid at 375px and 1200px+ both locales; about link click lands on reports; dead-URL 404 + CTA; add-to-cart → Tab focus lands in the drawer; Home visually unchanged.
- Fence: `ReportsScreen.tsx`, `AboutScreen.tsx`, `HomeScreen.tsx` (band retrofit ONLY), `not-found.tsx`, `error.tsx`, dictionaries, `eslint.config.mjs` (ignore entry ONLY), `package.json`/lockfile (swiper removal ONLY), and — for DEF-23 only — DS `sheet.tsx` internals or the layout mount. NO catalog data, NO other screens, NO DS API changes, NO payload/checkout code.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
