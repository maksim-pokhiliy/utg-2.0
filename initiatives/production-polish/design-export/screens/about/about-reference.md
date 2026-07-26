# About — ratified design (D3.5, surface 2)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/about/About.dc.html`, exported verbatim alongside; strings in
`../data/catalog.js`), user-approved 2026-07-27. Zero DS additions.

## Structure

1. **Band** — `SectionBand` title «про нас»/"about" (h1), plain (no meta, no kicker).
2. **Reading column** — max 760px: two body paragraphs (`ink`, `text-wrap: pretty`,
   `--space-5` gap).
3. **Photo** — `no_commercial.JPG` constrained to max 520px (today it renders
   full-width — the constrained frame is the ratified form): square 1:1 crop
   (`object-fit: cover`), 2px ink border, white matte, `loading="lazy"`.

## Copy — RATIFIED CHANGE (owner decision, 2026-07-27)

The closing sentence of paragraph 2 is REPLACED — the live copy promised a reports
section in the future tense while the section has been live in the nav since 1.0:

- uk P2 becomes: «Усі кошти з продаж підуть на закупівлі спорядження, витратних
  матеріалів, ремонт техніки. Фотозвіти з кожної закупівлі — у [розділі звітів].»
  — the bracketed «розділі звітів» is an inline link → `/reports`.
- en P2 becomes: "All proceeds from the sale will be used to purchase equipment,
  consumables, and repair equipment. Photo reports from every purchase are in the
  [reports section]." — link → `/reports`.
- The old closing sentence («Після старту продаж тут з'явиться ще один розділ із
  звітами» / "After the start of sales, another section with reports will appear
  here.") DIES from both dictionaries.
- en P1 adopts the kit fix (DEF-14): "…to cover the needs of the unit we support."
  replaces the broken "the under-boss's special unit". uk P1 unchanged.

The prototype carries a `closingLine: proposed|live` toggle for the review; the
ratified state is `proposed`. Inline link styling: flag-blue prose link — the shipped
drawer empty-state «тут» precedent (`NavLink` + `text-flag-blue`).

## Implementation mapping notes

- The current AboutScreen's double `mt-10` (wrapper AND image) dies with the
  recompose; the ratified spacing is the column's `--space-5` flow + `--space-2` top
  margin on the photo frame.
- Dictionary shape: the link segment needs the sentence split around it (pre-text +
  link-label keys, or a component-interpolation approach) — the executor proposes the
  key shape at plan gate; the RENDERED sentence must byte-match the ratified copy
  above in both locales.
- Header/footer/drawer mounts in the prototype are demo plumbing.
