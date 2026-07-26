# D3.5 — Reports + About + 404 design (Claude Design brief)

Paste everything below into the SAME cumulative Claude Design dialog (Home + catalog +
category + product + cart/checkout), as one message, with the freshly refreshed
`utg-2.0` Desktop snapshot attached.

Standing rule for ALL page briefs (D3 track): the user attaches a FRESH snapshot of the
codebase (folder `utg-2.0`, planner refreshes it on the Desktop before each brief) to
the design dialog; the newest snapshot SUPERSEDES any previously attached one. The
brief still carries all copy inline; the attached code is the ground truth for what
exists — the sealed design system in `src/design-system/` (tokens `styles/theme.css`,
primitives, public barrel `index.ts`), current screens in `src/app/[lang]/` +
`src/components/`, dictionaries in `src/app/[lang]/dictionaries/`.

---

Page-design phase, fifth and FINAL brief — same dialog, the prototype completes. The
freshly attached `utg-2.0` snapshot SUPERSEDES the previous one: the buy path you
designed in D3.4 is now SHIPPED and live — the cart drawer (auto-opens on add), the
checkout form with validation/pending/success/error states, the whole money path. The
design system is FROZEN — tokens, type, primitives, guidelines are the law. Older
`ui_kits/` demos remain sketches you may depart from.

**Task: design the CLOSING TRIO** (they ship together as one implementation step): the
**reports page** (`/reports`), the **about page** (`/about`), and the **404 page** —
the last three unstyled surfaces of the site. Quiet content pages. Mobile-first (375px)
and desktop (1200px+), Ukrainian default with an English variant (uk runs 20–30%
longer — design for uk, verify en).

**Surface 1 — Reports.** Today: a band «звіти» and a swiper carousel showing the 8
report photos one at a time — no intro, no captions. The carousel DIES with this step
(the swiper dependency is scheduled for removal; do not design a swiper back in — if
you genuinely believe a slider is the right interaction, that is an explicit DS-addition
proposal, not a default). The kit sketch (legitimate starting point, not a constraint):
intro line + auto-fill grid of square figures with 2px ink borders, mono-caps numbered
captions 01…08; report #3 alone additionally carries the FPV caption. The 8 photos are
real (`public/images/reports/report_1.jpg` … `report_8.jpg`, in the snapshot).

- Honesty rule, hard: caption ONLY what we know — the FPV caption belongs to report #3;
  do NOT invent purchase descriptions for the other seven. Bare numbering (01…08) is
  fine; fabricated captions are not.
- This page is the shop's proof-of-work — «звіти» is why buyers trust the store. Give
  it weight without theatrics.

**Surface 2 — About.** Today: a band «про нас», two body paragraphs, one full-width
photo (`public/images/no_commercial.JPG`). The kit sketch: narrow reading column
(~760px), the two paragraphs, the photo constrained (~520px) with a 2px ink border.

- Copy fact for you and the owner: the second paragraph's closing sentence PROMISES a
  reports section in the future tense («…тут з'явиться ще один розділ із звітами») —
  but the reports page is LIVE and in the nav. You MAY propose an updated closing line
  (uk + en) that points to the live reports page instead of promising it; mark it
  clearly as PROPOSED COPY — adoption is the owner's call at ratification, never
  silent.

**Surface 3 — 404.** Today: an unstyled centered column (hero-size "404", a body line,
an outline button to home). The kit sketch: `SectionBand` kicker "/ 404" + title, column
~560px, body paragraph, outline CTA «До мерчу» → `/category` (catalog, not home — merch
is where a lost visitor converts; keep that target unless you argue otherwise
explicitly). Decide whether the big "404" numeral survives.

Copy (verbatim; live dictionary strings + kit-authored adoptions per our no-reinvention
rule):

- Band titles: «звіти»/"reports" · «про нас»/"about".
- Reports (kit-authored, adopt): intro «Кожна закупівля — з ваших замовлень. Фотозвіти
  підрозділу.» / "Every purchase is funded by your orders. Photo reports from the
  unit." · caption for report #3: «На матеріали для виготовлення ініціаторів для FPV» /
  "For material for the manufacture of initiators for FPV".
- About (live, uk is the source of truth): «Цей сайт створено виключно як волонтерський
  проект. Ідея з'явилася через численні прохання підписників зробити мерч та як ще одна
  можливість зібрати ресурс для закриття потреб підшефного спецпідрозділу.» + «Усі
  кошти з продаж підуть на закупівлі спорядження, витратних матеріалів, ремонт техніки.
  Після старту продаж тут з'явиться ще один розділ із звітами.» · en paragraph 1 adopts
  the kit fix: "This site was created exclusively as a volunteer project. The idea
  appeared due to numerous requests from subscribers to make merch and as another
  opportunity to collect a resource to cover the needs of the unit we support."
  (replaces the broken "under-boss" legacy translation) · en paragraph 2 (live): "All
  proceeds from the sale will be used to purchase equipment, consumables, and repair
  equipment. After the start of sales, another section with reports will appear here."
  (subject to the proposed-copy note above).
- 404 (kit-authored, adopt): «Сторінку не знайдено»/"Page not found" · «Такої сторінки
  немає. Можливо, товар знято з продажу.» / "This page doesn't exist. The item may have
  been removed." · CTA «До мерчу»/"To merch".

Constraints:

- The DS is frozen. One API fact so your proposal ledger stays honest: `SectionBand`
  today takes title/meta/kicker only — it has NO intro-paragraph slot. An intro INSIDE
  the band = list "SectionBand intro slot" as a proposed DS addition; an intro below the
  band in content-land needs nothing new.
- Accent budget: these are quiet pages — the expected flag-yellow count is ZERO on all
  three (the kit 404 CTA is outline). If a composition genuinely earns an accent,
  justify it explicitly.
- Honest tone — no urgency, no invented claims, no fake counters; AA contrast; touch
  targets ≥44px; images lazy below the fold. No loading states (SSG pages, static
  data).
- If a composition genuinely needs something the DS lacks, do NOT silently improvise a
  style — build the page with it, but list it separately as a "proposed DS addition"
  for ratification.

Design-load (must exist in the prototype): the reports grid with all 8 real photos and
exactly ONE captioned figure; about with the real paragraphs (kept or proposed closing
line — show whichever you propose, labeled); the 404 reachable. Both locales, both
breakpoints.

Deliverable: ONE worked composition per surface — no variant forks; polish across both
breakpoints, both locales. Ship as new files (`screens/reports/`, `screens/about/`,
`screens/404/`), clearly separated.

Because the prototype is cumulative and this brief COMPLETES it, WIRE the whole site:
the header nav and footer «звіти»/«про нас» entries route to the new pages from every
screen; add an obvious dead-link demo (or toggle) that lands on the 404. After this
brief the prototype should demo the ENTIRE site on mocked data — home → catalog →
category → product → drawer → checkout → success, plus reports, about, and the 404.

(One implementation note you can ignore while designing: the runtime-error screen will
reuse your 404 composition with a retry button at implementation time — no separate
design needed unless you believe it deserves its own treatment.)
