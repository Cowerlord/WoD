export const SKILLS = [
  { id: "athletics", name: "Атлетика", ability: "str" },
  { id: "acrobatics", name: "Акробатика", ability: "dex" },
  { id: "stealth", name: "Скрытность", ability: "dex" },
  { id: "sleight", name: "Ловкость рук", ability: "dex" },
  { id: "occult", name: "Оккультизм", ability: "int" },
  { id: "medicine", name: "Медицина", ability: "int" },
  { id: "tech", name: "Технологии", ability: "int" },
  { id: "lore", name: "Начитанность", ability: "int" },
  { id: "crafts", name: "Ремесло", ability: "int" },
  { id: "perception", name: "Внимательность", ability: "wis" },
  { id: "insight", name: "Проницательность", ability: "wis" },
  { id: "survival", name: "Выживание", ability: "wis" },
  { id: "animals", name: "Обращение с животными", ability: "wis", requires: "animalism" },
  { id: "persuasion", name: "Убеждение", ability: "cha" },
  { id: "deception", name: "Обман", ability: "cha" },
  { id: "intimidation", name: "Запугивание", ability: "cha" },
  { id: "performance", name: "Исполнение", ability: "cha" },
  { id: "etiquette", name: "Этикет", ability: "cha" },
  { id: "leadership", name: "Лидерство", ability: "cha" },
  { id: "streetwise", name: "Знание улиц", ability: "cha" },
];

export const SKILL_PICKS = [
  { key: "two", bonus: 2 },
  { key: "one", bonus: 1 },
];
