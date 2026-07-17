# D2 — Screen prototypes (Claude Design brief)

Run AFTER the D1 system is reviewed. Paste into the same Claude Design session so it
builds on the ratified system; if a new session, re-attach/reference the D1 sheet first.

---

Using the design system we just built (same tokens, type, primitives — do not reinvent), prototype every screen of the UTG storefront. Mobile-first (375px) with a desktop variant for each. Both locales exist — default all copy to Ukrainian, show at least one screen in English for comparison.

## Screens

1. **Home.** Typographic hero built from the wordmark "UKRAINIAN TACTICAL GEAR" + UTG logo asset — no hero photograph available (design must stand without one; include an optional photo slot variant for later). One-line mission statement: volunteer project, all proceeds equip a Ukrainian unit. Category tiles (Patches / Stickers / T-Shirts) with photos. Instagram link. This page must make both the *shop* and the *cause* obvious in five seconds.
2. **Catalog** (`/category`): the three category tiles as a grid under a black section band.
3. **Category** (`/category/patches` etc.): product grid of cards (photo, title, price, availability badge); out-of-stock cards stay visible but clearly muted.
4. **Product page**: square photo, title, price, description paragraph, size selector (chips: M / L / XL / 2XL — only for t-shirts), quantity stepper, add-to-cart primary CTA; the complete out-of-stock variant (no dead controls, honest message). Note: sizes exist in data but were never shown before — this is their debut.
5. **Cart drawer**: per the D1 primitive, now with 2–3 real items, one long-titled item, total, "Proceed to Checkout"; the empty state.
6. **Checkout**: customer details (first name, last name, phone/Telegram), delivery (country, region, city, address, additional info textarea), order summary column with items + total; Place Order CTA with loading state; success confirmation state ("manager will contact you shortly" — orders are relayed to a human, no online payment: make that expectation clear) and error state that keeps everything intact.
7. **About**: mission text (volunteer, non-commercial, proceeds → equipment) + one photo.
8. **Reports**: photo gallery/carousel of purchase reports, some with captions (e.g. "For material for the manufacture of initiators for FPV") — this page is the donors' proof-of-impact, give it weight.
9. **404 / error page** in the same voice.

## Chrome

- **Header**: UTG wordmark, language switcher (UA/EN), cart icon with count, burger → full-screen black nav overlay (Home / Merch / Reports / About, Instagram).
- **Footer**: not the current empty strip — mission one-liner, nav links, Instagram, © UTG. Keep it short but real.

## Content (use verbatim, no lorem)

- Patches ₴300 each: «Waiting», «Welcome», «Death», «UTG»; set of three — ₴800. In stock.
- Sticker Pack — ₴250. In stock.
- T-shirts ₴1 000: «Death» (black/green/grey), «Welcome» (black/green/grey); sizes M–2XL. All out of stock.
- Product description sample: "Small print on the left chest: Ukrainian Tactical Gear logo. Back print with 'Welcome to Ukraine, suka!' slogan and large graphic."
- Prices display as ₴ for Ukrainian, $ for English.

## Guardrails

- No dark commerce patterns: no fake urgency, no countdown timers, no "3 people are viewing this". It is a donation shop — honesty is the aesthetic.
- Every interactive element maps to a D1 primitive; if a screen needs a primitive D1 lacks, add it explicitly as a system addition, not a one-off.
- Keep images square (real amateur product photos) with the D1 frame treatment.
- Show loading skeletons for category grid + product page.
