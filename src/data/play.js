// Эффекты дисциплин, которые держатся до конца боя (ключ — «дисциплина-уровень»).
// ac — прибавка к КД, tempHP — временные HP ({5+con} → 5 + мод. ВЫН), noWoundPenalty — штрафы ранений не действуют
export const COMBAT_EFFECTS = {
  "protean-1": { name: "Когти" },
  "protean-3": { name: "Боевая форма Зверя", ac: 2 },
  "vicissitude-1": { name: "Костяные пластины", ac: 2 },
  "fortitude-1": { name: "Щит Брони", tempHP: "{5+con}" },
  "fortitude-3": { name: "Щит Брони", tempHP: "{10+con}", noWoundPenalty: true },
  "auspex-3": { name: "Ментальное сканирование" },
  "obfuscate-3": { name: "Идеальная невидимость" },
};

// Раз за бой: повторно использовать нельзя до «Нового боя»
export const ONCE_PER_COMBAT = ["fortitude"];

// Состояния; roll — прибавка ко всем броскам, meleeDamage — к урону в ближнем бою
export const CONDITIONS = [
  { id: "euphoria", name: "Эйфория", roll: 1, note: "+1 ко всем броскам на 1 ход после питья" },
  { id: "fury", name: "Праведный гнев", clan: "brujah", meleeDamage: 2, note: "+2 к урону в ближнем бою, Ярость — Сл. 14" },
  { id: "stunned", name: "Оглушён", note: "пропускаете следующий ход" },
  { id: "grappled", name: "Схвачен", note: "скорость 0" },
  { id: "invisible", name: "Невидим", note: "спадает при атаке или Дисциплине" },
];
