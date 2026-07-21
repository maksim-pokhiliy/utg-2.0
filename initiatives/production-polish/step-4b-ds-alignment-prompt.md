# Step 4b — DS alignment in the app: NavOverlay fidelity + DEF-20 hygiene (executor prompt)

Precondition: master at/after `2cc6f4b`.
Invocation: paste everything below into the executor tab as one message.

---

/feature small Step 4b of the production-polish initiative: bring the app's chrome into exact alignment with the sealed design system — fix the burger-menu overlay to match the ratified spec and close the DEF-20 hygiene items. This is a small, surgical fidelity step: NO screen re-composition (pages are being redesigned separately and land in later steps), no checkout changes, no new features.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-10 + addendum; D-11 — pages get their own design→implement loop, so stay off them), `deferred.md` (DEF-20 lands here). The overlay spec is `initiatives/production-polish/design-export/chrome-reference.md` → NavOverlay section (verbatim from the design kit). The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner.

**Scope:**

1. **NavOverlay per the spec** (user-reported defect): the overlay is currently centered (`items-center justify-center`) at Typography-h2 scale — the spec is a LEFT-aligned column starting ~10vh from the top; links at the kit's large display size (`600 clamp(2.5rem,8vw,4rem)/1.15`, uppercase, tracking 0.015em) with baseline-aligned mono numbered prefixes (`01…`, band-muted); Instagram pinned to the bottom via auto margin as a mono-caps row with the icon (not a bare icon). The link size exceeds the current Typography scale — however you express it (a new Typography variant or a DS-internal overlay-link treatment), it lives INSIDE the design system; app-land contributes routing and data only (D-10 addendum).
2. **DEF-20 sweep** — verify each item against current master first (some may have died in the 4a fix round), then fix what remains:
   - Radix "missing Description" dev warning on the full-size Dialog (NavOverlay) — `aria-describedby={undefined}` or an sr-only description.
   - `Button asChild` silently ignores `loading` (no spinner, aria-only disable) — guard it or forbid the combination at the type level.
   - `Footer` is `"use client"` but only reads the dictionary — server-ify it by passing strings as props from the layout, if that stays clean.
   - `LanguageSwitcher` does `pathname.replace` on `/${locale}` unanchored — anchor to the leading segment.

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint / `prettier --check` / zero-env `yarn build` — green; route table unchanged (all pages SSG).
- All six seal greps zero (colors, text utilities, deep imports, raw `<button>`/`<a>`, Dialog internals, retired deps).
- Overlay in both locales: left-aligned numbered column at the spec's type scale, Instagram pinned bottom, esc/close still work, no hydration warnings, dev console free of the Radix description warning.
- DEF-20: each of the four items demonstrated fixed, or reported not-applicable with evidence.
- Cart, checkout, payload, catalog data — untouched.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- No screen re-composition, no new DS components beyond what the overlay needs, no dependency changes.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
