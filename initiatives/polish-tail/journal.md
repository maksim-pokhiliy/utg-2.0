# polish-tail — journal

Append-only. One entry per session/step.

## 2026-08-22 — initiative opened: the ledger tail gets a driver

- production-polish and ua-checkout are both COMPLETE; their open carry-forwards sat in
  the canonical ledger with no driver. polish-tail is that driver. The package map was
  agreed with the owner and fixed as D-1: P1 contract pair (UAC-27 core + UAC-26's
  currency-case item + the unrecognised-category warn), P2 hardening (UAC-20/-14/
  -19(2)(3)/-21 + triage of 16/22/23), P3 place_order policy (UAC-25), P4 DS window
  (UAC-8 + UAC-4).
- P1 fact-finding at open: the relay's `CONTACT_CHANNEL_TEXTS` is
  `call → Дзвінок / telegram → Telegram / viber → Viber` with a verbatim `?? value`
  fallback (B3-Q1 honored), and `contract.ts` pins keys only — the value coupling is
  exactly as UAC-27 recorded it.
- Administrative ledger sweep at open: **UAC-7 CLOSED** (it was SCHEDULED to the U7
  browser gate; the gate ran 2026-08-21 and raised nothing — the watch completed; the
  D-6.2 combobox consumer contract stays recorded in ua-checkout). **UAC-26 restored** —
  ua-checkout's close-out promoted every other open row but this one (an omission found
  by diffing the two ledgers); added to the inherited table with the currency item
  scheduled to P1. The remaining open rows were stamped with their polish-tail windows.
  `requirements.md:186` corrected to the shipped wording (a missing `source` renders as
  «не вказано — уточніть у дзвінку», not the stale English "not stated") — the doc half
  of UAC-27, a planner-owned file.
- Next: /step P1.

## 2026-08-22 — P1 shipped: the pair merged, and both halves were reshaped by measurement

- The contract pair merged ten seconds apart and was prod-smoked: relay PR #7 (squash
  `aa10f56`) + shop PR #26 (squash `e48442a`). Smoke: home 200; settlements 200 with
  real rows; warehouses 200 THROUGH the restructured directory + tripwire (Ірпінь, 627
  points, real labels); the relay 401s a secretless caller on the new deploy.
- **The prompt premise fell at the first plan gate, and the step got better for it.**
  "Renaming a map key reddens nothing" was stale — U8's message test already catches it
  (measured: 1 red on master). The real gap was narrower and real: no NAMED cross-repo
  fixture. `contract.ts` now exports `ORDER_CONTACT_CHANNEL_VALUES`, the display map is
  pinned through the rendered message, the shop's §5 pin was mutation-confirmed (a
  consistent rename = 5 red across 3 files), and mutations that were red-on-master-too
  were reported as proving U8's test, never this step's work.
- **The currency item was a hole, not a missing pin**: `/^[A-Z]{3}$/` meant an
  informational field could cost an order. Ruling (bot BD-12): any-case 3-letter
  accept normalized to uppercase at the read — shape test on the RAW value first (the
  `toUpperCase` length trap: `"ßa"` → `"SSA"`), garbage still 400s. Identity proven
  unmoved three ways (frozen `PINNED_HASH`; 17 576 fixed points; the reviewer's own
  25M-body differential). The relay deep review blocked twice, correctly: moving
  `"uah"` to accept had deleted the only pattern-typo detector (restored as a property
  test — decoder-accept ⇒ Intl formats — plus boundary literals), and the hand-written
  `CurrencyRead` had lost the compiler's null-narrowing (pinned by fixture). The `/m`
  anchor got its own named pin in a micro-round.
- **Two planner gate rulings were REVERSED by measurement, which is the process
  working**: the tripwire Set got its ceiling after 600 log lines from one uncacheable
  page were measured, and the vocabulary became DERIVED from routing (D-2) after the
  refuter's A/B showed a literal list is blind to the exact U8 shape. The shop review
  then caught the killed mutant CHANGING ADDRESS (`"Locker"` into `NEVER_OFFERED`
  with the alarm off) — closed by pinning the derived set in both directions.
- Byte-identity of the warehouses route held through every round: 84 snapshots across
  three independent reproductions, sha256-equal to master.
- Promotions all landed with this entry: canonical ledger — UAC-27 coupling CLOSED,
  UAC-26 currency item CLOSED, UAC-28 opened (P1 review tail; RF-3 SCHEDULED → P2);
  bot repo — BD-12 ratified, BDEF-13 (the same class FATAL on `delivery.mode`),
  BDEF-14 (absorbed bugs leave no artifact), BDEF-15 (hygiene). CLAUDE.md updated
  (derived vocabulary + tripwire; value pins + case folding).
