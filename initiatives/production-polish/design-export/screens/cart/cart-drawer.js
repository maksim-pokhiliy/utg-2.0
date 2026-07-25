/* UTG shared cart drawer — the shipped Sheet pattern (utg-scrim + utg-drawer) with designed content.
   Composes DS primitives only: IconButton, Icon, Price, QuantityStepper, Button, Dialog.
   Self-contained: subscribes to UTG_CATALOG.cart; props: locale, open, onClose, catalogHref, checkoutHref, demoEmpty. */
(function () {
  function Drawer(props) {
    var DS = window.UTGDesignSystem_62bf00, C = window.UTG_CATALOG;
    var h = React.createElement;
    var tick = React.useState(0), setTick = tick[1];
    var conf = React.useState(null), confirming = conf[0], setConfirming = conf[1];
    React.useEffect(function () {
      if (!C) return undefined;
      return C.cart.subscribe(function () { setTick(function (n) { return n + 1; }); });
    }, []);
    if (!DS || !C) return null;
    var locale = props.locale || "uk";
    var d = C.dict[locale];
    var open = !!props.open;
    var items = props.demoEmpty ? [] : C.cart.lines(locale);
    var total = items.reduce(function (s, i) { return s + i.uah * i.qty; }, 0);
    var count = items.reduce(function (s, i) { return s + i.qty; }, 0);
    var lines = items.map(function (it) {
      return h("div", { className: "utg-cartline", key: it.id },
        h("img", { src: it.image, alt: "" }),
        h("div", { style: { display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 } },
          h("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" } },
            h("span", { style: { font: "500 0.9375rem/1.35 var(--font-body)", textWrap: "pretty" } }, it.title),
            h(DS.IconButton, { icon: "trash", size: 18, label: d.removeConfirm, onClick: function () { setConfirming(it); }, style: { width: "32px", height: "32px", margin: "-4px -6px 0 0", flex: "none" } })),
          h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" } },
            h(DS.QuantityStepper, { size: "sm", value: it.qty, label: d.quantity, onChange: function (v) { C.cart.setQty(it.id, v); } }),
            h(DS.Price, { uah: it.uah * it.qty, locale: locale }))));
    });
    return h(React.Fragment, null,
      open && h("div", { className: "utg-scrim", onClick: props.onClose }),
      h("aside", { className: "utg-drawer" + (open ? " utg-drawer--open" : ""), role: "dialog", "aria-modal": "true", "aria-label": d.cartTitle, "aria-hidden": !open },
        h("header", { className: "utg-drawer-head" },
          h("h3", null, d.cartTitle, count > 0 && h("span", { style: { font: "500 13px var(--font-mono)", marginLeft: "10px", color: "var(--band-muted)" } }, "[", count, "]")),
          h(DS.IconButton, { band: true, icon: "x", label: d.close, onClick: props.onClose })),
        items.length === 0
          ? h("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "24px", textAlign: "center" } },
              h(DS.Icon, { name: "shopping-bag", size: 40, strokeWidth: 1.5 }),
              h("p", { style: { font: "var(--type-h3)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "var(--display-tracking)" } }, d.emptyTitle),
              h("p", { className: "utg-help" }, d.emptyHint, " ", h("a", { href: props.catalogHref, style: { color: "var(--secondary)" } }, d.here)))
          : h(React.Fragment, null,
              h("div", { style: { flex: 1, overflowY: "auto", padding: "0 20px" } }, lines),
              h("footer", { style: { borderTop: "2px solid var(--ink)", padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: "14px", background: "var(--paper)" } },
                h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                  h("span", { className: "utg-label" }, d.total),
                  h(DS.Price, { uah: total, locale: locale, big: true })),
                h(DS.Button, { variant: "accent", block: true, href: props.checkoutHref }, d.proceed)))),
      confirming && h("div", { style: { position: "fixed", inset: 0, zIndex: 80 } },
        h(DS.Dialog, {
          open: true,
          title: d.removeTitle,
          onClose: function () { setConfirming(null); },
          actions: h(React.Fragment, null,
            h(DS.Button, { variant: "ghost", size: "sm", onClick: function () { setConfirming(null); } }, d.cancel),
            h(DS.Button, { variant: "destructive", size: "sm", onClick: function () { C.cart.remove(confirming.id); setConfirming(null); } }, d.removeConfirm)),
        }, d.removeBody.replace("{title}", confirming.title))));
  }
  window.UTGCart = { Drawer: Drawer };
})();
