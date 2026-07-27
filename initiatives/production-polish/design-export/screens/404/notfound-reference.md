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
- ROUTING REALITY (final — PR #12 round 3, shipped `300333d`): with the root layout
  living inside the dynamic `[lang]` segment, a nested `[lang]/not-found.tsx`
  boundary renders only the bare `__next_error__` shell (no layout/CSS), and the
  intermediate root `app/not-found.tsx` shell materialized a second `<html>` above
  `[lang]` — client-navigating out of it nested `<html>` inside `<body>`
  (user-caught hydration errors). The shipped form is an ordinary catch-all PAGE —
  `/[lang]/[...rest]/page.tsx` rendering `NotFoundScreen` inside the REAL layout:
  full chrome (closer to the approved prototype than the abandoned no-chrome
  deviation), per-request server locale (no flash possible), `generateMetadata`
  carrying the 404 title + `robots noindex`.
- RECORDED TRADE-OFF (DEF-29): locale-prefixed dead URLs answer HTTP 200 + noindex
  (soft-404) — Next cannot give both the real layout and a true 404 status while
  the root layout lives inside the dynamic segment (executor-measured either/or).
  Terminal fix = a real `src/app/layout.tsx` owning `<html>`/`<body>`; step 5
  revisits or accepts. Middleware-excluded residue (dotted paths, unknown locales)
  keeps the built-in bare 404 — a crawler-only surface.
- Strings live in the dictionaries under `not_found` (DEF-14 holds — the surface
  renders inside `I18nProvider`), byte-verbatim from the copy above in both locales
  (verified against the exported prototype `catalog.js`). `error.tsx` keeps local
  consts — the boundary must not depend on the context it may be reporting on.
- The defensive `notFound()` guards in the category/product pages stay: unreachable
  with a static catalog, and the catch-all wins unknown-param URLs first
  (`dynamicParams = false` cascades from the `[lang]` layout).
