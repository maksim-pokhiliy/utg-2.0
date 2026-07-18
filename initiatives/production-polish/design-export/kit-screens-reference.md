# Kit screen compositions (verbatim from `ui_kits/storefront/`, pulled 2026-07-18)

The ratified screen specs for 4b/4c. Inline styles are the kit's medium — translate to
DS components/token utilities; structure, hierarchy, and values are the spec. The kit's
simulated loading (550ms skeleton timeout in Category) is prototype theater — our pages
are SSG with synchronous data: NO loading states on catalog pages.

## Home

Two sections above the catalog grid:

1. **Hero** (paper, 2px ink bottom border): flex-wrap row — left column (`flex 1 1 420px`): three-line `Ukrainian / Tactical / Gear` in `--type-hero`, mission paragraph (`--type-body`, ink-soft, max 44ch, margins 20/24), then a row with `Button variant="accent"` → `/category` (label = kit `get` string) and an Instagram IconLink (mono caps). Right column (`flex 0 1 340px`, centered): the logo image (`public/logo.png`, width min(100%,320px), alt "UTG — skull in headset with bayonet").
2. **Band**: `utg-band` with `h2` = merch title + right-aligned mono caption counter «3 категорії» / "3 categories" (band-muted).
3. **Category grid**: `repeat(auto-fit,minmax(240px,1fr))`, gap 24. Each tile = card (2px ink border): square media image, body row = display-caps category name (text-h3) + `arrow-right` icon, space-between, padding 14/16.

## Category

`SectionBand kicker="/ {catTitle}" title={category name}` → container → grid
`repeat(auto-fill,minmax(min(240px,100%),1fr))` gap 24 of **ProductCard**: square media
with Badge (in/out) overlaid top-left, out-of-stock image 45% grayscale + 70% opacity,
body = title (body font, no transform) + Price; whole card is the link.

## Product

- **Back-link** above the grid: mono 500 12px caps, left-rotated chevron icon, `{back} {category name}` → category page. (This is the kit's answer to breadcrumbs.)
- Grid `repeat(auto-fit,minmax(min(340px,100%),1fr))` gap 40, align start.
- **Left**: image in 2px ink border on white, aspect 1, object-cover; Badge (in/out) absolute top-left; out-of-stock → grayscale(.45) opacity .7.
- **Right column** (flex col, gap 18): title (display h2, clamp 1.75–2.25rem), `Price big` (muted when out of stock), description block (label «Опис»/Description + body paragraph ink-soft max 52ch), **size selector** (label «Розмір»/Size + chip row: min-width 48px, height 44px, 2px ink border, mono 500 0.9375rem; active = ink bg + paper text; inactive = transparent + ink), hair Divider, then:
  - in stock: quantity label + QuantityStepper, `Button block` add-to-cart;
  - out of stock: sizes as plain Badges, `outMsg` paragraph (small, ink-faint, 44ch), `Button variant="outline"` with Instagram icon → Instagram.

## Reports (NO carousel — the kit replaced it with a grid)

`SectionBand kicker="/ UTG" title={reports}` with intro paragraph inside the band
(small, band-muted, 52ch). Grid `repeat(auto-fill,minmax(min(260px,100%),1fr))` gap 24
of `<figure>`: square image, 2px ink border, `loading="lazy"`; figcaption = mono caps
numbered `01…08` (ink-faint), report #3 additionally carries `reportCaption1`. Do not
invent captions for other reports.

## About

`SectionBand kicker="/ UTG" title={about}` → narrow column (max 760px): two body
paragraphs (`about1`, `about2` — second in ink-soft), then `no_commercial` photo
(max 520px, 2px ink border, lazy).

## 404

`SectionBand kicker="/ 404" title={nfTitle}` → column max 560px: `nfBody` paragraph
(ink-soft), `Button variant="outline"` → `/category` with `nfCta`.

## Kit dictionary copy (verbatim; 4b takes what its screens need, checkout strings are 4c)

| key | uk | en |
| --- | --- | --- |
| get | Замовити мерч | Get Merch |
| catTitle (kicker) | Категорія | Category |
| back | Назад до | Back to |
| size | Розмір | Size |
| description | Опис | Description |
| outMsg | Наразі немає в наявності. Слідкуйте за оновленнями в Instagram. | Currently out of stock. Follow updates on Instagram. |
| reportsIntro | Кожна закупівля — з ваших замовлень. Фотозвіти підрозділу. | Every purchase is funded by your orders. Photo reports from the unit. |
| reportCaption1 | На матеріали для виготовлення ініціаторів для FPV | For material for the manufacture of initiators for FPV |
| nfTitle | Сторінку не знайдено | Page not found |
| nfBody | Такої сторінки немає. Можливо, товар знято з продажу. | This page doesn't exist. The item may have been removed. |
| nfCta | До мерчу | To merch |
| about1 | (keep existing uk `about.site_created`) | This site was created exclusively as a volunteer project. The idea appeared due to numerous requests from subscribers to make merch and as another opportunity to collect a resource to cover the needs of the unit we support. |
| about2 | (keep existing uk `about.all_proceeds`) | (keep existing en; kit matches) |

Note on about1/en: the kit fixes the awkward legacy "the under-boss's special unit" to
"the unit we support" — adopt the kit version (DEF-14 good-copy rule).

Checkout strings (customer/delivery/summary/successTitle/successNote/required/f.*) are
reserved for 4c — do not add them in 4b.
