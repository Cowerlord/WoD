// Навыки. Проверка навыка = d20 + мод. характеристики + бонус навыка.
// core: true — основной навык (виден всем, из них выбирают 2 при создании: +2 и +1);
// core: false — дополнительный (даёт клан или Мастер за события и уровни; на листе — только если есть).
// abilities — навык можно бросать через одну из характеристик: игрок выбирает заранее (Запугивание: СИЛ или ХАР).
export const SKILLS = [
  // --- основные ---
  { id: "athletics", core: true, name: "Атлетика", ability: "str", hint: "Захват и укус, лазание, выломать дверь, догнать, поднять тяжёлое" },
  { id: "intimidation", core: true, name: "Запугивание", ability: "cha", abilities: ["str", "cha"], hint: "Надавить, пригрозить, сломать волю — силой или холодным голосом" },
  { id: "stealth", core: true, name: "Скрытность", ability: "dex", hint: "Красться, прятаться, незаметно носить оружие" },
  { id: "sleight", core: true, name: "Ловкость рук", ability: "dex", hint: "Карманы, подмена вещей, отмычки и замки" },
  { id: "occult", core: true, name: "Оккультизм", ability: "int", hint: "Магия, ритуалы, сверхъестественное, тайны Сородичей" },
  { id: "tech", core: true, name: "Техника", ability: "int", hint: "Компьютеры, камеры и записи, сигнализации, угон машин, починка" },
  { id: "lore", core: true, name: "Начитанность", ability: "int", hint: "История, наука, право — и расследование: улики, архивы, документы" },
  { id: "perception", core: true, name: "Внимательность", ability: "wis", hint: "Заметить засаду и детали, выследить по следам" },
  { id: "insight", core: true, name: "Проницательность", ability: "wis", hint: "Понять ложь, мотивы и настроение собеседника" },
  { id: "persuasion", core: true, name: "Убеждение", ability: "cha", hint: "Уговорить, договориться, повести за собой толпу" },
  { id: "deception", core: true, name: "Обман", ability: "cha", hint: "Солгать, притвориться, отвлечь" },
  // --- дополнительные ---
  { id: "acrobatics", core: false, name: "Акробатика", ability: "dex", hint: "Трюки, равновесие, падения, бег по крышам" },
  { id: "driving", core: false, name: "Вождение", ability: "dex", hint: "Погони, опасная езда, уйти от хвоста" },
  { id: "medicine", core: false, name: "Медицина", ability: "int", hint: "Первая помощь, раны, анатомия, психиатрия" },
  { id: "politics", core: false, name: "Политика Сородичей", ability: "int", hint: "Традиции, иерархия, долги и интриги Камарильи" },
  { id: "animals", core: false, name: "Обращение с животными", ability: "wis", hint: "Успокоить, приручить, понять зверя" },
  { id: "survival", core: false, name: "Выживание", ability: "wis", hint: "Природа, ночёвка вне города, охота вдали от людей" },
  { id: "etiquette", core: false, name: "Этикет", ability: "cha", hint: "Высшее общество, Элизиум, светские правила" },
  { id: "streetwise", core: false, name: "Знание улиц", ability: "cha", hint: "Банды, барыги, слухи, как всё устроено на районе" },
  { id: "art", core: false, name: "Искусство", ability: "cha", hint: "Музыка, сцена, живопись, подделки" },
  { id: "leadership", core: false, name: "Лидерство", ability: "cha", hint: "Командовать Гулями, Стадом, отрядом в бою" },
];

export const CORE_SKILLS = SKILLS.filter(k => k.core);
export const BONUS_SKILLS = SKILLS.filter(k => !k.core);

// Потолок бонуса одного навыка (клан + выбор + от Мастера)
export const SKILL_MAX = 5;

// Навык от клана: дополнительный +2 или основной +1 (на выбор игрока)
export const CLAN_SKILL_BONUS = { bonus: 2, core: 1 };

// Старые id навыков → новые (для файлов и персонажей со старыми навыками)
export const SKILL_ALIASES = {
  computers: "tech",
  engineering: "tech",
  crafts: "tech",
  performance: "art",
};

export const SKILL_PICKS = [
  { key: "two", bonus: 2 },
  { key: "one", bonus: 1 },
];
