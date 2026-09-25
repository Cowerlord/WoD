export const DISTANCES = { 1: "В упор", 2: "Ближняя", 3: "Дальняя" };

export const STEALTH_DC = 10;

export const MASTERY = {
  firearms: { name: "Огнестрельное оружие", bonus: 1 },
  melee: { name: "Ближний бой", bonus: 2 },
};

export const UNARMED_ID = "none";

// kind: melee — d20 + мастерство, ranged — d20 + ЛОВ + мастерство; addMod: false — без мода к урону; upgrades — кость урона от дисциплины

export const WEAPONS = [
  {
    id: "none",
    name: "Без оружия",
    die: "1d4",
    ability: "str",
    kind: "melee",
    mastery: "melee",
    type: "Дробящий",
    distance: [1],
    concealable: false,
    stealth: "Автоматически скрыто (нет оружия)",
    description: "Вы полагаетесь на свои кулаки или вампирские когти. Никаких проблем с полицией и Маскарадом.",
    upgrades: [
      { discipline: "potence", level: 2, die: "1d8" },
    ],
  },
  {
    id: "pistol_9mm",
    name: "Пистолет (9мм)",
    die: "1d6",
    ability: "dex",
    addMod: false,
    kind: "ranged",
    mastery: "firearms",
    type: "Колющий (физ.)",
    distance: [2, 3],
    concealable: true,
    stealth: `Проверка Ловкости (Скрытность) против Восприятия (Сложность ${STEALTH_DC})`,
    description: "Легко спрятать под курткой. Эффективен на расстоянии, но бесполезен в плотном клинче (Дистанция 1).",
  },
  {
    id: "short_blade",
    name: "Короткий клинок (Нож / Заточка)",
    die: "1d6",
    ability: "str",
    kind: "melee",
    mastery: "melee",
    type: "Режущий (физ.)",
    distance: [1],
    concealable: true,
    stealth: `Проверка Ловкости (Скрытность) против Восприятия (Сложность ${STEALTH_DC})`,
    description: "Компактное холодное оружие. Идеально для бесшумных убийств со спины в упор (Дистанция 1).",
  },
];
