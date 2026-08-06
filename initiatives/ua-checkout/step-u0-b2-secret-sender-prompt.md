# Step U0 / bot-polish B2 — the `x-relay-secret` sender (executor prompt)

---

/feature small Step U0 of the ua-checkout initiative (step B2 of the bot-polish initiative in the sibling repo): make this shop authenticate itself to the order relay by sending the `x-relay-secret` header when a secret is configured. Payload-neutral and tiny by design — the order body, the rate limiter, and every failure path stay exactly as they are. Prod takes real orders and auto-deploys `master`: the change must be inert until the env var is set in Vercel.

**Context (read, never edit or stage).** `initiatives/ua-checkout/`: `state.md` (board), `decisions.md` D-9 (why the bot leads), `charter.md` (sacred constraints). The consumer of this header already ships in the relay repo — `../utg-tg-order-bot/src/auth.ts` is the authority on the wire contract: the header is exactly `x-relay-secret`, the relay reads its own `ORDER_RELAY_SECRET`, it trims the presented value before a timing-safe compare, and when its env is unset it authorizes everyone (so a header sent to an unconfigured relay is harmless). `../utg-tg-order-bot/README.md` documents the 401 behavior. The route you are changing is `src/app/api/place_order/route.ts`; `src/app/api/np/client.ts` is the in-repo precedent for reading an optional server-side key.

**Scope:**

1. `POST /api/place_order` sends the header `x-relay-secret: <value>` on its upstream `fetch` **when and only when** `ORDER_RELAY_SECRET` is set in the environment (same variable name as the relay, one secret in two projects). Unset, empty, or whitespace-only → no header at all, and the request goes out byte-identical to today. The value is forwarded verbatim (the relay trims on its side); never log it, never echo it into any response body.
2. `.env.example` documents `ORDER_RELAY_SECRET` as an optional server-only key alongside the existing four, in the same voice as its neighbours.
3. Blank the new key everywhere the other four are blanked (the `yarn e2e` script, both Playwright configs' `webServer.env`, the CI workflow's build step) so the blank-env battery stays deterministic and secretless.
4. Units in the `tests/` mirror: header present with the exact name and verbatim value when the env is set; header absent when unset/empty/whitespace-only; the rest of the upstream request (method, URL, `Content-Type`, body) unchanged in both cases; the existing 503-without-`PLACE_ORDER_URL`, 429, and upstream-status-forwarding paths keep passing untouched.

**Out of scope (hard fence):** the order payload shape (that flips later, in U5a — D-9), the rate limiter, the NP directory routes, anything under `src/components/`, `src/design-system/`, dictionaries, and any new dependency. Do not add retry/backoff, do not change error bodies. Never stage `CLAUDE.md` or anything under `initiatives/`.

**Acceptance gates (verify and report in the PR test plan):**

- `yarn lint`, `yarn format` (run before committing), `yarn typecheck`, `yarn test`, zero-env `yarn build`, blank-env `yarn e2e` — all green.
- With no env var set, the upstream request is provably identical to master's (state how you proved it).
- `grep -rn "ORDER_RELAY_SECRET" src/` shows exactly one read site.

**Resource budget (WSL — mandatory).** Every heavy command (`next build`, full vitest runs, e2e) goes inside `systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=1G -- <cmd>`, with `NODE_OPTIONS=--max-old-space-size=3072` on builds and vitest capped (`--maxWorkers=2`). Heavy commands strictly one at a time. If `systemd-run --user` is unavailable, say so in your report and apply the diet + sequencing alone.

**Constraints:**

- No comments in code; remove existing comments in any region you edit.
- No skip flags (`--no-verify`, `--ignore-engines`, …) — root-cause failures instead.
- Follow the existing route conventions (`place_order` and the NP client are both in front of you).
- Branch from `master`, PR against `master`. Commits and PR text in English, first person, no assistant signatures anywhere.
