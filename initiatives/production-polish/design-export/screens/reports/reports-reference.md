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
