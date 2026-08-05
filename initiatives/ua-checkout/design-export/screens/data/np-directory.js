/* Mock Нова Пошта directory — prototype data for the checkout comboboxes.
   Mirrors the async API shape only; entries are demo data, not real warehouses. */
(function () {
  var CITIES = [
    { id: "kyiv", name: "Київ", region: "Київська обл." },
    { id: "lviv", name: "Львів", region: "Львівська обл." },
    { id: "kharkiv", name: "Харків", region: "Харківська обл." },
    { id: "odesa", name: "Одеса", region: "Одеська обл." },
    { id: "dnipro", name: "Дніпро", region: "Дніпропетровська обл." },
    { id: "zaporizhzhia", name: "Запоріжжя", region: "Запорізька обл." },
    { id: "vinnytsia", name: "Вінниця", region: "Вінницька обл." },
    { id: "poltava", name: "Полтава", region: "Полтавська обл." },
  ];
  function W(n, addr) { return { kind: "branch", n: n, label: "Відділення №" + n + ": " + addr }; }
  function L(n, addr) { return { kind: "locker", n: n, label: "Поштомат №" + n + ": " + addr }; }
  var WAREHOUSES = {
    kyiv: [
      W(1, "вул. Пирогівський шлях, 135"), W(3, "вул. Слобожанська, 13"), W(8, "вул. Наддніпрянське шосе, 15"),
      W(17, "вул. Вербова, 17а"), W(24, "просп. Степана Бандери, 24"), W(42, "вул. Богатирська, 11"),
      W(58, "вул. Здолбунівська, 5"), W(101, "вул. Кільцева дорога, 1"),
      L(9001, "вул. Хрещатик, 22, у вестибюлі"), L(9014, "просп. Оболонський, 21б"),
      L(9027, "вул. Антоновича, 50"), L(9033, "вул. Драгоманова, 31з"),
    ],
    lviv: [
      W(2, "вул. Городоцька, 355"), W(5, "вул. Зелена, 147"), W(11, "вул. Шевченка, 111"),
      W(20, "вул. Липинського, 36"), W(31, "вул. Наукова, 35"),
      L(9102, "просп. Свободи, 27"), L(9110, "вул. Кульпарківська, 226а"), L(9118, "вул. Стрийська, 30"),
    ],
    kharkiv: [W(4, "вул. Полтавський шлях, 56"), W(12, "просп. Гагаріна, 22"), W(33, "вул. Академіка Павлова, 120"), L(9201, "вул. Сумська, 73"), L(9208, "просп. Науки, 9")],
    odesa: [W(6, "вул. Чорноморського козацтва, 70"), W(15, "вул. Люстдорфська дорога, 90"), W(27, "вул. Академіка Корольова, 83"), L(9301, "вул. Дерибасівська, 14"), L(9307, "просп. Небесної Сотні, 2")],
    dnipro: [W(7, "вул. Незалежності, 90"), W(14, "просп. Слобожанський, 76"), W(29, "вул. Робоча, 154"), L(9401, "просп. Дмитра Яворницького, 50"), L(9406, "вул. Титова, 36")],
    zaporizhzhia: [W(9, "вул. Соборний просп., 133"), W(18, "вул. Перемоги, 62"), L(9501, "вул. Незалежної України, 39")],
    vinnytsia: [W(10, "вул. Келецька, 61"), W(21, "вул. Пирогова, 41"), L(9601, "вул. Соборна, 24")],
    poltava: [W(13, "вул. Європейська, 60"), W(22, "вул. Небесної Сотні, 32"), L(9701, "вул. Соборності, 28")],
  };
  function norm(s) { return String(s || "").trim().toLowerCase(); }
  window.UTG_NP = {
    searchCities: function (q, cb) {
      var n = norm(q);
      setTimeout(function () {
        cb(CITIES.filter(function (c) { return !n || norm(c.name).indexOf(n) === 0 || norm(c.region).indexOf(n) >= 0; }));
      }, 260 + Math.random() * 180);
    },
    searchWarehouses: function (cityId, kind, q, cb) {
      var n = norm(q);
      setTimeout(function () {
        var list = (WAREHOUSES[cityId] || []).filter(function (w) { return w.kind === kind; });
        cb(list.filter(function (w) { return !n || String(w.n).indexOf(n.replace(/^№/, "")) === 0 || norm(w.label).indexOf(n) >= 0; }));
      }, 220 + Math.random() * 160);
    },
  };
})();
