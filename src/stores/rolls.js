import { ROLL_ADVANTAGES } from "../data/disciplines.js";
import { HEALING, MORTAL_CRIT } from "../data/combat.js";
import { ABILITIES } from "../data/config.js";
import { BLOOD_PACK } from "../data/clothing.js";
import { discipline, abbrOf, fmt } from "../character/format.js";
import { character, rules } from "./editor.js";
import { roll } from "./dice.js";

// Преимущество и помеха по правилам: дисциплины, тяжёлая броня, ранения. Друг друга гасят.
function modeFor({ ability, skill, initiative, attack }) {
  const adv = [], dis = [];
  for (const a of ROLL_ADVANTAGES) {
    if (!rules.hasDisc(a.discipline, a.level)) continue;
    if ((ability && a.abilities?.includes(ability)) || (skill && a.skills?.includes(skill)) || (initiative && a.initiative))
      adv.push(`${discipline(a.discipline).name} ${a.level}`);
  }
  if (rules.armor()?.dexDisadvantage && (ability === "dex" || initiative)) dis.push("тяжёлая броня");
  const w = woundPenalty();
  if (w.dis && (ability || initiative || attack)) dis.push(w.why);
  const notes = [...adv.map(x => `преимущество: ${x}`), ...dis.map(x => `помеха: ${x}`)];
  const mode = adv.length && !dis.length ? "adv" : dis.length && !adv.length ? "dis" : "normal";
  return { mode, notes };
}

function woundPenalty() {
  if (rules.noWoundPenalty()) return { mod: 0, dis: false, why: "" };
  const l = rules.live();
  const stage = l.stage?.level ?? 0;
  if (stage === 2 || l.severe?.level === 4) return { mod: -2, dis: true, why: stage === 2 ? "ранения ур. 2" : "Паралич крови" };
  if (stage === 1) return { mod: -1, dis: false, why: "ранения ур. 1" };
  return { mod: 0, dis: false, why: "" };
}

function check(label, mod, ctx, extra = {}) {
  const { mode, notes } = modeFor(ctx);
  const w = woundPenalty();
  const penalty = w.mod && (ctx.ability || ctx.initiative || ctx.attack) ? w.mod : 0;
  if (penalty) notes.push(`${fmt(penalty)}: ${w.why}`);
  const bonus = ctx.ability || ctx.initiative || ctx.attack ? rules.rollBonus() : 0;
  if (bonus) notes.push(`${fmt(bonus)}: ${rules.activeConditions().filter(c => c.roll).map(c => c.name).join(", ")}`);
  if (ctx.ability && rules.surgeBonus(ctx.ability)) notes.push(`${fmt(rules.surgeBonus(ctx.ability))}: Интенсификация Крови`);
  roll({ label, mod: mod + penalty + bonus, mode, notes, ...extra });
}

export const rollAbility = key => check(`Проверка: ${ABILITIES.find(a => a.key === key).name}`, rules.mod(key), { ability: key });

export const rollSkill = sk => check(sk.name, rules.mod(sk.ability) + rules.skillBonus(sk.id), { ability: sk.ability, skill: sk.id });

export const rollInitiative = () => check("Инициатива", rules.combatStats().init, { initiative: true });

export const rollStealth = () => check("Скрытое ношение", rules.stealthRoll(), { ability: "dex", skill: "stealth" }, { target: rules.stealthDC() });

export const rollSave = (key, label = `Спасбросок ${abbrOf(key)}`) => check(label, rules.mod(key), { ability: key });

export const rollGrapple = () => check("Захват / укус", rules.mod("str") + rules.skillBonus("athletics"), { ability: "str", skill: "athletics" });

export function rollAttack(a) {
  const st = rules.weaponStats(a);
  const label = a.name.replace(/\s*\(.*\)$/, "");
  if (a.save) {
    roll({ label, onlyDamage: true, damage: st.damage, notes: [`цель: спасбросок ${abbrOf(a.save)}, Сл. ${rules.saveDCof(a)}`] });
    return;
  }
  const extra = { damage: st.damage };
  if (a.mortalCrit) extra.critNote = `По смертному: ${MORTAL_CRIT}.`;
  check(label, Number(st.attack.replace("−", "-")), { attack: true }, extra);
}

export const rollDamageOnly = a => roll({ label: `Урон: ${a.name.replace(/\s*\(.*\)$/, "")}`, onlyDamage: true, damage: rules.weaponStats(a).damage });

export const rollHeal = () => roll({ label: "Лечение", onlyDamage: true, damage: rules.healAmount(), notes: [`${HEALING.cost}, восстановить HP`] });

export function drinkBloodPack() {
  const s = character.session;
  if (!s.packs) return;
  const res = roll({ label: "Пакет крови", onlyDamage: true, damage: BLOOD_PACK.dice, notes: ["восстановлено ПК"] });
  s.packs--;
  s.bp = Math.min(rules.maxBP(), s.bp + res.total);
}

// Бешенство: спасбросок ВОС, Человечность 7+ даёт +2, 9–10 — преимущество, 0–3 — помеха
export function rollFrenzy() {
  const f = rules.frenzy();
  const base = modeFor({ ability: "wis" });
  const adv = base.mode === "adv" || f.mode === "adv", dis = base.mode === "dis" || f.mode === "dis";
  const w = woundPenalty();
  const notes = [...base.notes];
  const h = character.session.humanity ?? character.humanity;
  if (f.bonus) notes.push(`+${f.bonus}: Человечность ${h}`);
  if (f.mode === "adv") notes.push(`преимущество: Человечность ${h}`);
  if (f.mode === "dis") notes.push(`помеха: Человечность ${h}`);
  if (w.mod) notes.push(`${fmt(w.mod)}: ${w.why}`);
  if (rules.rollBonus()) notes.push(`${fmt(rules.rollBonus())}: состояния`);
  roll({ label: "Бешенство: спасбросок ВОС", mod: rules.mod("wis") + f.bonus + w.mod + rules.rollBonus(), mode: adv && !dis ? "adv" : dis && !adv ? "dis" : "normal", notes });
}
