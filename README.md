# Ukrainian Tactical Gear — merch storefront

A small bilingual (Ukrainian / English) storefront for Ukrainian Tactical Gear, built as a volunteer project. It grew out of repeated requests from the community for branded merch and doubles as a way to raise funds: proceeds go toward equipment, consumables, and repairs for a Ukrainian military unit.

The catalog lives in Firestore. Prices are stored in UAH and shown as UAH on the `uk` locale or converted to USD on `en`. Checkout relays each order to an external service.

## Stack

- Next.js 14 (App Router) + React 18, TypeScript (strict)
- Tailwind CSS + Flowbite React
- Recoil for client state
- Firebase Admin SDK (Firestore) for the catalog
- i18n via per-locale JSON dictionaries (`uk` default, `en`)

## Getting started

Prerequisites: Node.js 18+ and Yarn.

```bash
yarn install
cp .env.example .env.local   # then fill in the values
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) — you are redirected to `/uk` or `/en` based on your browser language.

`.env.local` provides live data. Without Firebase credentials the catalog API returns 503 and the app still boots and builds; without the exchange-rate keys, prices fall back to UAH. See `.env.example` for the full list of variables.

## Scripts

| Command | What it does |
| --- | --- |
| `yarn dev` | Start the dev server on http://localhost:3000 |
| `yarn build` | Production build |
| `yarn start` | Serve the production build |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Run ESLint with autofix |
| `yarn format` | Format the repo with Prettier |
