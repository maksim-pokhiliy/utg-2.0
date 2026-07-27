# Step 4h — Reports lightbox per the ratified D3.6 design (executor prompt)

Invocation: paste everything below into the executor tab as one message.

---

/feature small Step 4h of the production-polish initiative: give the shipped reports grid its ratified click-to-view lightbox. One interaction, two sanctioned DS additions (`MediaFigure`, `Lightbox`) plus Icon chevron glyphs and two dictionary keys — a micro-step on a live shop; every intermediate commit leaves the site fully functional.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-9 — no carousels, D-10 + addendum, D-11), `deferred.md` (DEF-27 describes `useReturnFocus` residue — do not fix it here, but do not worsen it). **The spec is `initiatives/production-polish/design-export/screens/reports/`** — `reports-reference.md` § "Lightbox (D3.6 addendum)" is implementation truth (structure, ratified interaction semantics, the two REJECTED prototype behaviors, mapping notes) + the ratified prototype `Reports.dc.html` (inline styles and raw buttons are the medium — your implementation renders the same result from DS exports and token utilities). The seal is mechanical: raw colors/text-sizes/`<button>`/`<a>`/deep-imports outside `src/design-system/` fail lint.

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. Expected plan-gate items: the `MediaFigure` and `Lightbox` React APIs (both barrel-exported closed intents; constraints in the reference), which chevron glyphs are actually missing from the DS `Icon` set, and how `Lightbox` composes the DS-internal Radix Dialog primitives (controlled open; trap/scroll-lock/Esc/scrim and the return-focus law must come from the shipped machinery, not hand-rolled listeners).

**Scope:**

1. **DS — `Icon`**: add the missing chevron glyph(s) (22px usage in the lightbox header; verify what exists before adding).
2. **DS — `MediaFigure`** (new composite, barrel-exported) per the reference: the framed-square control — 2px ink border, white matte, `overflow-hidden`, image `object-cover`, hover zoom `scale(1.03)` on the motion tokens, focus-visible 2px `--secondary` ring offset 2; accessible name via prop; caption row stays app-land.
3. **DS — `Lightbox`** (new composite, barrel-exported) per the reference: standard scrim; panel `min(92vw,880px)` × max 92vh, 2px ink border, paper; band header strip (56px min) — mono-caps index in band-muted + optional caption, then prev/next/close controls (44px, inverse hover, paper focus ring); clamped prev/next (disabled end = 35% opacity, inert) + ←/→ keys + touch swipe ≥40px; media area — white bg, uncropped `object-contain`, max-height `calc(92vh − 56px)`, `alt=""` (ratified — the header strip carries the text). Built ON the internal Radix Dialog primitives — no hand-rolled focus/scroll/key plumbing. Zero accent.
4. **`ReportsScreen` wiring**: figures render through `MediaFigure` opening the `Lightbox`; selected-index state is app-side; stepping clamped at 01/08. The grid composition itself (band, intro, figcaptions, sizes) is SHIPPED — do not touch it beyond the control swap.
5. **Dictionary keys** (both locales, verbatim): `reports.prev` «Попередній звіт»/"Previous report", `reports.next` «Наступний звіт»/"Next report". The prototype's neighbor-index aria-labels are REJECTED — use these.

**Acceptance gates (verify and report in the PR test plan):**

- tsc / lint (0/0) / `prettier --check` / zero-env `yarn build` green; route table unchanged; all seal greps zero.
- View-source `/uk/reports` + `/en/reports`: the static grid HTML unchanged in substance (band, intro, 8 figures, exactly ONE caption at element boundaries) — the lightbox is client-side and must not de-SSG anything.
- Keyboard run (list in the PR for the user): Tab to a figure (visible ring) → Enter opens the viewer with focus trapped inside → ←/→ step and clamp at 01/08 (disabled chevron inert) → Esc closes → focus returns to the opening figure. Scrim click closes. Locale switch changes the three control labels.
- Honesty proof: viewer on 03 shows the FPV caption; on any other report the header carries the bare index only.
- Browser gates for the user: hover zoom on the grid; the viewer on mobile width (swipe steps, controls ≥44px); uncropped photos on white; both locales.
- Fence: `src/design-system/` (icon glyphs + the two new composites + barrel), `ReportsScreen.tsx`, the two dictionaries. NO other screens, NO existing DS component API changes, NO `useReturnFocus` edits (DEF-27 is out of scope).

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage them or `CLAUDE.md`.
- Run `yarn format` before committing.
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
