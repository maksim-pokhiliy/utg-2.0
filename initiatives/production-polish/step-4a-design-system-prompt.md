# Step 4a — Port the design system as a SEALED module: Tailwind 4 + shadcn, tokens, primitives, chrome (executor prompt)

Precondition: master at/after `04c8fad` (step 3 merged, formatting clean).
Invocation: paste everything below into the executor tab as one message.

---

/feature Step 4a of the production-polish initiative: port the ratified UTG design system into the codebase as a **sealed module** — Tailwind 3→4 with shadcn-style components, design tokens as the only source of color/type/spacing in the entire app, `next/font` typography, the full primitive set plus `Typography` and `Container`, new Header/Footer/cart-drawer chrome — and retire Flowbite React, notyf, and body-scroll-lock. After this step every styled element on the site comes from the design system's public API; raw colors and font sizes outside it do not exist, and cannot compile.

**Context.** Read first: `initiatives/production-polish/charter.md`, `state.md`, `decisions.md` (D-4 visual SSOT, D-9 shadcn, **D-10 sealed-module rules** — RATIFIED, do not re-litigate), `deferred.md` (DEF-19 lands here). **The design spec lives in `initiatives/production-polish/design-export/`** — read ALL of it before planning: `system-readme.md` (rules of the visual language), `tokens/*.css` (exact values), `component-specs.md` (chrome components). The spec is planner-managed and read-only for you. Scope fence: design-system module + chrome + dependency retirement + mechanical sweeps. **Full screen re-composition (hero, grids, product-page/checkout layout) is steps 4b/4c — do not redesign page structure here.**

**Process gate.** Stop after your plan & design stage and present the plan to the user for approval before implementing. The user will relay it to the planner.

**Scope:**

1. **The sealed module (D-10).** Everything lives in `src/design-system/`: `tokens/` (the theme CSS), internal `lib/` (`cn` etc. — internal, NOT exported), component directories, and a single public barrel `index.ts`. Exact internal layout is your design call; the seal is not:
   - App code imports ONLY from the barrel (`@root/design-system`). Enforce with ESLint `no-restricted-imports` (or equivalent) banning deep paths into the module; the sole exception is the root layout importing the global stylesheet.
   - **Colors:** raw color values (hex/rgb/hsl/oklch) exist ONLY in the DS theme definition. In the Tailwind-4 theme, **wipe the default palette** (`--color-*: initial`) and define exclusively the UTG semantic tokens from `design-export/tokens/colors.css` — so `bg-zinc-900`-style classes produce no CSS anywhere.
   - **Typography:** font-size/line-height values and utilities exist only inside the DS (wipe the default `--text-*` scale the same way). App code renders ALL text through a **`Typography`** component — variants per the export's type scale (`hero`, `h1`, `h2`, `h3`, `body`, `small`, `caption`, `price`), polymorphic `as`, correct uppercase/tracking baked into display variants.
   - **`Container`** component: MUI-style `maxWidth` prop (at minimum `default` = 1200px and `full`; extensible), built-in responsive gutters (24px mobile / 56px desktop per tokens). All page-width framing goes through it.
2. **Mechanical enforcement — the toolchain must scream, agreements don't count (D-10).** Violations of the seal must fail `yarn lint` (errors, not warnings) or fail to compile:
   - ESLint flat-config layer scoped to all of `src/` EXCEPT `src/design-system/`: `no-restricted-imports` banning deep DS paths, and `no-restricted-syntax` (or an equivalent plugin rule) making these hard errors in string literals/templates/JSX: color literals (`#hex`, `rgb(`, `rgba(`, `hsl(`, `oklch(`), legacy palette utility patterns (`bg|text|border-(black|white|zinc|gray|stone|slate|neutral|red|yellow|blue|...)-?`), raw text-size utilities (`text-(xs|sm|base|lg|xl|2xl…9xl)`, `text-[`, `leading-[`). Tune the patterns to avoid false positives on token utilities; document the final rule set in the PR.
   - Type-level: `Typography` variants and `Container` maxWidth are closed unions — invalid values are compile errors.
   - Note the repo-wide no-comments rule: `eslint-disable` directives are comments and therefore banned — there is no in-file escape hatch by construction. If a rule needs a genuine exception, the config (inside the DS module's ownership) is the only place, justified in the PR.
3. **Platform: Tailwind 3 → 4 + shadcn init.** CSS-first `@theme` with the export's exact values (hex, spacing scale, radius 0, border weights, durations/easing); shadcn initialized with its generated components living inside `src/design-system/` (adjust `components.json` aliases accordingly). Port `base.css` element defaults into the new globals. Remove the Flowbite Tailwind plugin and all old theme wiring — old tokens (`site`, `custom-1`, `yellow-100`, `blue-100`), `btn-main`, `h-header`, and the Wix `@font-face` blocks die with the old `globals.css`. First move the existing app-level components out of `src/components/ui/` (to e.g. `src/components/cart/`) so namespaces stay clean.
4. **Typography via `next/font/google`** (self-hosted at build, zero runtime CDN): Oswald (variable), IBM Plex Sans, IBM Plex Mono (400/500/600) — all with `latin` + `cyrillic` subsets (`fonts.css` in the export is reference-only; do not vendor TTFs). Wire them to the `--font-display`/`--font-body`/`--font-mono` families the tokens expect.
5. **Primitives** (public API surface, per `tokens/components.css` — the visual truth; rendered results must match): Button (default/accent/outline/ghost/destructive; sm; block; loading with spinner), IconButton (default/band/box), Icon (lucide-react subset wrapper, stroke 2), Badge (in/out/line/band), Price, QuantityStepper (port step-2's draft/commit/clamp input semantics into the new shell — do not regress them), Separator (hair/rule/heavy), Skeleton, Input, Textarea, Select, Field (label + helper + error), SectionBand, Typography, Container, Toast (via sonner, styled to the `.utg-toast` spec), Dialog and the cart Sheet on Radix primitives (scroll lock, focus trap, esc — Radix-native; `body-scroll-lock` dies).
6. **Chrome** per `component-specs.md`: new Header (wordmark + logo, locale switcher, cart icon with count, burger → full-screen ink nav overlay), new Footer (mission line, uppercase nav, Instagram, ©), CartDrawer as the Sheet (band header with count, cart lines, sticky total + accent CTA, empty state) replacing `Sidebar`/`SidebarUI`/`CartView` chrome. Reuse existing store/i18n hooks; strings come from the dictionaries — add the few new keys this needs to BOTH `uk.json`/`en.json`, sourcing wording from the ratified kit via planner notes in `design-export/`; if a string you need is missing, flag it at the plan gate instead of inventing.
7. **Mechanical sweeps across existing screens** — two kinds, neither changes page structure:
   - Component swaps: Flowbite `Button`/`TextInput`/`Textarea`/`Label`/`HR`/`Spinner` → DS equivalents; notyf → sonner Toast; black title strips → `SectionBand`; hand-rolled steppers → `QuantityStepper`; `btn-main` → Button.
   - Class sweeps (forced by the sealed theme): every legacy color utility (`bg-black`, `bg-zinc-*`, `text-gray-*`, `text-white`, `bg-stone-*`…) → nearest semantic token utility; every raw text-size utility (`text-3xl`, `text-6xl`, `text-[80px]`…) → `Typography` with the nearest variant; page-width wrappers → `Container`. Pages will look transitional (new tokens/type on old layouts) — expected; 4b/4c re-compose them.
8. **Dependency retirement:** `flowbite-react`, `notyf`, `body-scroll-lock` gone from package.json (+ imports/CSS). `swiper` stays (dies in 4b). Add: Tailwind 4 toolchain, shadcn deps as the CLI dictates (radix, cva/clsx/tailwind-merge), `lucide-react`, `sonner`.
9. **DEF-19:** with Flowbite gone, delete the checkout `ssr:false` client wrapper — checkout becomes a normal SSG page rendering `CheckoutScreen` (its hydration guard already prevents the cart flash).

**Acceptance gates (verify and report in the PR test plan):**

- `npx tsc --noEmit`, `yarn lint`, `npx prettier --check .`, `yarn build` zero-env — green; route table unchanged (all pages SSG; checkout without the dynamic-import wrapper).
- **Seal enforcement proof:** demonstrate in the PR that the toolchain screams — add a temporary violation (a hex color and a `text-6xl` in a screen file), show `yarn lint` failing with the rule name, then remove it. The lint layer is the contract; the greps below double-check it:
- **Seal greps (all must be zero):**
  - `grep -rniE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(" src/ --exclude-dir=design-system` (color values outside the DS);
  - `grep -rnE "text-(xs|sm|base|lg|[2-9]?xl)|text-\[|leading-\[" src/ --exclude-dir=design-system` (type utilities outside the DS);
  - `grep -rn "design-system/" src/ --include="*.tsx" --include="*.ts" | grep -v "src/design-system/"` modulo the barrel/stylesheet exceptions (deep imports);
  - `grep -riE "flowbite|notyf|body-scroll-lock" src/ package.json`; no `btn-main`/`site`/`custom-1`; no parastorage/gstatic/external font URLs.
- Token fidelity: computed theme exposes exactly the export's values — spot-check `#FFF9F6`/`#181512`/`#FFC657`/`#5362AC`/`#B42318`, radius 0 on every control, 2px ink borders, focus ring 2px flag-blue offset 2.
- `yarn dev` walkthrough (both locales): header + burger overlay + cart count; drawer opens (esc closes, focus trapped, scroll locked); add to cart → stepper works incl. clearing the input; checkout form fully usable; submit with `PLACE_ORDER_URL` unset → error toast, cart intact; uk/en voice strings correct; footer real; transitional pages render coherently — no broken layouts.
- No hydration warnings; cart persistence (`utg-cart-v2`) untouched and loading.

**Constraints:**

- No comments in code; remove existing comments in any section you edit.
- `design-export/` and all `initiatives/` files are read-only; never stage changes to them or `CLAUDE.md`.
- No page re-composition (4b/4c), no `swiper` changes, no SEO work, no tests, no catalog/data changes, no payload changes (sacred contract).
- Run `yarn format` before committing (Prettier must pass repo-wide).
- Branch from `master`, PR against `master`. Commits and PR in English, first person, no assistant signatures anywhere.
