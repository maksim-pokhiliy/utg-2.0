# D3.6 — Reports lightbox (Claude Design brief)

Paste everything below into the SAME cumulative Claude Design dialog, as one message,
with the freshly refreshed `utg-2.0` Desktop snapshot attached.

Standing rule (D3 track): the freshly attached snapshot SUPERSEDES any previous one;
the brief carries all copy inline; the attached code is ground truth — the sealed
design system in `src/design-system/`, screens in `src/components/pages/`,
dictionaries in `src/app/[lang]/dictionaries/`.

---

Page-design phase, addendum brief — same dialog, one interaction. The freshly
attached snapshot SUPERSEDES the previous one: your reports/about/404 designs are
now SHIPPED and live (the reports grid with the numbered captions, the about
reading column with the reports link, the catch-all 404 inside the real layout).
The design system is FROZEN — tokens, type, primitives, guidelines are the law.

**Task: design the reports LIGHTBOX** — an owner request from the shipped page's
review: clicking a report photo should show it large. Today the figures are inert
`<img>`s in 2px ink frames. Design the click-to-view interaction on the shipped
reports grid. Mobile-first (375px) and desktop (1200px+), uk default + en variant.

**Constraints and facts:**

- This WILL require DS additions — there is no clickable-media primitive, and raw
  interactive elements are lint-banned in app-land. The shipped `Dialog` is a
  closed intent API (title + children + actions; sizes panel|full) — an image
  lightbox is likely a DIFFERENT intent (minimal chrome, image-first). Whatever
  the composition needs — the clickable figure treatment (hover/focus states on
  the framed square) and the lightbox surface itself — list EVERY addition
  explicitly as a "proposed DS addition" for ratification. Reuse what exists
  where honest: the localized close label («Закрити»/"Close") and the band-style
  close affordance are shipped vocabulary; the return-focus behavior on close is
  already DS-wide law.
- The SAME image files serve both grid and lightbox (no hi-res originals exist) —
  the lightbox shows the same asset larger. The grid crops to a 1:1 square
  (`object-fit: cover`); DECIDE whether the lightbox shows the uncropped photo
  (natural aspect ratio) or keeps the square — and say which.
- Honesty rule carries over, hard: inside the lightbox, report #3 alone carries
  the FPV caption («На матеріали для виготовлення ініціаторів для FPV» / "For
  material for the manufacture of initiators for FPV"); the other seven show the
  mono-caps number (01…08) ONLY. Never invent captions.
- Prev/next navigation between reports inside the lightbox is YOUR call — but it
  is MORE DS surface (arrow affordances, swipe on touch); if you include it,
  design it explicitly and add it to the proposal ledger; if you skip it, the
  lightbox is a single-photo viewer with close only. Do not design a carousel
  back into existence as a page pattern (D-9 stands — the swiper is dead).
- A11y: the figures become focusable controls (visible focus treatment on the
  frame — propose it); Esc and scrim-click close per the Dialog precedent; focus
  returns to the opening figure on close; touch targets ≥44px. AA contrast.
- Accent budget: ZERO — this is a quiet viewer; ink/paper vocabulary only.
- Design-load (must exist in the prototype): the lightbox open on report 03
  (captioned) AND on an uncaptioned report; both breakpoints; both locales.

Deliverable: ONE worked composition — update the existing `screens/reports/`
files in place (the grid gains the interaction; the lightbox joins the screen).
List the proposed DS additions separately for ratification. Wire it into the
cumulative prototype so clicking any report in the reports screen demos the flow.
