import { CONFIG, TOTAL_STEPS } from "../data/config.js";
import { CLANS } from "../data/clans.js";
import { DISCIPLINE_PASSIVES, SAVE_DC } from "../data/disciplines.js";
import { SKILLS, SKILL_PICKS } from "../data/skills.js";
import { WEAPONS, MASTERY } from "../data/weapons.js";
import { ARMOR } from "../data/armor.js";
import { HEALING } from "../data/combat.js";
import { modOf, fmt, abbrOf, discipline } from "./format.js";

export const skillById = id => SKILLS.find(k => k.id === id) || null;

// Все расчёты по персонажу. ch — реактивный объект, поэтому результаты всегда актуальны.
export function characterRules(ch) {
  const mod = key => ch.abilities[key] == null ? 0 : modOf(ch.abilities[key]);
  const clan = () => CLANS.find(c => c.id === ch.clanId) || null;
  const weapon = () => WEAPONS.find(w => w.id === ch.weaponId) || null;
  const armor = () => ARMOR.find(a => a.id === ch.armorId) || null;

  const discLevel = id => ch.disciplines[id] || 0;
  const hasDisc = (id, level = 1) => discLevel(id) >= level;
  const learnedDisciplines = () => Object.entries(ch.disciplines).filter(([, l]) => l > 0);
  const pointsSpent = () => learnedDisciplines().reduce((sum, [, l]) => sum + l, 0);
  const pointsBudget = () => CONFIG.disciplinePoints + (ch.bonusPoints || 0);
  const activePassives = () => DISCIPLINE_PASSIVES.filter(p => hasDisc(p.discipline, p.level));
  const passiveBonus = key => activePassives().reduce((sum, p) => sum + (p[key] || 0), 0);
  const passiveNote = key => activePassives().filter(p => p[key])
    .map(p => ` ${fmt(p[key])} (${discipline(p.discipline).name} ${p.level})`).join("");

  const clanSkillId = () => clan()?.skill || null;
  const skillAllowed = sk => !sk.requires || hasDisc(sk.requires) || clanSkillId() === sk.id;
  const skillBonus = id => (clanSkillId() === id ? 2 : 0)
    + SKILL_PICKS.reduce((sum, p) => sum + (ch.skills[p.key] === id ? p.bonus : 0), 0);

  function combatStats() {
    const a = armor();
    return {
      hp: CONFIG.baseHP + CONFIG.hpConMultiplier * mod("con") + passiveBonus("hp"),
      ac: CONFIG.baseAC + (a ? a.ac : mod("dex")) + passiveBonus("ac"),
      bp: CONFIG.baseBP,
      speed: Math.min(CONFIG.maxSpeed, Math.max(CONFIG.minSpeed, CONFIG.baseSpeed + passiveBonus("speed"))),
      init: mod("dex") + passiveBonus("init") + (a?.init || 0),
      initAdvantage: hasDisc("celerity", 2) && !a?.dexDisadvantage,
      initDisadvantage: !!a?.dexDisadvantage && !hasDisc("celerity", 2),
      noDash: !!a?.noDash,
      tempHP: hasDisc("fortitude") || hasDisc("vicissitude"),
    };
  }

  const fillTokens = text => text
    .replace(/\{dc:(\w+)\}/g, (_, k) => CONFIG.saveDCBase + mod(k))
    .replace(/\{(\d+)\+(\w+)\}/g, (_, n, k) => Number(n) + mod(k));

  const saveDCs = () => SAVE_DC.filter(d => d.disciplines.some(id => hasDisc(id)))
    .map(d => ({ ...d, value: CONFIG.saveDCBase + mod(d.ability) }));

  const weaponDie = w => (w.upgrades || []).find(u => hasDisc(u.discipline, u.level))?.die ?? w.die;
  const weaponUpgrade = w => (w.upgrades || []).find(u => hasDisc(u.discipline, u.level)) || null;

  const mastery = () => { const w = weapon(); return w?.mastery ? { id: w.mastery, ...MASTERY[w.mastery] } : null; };
  const masteryBonus = id => mastery()?.id === id ? mastery().bonus : 0;

  function attackParts(a) {
    if (a.attack) return [[abbrOf(a.attack), mod(a.attack)]];
    if (a.kind === "ranged") return [["ЛОВ", mod("dex")], ["мастерство", masteryBonus("firearms")]];
    return [["мастерство", masteryBonus("melee")]];
  }
  const attackBonus = a => attackParts(a).reduce((sum, [, v]) => sum + v, 0);
  const attackNote = a => attackParts(a).filter(([, v]) => v).map(([k, v]) => `${k} ${fmt(v)}`).join(", ");
  const saveDCof = a => a.dc ? a.dc.base + mod(a.dc.ability) : null;
  const severeDC = a => a.aggr ? CONFIG.saveDCBase + mod(a.aggr) : null;

  function weaponStats(w) {
    const m = mod(w.ability) * (w.modMul || 1);
    const die = weaponDie(w);
    const addMod = w.addMod !== false && m !== 0;
    return {
      attack: w.save ? `Спб ${abbrOf(w.save)}${w.dc ? ` (Сл. ${saveDCof(w)})` : ""}` : fmt(attackBonus(w)),
      damage: addMod ? `${die} ${m > 0 ? "+" : "−"} ${Math.abs(m)}` : die,
    };
  }

  function stealthAdvNote() {
    const adv = hasDisc("obfuscate", 2), dis = !!armor()?.dexDisadvantage;
    if (adv && !dis) return ", с преимуществом (Затемнение 2)";
    if (dis && !adv) return ", с помехой (тяжёлая броня)";
    return "";
  }
  const stealthRoll = () => mod("dex") + skillBonus("stealth");
  const stealthParts = () => `ЛОВ ${fmt(mod("dex"))}${skillBonus("stealth") ? `, Скрытность ${fmt(skillBonus("stealth"))}` : ""}`;

  const healAmount = () => {
    const m = mod(HEALING.ability);
    return m ? `${HEALING.die} ${m > 0 ? "+" : "−"} ${Math.abs(m)}` : HEALING.die;
  };

  const validators = {
    1() {
      if (!ch.name.trim()) return "Введите имя персонажа.";
      if (!ch.clanId) return "Выберите клан.";
      return "";
    },
    2() {
      const vals = Object.values(ch.abilities);
      if (vals.some(v => v == null)) return "Присвойте значение каждой характеристике.";
      if (new Set(vals).size !== vals.length) return "Одно и то же значение нельзя присвоить двум характеристикам.";
      return "";
    },
    3() {
      const spent = pointsSpent();
      if (spent !== pointsBudget()) return `Нужно распределить ровно ${pointsBudget()} очк. Дисциплин (распределено: ${spent}).`;
      if (SKILL_PICKS.some(p => !ch.skills[p.key])) return "Выберите оба навыка: на +2 и на +1.";
      return "";
    },
    4() { return ch.weaponId ? "" : "Выберите оружие."; },
    5() { return ""; },
  };

  function firstInvalidStep(upTo = TOTAL_STEPS - 1) {
    for (let i = 1; i <= upTo; i++) if (validators[i]()) return i;
    return null;
  }

  return {
    mod, clan, weapon, armor,
    discLevel, hasDisc, learnedDisciplines, pointsSpent, pointsBudget, passiveNote,
    clanSkillId, skillAllowed, skillBonus,
    combatStats, fillTokens, saveDCs,
    weaponDie, weaponUpgrade, mastery, attackNote, saveDCof, severeDC, weaponStats,
    stealthAdvNote, stealthRoll, stealthParts, healAmount,
    validators, firstInvalidStep,
  };
}
