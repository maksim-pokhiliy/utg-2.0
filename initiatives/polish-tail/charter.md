# polish-tail — charter

**Goal.** Drain the actionable tail of the production-polish canonical ledger — the
carry-forwards that production-polish and ua-checkout (both COMPLETE) left open — so the
shop and the relay carry no known debt that is worth code.

**Driving decision(s).** D-1 (packaging: a new initiative, four windows, the contract
pair first and atomic). The canonical ledger is `../production-polish/deferred.md`; the
originals with their measurements are `../ua-checkout/deferred.md`. Standing rulings
that FENCE this work (not to be re-litigated inside a step): ua-checkout D-16…D-22
(cache/damper/fan-out, body-mirroring, abort direction, page-success), and the
bot-polish B3-Q1 ruling recorded in `../ua-checkout/requirements.md` §5 — the relay
accepts ANY non-empty `contact_channel` and renders unknown values verbatim; the
vocabulary pin is test-level on both sides, never a decoder enum.

**Acceptance criteria.**

1. **P1 — contract pair.** The channel vocabulary `call | telegram | viber` is pinned at
   VALUE level by executable tests in BOTH repos: renaming a value on either side
   reddens that side's suite (mutation-proven). The relay's `CONTACT_CHANNEL_TEXTS` keys
   and the shop's emitted values are each pinned against their repo's contract fixture;
   the relay's verbatim fallback for unknown values stays. The relay's currency read is
   case-pinned (UAC-26's named item). The shop logs a warn on an unrecognised warehouse
   category (unit-pinned). Both PRs merge as a pair; prod smoked after.
2. **P2 — hardening.** UAC-20 closed with the cache and single-flight joiners provably
   unpoisoned; UAC-14's second door locked; UAC-19 (2)(3) closed or re-ratified and
   (1)(5) triaged; UAC-21 paid; UAC-16/22/23 triaged — every item closed or DROPPED with
   a recorded reason. The fail-open fallback e2e stays green throughout.
3. **P3 — policy.** UAC-25's two halves — an origin check, and a rate limit that is not
   a per-lambda `Map` — each land or are DROPPED by a ratified decision naming the
   mechanism considered; the choice is probed, not asserted.
4. **P4 — DS window.** UAC-8 closed (one chip base, `SizeSelector` composes it and gains
   its first tests; one fade-duration source); UAC-4's kit backport pass run via
   /design-sync.
5. Every closure is recorded in the canonical ledger, not only here; prod is verified
   alive after every merged step; the zero-env invariant holds throughout.

**Scope.** The OPEN inherited UAC rows of the canonical ledger — UAC-27 (the schedulable
core), UAC-26 (the currency-case item now; the rest stays unscheduled hygiene), UAC-25,
UAC-21, UAC-20, UAC-19, UAC-16, UAC-14, UAC-8, UAC-4, and the UAC-22/23 triages — plus
the relay-side halves those rows carry (`../utg-tg-order-bot`).

**Non-goals.** DEF-9 (external Firebase ticket); DEF-18 (React Compiler adoption — a
platform decision, not polish); re-litigating UAC-23(1) (the D-17 "unparseable success
stays distress" ruling stands; its trigger is carrier drift, nothing else); UAC-24 (the
deliberately unprovable Firefox blur guard — rides along the day Firefox coverage
arrives for another reason); new features; visual changes beyond the DS-hygiene pair.

**Sacred (do not touch).** Catalog data (`src/data/`); frozen `ICartItem`; the v2
envelope — both halves move only in a paired step; the sealed DS and its lint (no escape
hatch); rulings D-16…D-22; `place_order`'s fail-open limiter identity (a false 429 costs
a real volunteer order); zero-env build/boot/e2e; prod takes real orders — every merge
leaves checkout able to submit.
