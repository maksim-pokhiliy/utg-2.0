# UTG — Ukrainian Tactical Gear · Design System

**UTG** (ua-tactical-gear.com) is a bilingual (Ukrainian default / English) volunteer merch storefront — patches, stickers, t-shirts. Every hryvnia of proceeds buys equipment for a Ukrainian special-forces unit. It is **a donation shop wearing a store's clothes**: no online payments — orders are relayed to a human who contacts the buyer. Traffic arrives mostly from Instagram, on phones → **mobile-first, web only**. Production stack: Next.js App Router + Tailwind + shadcn/ui (tokens here map 1:1 to shadcn CSS variables).

**Direction (fixed, ratified):** black/military **brutalism, sharpened**. Warm-paper + ink, inverted black section bands, zero border radius, condensed uppercase display type. Flag yellow `#FFC657` and blue `#5362AC` are *rare, deliberate* accents — never wallpaper. Anti-goals: tactical cosplay (camo, crosshairs, stencil clichés) AND generic-pretty (gradients, glassmorphism, rounding, heavy shadows). Honest donation-shop tone — no dark commerce patterns (no fake urgency, timers, "3 people viewing"). Mnemonic: **army supply depot paperwork meets modern editorial**.

## CONTENT FUNDAMENTALS

- **Bilingual, Ukrainian first.** Every string exists in uk + en; uk is the default locale. Ukrainian runs 20–30% longer — design for uk («Перейти до Оформлення»), verify in en. Full Cyrillic incl. є ї ґ і is a hard constraint.
- **Tone: honest, direct, unadorned volunteer speech.** No marketing superlatives, no exclamation marks in UI chrome, no urgency mechanics. The About page states plainly: «Цей сайт створено виключно як волонтерський проект…» / "All proceeds… purchase equipment, consumables, and repair equipment."
- **Casing:** nav items lowercase in copy source («мерч», «про нас», «звіти») but *rendered* uppercase by the display layer. Buttons/labels in sentence case in source, display layer uppercases CTAs and headings. Body text: normal sentence case.
- **Person:** shop speaks as «ми» (we, the volunteers) to «ви» (you, formal). English mirrors: "Your cart is empty", "Our manager will contact you shortly".
- **No emoji anywhere.** Meta/labels are set in mono caps like form stamps: `КІЛЬКІСТЬ`, `В НАЯВНОСТІ`.
- **Prices:** ₴ for uk (`₴1 000`, thin/space thousands separator), $ for en (`$25.00`). Prices are data, set in mono.
- **Product names** are quoted slogans: «Death», «Waiting», «Welcome», «UTG». Blunt, unsanitized descriptions — do not soften.
- **Success/error voice:** thankful but procedural — «Дякуємо за ваше замовлення! Наш менеджер зв'яжеться з вами найближчим часом» / "Error when placing an order" (state the fact, keep the form intact).

## VISUAL FOUNDATIONS

- **Color:** one light theme. Warm paper `--paper #FFF9F6` page ground; warm near-black ink `--ink #181512` for text, borders, primary buttons, and inverted **section bands**. Muted surface `--paper-dim #F3EAE4` (skeletons, disabled, muted rows). Flag yellow `#FFC657` = ONE primary-CTA moment per view + in-stock marks; flag blue `#5362AC` = links, focus ring, tiny marks. Destructive `#B42318`. Never yellow text; yellow is a surface with ink on it. All pairs AA (ink/paper 15.9:1, paper/blue 5.4:1, ink/yellow 11.9:1, white/alarm 6.6:1).
- **Type:** Oswald (condensed, weight 500–600, ALWAYS uppercase, tracking +0.015em, leading ≤1) for hero/h1–h3/band titles; IBM Plex Sans 400/500 for body & UI; IBM Plex Mono 500 caps (+0.08em) for meta labels, prices, badges — the "paperwork" voice.
- **Spacing:** 4px base scale (`--space-1..9` = 4/8/12/16/24/32/48/64/96). Container 1200px; page gutter 24px mobile / 56px desktop. Touch targets ≥44px (`--hit`).
- **Radius: 0 everywhere.** Non-negotiable. `--radius:0px`.
- **Borders:** the system's line voice is **2px ink** (`--rule`). 1px hairlines (`--rule-hair`, color `--line`) only for interior table/list rules; 4px (`--rule-heavy`) for emphasis under band titles. Structural borders are ink-colored, never gray.
- **Shadows: none.** Depth comes from inversion (black band/drawer on paper) and 2px rules. Overlays sit on a plain `rgba(24,21,18,.5)` scrim, no blur.
- **Backgrounds:** flat paper or flat ink. No gradients, patterns, textures, or camo. Full-bleed black bands mark section starts (page titles, drawer headers, footer).
- **Imagery:** real amateur product photos on varied backgrounds — honest, not retouched. Treatment: **square (1:1), 2px ink frame**, flat white or in-situ background as shot. Out-of-stock photos: 45% grayscale + 70% opacity. No duotones, no color grading.
- **Motion:** cheap and sharp. 120–200ms, `cubic-bezier(.2,0,0,1)`, opacity/transform only. Drawer slides in 200ms; toasts slide up; skeletons pulse opacity. No bounces, parallax, or scroll effects.
- **Hover:** inversion or yellow. Ink button → yellow bg + ink text (the flag moment); outline button → fills ink/paper-inverted; links ink-underline thickens; product photo zooms 1.03 (200ms). **Press:** translate down 1px, no scale. **Focus-visible:** 2px flag-blue outline, offset 2px — on black bands, paper-colored outline.
- **Layout motifs:** inverted band (`--band`) with uppercase display title; mono-caps meta rows with hairline rules (supply-manifest tables); sticky CTA footers in drawer/checkout; oversized wordmark typography as hero (no hero photo needed).

## ICONOGRAPHY

- **Logo:** monochrome mark — skull in headset with bayonet — `public/logo.png` (640×~450, black on transparent/white). Use as-is, never recolor beyond pure ink/paper inversion, never redraw.
- **Icon system: Lucide** (stroke icons, 2px stroke — matches the 2px rule voice; shadcn/ui's native set). Glyphs used: `shopping-bag`, `menu`, `x`, `plus`, `minus`, `trash-2`, `chevron-down`, `chevron-right`, `arrow-right`, `instagram`, `check`, `loader-circle`. Always `stroke-width="2"`, sized 20/24.
- **No emoji, no icon fonts, no filled/duotone styles.** Unicode chars (₴, ×, —) are legitimate in text.
- The skull logo is the only illustration; there is no other brand illustration set — leave blank rather than invent.

## Components (authoritative inventory)

`core`: Button, IconButton, Icon, Badge, Price, QuantityStepper, Divider, Skeleton. `forms`: Input, Textarea, Select, Field (label+helper+error). `commerce`: ProductCard, CartDrawer, Toast, Dialog. `layout`: SectionBand, Header, Footer. (Icon is a Lucide-subset wrapper so screens never hand-draw glyphs.)

## Notes

- Fonts: **Oswald** (display; Cyrillic-capable) + **IBM Plex Sans/Mono** replace the Wix-era Avenir/Helvetica/Poppins CDN fonts.
- shadcn mapping: `--background/--foreground/--card/--muted/--primary/--secondary/--accent/--destructive/--border/--input/--ring` all defined in `tokens/colors.css`.
- `--secondary` = flag blue; use sparingly (it is an accent, not a workhorse surface).
