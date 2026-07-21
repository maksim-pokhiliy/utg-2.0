# D3.1 — Home page design (Claude Design brief)

Paste everything below into the Claude Design session (UTG Design System project) as one message.

Standing rule for ALL page briefs (D3 track): Claude Design has NO access to the repo —
every brief must be self-contained. All copy goes inline verbatim; assets and catalog
data are referenced only by project-internal paths (`assets/…`, `ui_kits/storefront/data.js`
— the punch-list-fixed catalog inside the design project).

---

New phase: page design. The design system is FROZEN and ratified — tokens, type, primitives, guidelines are the law; do not restyle them. The storefront screens in `ui_kits/` were demos showcasing the system, NOT ratified page designs — treat them as sketches you are free to depart from. We are now designing the real pages, one at a time, starting with Home.

**Task: design the Home page** of the UTG storefront. Mobile-first (375px) and desktop (1200px+), Ukrainian default with an English variant (uk strings run 20–30% longer — design for uk, verify en).

What Home must do: make both the SHOP and the CAUSE obvious within five seconds — this is a volunteer donation shop (all proceeds equip a Ukrainian special-forces unit), not a commercial brand. Composition is yours; bring fresh ideas — you are not bound to the previous hero-left/logo-right demo.

Content (real, no lorem):

- Wordmark "UKRAINIAN TACTICAL GEAR" and the skull logo asset (`assets/logo-640.png`). There is NO hero photograph and none can be produced right now — the hero must stand typographically/graphically on its own (an optional photo-slot variant for later is welcome).
- Mission line (uk): «Волонтерський проект: усі кошти з продажу мерчу йдуть на спорядження для підшефного спецпідрозділу.» / (en): "A volunteer project: all merch proceeds buy equipment for a Ukrainian special-forces unit."
- Three categories with real photos from `assets/products/`: Патчі (patch-utg), Стікери (stickers-2), Футболки (tshirt-death-black).
- Primary CTA → catalog («Замовити мерч» / "Get Merch"); Instagram link (ukrainian_tactical_gear).

Rules (unchanged from the system): honest tone — no dark patterns, no urgency mechanics, no invented claims; ONE accent (flag-yellow) CTA moment per view; AA contrast; touch targets ≥44px; every interactive element maps to an existing DS primitive.

If a composition genuinely needs something the DS lacks (a new variant, a new pattern), do NOT silently improvise a style — build the page with it, but list it separately as a "proposed DS addition" for ratification.

Deliverable: the Home page prototype (both breakpoints, both locales) as new files in this project, clearly separated from the DS demos (e.g. a `screens/home/` area). If it is cheap, show two compositional directions for the hero section and recommend one — we will pick.
