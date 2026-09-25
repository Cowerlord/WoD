import { CONFIG, TOTAL_STEPS } from "../data/config.js";
import { CLANS } from "../data/clans.js";
import { DISCIPLINE_PASSIVES, SAVE_DC } from "../data/disciplines.js";
import { SKILLS, SKILL_PICKS } from "../data/skills.js";
import { WEAPONS, MASTERY, STEALTH_DC } from "../data/weapons.js";
import { CLOTHING } from "../data/clothing.js";
import { generationInfo } from "../data/blood.js";
import { humanityFrenzy } from "../data/beast.js";
import { COMBAT_EFFECTS, CONDITIONS } from "../data/play.js";
import { ARMOR } from "../data/armor.js";
import { HEALING, WOUND_STAGES } from "../data/combat.js";
import { modOf, fmt, abbrOf, discipline, stageForHP } from "./format.js";

export const skillById = id => SKILLS.find(k => k.id === id) || null;

// Короткая строка состояния для карточки: «HP 14/18 · ПК 3/5 · Ур. 1»
export function liveSummary(ch) {
  const l = characterRules(ch).live();
  const parts = [`HP ${l.hp}/${l.max}`, `ПК ${ch.session.bp}/${generationInfo(ch.generation).maxBP}`];
  if (ch.session.tempHP) parts.push(`врем. ${ch.session.tempHP}`);
  if (l.stage?.level) parts.push(`ур. ${l.stage.level}`);
  if (l.severe) parts.push(l.severe.cheatName);
  return parts.join(" · ");
}

// Все расчёты по персонажу. ch — реактивный объект, поэтому результаты всегда актуальны.
export function characterRules(ch) {
  const baseMod = key => ch.abilities[key] == null ? 0 : modOf(ch.abilities[key]);
  // Интенсификация Крови действует на броски, но не на макс. HP и КД
  const surgeBonus = key => ch.session?.surge === key ? generationInfo(ch.generation).potency : 0;
  const mod = key => baseMod(key) + surgeBonus(key);
  const activeEffects = () => (ch.session?.effects || []).map(k => ({ key: k, ...COMBAT_EFFECTS[k] })).filter(e => e.name);
  const activeConditions = () => CONDITIONS.filter(c => ch.session?.conditions?.includes(c.id));
  const rollBonus = () => activeConditions().reduce((s, c) => s + (c.roll || 0), 0);
  const meleeDamageBonus = () => activeConditions().reduce((s, c) => s + (c.meleeDamage || 0), 0);
  const noWoundPenalty = () => activeEffects().some(e => e.noWoundPenalty);
  const clan = () => CLANS.find(c => c.id === ch.clanId) || null;
  const weapon = () => WEAPONS.find(w => w.id === ch.weaponId) || null;
  const armor = () => ARMOR.find(a => a.id === ch.armorId) || null;
  const generation = () => generationInfo(ch.generation);
  const maxBP = () => generation().maxBP;
  const frenzy = () => humanityFrenzy(ch.session.humanity ?? ch.humanity);
  const clothing = () => CLOTHING.find(c => c.id === ch.clothingId) || null;
  const clothingAllowed = c => !c.excludeClans?.includes(ch.clanId);
  const stealthDC = () => clothing()?.stealthDC?.[ch.weaponId] ?? STEALTH_DC;

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
      hp: CONFIG.baseHP + CONFIG.hpConMultiplier * baseMod("con") + passiveBonus("hp"),
      ac: CONFIG.baseAC + (a ? a.ac : baseMod("dex")) + passiveBonus("ac") + activeEffects().reduce((s, e) => s + (e.ac || 0), 0),
      bp: maxBP(),
      speed: Math.min(CONFIG.maxSpeed, Math.max(CONFIG.minSpeed, CONFIG.baseSpeed + passiveBonus("speed"))),
      init: mod("dex") + passiveBonus("init") + (a?.init || 0),
      initAdvantage: hasDisc("celerity", 2) && !a?.dexDisadvantage,
      initDisadvantage: !!a?.dexDisadvantage && !hasDisc("celerity", 2),
      noDash: !!a?.noDash,
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
    const m = (w.addMod !== false ? mod(w.ability) * (w.modMul || 1) : 0) + (w.kind === "melee" ? meleeDamageBonus() : 0);
    const die = weaponDie(w);
    return {
      attack: w.save ? `Спб ${abbrOf(w.save)}${w.dc ? ` (Сл. ${saveDCof(w)})` : ""}` : fmt(attackBonus(w)),
      damage: m ? `${die} ${m > 0 ? "+" : "−"} ${Math.abs(m)}` : die,
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

  function live() {
    const max = combatStats().hp;
    const hp = ch.session.hp ?? max;
    return {
      max,
      hp,
      humanity: ch.session.humanity ?? ch.humanity,
      stage: stageForHP(hp, max, WOUND_STAGES),
      severe: ch.session.severe ? WOUND_STAGES.find(w => w.level === 2 + ch.session.severe) : null,
    };
  }

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
    4() {
      if (!ch.weaponId) return "Выберите оружие.";
      if (!clothing() || !clothingAllowed(clothing())) return "Выберите одежду, доступную вашему клану.";
      return "";
    },
    5() { return ""; },
  };

  function firstInvalidStep(upTo = TOTAL_STEPS - 1) {
    for (let i = 1; i <= upTo; i++) if (validators[i]()) return i;
    return null;
  }

  return {
    mod, baseMod, surgeBonus, activeEffects, activeConditions, rollBonus, noWoundPenalty, clan, weapon, armor, clothing, clothingAllowed, stealthDC, generation, maxBP, frenzy,
    discLevel, hasDisc, learnedDisciplines, pointsSpent, pointsBudget, passiveNote,
    clanSkillId, skillAllowed, skillBonus,
    combatStats, fillTokens, saveDCs,
    weaponDie, weaponUpgrade, mastery, attackNote, saveDCof, severeDC, weaponStats,
    stealthAdvNote, stealthRoll, stealthParts, healAmount, live,
    validators, firstInvalidStep,
  };
}
