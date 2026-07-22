/* UTG storefront mock catalog — mirrors utg-2.0/src/data/catalog.ts (slugs, titles, prices, availability).
   Counts and availability are DERIVED from the products array — nothing hardcoded per page. */
(function () {
  var A = "../../assets/products/";
  var categories = [
    { slug: "patches", name: { uk: "Патчі", en: "Patches" }, image: A + "patch-utg.jpg" },
    { slug: "stickers", name: { uk: "Стікери", en: "Stickers" }, image: A + "stickers-2.jpg" },
    { slug: "tshirts", name: { uk: "Футболки", en: "T-Shirts" }, image: A + "tshirt-death-black.jpg" },
  ];
  /* order mirrors catalog.ts */
  var products = [
    { slug: "death-black", category: "tshirts", title: { uk: "«Death» Чорна", en: "«Death» Black" }, price: 1000, isAvailable: false, image: A + "tshirt-death-black.jpg" },
    { slug: "welcome-black", category: "tshirts", title: { uk: "«Welcome» Чорна", en: "«Welcome» Black" }, price: 1000, isAvailable: false, image: A + "tshirt-welcome-black.jpg" },
    { slug: "death-green", category: "tshirts", title: { uk: "«Death» Зелена", en: "«Death» Green" }, price: 1000, isAvailable: false, image: A + "tshirt-death-green.jpg" },
    { slug: "welcome-green", category: "tshirts", title: { uk: "«Welcome» Зелена", en: "«Welcome» Green" }, price: 1000, isAvailable: false, image: A + "tshirt-welcome-green.jpg" },
    { slug: "death-grey", category: "tshirts", title: { uk: "«Death» Сіра", en: "«Death» Grey" }, price: 1000, isAvailable: false, image: A + "tshirt-death-grey.jpg" },
    { slug: "welcome-grey", category: "tshirts", title: { uk: "«Welcome» Сіра", en: "«Welcome» Grey" }, price: 1000, isAvailable: false, image: A + "tshirt-welcome-grey.jpg" },
    { slug: "waiting", category: "patches", title: { uk: "«Waiting»", en: "«Waiting»" }, price: 300, isAvailable: true, image: A + "patch-waiting.jpg" },
    { slug: "welcome", category: "patches", title: { uk: "«Welcome»", en: "«Welcome»" }, price: 300, isAvailable: true, image: A + "patch-welcome.jpg" },
    { slug: "death", category: "patches", title: { uk: "«Death»", en: "«Death»" }, price: 300, isAvailable: true, image: A + "patch-with-you.jpg" },
    { slug: "utg", category: "patches", title: { uk: "«UTG»", en: "«UTG»" }, price: 300, isAvailable: true, image: A + "patch-utg.jpg" },
    { slug: "set", category: "patches", title: { uk: "Набір із «Waiting, Welcome, Death»", en: "Set of «Waiting, Welcome, Death»" }, price: 800, isAvailable: true, image: A + "patches-set.jpg" },
    { slug: "sticker-pack", category: "stickers", title: { uk: "«Стікер Пак»", en: "«Sticker Pack»" }, price: 250, isAvailable: true, image: A + "stickers-2.jpg" },
  ];
  /* strings: shared.* / category.* verbatim from dictionaries; inStock adopted from kit Badge labels */
  var dict = {
    uk: { home: "головна", merch: "мерч", reports: "звіти", about: "про нас", order: "Замовити", out: "Немає в наявності", inStock: "В наявності" },
    en: { home: "home", merch: "merch", reports: "reports", about: "about", order: "Order Now", out: "Out Of Stock", inStock: "In stock" },
  };
  function ukPlural(n, forms) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return forms[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
    return forms[2];
  }
  function countItems(n, locale) {
    return locale === "en" ? n + (n === 1 ? " item" : " items") : n + " " + ukPlural(n, ["товар", "товари", "товарів"]);
  }
  function countCats(n, locale) {
    return locale === "en" ? n + (n === 1 ? " category" : " categories") : n + " " + ukPlural(n, ["категорія", "категорії", "категорій"]);
  }
  function byCategory(slug) {
    return products.filter(function (p) { return p.category === slug; });
  }
  function categoryHref(slug, locale) { return "../category/Category.dc.html#cat=" + slug + "&lang=" + locale; }
  function catalogHref(locale) { return "../catalog/Catalog.dc.html#lang=" + locale; }
  window.UTG_CATALOG = {
    categories: categories,
    products: products,
    dict: dict,
    countItems: countItems,
    countCats: countCats,
    categoryHref: categoryHref,
    catalogHref: catalogHref,
    homeHref: function (locale) { return "../home/Home.dc.html#lang=" + locale; },
    getHash: function (k) { return new URLSearchParams(location.hash.slice(1)).get(k); },
    setHash: function (obj) {
      var h = new URLSearchParams(location.hash.slice(1));
      Object.keys(obj).forEach(function (k) { h.set(k, obj[k]); });
      history.replaceState(null, "", "#" + h.toString());
    },
    navLinks: function (locale) {
      var d = dict[locale];
      return [[d.home, "../home/Home.dc.html#lang=" + locale], [d.merch, catalogHref(locale)], [d.reports, "#reports"], [d.about, "#about"]];
    },
    summaries: function (locale) {
      var d = dict[locale];
      return categories.map(function (c, i) {
        var items = byCategory(c.slug);
        var anyIn = items.some(function (p) { return p.isAvailable; });
        return {
          slug: c.slug,
          href: categoryHref(c.slug, locale),
          image: c.image,
          index: String(i + 1).padStart(2, "0"),
          name: c.name[locale],
          count: countItems(items.length, locale),
          stock: anyIn ? d.inStock : d.out,
        };
      });
    },
    categoryView: function (slug, locale) {
      var c = categories.find(function (x) { return x.slug === slug; }) || categories[0];
      return {
        slug: c.slug,
        name: c.name[locale],
        products: byCategory(c.slug).map(function (p) {
          return { slug: p.slug, title: p.title[locale], image: p.image, price: p.price, isAvailable: p.isAvailable };
        }),
      };
    },
  };
})();
