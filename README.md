# Ukrainian Tactical Gear — merch storefront

A small bilingual (Ukrainian / English) storefront for Ukrainian Tactical Gear, built as a volunteer project. It grew out of repeated requests from the community for branded merch and doubles as a way to raise funds: proceeds go toward equipment, consumables, and repairs for a Ukrainian military unit.

The catalog is a small typed module baked into the repo (`src/data`), with all product images served locally from `public/`. Prices are stored in UAH and shown as UAH (₴) on the `uk` locale, or converted to USD on `en` when live exchange rates are available. Checkout relays each order to an external service.

## Stack

- Next.js 14 (App Router) + React 18, TypeScript (strict)
- Server-rendered catalog pages (RSC) from a static typed catalog module (`src/data`)
- Tailwind CSS + Flowbite React
- Recoil for client state (cart, sidebar)
- i18n via per-locale JSON dictionaries (`uk` default, `en`)

## Getting started

Prerequisites: Node.js 18+ and Yarn.

```bash
yarn install
cp .env.example .env.local   # then fill in the values
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) — you are redirected to `/uk` or `/en` based on your browser language.

The app boots and builds with no environment variables at all — the catalog is static and prices fall back to UAH (₴). The variables only enable live currency conversion and checkout: `EXCHANGE_RATE_API_URL` + `EXCHANGE_RATE_API_KEY` convert UAH prices to USD on the `en` locale, and `PLACE_ORDER_URL` is the external order-relay service the checkout posts to. See `.env.example`.

## Scripts

| Command | What it does |
| --- | --- |
| `yarn dev` | Start the dev server on http://localhost:3000 |
| `yarn build` | Production build |
| `yarn start` | Serve the production build |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Run ESLint with autofix |
| `yarn format` | Format the repo with Prettier |
