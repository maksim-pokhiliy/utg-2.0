/* UTG storefront mock catalog — mirrors utg-2.0/src/data/catalog.ts (slugs, titles, prices, availability).
   Counts and availability are DERIVED from the products array — nothing hardcoded per page. */
(function () {
  var A = "../../assets/products/";
  var TS = ["M", "L", "XL", "2XL"];
  /* descriptions verbatim from src/data/catalog.ts */
  var DESC_DEATH = {
    en: 'Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "With you or for you it depends on how you trained" slogan and large graphic.',
    uk: 'Ліворуч спереду дрібний принт: лого Ukrainian Tactical Gear. Принт на спині зі слоганом "With you or for you it depends on how you trained" і великим малюнком.',
  };
  var DESC_WELCOME = {
    en: 'Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "Welcome to Ukraine, suka!" slogan and large graphic.',
    uk: 'Ліворуч спереду дрібний принт: лого Ukrainian Tactical Gear. Принт на спині зі слоганом "Welcome to Ukraine, suka!" і великим малюнком.',
  };
  var categories = [
    { slug: "patches", name: { uk: "Патчі", en: "Patches" }, image: A + "patch-utg.jpg" },
    { slug: "stickers", name: { uk: "Стікери", en: "Stickers" }, image: A + "stickers-2.jpg" },
    { slug: "tshirts", name: { uk: "Футболки", en: "T-Shirts" }, image: A + "tshirt-death-black.jpg" },
  ];
  /* order mirrors catalog.ts */
  var products = [
    { slug: "death-black", category: "tshirts", title: { uk: "«Death» Чорна", en: "«Death» Black" }, description: DESC_DEATH, sizes: TS, price: 1000, isAvailable: false, image: A + "tshirt-death-black.jpg" },
    { slug: "welcome-black", category: "tshirts", title: { uk: "«Welcome» Чорна", en: "«Welcome» Black" }, description: DESC_WELCOME, sizes: TS, price: 1000, isAvailable: false, image: A + "tshirt-welcome-black.jpg" },
    { slug: "death-green", category: "tshirts", title: { uk: "«Death» Зелена", en: "«Death» Green" }, description: DESC_DEATH, sizes: TS, price: 1000, isAvailable: false, image: A + "tshirt-death-green.jpg" },
    { slug: "welcome-green", category: "tshirts", title: { uk: "«Welcome» Зелена", en: "«Welcome» Green" }, description: DESC_WELCOME, sizes: TS, price: 1000, isAvailable: false, image: A + "tshirt-welcome-green.jpg" },
    { slug: "death-grey", category: "tshirts", title: { uk: "«Death» Сіра", en: "«Death» Grey" }, description: DESC_DEATH, sizes: TS, price: 1000, isAvailable: false, image: A + "tshirt-death-grey.jpg" },
    { slug: "welcome-grey", category: "tshirts", title: { uk: "«Welcome» Сіра", en: "«Welcome» Grey" }, description: DESC_WELCOME, sizes: TS, price: 1000, isAvailable: false, image: A + "tshirt-welcome-grey.jpg" },
    { slug: "waiting", category: "patches", title: { uk: "«Waiting»", en: "«Waiting»" }, price: 300, isAvailable: true, image: A + "patch-waiting.jpg" },
    { slug: "welcome", category: "patches", title: { uk: "«Welcome»", en: "«Welcome»" }, price: 300, isAvailable: true, image: A + "patch-welcome.jpg" },
    { slug: "death", category: "patches", title: { uk: "«Death»", en: "«Death»" }, price: 300, isAvailable: true, image: A + "patch-with-you.jpg" },
    { slug: "utg", category: "patches", title: { uk: "«UTG»", en: "«UTG»" }, price: 300, isAvailable: true, image: A + "patch-utg.jpg" },
    { slug: "set", category: "patches", title: { uk: "Набір із «Waiting, Welcome, Death»", en: "Set of «Waiting, Welcome, Death»" }, price: 800, isAvailable: true, image: A + "patches-set.jpg" },
    { slug: "sticker-pack", category: "stickers", title: { uk: "«Стікер Пак»", en: "«Sticker Pack»" }, price: 250, isAvailable: true, image: A + "stickers-2.jpg" },
  ];
  /* strings: shared.* / category.* verbatim from dictionaries; inStock adopted from kit Badge labels */
  var dict = {
    uk: { home: "головна", merch: "мерч", reports: "звіти", about: "про нас", order: "Замовити", out: "Немає в наявності", inStock: "В наявності", add: "Додати у Кошик", quantity: "Кількість", size: "Розмір", description: "Опис", outMsg: "Наразі немає в наявності. Слідкуйте за оновленнями в Instagram.", cartTitle: "Кошик", total: "Всього", proceed: "Перейти до Оформлення", emptyTitle: "Ваш кошик порожній", emptyHint: "Додайте товари до свого кошика", here: "тут", removeTitle: "Видалити товар?", removeBody: "«{title}» буде видалено з кошика.", cancel: "Скасувати", removeConfirm: "Видалити", close: "Закрити", checkout: "оформлення", customer: "Інформація про замовника", delivery: "Деталі доставки", firstName: "Ім'я", firstPh: "John", lastName: "Прізвище", lastPh: "Wick", phone: "Телефон / Нік у Телеграм", phonePh: "555-0100", country: "Країна", countryPh: "Україна", region: "Область", regionPh: "Львівська Область", city: "Місто", cityPh: "Львів", address: "Адреса", addressPh: "Вулиця Казкового Міста 1", additional: "Додаткова інформація", summary: "Підсумок", placeOrder: "Зробити Замовлення", review: "Перегляньте ваші дані вище та продовжуйте, коли будете готові.", required: "Обов'язкове поле", orderError: "Помилка при відправці замовлення", orderReceived: "Замовлення прийнято", successBody: "Дякуємо за ваше замовлення! Наш менеджер зв'яжеться з вами найближчим часом", successNote: "Оплата не відбувається онлайн — це волонтерський проект. Менеджер узгодить з вами оплату та доставку.", reportsIntro: "Кожна закупівля — з ваших замовлень. Фотозвіти підрозділу.", reportFpv: "На матеріали для виготовлення ініціаторів для FPV", aboutP1: "Цей сайт створено виключно як волонтерський проект. Ідея з'явилася через численні прохання підписників зробити мерч та як ще одна можливість зібрати ресурс для закриття потреб підшефного спецпідрозділу.", aboutP2Live: "Усі кошти з продаж підуть на закупівлі спорядження, витратних матеріалів, ремонт техніки. Після старту продаж тут з'явиться ще один розділ із звітами.", aboutP2Base: "Усі кошти з продаж підуть на закупівлі спорядження, витратних матеріалів, ремонт техніки.", aboutPropPre: "Фотозвіти з кожної закупівлі — у ", aboutPropLink: "розділі звітів", nfTitle: "Сторінку не знайдено", nfBody: "Такої сторінки немає. Можливо, товар знято з продажу.", nfCta: "До мерчу", patronymic: "По батькові", phoneShort: "Телефон", phoneMaskPh: "+380 67 555 01 00", channelLabel: "Як з вами зв'язатися", chCall: "Дзвінок", chTelegram: "Telegram", chViber: "Viber", methodLabel: "Спосіб доставки", mBranch: "НП відділення", mLocker: "НП поштомат", mCourier: "НП кур'єр", npCity: "Місто", npBranch: "Відділення", npLocker: "Поштомат", street: "Вулиця", building: "Будинок", apartment: "Квартира", npEmpty: "нічого не знайдено", npFallbackHint: "Довідник Нової Пошти зараз недоступний — впишіть місто та відділення вручну.", expectations: "Онлайн-оплати на сайті немає — це волонтерський проєкт. Після оформлення менеджер зв'яжеться з вами, щоб узгодити оплату й підтвердити замовлення. Доставка — за тарифами Нової Пошти при отриманні.", consent: "Надсилаючи замовлення, ви погоджуєтесь на обробку персональних даних для його виконання." },
    en: { home: "home", merch: "merch", reports: "reports", about: "about", order: "Order Now", out: "Out Of Stock", inStock: "In stock", add: "Add to Cart", quantity: "Quantity", size: "Size", description: "Description", outMsg: "Currently out of stock. Follow updates on Instagram.", cartTitle: "Cart", total: "Total", proceed: "Proceed to Checkout", emptyTitle: "Your cart is empty", emptyHint: "Add products to your cart in", here: "here", removeTitle: "Remove item?", removeBody: "{title} will be removed from your cart.", cancel: "Cancel", removeConfirm: "Remove", close: "Close", checkout: "checkout", customer: "Customer details", delivery: "Delivery details", firstName: "First Name", firstPh: "John", lastName: "Last Name", lastPh: "Wick", phone: "Phone Number / Telegram Nickname", phonePh: "555-0100", country: "Country", countryPh: "Ukraine", region: "Region / State", regionPh: "Lviv Region", city: "City", cityPh: "Lviv", address: "Address", addressPh: "Fairy Tale City Street 1", additional: "Additional Information", summary: "Order summary", placeOrder: "Place Order", review: "Review your details above and continue when you're ready.", required: "Required field", orderError: "Error when placing an order", orderReceived: "Order received", successBody: "Thank you for your order! Our manager will contact you shortly", successNote: "No online payment — this is a volunteer project. Our manager will arrange payment and delivery with you.", reportsIntro: "Every purchase is funded by your orders. Photo reports from the unit.", reportFpv: "For material for the manufacture of initiators for FPV", aboutP1: "This site was created exclusively as a volunteer project. The idea appeared due to numerous requests from subscribers to make merch and as another opportunity to collect a resource to cover the needs of the unit we support.", aboutP2Live: "All proceeds from the sale will be used to purchase equipment, consumables, and repair equipment. After the start of sales, another section with reports will appear here.", aboutP2Base: "All proceeds from the sale will be used to purchase equipment, consumables, and repair equipment.", aboutPropPre: "Photo reports from every purchase are in the ", aboutPropLink: "reports section", nfTitle: "Page not found", nfBody: "This page doesn't exist. The item may have been removed.", nfCta: "To merch", patronymic: "Patronymic", phoneShort: "Phone Number", phoneMaskPh: "555-0100", channelLabel: "How should we contact you", chCall: "Call", chTelegram: "Telegram", chViber: "Viber", methodLabel: "Delivery method", mBranch: "NP branch", mLocker: "NP parcel locker", mCourier: "NP courier", npCity: "City", npBranch: "Branch", npLocker: "Parcel locker", street: "Street", building: "Building", apartment: "Apartment", npEmpty: "nothing found", npFallbackHint: "The Nova Poshta directory is unavailable right now — type your city and branch manually.", expectations: "There are no online payments on this site — it's a volunteer project. After you place an order, our manager will contact you to arrange payment and confirm the order. Delivery is paid on receipt at Nova Poshta rates.", consent: "By submitting the order, you consent to the processing of your personal data required to fulfil it." },
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
  function categoryExists(slug) { return categories.some(function (c) { return c.slug === slug; }); }
  function productExists(catSlug, prodSlug) { return products.some(function (p) { return p.category === catSlug && p.slug === prodSlug; }); }
  function categoryHref(slug, locale) { return "../category/Category.dc.html#cat=" + slug + "&lang=" + locale; }
  function productHref(catSlug, prodSlug, locale) { return "../product/Product.dc.html#cat=" + catSlug + "&product=" + prodSlug + "&lang=" + locale; }
  function checkoutHref(locale) { return "../checkout/Checkout.dc.html#lang=" + locale; }
  function reportsHref(locale) { return "../reports/Reports.dc.html#lang=" + locale; }
  function aboutHref(locale) { return "../about/About.dc.html#lang=" + locale; }
  function notFoundHref(locale) { return "../404/NotFound.dc.html#lang=" + locale; }
  /* cart store — localStorage-backed, seeded once with the design-load cart (sized line, long set title, qty > 1) */
  var CART_KEY = "utg_cart_v1";
  var cartListeners = [];
  function cartNotify() { cartListeners.forEach(function (cb) { try { cb(); } catch (e) {} }); }
  function cartRead() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (raw == null) {
        var seed = [
          { cat: "tshirts", slug: "death-black", size: "M", qty: 1 },
          { cat: "patches", slug: "set", size: null, qty: 1 },
          { cat: "patches", slug: "waiting", size: null, qty: 2 },
        ];
        localStorage.setItem(CART_KEY, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw) || [];
    } catch (e) { return []; }
  }
  function cartWrite(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
    cartNotify();
  }
  function lineId(it) { return it.cat + "/" + it.slug + (it.size ? "·" + it.size : ""); }
  window.addEventListener("storage", function (ev) { if (ev.key === CART_KEY) cartNotify(); });
  var cart = {
    subscribe: function (cb) {
      cartListeners.push(cb);
      return function () { var i = cartListeners.indexOf(cb); if (i >= 0) cartListeners.splice(i, 1); };
    },
    lines: function (locale) {
      return cartRead().map(function (it) {
        var p = byCategory(it.cat).find(function (x) { return x.slug === it.slug; });
        if (!p) return null;
        return { id: lineId(it), title: p.title[locale] + (it.size ? " · " + it.size : ""), image: p.image, uah: p.price, qty: it.qty };
      }).filter(Boolean);
    },
    count: function () { return cartRead().reduce(function (s, i) { return s + i.qty; }, 0); },
    total: function () { return cart.lines("uk").reduce(function (s, l) { return s + l.uah * l.qty; }, 0); },
    add: function (catSlug, slug, size, qty) {
      var items = cartRead();
      var id = catSlug + "/" + slug + (size ? "·" + size : "");
      var hit = items.find(function (i) { return lineId(i) === id; });
      if (hit) hit.qty = Math.min(99, hit.qty + (qty || 1));
      else items.push({ cat: catSlug, slug: slug, size: size || null, qty: qty || 1 });
      cartWrite(items);
    },
    setQty: function (id, qty) {
      cartWrite(cartRead().map(function (i) {
        if (lineId(i) === id) i.qty = Math.max(1, Math.min(99, qty));
        return i;
      }));
    },
    remove: function (id) { cartWrite(cartRead().filter(function (i) { return lineId(i) !== id; })); },
    clear: function () { cartWrite([]); },
  };
  function catalogHref(locale) { return "../catalog/Catalog.dc.html#lang=" + locale; }
  window.UTG_CATALOG = {
    categories: categories,
    products: products,
    dict: dict,
    countItems: countItems,
    countCats: countCats,
    categoryHref: categoryHref,
    productHref: productHref,
    checkoutHref: checkoutHref,
    reportsHref: reportsHref,
    aboutHref: aboutHref,
    notFoundHref: notFoundHref,
    categoryExists: categoryExists,
    productExists: productExists,
    reports: function (locale) {
      var d = dict[locale];
      var out = [];
      for (var i = 1; i <= 8; i++) {
        out.push({ image: "../../assets/reports/report-" + i + ".jpg", index: String(i).padStart(2, "0"), caption: i === 3 ? d.reportFpv : null });
      }
      return out;
    },
    cart: cart,
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
      return [[d.home, "../home/Home.dc.html#lang=" + locale], [d.merch, catalogHref(locale)], [d.reports, reportsHref(locale)], [d.about, aboutHref(locale)]];
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
    productView: function (catSlug, prodSlug, locale) {
      var c = categories.find(function (x) { return x.slug === catSlug; }) || categories[0];
      var list = byCategory(c.slug);
      var p = list.find(function (x) { return x.slug === prodSlug; }) || list[0];
      return {
        categorySlug: c.slug,
        categoryName: c.name[locale],
        slug: p.slug,
        title: p.title[locale],
        description: p.description ? p.description[locale] : null,
        sizes: p.sizes || null,
        price: p.price,
        isAvailable: p.isAvailable,
        image: p.image,
      };
    },
  };
})();
