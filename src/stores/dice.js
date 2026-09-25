import { reactive } from "vue";

export const dice = reactive({ current: null, rolling: false, history: [] });

const d = sides => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return 1 + (buf[0] % sides);
};
const many = (count, sides) => Array.from({ length: count }, () => d(sides));
const sum = list => list.reduce((a, b) => a + b, 0);

// «2d6 + 3», «1d8 − 1», «1d4» → { count, sides, bonus }
export function parseDice(expr) {
  const m = String(expr).replace(/\s+/g, "").match(/^(\d*)d(\d+)(?:([+−-])(\d+))?$/);
  if (!m) return null;
  return { count: Number(m[1] || 1), sides: Number(m[2]), bonus: m[3] ? (m[3] === "+" ? 1 : -1) * Number(m[4]) : 0 };
}

function rollD20(mode) {
  const rolls = mode === "normal" ? [d(20)] : [d(20), d(20)];
  const kept = mode === "adv" ? Math.max(...rolls) : mode === "dis" ? Math.min(...rolls) : rolls[0];
  return { rolls, kept };
}

function rollDamage(expr, crit = false) {
  const p = parseDice(expr);
  if (!p) return null;
  const rolls = many(p.count * (crit ? 2 : 1), p.sides);
  return { expr, rolls, bonus: p.bonus, total: Math.max(0, sum(rolls) + p.bonus), crit };
}

let seq = 0;
let hideTimer = null;

function show(result) {
  dice.current = { ...result, id: ++seq };
  dice.rolling = true;
  dice.history.unshift(dice.current);
  dice.history.splice(6);
  setTimeout(() => { dice.rolling = false; }, 750);
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { dice.current = null; }, 9000);
}

export function hideRoll() {
  clearTimeout(hideTimer);
  dice.current = null;
}

// request: { label, mod, mode, notes, damage } — damage есть у атак; save — атака через спасбросок цели (только урон)
export function roll(request) {
  const mode = request.mode || "normal";
  if (request.onlyDamage) {
    const damage = rollDamage(request.damage);
    show({ request, damage });
    return damage;
  }
  const d20 = rollD20(mode);
  const crit = d20.kept === 20;
  show({
    request: { ...request, mode },
    d20,
    total: d20.kept + (request.mod || 0),
    crit,
    fumble: d20.kept === 1,
    damage: request.damage ? rollDamage(request.damage, crit) : null,
  });
}

export function reroll(mode) {
  if (dice.current?.request && !dice.current.request.onlyDamage) roll({ ...dice.current.request, mode });
}

export function rollFree(sides) {
  show({ request: { label: `d${sides}`, free: true }, free: { sides, value: d(sides) } });
}
