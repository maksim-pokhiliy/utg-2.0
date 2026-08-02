# Step 7 — README + presentation + the DEF-40 rider (executor prompt)

Invocation: run everything below as one /feature small task.

---

/feature small Step 7 of the production-polish initiative — the last step: rewrite the README into a presentation for a cold reader (charter acceptance: "README presents the project: description, stack, architecture sketch, screenshots, run instructions, badges"), add the MIT license, and ship the DEF-40 rider (the lightbox skeleton veil fix). The shop is live and takes real orders; every commit leaves it fully functional.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-3 is the reason the README frames the initiative system as a feature; D-10/D-13 feed the stack story), `deferred.md` (DEF-40 carries the ratified diagnosis and the fix candidate). Standing facts:

- The current `README.md` is from step 0 and describes a DEAD stack — Next 14, React 18, Flowbite, Recoil. It must not survive: every claim in the new README must be TRUE and verifiable in this repo today (the honesty rule is repo law; no aspirational claims, no invented numbers).
- The live site is `https://www.ua-tactical-gear.com` — link it. Keep the current anonymous framing of the military unit exactly as the old README has it (no unit names).
- `initiatives/` and `CLAUDE.md` are read-only SOURCE MATERIAL for you — read them freely for the feature section, never stage them.
- DEF-40 (ratified diagnosis): the lightbox skeleton never hides — `utg-pulse` animates `opacity` infinitely, a running CSS animation beats the normal `opacity-0` declaration in the cascade, and the `absolute` skeleton paints above the static `<img>`, so the settled photo pulses behind an opaque veil on a 1.4s cycle. Candidate fix: `animate-none` added to `VIEWER_SKELETON_HIDDEN` in `ReportsScreen.tsx` — tailwind-merge should replace the arbitrary animate class so `opacity-0` finally applies and `transition-opacity` restores the fade-out. VERIFY the tailwind-merge replacement actually happens; if it does not, stop and report instead of improvising.

**Scope:**

1. **README rewrite** (English, cold-reader-first). Expected shape — argue changes at the plan gate: what it is + live link; the real stack (Next 16 App Router + React 19, TS strict, Tailwind 4 with the SEALED in-repo design system, Zustand, typed static catalog, zero-env boot, Vitest + RTL + Playwright, secretless CI on every PR, Node 24 via `engines` per D-13); an architecture sketch (routing/i18n, RSC pages → Screen components, the money path with the honest-UAH fallback, the design-system seal and how lint enforces it, the order relay + rate limiter, SEO); **the initiative-system section framed as a feature per D-3** — `initiatives/production-polish/` as a public, inspectable audit trail of disciplined AI-agent orchestration (planner/executor model, D-numbered decisions with rationale, the DEF ledger, the journal), linking the key files; screenshots; getting started (zero-env boot, the three optional keys from `.env.example`, the test commands); badges (CI status — nothing invented); a license note.
2. **LICENSE**: MIT, copyright Maksim Pokhiliy. The README license section says the CODE is MIT-licensed while product imagery, report photos and brand assets belong to the unit and are not covered.
3. **Screenshots**: propose the mechanics at the plan gate. Preference: a Playwright-scripted capture against the zero-env `next start` (reproducible, uses the infra the repo already has) over manual shots; a few key screens (home, category, product, reports/lightbox, checkout), assets in a dedicated directory, repo weight kept sane (optimize sizes).
4. **DEF-40 rider**: the one-token candidate above in `VIEWER_SKELETON_HIDDEN` only. Proof beyond words: two headless screenshots of the OPEN lightbox taken ≥1.5s apart AFTER the image settles must be pixel-identical (the pulse period is 1.4s — any veil movement breaks equality), and the skeleton→photo fade must still play on first open (the transition now animates from the current value to 0). Include the proof artifacts/method in the PR.

**Process gate.** Stop after your plan & design stage and present the plan for approval before implementing. Expected plan-gate items: the README outline (section list with one-liners), the screenshot mechanics + exact screen list, the badge set, the DEF-40 verification approach, and whether any package.json script is added for the capture.

**Acceptance gates (verify and report in the PR):**

- Full battery green: lint / `prettier --check` / typecheck (both programs) / vitest / zero-env build / `yarn e2e`.
- Dead-stack greps zero: `grep -inE "recoil|flowbite|next\.js 14|react 18" README.md` prints nothing.
- Every README claim spot-verifiable in the repo (name the greps for the load-bearing ones in the PR test plan).
- Screenshots render in the GitHub PR view (relative paths).
- The DEF-40 proof (identical-pair screenshots or equivalent) is in the PR; the fade-out behavior described.
- Fence: `README.md`, `LICENSE`, the screenshot assets directory, `src/components/pages/ReportsScreen.tsx` (the `VIEWER_SKELETON_HIDDEN` constant only), `package.json` (a capture script only if proposed at the gate), a pulse-regression test only if it is cheap and honest. NO catalog values, NO payload keys, NO design-system files, NO dictionary changes.

**Constraints:**

- No comments in code — configs and scripts included; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no AI signatures anywhere.
