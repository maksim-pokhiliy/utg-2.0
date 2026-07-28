# Step 6b — DS hygiene under green tests (executor prompt)

Invocation: paste everything below into a fresh executor tab as one message.

---

/feature small Step 6b of the production-polish initiative: the DS-hygiene quartet deliberately sequenced AFTER the test suite (step 6, PR #15) so every refactor lands under green tests — DEF-27 (`useReturnFocus` carries app knowledge), DEF-28 (dead `SectionBand.center` prop), DEF-32 (IconButton inert state + the forked scrim), DEF-38 (cart codec guard/catch redundancy). ZERO visual delta and ZERO behavior change is the acceptance bar — this is hygiene, not redesign. The shop is live and takes real orders; every commit leaves it fully functional.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-10 seal, D-11 DS-frozen — THIS PROMPT is the sanctioned change window for exactly these four items, ruled 2026-07-28), `deferred.md` (the four IDs above carry the full findings). The step-6 suite (265 units + 11 e2e + CI on every PR) must stay green throughout — it exists precisely to catch you here; treat a red test as a stop signal, not an obstacle.

**Scope:**

1. **DEF-27 — `useReturnFocus` sheds app knowledge.** Its pathname guard exists only to compensate CartDrawer's close-on-navigation effect — app knowledge inside the DS, and a URL comparison across an async React commit is a timing heuristic. Move the navigation-close knowledge to CartDrawer via the forwarded `onCloseAutoFocus` preventDefault (the hook already bails on `defaultPrevented`); the pathname guard dies. Also: the hook's two capture listeners register at module scope with no teardown — refcount the registration (attach on first consumer, detach on last).
2. **DEF-28 — dead prop removal.** `SectionBand.center` lost its last consumer in 4g. Verify zero consumers by grep, then delete the prop and its branch from the FROZEN API (this window sanctions it).
3. **DEF-32 — IconButton inert state + one scrim.** The `aria-disabled` styling currently lives in a class passed by Lightbox — the intent belongs in the DS API: give IconButton a first-class inert prop and move the treatment inside. Unify the scrim forked between `DialogOverlay` and the Sheet overlay — one treatment, two consumers. The ratified law stands: `aria-disabled`, never `disabled`, on focused controls (a real `disabled` strands focus outside the Radix trap).
4. **DEF-38 — cart codec cleanup.** In the persistence decoder the `Array.isArray` guard and the broad `catch` are mutually redundant — any non-array throws one line later into the same `null`. Behavior-preserving cleanup: narrow the catch to `JSON.parse` or drop the guard — argue your pick at the plan gate. The step-6 codec tests (incl. legacy-line rehydration) must pass UNCHANGED — they are the proof the behavior held.

**Process gate.** Stop after your plan & design stage and present the plan for approval before implementing. Expected plan-gate items: the exact `onCloseAutoFocus` event flow for DEF-27 (who prevents, who bails, what happens on navigation-while-open), the refcount shape, the scrim unification target, the DEF-38 choice with rationale, and — per refactor — WHICH existing tests cover it (name the files; where a refactored path has no coverage, add it in this PR).

**Acceptance gates (verify and report in the PR test plan):**

- Full battery green BEFORE the refactors (baseline run, state it) and AFTER: lint 0/0 / `prettier --check` / typecheck (both programs) / vitest (265+) / zero-env build / `yarn e2e`. CI green on the PR.
- Zero visual delta: no token, spacing, or rendered-markup changes on drawer/dialog/lightbox/band surfaces. List the user's browser gate explicitly: cart drawer open/close incl. keyboard return-focus, close-on-navigation while the drawer is open, ConfirmDialog, Lightbox prev/next incl. the aria-disabled ends, a reports-band spot check.
- Seal greps zero; route table unchanged; no catalog values, no payload keys, no dictionary changes.
- Fence: `src/design-system/` (ONLY the named internals: `useReturnFocus`, `SectionBand`, `IconButton`, the two overlay/scrim files), `CartDrawer`, `src/store/cart.ts` (decode path only), the Lightbox call site losing its passed class, tests as needed. Nothing else.

**Constraints:**

- No comments in code — tests and configs included; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no AI signatures anywhere.
