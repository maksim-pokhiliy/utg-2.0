# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Initiatives (start here for any non-trivial work)

Long-running work is tracked in `initiatives/` — see `initiatives/README.md` for the
system and roles. The active initiative is named in `initiatives/ACTIVE`. Resume
protocol: `charter.md` → `state.md` (board + next action) → open entries in
`decisions.md`/`deferred.md` → `plan.md`. Executor sessions run one scoped step from a
`step-*-prompt.md` file and must not edit initiative files or stage untracked planner
artifacts (`CLAUDE.md`, `initiatives/`) into PRs.

## Project

E-commerce merch store for Ukrainian Tactical Gear (volunteer initiative): Next.js 16 App Router (Turbopack) + React 19, TypeScript (strict), Zustand + React context for state, Tailwind 4 with a SEALED in-repo design system (`src/design-system/` — see below), and a typed static in-repo catalog (`src/data/`) — no database. Two locales: `uk` (default) and `en`. There are no tests and no CI.

## Commands

Yarn is the package manager.

- `yarn dev` — dev server on localhost:3000 (Turbopack)
- `yarn build` — production build
- `yarn lint` / `yarn lint:fix` — ESLint 9 flat config (`eslint.config.mjs`): `next/core-web-vitals` with `react-hooks/exhaustive-deps` active; the two react-hooks v6 Compiler-era rules are deliberately off (DEF-18); `initiatives/` is ignored. The config also enforces the design-system seal with hard errors outside `src/design-system/`: no raw color values, no raw text-size utilities, no deep imports past the barrel, no raw `<button>`/`<a>` JSX, no Dialog-internals imports.
- `yarn format` — Prettier over the repo (`initiatives/production-polish/extracted/` is excluded — documentary recovered sources stay verbatim)

The app boots and builds with zero env vars (the exchange-rates fetch is guarded → prices fall back to UAH for both locales). `.env.example` documents the three optional keys: `EXCHANGE_RATE_API_URL`, `EXCHANGE_RATE_API_KEY` (USD conversion for `en`), `PLACE_ORDER_URL` (order relay — checkout returns 503 without it).

## Architecture

Path alias: `@root/*` → `src/*`.

### Routing & i18n

- There is no `src/app/layout.tsx` — `src/app/[lang]/layout.tsx` is the root layout (renders `<html>`, loads the dictionary, fetches exchange rates with `revalidate: 3600`, mounts `I18nProvider`). Every page URL is locale-prefixed; `dynamicParams = false` makes unknown locales 404. `params` are async (`Promise<{lang}>`) everywhere per Next 16.
- `src/proxy.ts` (Next 16 name for middleware) redirects locale-less paths to `/uk/...` or `/en/...` via Accept-Language negotiation; `_next`, `api`, and public files are excluded.
- Dictionaries live in `src/app/[lang]/dictionaries/{uk,en}.json`, loaded server-side by `getDictionary` (`server-only`), typed as `typeof en` with a `satisfies Record<Locale, Dictionary>` drift-guard (a missing uk key is a compile error), and delivered to client components via `I18nProvider`.
- Catalog pages (`/`, `/category`, `/category/[categoryId]`, `/category/[categoryId]/[productId]`) are plain segments — server components with `generateStaticParams` + `generateMetadata`, fully SSG. `about`, `checkout`, `reports` are client/`*Screen`-based segments. `error.tsx` lives under `[lang]`; the 404 is an ordinary catch-all page (`/[lang]/[...rest]`) rendered inside the real layout — dead URLs under a valid locale answer 200 + `robots noindex` (soft-404, DEF-29; there is deliberately no `not-found.tsx` — a boundary cannot compose with the root layout living inside the dynamic segment).

### SEO

Every page builds its metadata through `buildPageMetadata()` in `src/utils/seo.ts` (canonical + hreflang uk/en/x-default + per-page OG on the `https://www.ua-tactical-gear.com` metadataBase — the apex 308s to www); the layout owns the invariants (title template, robots, twitter, OG defaults) because a child `openGraph` REPLACES the parent's, never merges. `sitemap.ts` (38 URLs from catalog accessors; checkout and the 404 excluded) + `robots.ts`; product pages carry Product JSON-LD with offers always in UAH (the operator charges UAH — display currency is informational). Zero invented copy: descriptions derive from dictionary strings; `SITE_NAME` is the one locale-neutral constant.

### Page pattern

Catalog `page.tsx` files are server components: they read the catalog module synchronously, resolve the locale, and pass localized view objects as props to presentational `*Screen` components (`src/components/pages/`). Screens are `"use client"` and read `{locale, dictionary, money}` from `src/i18n/` context hooks (`useDictionary`/`useMoney`/`useLocale`).

### Data

- `src/data/` is the catalog: `catalog.types.ts` (canonical bilingual types + flat `*View` types), `catalog.ts` (data verbatim from the recovered 1.0 sources + accessors returning locale-resolved views), `index.ts` (barrel, incl. `resolveLocale`).
- Catalog data is sacred business data (titles, UAH integer prices, availability, sizes, uk/en descriptions) — never invent or edit it without an explicit decision; `initiatives/production-polish/extracted/` holds the recovered sources of truth.
- URL slugs are lowercase (`patches`, `tshirts`, `patches/waiting`, `tshirts/death-black`).
- The only API route left is `POST /api/place_order` — proxies the checkout payload to the external `PLACE_ORDER_URL` relay, forwarding upstream status; its 500 body carries no internal details. A per-IP in-memory rate limiter (5/60s, 429 + Retry-After) runs before body parsing and fails OPEN when no client identity exists — a false 429 costs a real volunteer order. The payload field shape (`first_name`…`cart[{title,quantity,productUrl,…}]`, `locale`, `total`, `currency` per D-12) is a sacred contract with the bot (the bot reads `currency` in a separate bot-repo follow-up).
- All images are local under `public/images/` (products, reports, `no_commercial.JPG`), logo at `public/logo.png` (intrinsic 640×448), favicon via `src/app/favicon.ico`.

### State & money

- Client state is exactly two Zustand stores (`src/store/`): `cart.ts` (persists to localStorage key `utg-cart-v2` as a RAW JSON array via a custom `PersistStorage` — not Zustand's envelope; `skipHydration` + `<CartHydration/>` rehydrates post-mount; quantities normalized ≥1 at every entry) and `sidebar.ts` (ephemeral). Cart line identity is size-aware (DEF-3): `composeCartLine` in `cart.ts` is the single encoder — sized lines get `id = slug::SIZE` and `title = Title · SIZE`, sizeless lines keep the bare slug; the size reaches the order bot inside the existing `title` payload field (no new keys; `ICartItem` is frozen — a new field is a compile error).
- Everything else (`locale`, `dictionary`, `money`) is server-resolved per request and flows through `I18nProvider` (`src/i18n/`) — re-renders with fresh props on locale navigation, so nothing goes stale.
- Prices are stored as UAH integers in the catalog. The layout resolves `{coefficient, currency}` server-side: with rates available `en` converts to USD; with rates unavailable both locales show real UAH amounts as `₴` (never `$` on a UAH magnitude).

### Styling — the sealed design system (D-10)

- `src/design-system/` is the ONLY styling authority: Tailwind 4 CSS-first theme (`styles/theme.css` — the default palette and text scale are WIPED; only UTG semantic tokens exist), shadcn-style primitives, and a single public barrel `index.ts`. App code imports from `@root/design-system` only; the global stylesheet reaches the layout via CSS `@import`, not JS.
- Raw colors (hex/rgb/hsl/oklch) and raw font-size utilities exist ONLY inside the DS. App text renders through `Typography` (variants hero/h1/h2/h3/nav/body/small/caption/price); page width through `Container` (maxWidth prop). Styled interactive elements are DS components (`Button`, `IconButton`, `TextTab`, `IconLink` — whose optional `label` renders the sealed icon+mono-caps treatment, `SizeSelector` — controlled single-select chip row); raw `<button>`/`<a>` outside the DS is a lint error. `bg-white` is the one palette-named utility exempt from the seal lint (it resolves to the DS `--color-white` token; the default palette is wiped). Composite patterns are closed intent-API exports (`Dialog` title/children/actions + size panel|full, `ConfirmDialog`, `CategoryTile` index/name/media + optional meta, `ProductCard` title/price/media + availability states, `SectionBand` title/meta/linkable-kicker, `CartLine` media/title/quantity/total + remove, `MediaFigure` clickable framed-media control, `Lightbox` image-first viewer with clamped prev/next — its end chevrons use `aria-disabled`, never `disabled`: a real `disabled` on the focused control strands focus outside the Radix trap) — building blocks stay internal. Layout containers (div/flex/gap/spacing) remain app-land.
- Fonts self-hosted via `next/font/google` (declared once in `src/app/fonts.ts`): Oswald (display, uppercase), IBM Plex Sans (body), IBM Plex Mono (prices/meta labels) — latin + cyrillic subsets, zero external font/CDN requests.
- The visual spec is `initiatives/production-polish/design-export/` (verbatim from the ratified Claude Design project — read-only); violations of the seal fail `yarn lint`, and there is no `eslint-disable` escape hatch (comments are banned repo-wide).

## Quirks

- Production deploys to Vercel (project `utg`, domain ua-tactical-gear.com) from `master`.
- `next dev` may rewrite `tsconfig.json` array formatting that Prettier then collapses back — if you see a parasitic tsconfig diff, run `yarn format` and move on.
