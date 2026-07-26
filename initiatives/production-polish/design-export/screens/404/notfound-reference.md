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
  ONLY. The app keeps native Next behavior: the 404 renders at the requested URL, no
  redirect.
- ROUTING REALITY (4g plan-gate discovery, prod-verified 2026-07-27): with the root
  layout living inside the dynamic `[lang]` segment, `[lang]/not-found.tsx` is DEAD
  code — Next serves its built-in bare 404 for dead URLs AND for `notFound()` throws
  (live prod confirmed: the English built-in on /uk/zzz; a nested boundary renders
  only the `__next_error__` shell without layout/CSS). The ratified surface ships as
  a ROOT `src/app/not-found.tsx` thin shell (pulls globals.css + fonts itself, via a
  shared `src/app/fonts.ts`) + `NotFoundScreen` resolving locale from the pathname;
  the dead `[lang]` file is deleted.
- Ratified deviation (plan gate 2026-07-27): no header/footer chrome on the 404 —
  the route renders outside the `[lang]` layout and its providers; the composition +
  outline CTA stand alone. The screen sets `document.documentElement.lang` from the
  resolved locale on mount (the shell's `<html>` cannot know it server-side).
- Strings live in a local const — the surface renders outside `I18nProvider`
  (`useDictionary` would throw); byte-verbatim from the copy above, both locales.
  The DEF-14 centralization deviation is recorded in the PR.
