# Chrome reference (verbatim structure from the ratified kit)

Pulled from the design project 2026-07-18 for the 4a defect round. Inline styles are the
kit's medium — translate to DS tokens/utilities; the *structure and values* are the spec.

## Header locale switcher — two text buttons, NOT a select

```jsx
const langBtn = (l) => (
  <button key={l} type="button" onClick={() => onLocaleChange && onLocaleChange(l)}
    style={{ font: "500 13px var(--font-mono)", letterSpacing: "0.08em", background: "none",
      border: "none", cursor: "pointer", padding: "4px 2px",
      color: locale === l ? "var(--ink)" : "var(--ink-faint)",
      borderBottom: locale === l ? "2px solid var(--flag-yellow)" : "2px solid transparent" }}>
    {l.toUpperCase()}
  </button>
);
<nav aria-label="Мова">{langBtn("uk")}{langBtn("en")}</nav>
```

Mono 500 caps, active = ink + 2px flag-yellow underline, inactive = ink-faint +
transparent underline. Header row: logo+wordmark pushed left (`margin-right: auto`),
then switcher, cart IconButton with count, burger.

## Footer — band footer, two rows

```jsx
<footer className="utg-band" style={{ padding: "var(--space-7) var(--gutter) var(--space-5)" }}>
  {/* row 1: flex-wrap, space-between, align-start, gap 24/48 */}
  <p style={{ font: "var(--type-small)", color: "var(--band-muted)", maxWidth: "38ch" }}>{MISSION[locale]}</p>
  <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    {/* links: paper color, 500 0.9375rem/1 display, uppercase, tracking .05em, no underline */}
  </nav>
  <a aria-label="Instagram" style={{ color: "var(--paper)" }}><Icon name="instagram" size={22} /></a>
  {/* row 2: borderTop 1px rgba(255,249,246,.25), paddingTop 16, space-between,
      mono 500 0.75rem caps tracking .08em band-muted */}
  <span>© {year} UTG</span>
  <span>ua-tactical-gear.com</span>
</footer>
```

Container-width inner wrapper (max-width var(--container), centered), column gap 28px
between rows. Mission line stays the already-shipped dictionary string (do not churn
wording — two near-identical variants exist in the kit; the shipped one is ratified).

## Dialog — cart-line remove confirmation (the primitive's intended use)

```jsx
<Dialog open title="Видалити товар?" onClose={fn}
  actions={<><Button variant="ghost">Скасувати</Button><Button variant="destructive">Видалити</Button></>}>
  «Waiting» буде видалено з кошика.
</Dialog>
```

Flat scrim, band header, body, right-aligned actions. The body interpolates the product
title. English strings (planner-approved, kit shows uk only): title "Remove item?",
body "{title} will be removed from your cart.", actions "Cancel" / "Remove".

## QuantityStepper — hugs content

Spec (`tokens/components.css`): `.utg-stepper { display: inline-flex; … }` — the control
hugs its buttons+input and never stretches to the parent's width, regardless of flex/grid
context it is placed in.

## NavOverlay (burger menu) — LEFT-aligned, numbered, Instagram pinned bottom

Verbatim structure from the kit's Header.jsx overlay (pulled 2026-07-18). Our 4a
implementation centers the column (`items-center justify-center`) — that is a fidelity
defect; the kit is left-aligned:

```jsx
<div style={{ position: "fixed", inset: 0, background: "var(--ink)", color: "var(--paper)",
  display: "flex", flexDirection: "column", padding: "0 var(--gutter)" }}>
  {/* top row: wordmark + close, minHeight 60px, space-between */}
  <nav style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10vh" }}>
    {/* each link: LEFT-aligned, flex baseline gap 16px */}
    <a style={{ font: "600 clamp(2.5rem,8vw,4rem)/1.15 var(--font-display)",
      textTransform: "uppercase", letterSpacing: "0.015em", color: "var(--paper)",
      textDecoration: "none", display: "flex", alignItems: "baseline", gap: "16px" }}>
      <span style={{ font: "500 0.875rem var(--font-mono)", color: "var(--band-muted)" }}>01</span>
      головна
    </a>
  </nav>
  <a style={{ marginTop: "auto", marginBottom: "32px", /* Instagram: mono caps row,
    inline-flex gap 10px, icon 20 */ }}>Instagram</a>
</div>
```

Key deltas vs our 4a build: column is left-aligned (no centering), starts at 10vh from
the top; link size is the big display clamp (larger than Typography h2's scale — extend
the DS type scale or the overlay link component accordingly, inside the DS); numbered
prefixes sit at baseline; Instagram is `margin-top: auto` pinned, as a mono-caps row
with the icon, not a bare icon.
