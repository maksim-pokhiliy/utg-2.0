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

E-commerce merch store for Ukrainian Tactical Gear (volunteer initiative): Next.js 14 App Router, TypeScript (strict), Recoil, Tailwind + Flowbite React, and a typed static in-repo catalog (`src/data/`) — no database. Two locales: `uk` (default) and `en`. There are no tests and no CI.

## Commands

Yarn is the package manager.

- `yarn dev` — dev server on localhost:3000
- `yarn build` — production build
- `yarn lint` / `yarn lint:fix` — ESLint (`next/core-web-vitals`; `react-hooks/exhaustive-deps` is disabled)
- `yarn format` — Prettier over the repo

The app boots and builds with zero env vars (the exchange-rates fetch is guarded → prices fall back to UAH for both locales). `.env.example` documents the three optional keys: `EXCHANGE_RATE_API_URL`, `EXCHANGE_RATE_API_KEY` (USD conversion for `en`), `PLACE_ORDER_URL` (order relay — checkout returns 503 without it).

## Architecture

Path alias: `@root/*` → `src/*`.

### Routing & i18n

- There is no `src/app/layout.tsx` — `src/app/[lang]/layout.tsx` is the root layout (renders `<html>`, loads the dictionary, fetches exchange rates with `revalidate: 3600`, mounts `RecoilProvider`). Every page URL is locale-prefixed; `dynamicParams = false` makes unknown locales 404.
- `src/middleware.ts` redirects locale-less paths to `/uk/...` or `/en/...` via Accept-Language negotiation; `_next`, `api`, and public files (dot-containing paths) are excluded.
- Dictionaries live in `src/app/[lang]/dictionaries/{uk,en}.json`, loaded server-side by `getDictionary` (`server-only`), then seeded into Recoil for client components.
- Catalog pages (`/`, `/category`, `/category/[categoryId]`, `/category/[categoryId]/[productId]`) are plain segments — server components with `generateStaticParams` + `generateMetadata`, fully SSG. `about`, `checkout`, `reports` are client/`*Screen`-based segments. `error.tsx`/`not-found.tsx` live under `[lang]`.

### Page pattern

Catalog `page.tsx` files are server components: they read the catalog module synchronously, resolve the locale, and pass localized view objects as props to presentational `*Screen` components (`src/components/pages/`). Screens are still `"use client"` and read the dictionary from Recoil (`dictionaryState`), not props.

### Data

- `src/data/` is the catalog: `catalog.types.ts` (canonical bilingual types + flat `*View` types), `catalog.ts` (data verbatim from the recovered 1.0 sources + accessors returning locale-resolved views), `index.ts` (barrel, incl. `resolveLocale`).
- Catalog data is sacred business data (titles, UAH integer prices, availability, sizes, uk/en descriptions) — never invent or edit it without an explicit decision; `initiatives/production-polish/extracted/` holds the recovered sources of truth.
- URL slugs are lowercase (`patches`, `tshirts`, `patches/waiting`, `tshirts/death-black`).
- The only API route left is `POST /api/place_order` — proxies the checkout payload to the external `PLACE_ORDER_URL` relay, forwarding upstream status; its 500 body carries no internal details. The payload field shape (`first_name`…`cart[{title,quantity,productUrl,…}]`, `locale`, `total`) is a sacred contract with the bot.
- All images are local under `public/images/` (products, reports, `no_commercial.JPG`), logo at `public/logo.png`, favicon via `src/app/favicon.ico`. Fonts still come from external CDNs (Wix) until the design-system step.

### State & money

- Recoil atoms in `src/recoil/atoms.ts`: `cartState` (persists to localStorage via atom effects; storage key `utg-cart-v2` in `src/utils/constants/recoil.ts`), `sidebarState`, `languageState`, `dictionaryState`, `moneyState`-style coefficient/currency seeded by `RecoilProvider` from server props at hydration.
- Prices are stored as UAH integers in the catalog. The layout resolves `{coefficient, currency}` server-side: with rates available `en` converts to USD; with rates unavailable both locales show real UAH amounts as `₴` (never `$` on a UAH magnitude). Known quirk: client-side locale switching does not re-seed Recoil (initializeState runs once) — money/dictionary can go stale until a hard navigation; the state-migration step fixes this.

### Styling

Tailwind + Flowbite React (wired in `tailwind.config.ts`). Custom color tokens (`site`, `custom-1`), the `btn-main` component class, and remote `@font-face` declarations live in `src/app/globals.css` and the Tailwind config.

## Quirks

- Production deploys to Vercel (project `utg`, domain ua-tactical-gear.com) from `master`.
- `framer-motion` is an unused dependency (its last consumer was deleted); removal is scheduled for the design-system step.
