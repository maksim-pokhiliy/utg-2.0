# Reports — ratified design (D3.5, surface 1)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/reports/Reports.dc.html`, exported verbatim alongside; strings + the
`reports()` accessor in `../data/catalog.js`), user-approved 2026-07-27. The swiper
carousel DIES with this page — D-9 completes; nothing slider-like returns. Zero DS
additions: every element maps to shipped primitives.

## Structure

1. **Band** — `SectionBand` title «звіти»/"reports" (h1) + right-baseline `meta`
   caption `01–08` (the shipped meta prop from 4d; the range is DERIVED from the
   report count, not hardcoded — 9th photo would make it `01–09`).
2. **Intro** — BELOW the band, content-land (no SectionBand extension needed): one
   body paragraph, `ink-soft`, max 46ch, `text-wrap: pretty`.
3. **Grid** — `repeat(auto-fill, minmax(min(100%,260px),1fr))`, `--space-5` gap.
   Each figure: square (1:1) image in a 2px ink border on a white matte (`bg-white`
   exemption, the 4e product-frame precedent), `loading="lazy"`.
4. **Figcaption** — caption treatment (mono caps: type-caption + caps tracking +
   uppercase), baseline row: index `01…08` in `ink-faint`, then — for report #3
   ONLY — the FPV caption in `ink`.

## Honesty rule (hard, held mechanically in the prototype)

`caption: i === 3 ? reportFpv : null` — exactly one captioned figure. The other
seven carry bare numbers. NEVER invent purchase descriptions; a new caption enters
only through a ratified dictionary addition.

## Copy (new dictionary keys, kit-authored, adopted per DEF-14)

- intro: «Кожна закупівля — з ваших замовлень. Фотозвіти підрозділу.» / "Every
  purchase is funded by your orders. Photo reports from the unit."
- caption for report #3: «На матеріали для виготовлення ініціаторів для FPV» /
  "For material for the manufacture of initiators for FPV"
- Band title reuses live `shared.reports`.

## Implementation mapping notes

- Images stay `/images/reports/report_1.jpg`…`report_8.jpg` (note: app filenames use
  underscore; the prototype's `report-N.jpg` naming is mock-land).
- The current screen marks ALL images `priority` + `quality={100}` — the ratified
  design lazy-loads; above-the-fold eagerness for the first row is the executor's
  call at plan gate.
- Empty `alt` + the visible numbered captions is the prototype's a11y stance;
  recorded trade-off (PR #12 review): a screen reader gets `01…08` and no content
  description for the seven uncaptioned photos — accepted because any alt would
  either duplicate the number or invent facts; revisit only if real captions ever
  arrive.
- swiper leaves `package.json`; both `swiper/css` imports die with it.
- Header/footer/drawer per-screen mounts in the prototype are demo plumbing — the
  app's layout chrome already provides all of it.

## Lightbox (D3.6 addendum — ratified 2026-07-27, user-approved; implemented in 4h)

Click-to-view on the grid. TWO ratified DS additions (+ Icon glyphs); the exported
`Reports.dc.html` alongside is the D3.6 revision (grid unchanged, viewer added).

### MediaFigure (new DS composite)

The framed square becomes the control: full-width `aspect-square` button, 2px ink
border, white matte, `overflow-hidden`; image `object-cover` with hover zoom
`scale(1.03)` on `--dur`/`--ease`; focus-visible = 2px `--secondary` ring, offset 2
(the SizeSelector precedent). Accessible name composed by the app (reports title +
index + optional caption). The mono-caps caption row stays OUTSIDE the control in
app-land.

### Lightbox (new DS composite — a distinct intent, NOT a Dialog extension)

Image-first viewer on the standard scrim (ink 50%, the Sheet treatment):

- Panel: `min(92vw, 880px)` wide, max-height 92vh, column flex, 2px ink border,
  paper bg.
- Header strip: band bg/foreground, min-height 56px, pad `6px 6px 6px 16px`;
  caption vocabulary (mono caps) — index in `band-muted`, then the caption for
  report 03 ONLY (honesty rule rides into the viewer; bare index elsewhere).
- Controls right, each 44px, transparent bg, band-foreground, inverse hover
  (paper/ink), paper focus ring: prev/next chevrons (22px) + close X.
- Prev/next semantics: clamped at 01/08 — disabled end = 35% opacity, inert; ←/→
  keys; touch swipe ≥40px. Deliberately NOT a wrap-around carousel (D-9 stands).
- Media area: white bg, image `width:100%; height:auto`, max-height
  `calc(92vh − 56px)`, `object-contain` — the UNCROPPED photo (ratified: the grid
  crops to 1:1, the viewer reveals the full frame; same asset, no hi-res exists).
- Zero accent anywhere in the viewer.

### Implementation mapping notes (4h)

- The Lightbox composes the DS-INTERNAL Radix Dialog primitives — focus trap,
  scroll lock, Esc-close, scrim-close and the `useReturnFocus` law come from the
  shipped machinery; the prototype hand-rolls all of it (mock plumbing: body
  overflow writes, window keydown, `_opener` refs — do not copy).
- Icon set gains the chevron glyphs (the designer inlined Lucide paths — declared;
  the executor adds whichever of chevron-left/right are actually missing).
- NEW dictionary keys (planner-adopted at ratification, the 4f `close` precedent):
  `reports.prev` «Попередній звіт»/"Previous report", `reports.next» «Наступний
  звіт»/"Next report" — the prototype's neighbor-index aria-labels are REJECTED
  as SR vocabulary.
- Viewer image `alt=""` — the header strip is the visible text; the prototype's
  `alt={dialog label}` double-announces and is REJECTED.
- Raw `<button>`s in the prototype are presentational vocabulary (the SizeChips
  precedent) — they map to the two composites above.
