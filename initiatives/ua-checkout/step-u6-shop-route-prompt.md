# Step U6 (shop half) — the forwarding route gets tested and bounded (executor prompt)

---

/feature Step U6's shop half. The relay's half of this step deletes its v1 path in the other
repo; **the shop needs no contract change at all** — it has sent `version: 2` since U5a and its
contract test already pins it. What the shop owes this window is the thing the contract close
keeps pointing at and nobody has done: `POST /api/place_order`, the route that carries every
real volunteer order, **is exercised only through a stubbed `fetch` and is bounded by nothing.**
This store auto-deploys `master` and takes REAL orders.

## Scope — one route, its tests, and one e2e

**1. DEF-37 — a real HTTP hop, not a stubbed one.** Today `tests/app/api/place_order/route.test.ts`
(10 cases) and `redirect.test.ts` drive the route with `fetch` stubbed, and no e2e touches
`PLACE_ORDER_URL` at all — the battery blanks it so checkout answers a deterministic 503. So the
one thing never proven is that the route actually forwards over the wire: the body it sends, the
`x-relay-secret` it injects, and the upstream status it mirrors back.

**Design this and bring it to the plan gate — do not hand-wave it.** A browser-level Playwright
route stub cannot help here: the forward happens server-side, so intercepting the browser→shop
call proves nothing about shop→relay. The honest options are a throwaway stub upstream started
alongside the Playwright `webServer` with `PLACE_ORDER_URL` pointed at it, or an integration test
that starts the route against a real local listener. Say which you propose, what it asserts, and
how it stays deterministic and secretless in CI. **Whatever you choose must not weaken the
zero-env invariant**: with no env vars the build, the boot and the rest of the battery stay green
and the checkout still answers its deterministic 503.

**2. UAC-12 + the bounded half of UAC-25 — the same file, so they ship together.** The route
currently buffers the whole upstream body with `response.text()` (an 8 MB body was measured
re-emitted in full), forwards the upstream `Content-Type` verbatim with no allowlist and no
`nosniff`, and forwards with **no abort signal, no timeout and no `maxDuration`** (grep finds
only `redirect: "error"`). Fix all four:

- cap what is buffered from upstream, and decide what the route answers when the cap is hit;
- allowlist the `Content-Type` it re-emits and add `nosniff`;
- give the forward an abort signal and a deadline, and give the route a `maxDuration`.

State the numbers you pick and why. The upstream is a Vercel function with a 300s ceiling, but a
buyer waiting on a checkout button is the real constraint — pick for the buyer.

**3. One stale name.** `tests/components/checkout/payload.test.ts` has a case named "stamps
version 2 so the relay can tell it from the v1 body". After the relay's half of this step there
is no v1 body to tell it from. The assertion is right and stays; the name is a claim that will
have expired, so fix the name.

## Explicitly OUT of scope

- **The rate limiter.** `src/app/api/rate-limit.ts` is an in-memory per-lambda `Map`, so the
  5/60s budget is per instance rather than per shop. That is the rest of UAC-25 and the owner has
  ruled it a separate decision — it is a choice of mechanism (platform-level rate limiting versus
  external state), not a route edit. Do not touch it, and do not "improve" it in passing.
- **Origin checks** on the route. Same reason: a policy decision, not hygiene.
- **UAC-20** (the directory client's abort is never linked to the upstream fetch). Different
  route, different semantics, deliberately deferred.
- The relay repo (`../utg-tg-order-bot`) — do not open, edit or stage anything there.
- The checkout UI, the payload composer, the v2 envelope shape, `ICartItem`, catalog data, the
  design-system seal, new dependencies.

## Acceptance gates — verify and report each

- The full battery green: `yarn lint`, `yarn format`, `yarn typecheck` (BOTH programs),
  `yarn test`, the zero-env `yarn build`, `yarn e2e`.
- **The zero-env invariant holds**, stated explicitly: no new env var is required for the build,
  the boot, or any spec that is not the new forwarding one.
- Any new e2e spec registers its own identity in `SPEC_CLIENT_IPS` in `e2e/support/app.ts` — the
  module throws on duplicates at import time, and an unregistered spec silently shares the
  socket-derived bucket.
- **Every fix mutation-proven**: one surgical, typecheck-valid mutation per claim, on a COMMITTED
  tree, each reported with the single named test it reddens, each reverted. A mutation reddening
  dozens proves the mutation was wrong, not the gate strong. If a mutation SURVIVES, first ask
  whether the environment can even produce the input that separates the two versions before
  blaming the tests — jsdom and Chromium have both failed to produce such an input in this repo
  before.
- The PR body carries the owner's verification checklist as `- [ ]` checkboxes.

## Resource budget (WSL — mandatory)

Every heavy command runs inside
`systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=1G -- <cmd>`, with
`NODE_OPTIONS=--max-old-space-size=3072` on builds. Heavy commands strictly one at a time —
never a build concurrently with a test run.

## Constraints

- No comments in code; remove existing comments in any region you edit.
- No skip flags (`--no-verify`, …) — root-cause failures instead.
- Match existing style and the design-system seal absolutely.
- Branch from `master`, PR against `master`. English, first person, lowercase subject, no
  assistant signatures anywhere.
- Never stage `CLAUDE.md` or anything under `initiatives/`.
- **Never POST to the deployed relay, the shop, any Vercel URL or the Нова Пошта API.** Tests run
  against local stubs; the planner owns every live probe.
