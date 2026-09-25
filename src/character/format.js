import { ABILITIES } from "../data/config.js";
import { DISTANCES } from "../data/weapons.js";
import { SPEED_RULES } from "../data/combat.js";
import { DISCIPLINES } from "../data/disciplines.js";

export const modOf = score => Math.floor((score - 10) / 2);
export const fmt = n => (n >= 0 ? "+" : "−") + Math.abs(n);
export const abbrOf = key => ABILITIES.find(a => a.key === key)?.abbr ?? key;
export const distText = list => list.map(d => `${d} — ${DISTANCES[d]}`).join(", ");
export const dots = (n, max) => "●".repeat(n) + "○".repeat(Math.max(0, max - n));
export const discipline = id => DISCIPLINES[id] || { name: id, levels: {} };

export const speedText = sp => sp >= 3
  ? "дистанции не важны"
  : `дист. 2 — ${SPEED_RULES[sp][2]}; дист. 3 — ${SPEED_RULES[sp][3]}`;

export const damageFormula = (w, die = w.die) =>
  `${die}${w.addMod === false ? "" : ` + ${w.modMul ? `${w.modMul}×` : ""}${abbrOf(w.ability)}`}`;

// «Активный [1 ПК]: …» → «Акт, 1 ПК»
export function levelTag(fullText) {
  const head = fullText.split(":")[0];
  const cost = (head.match(/\[(.*?)\]/) || [])[1];
  const kind = /^Усил/.test(head) ? "Усил" : /^Пасс/.test(head) ? "Пасс" : "Акт";
  return cost ? `${kind}, ${cost}` : kind;
}

// «Активный [1 ПК]: текст» → { head: "Активный [1 ПК]", body: "текст" }
export function splitLevel(text) {
  const i = text.indexOf(":");
  return i > 0 ? { head: text.slice(0, i), body: text.slice(i + 1) } : { head: "", body: text };
}

export function woundRange(stage, maxHP) {
  if (!stage.range) return "аггр.";
  const [lo, hi] = stage.range(maxHP);
  if (lo > hi) return "—";
  return lo === hi ? `${lo}` : `${lo}–${hi}`;
}

export const fmtDate = iso => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
};

export const fileSafe = name => String(name || "").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "").trim() || "Персонаж";
