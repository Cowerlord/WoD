import { reactive } from "vue";
import { CONFIG, ABILITIES } from "../data/config.js";
import { COMBAT_EFFECTS, ONCE_PER_COMBAT, CONDITIONS } from "../data/play.js";
import { BLOOD_SURGE } from "../data/blood.js";
import { HEALING } from "../data/combat.js";
import { discipline, levelCost, fmt } from "../character/format.js";
import { character, rules } from "./editor.js";
import { roll } from "./dice.js";

const s = () => character.session;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function setHP(v) {
  const max = rules.live().max;
  const hp = clamp(Math.round(v), 0, max);
  s().hp = hp === max ? null : hp;
}
export const setTempHP = v => { s().tempHP = clamp(Math.round(v), 0, 99); };
export const setBP = v => { s().bp = clamp(v, 0, rules.maxBP()); };
export const setPacks = v => { s().packs = clamp(v, 0, rules.clothing()?.bloodPacks ?? 0); };
export const setHumanity = v => { s().humanity = clamp(v, 0, CONFIG.maxHumanity); };

export function toggleCondition(id) {
  const list = s().conditions;
  const i = list.indexOf(id);
  if (i === -1) list.push(id);
  else list.splice(i, 1);
}

export function newCombat() {
  Object.assign(s(), { used: { heal: false, shield: false }, tempHP: 0, effects: [], surge: null, conditions: [] });
}

export function newSession() {
  newCombat();
  s().bp = rules.maxBP();
}

// Паралич крови (ур. 4) запрещает Дисциплины и Силу Крови
export const bloodLocked = () => rules.live().severe?.level === 4;

// Цена применения: ур. 1 — своя, ур. 3 сразу — ур. 1 + усиление, усиление после ур. 1 — только его цена
export function useCost(id, level, upgrade = false) {
  const levels = discipline(id).levels;
  if (level === 1) return levelCost(levels[1]);
  return upgrade ? levelCost(levels[3]) : levelCost(levels[1]) + levelCost(levels[3]);
}

export function whyCannotUse(id, level, upgrade = false) {
  if (bloodLocked()) return "Паралич крови: Дисциплины недоступны.";
  if (ONCE_PER_COMBAT.includes(id) && s().used.shield && !upgrade) return "Уже использовано в этом бою.";
  if (s().bp < useCost(id, level, upgrade)) return `Не хватает ПК (нужно ${useCost(id, level, upgrade)}).`;
  return "";
}

export function useDiscipline(id, level, upgrade = false) {
  if (whyCannotUse(id, level, upgrade)) return false;
  s().bp -= useCost(id, level, upgrade);
  const key = `${id}-${level}`;
  const effect = COMBAT_EFFECTS[key];
  if (effect) {
    s().effects = [...s().effects.filter(e => !e.startsWith(`${id}-`)), key];
    if (effect.tempHP) setTempHP(Math.max(s().tempHP, Number(rules.fillTokens(effect.tempHP))));
  }
  if (ONCE_PER_COMBAT.includes(id)) s().used.shield = true;
  return true;
}

export const removeEffect = key => { s().effects = s().effects.filter(e => e !== key); };

export function whyCannotSurge() {
  if (bloodLocked()) return "Паралич крови: Сила Крови недоступна.";
  if (s().bp < 1) return "Не хватает ПК.";
  return "";
}

export function useSurge(ability) {
  if (whyCannotSurge()) return false;
  s().bp -= 1;
  s().surge = ability;
  return true;
}

export function whyCannotHeal() {
  if (s().used.heal) return "Уже лечились в этом бою.";
  if (rules.live().severe) return "Тяжёлое ранение: лечиться нельзя.";
  if (s().bp < 1) return "Не хватает ПК.";
  if (rules.live().hp >= rules.live().max) return "HP и так полные.";
  return "";
}

export function heal() {
  if (whyCannotHeal()) return;
  s().bp -= 1;
  const res = roll({ label: "Лечение", onlyDamage: true, damage: rules.healAmount(), notes: [`${HEALING.cost}: восстановлено HP`] });
  setHP(rules.live().hp + res.total);
  s().used.heal = true;
}

export const surgeText = () => `${BLOOD_SURGE.name}: +${BLOOD_SURGE.scorePerPotency * rules.generation().potency} к характеристике (мод. +${rules.generation().potency}) до конца боя`;

// Значки бафов и дебафов в шапке: нажатие снимает, несколько секунд можно вернуть
export function activeChips() {
  const chips = [];
  if (s().surge) chips.push({ kind: "surge", key: s().surge,
    label: `🩸 Интенсификация: ${ABILITIES.find(a => a.key === s().surge).abbr} ${fmt(rules.surgeBonus(s().surge))}` });
  for (const e of rules.activeEffects()) chips.push({ kind: "effect", key: e.key, label: `✦ ${e.name}${e.ac ? ` (+${e.ac} КД)` : ""}` });
  for (const c of CONDITIONS.filter(x => s().conditions.includes(x.id))) chips.push({ kind: "condition", key: c.id, label: c.name });
  return chips;
}

export const undo = reactive({ text: "", restore: null });
let undoTimer = null;

export function removeChip(chip) {
  if (chip.kind === "surge") s().surge = null;
  if (chip.kind === "effect") removeEffect(chip.key);
  if (chip.kind === "condition") toggleCondition(chip.key);
  undo.text = `Снято: ${chip.label}`;
  undo.restore = () => {
    if (chip.kind === "surge") s().surge = chip.key;
    if (chip.kind === "effect" && !s().effects.includes(chip.key)) s().effects.push(chip.key);
    if (chip.kind === "condition" && !s().conditions.includes(chip.key)) s().conditions.push(chip.key);
  };
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => { undo.text = ""; undo.restore = null; }, 6000);
}

export function undoRemove() {
  undo.restore?.();
  undo.text = "";
  undo.restore = null;
  clearTimeout(undoTimer);
}
