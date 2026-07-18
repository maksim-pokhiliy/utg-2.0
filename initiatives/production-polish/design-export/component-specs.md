# Component specs (from the design project's per-component prompt.md files)

Pulled verbatim for the components 4a builds whole. The full visual truth for every
primitive is `tokens/components.css`; these add intent/API sketches. (API sketches are
the design kit's plain-React props — the implementation adapts them to its own idioms;
they are guidance, not a contract.)

## layout/Header

Site chrome: UTG wordmark (+ optional logo), UA/EN switcher, cart icon with yellow count, burger → full-screen ink nav overlay with numbered links + Instagram.

```jsx
<Header locale="uk" cartCount={2} logoSrc="assets/logo-640.png"
  onCartClick={openCart} onLocaleChange={setLocale} onNavigate={go} sticky />
```

## layout/Footer

Ink footer: mission one-liner, uppercase nav, Instagram, © line. Short but real — never an empty strip.

```jsx
<Footer locale="uk" onNavigate={go} />
```

## layout/SectionBand

Inverted black band that opens a page/section — the system's strongest layout motif.

```jsx
<SectionBand kicker="/ категорія" title="Патчі" center />
<SectionBand as="h2" title="Звіти" />
```

Title sets in condensed display caps. Keep one band per section start; don't stack bands.

## commerce/CartDrawer

Right-side cart sheet: band header with count, scrollable lines (thumb/title/stepper/remove/price), sticky total + accent CTA, empty state.

```jsx
<CartDrawer open={open} items={items} locale="uk" onClose={fn}
  onQtyChange={(id,q)=>…} onRemove={(id)=>…} onCheckout={fn} />
```

items: {id,title,uah,qty,image}[]. The accent (yellow) checkout button is the view's one CTA moment.

## commerce/Toast

Order feedback toast — success (ink + yellow check) or error (alarm red). Position fixed bottom-center yourself.

```jsx
<Toast variant="success" onClose={fn}>Дякуємо за ваше замовлення! Наш менеджер зв'яжеться з вами найближчим часом</Toast>
<Toast variant="error">Помилка при відправці замовлення</Toast>
```
