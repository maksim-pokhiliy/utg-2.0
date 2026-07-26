# 404 — ratified design (D3.5, surface 3)

Source: design project `01558ea9-9ab1-4308-b99f-b71e70dfb371`
(`screens/404/NotFound.dc.html`, exported verbatim alongside; strings in
`../data/catalog.js`), user-approved 2026-07-27. Zero DS additions; zero accents
(the CTA is outline).

## Structure

1. **Band** — `SectionBand` kicker `/ 404` (the shipped caption-kicker API,
   band-muted) + title «Сторінку не знайдено»/"Page not found" (h1). The old
   hero-size "404" numeral DIES — the kicker carries the number.
2. **Body** — left-aligned column max 560px: one body paragraph in `ink-soft`
   («Такої сторінки немає. Можливо, товар знято з продажу.» / "This page doesn't
   exist. The item may have been removed."), then outline `Button` «До мерчу»/"To
   merch" → `/category`.

## Copy (kit-authored, adopted per DEF-14/DEF-15)

- Title: live «Сторінку не знайдено»/"Page not found" (unchanged).
- Body: NEW nfBody line (above).
- CTA: NEW «До мерчу»/"To merch", target CHANGES home → `/category` (ratified kit
  ruling: the catalog is where a lost visitor converts). The old «На головну»/"Back
  home" dies.

## Runtime-error screen (ratified rider — no separate design)

`error.tsx` reuses this composition at implementation time: same band pattern +
column, title «Щось пішло не так»/"Something went wrong", outline retry button
(existing strings). Declared in the D3.5 brief; the designer did not object.

## Implementation mapping notes

- The prototype redirects unknown mock-routes via `location.replace` — mock plumbing
  ONLY. The app keeps native Next behavior: `dynamicParams = false` + `notFound()`
  render the 404 at the requested URL, no redirect.
- The current `not-found.tsx` holds a hardcoded `messages` const (it renders where
  the dictionary context may be unavailable); whether the new strings live there or
  in the dictionaries is the executor's plan-gate proposal — rendered output must
  match the ratified copy either way.
- Header/footer/drawer mounts in the prototype are demo plumbing.
