export const ARMOR = [
  { id: "light", name: "Лёгкий бронежилет", ac: 2, note: "" },
  { id: "kevlar", name: "Кевларовый жилет", ac: 3, init: -5, note: "−5 к Инициативе." },
  {
    id: "heavy",
    name: "Тяжёлый бронежилет",
    ac: 4,
    dexDisadvantage: true,
    noDash: true,
    note: "Помеха на проверки Ловкости и Инициативу, нельзя делать Рывок.",
  },
];
