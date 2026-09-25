export const CONFIG = {
  abilityArray: [15, 14, 13, 12, 10, 8],
  nameMaxLength: 40,
  conceptMaxLength: 80,
  disciplinePoints: 3,
  maxDisciplineLevel: 3,
  baseSpeed: 1,
  minSpeed: 1,
  maxSpeed: 3,
  saveDCBase: 8,
  baseHP: 16,
  hpConMultiplier: 2,
  startingHumanity: 6,
  maxHumanity: 10,
  maxBonusPoints: 12,
  baseAC: 10,
  baseBP: 5,
  playerGeneration: 12,
  adminGenerations: [12, 11, 10, 9, 8, 7, 6, 5, 4],
  startingBloodPotency: 1,
};

export const ABILITIES = [
  { key: "str", name: "Сила", abbr: "СИЛ" },
  { key: "dex", name: "Ловкость", abbr: "ЛОВ" },
  { key: "con", name: "Выносливость", abbr: "ВЫН" },
  { key: "int", name: "Интеллект", abbr: "ИНТ" },
  { key: "wis", name: "Восприятие", abbr: "ВОС" },
  { key: "cha", name: "Харизма", abbr: "ХАР" },
];

export const TOTAL_STEPS = 6;
export const SHEET_STEP = 5;
export const PLAY_STEP = 6;

// Шкала Сложностей проверок для Мастера
export const DIFFICULTY = [
  { dc: 10, name: "лёгкая" },
  { dc: 13, name: "средняя" },
  { dc: 16, name: "трудная" },
  { dc: 20, name: "почти невозможная" },
];
