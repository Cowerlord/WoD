import { reactive, watch, watchEffect } from "vue";
import { TOTAL_STEPS } from "../data/config.js";
import { SKILL_PICKS } from "../data/skills.js";
import { DEFAULT_CLOTHING } from "../data/clothing.js";
import { blankCharacter } from "../character/blank.js";
import { FILE_FORMAT, sanitizeCharacter, serialize } from "../character/sanitize.js";
import { characterRules, skillById } from "../character/rules.js";
import { fetchCharacter, describeError } from "../api/characters.js";
import { auth } from "./auth.js";
import { setMode } from "./ui.js";
import {
  roster, snapshot, isUnchanged, rememberSnap, isRejected, isFull, markKnown,
  queueSave, lastOpenedId, rememberLast,
} from "./roster.js";

export const character = reactive(blankCharacter());
export const rules = characterRules(character);

export const editor = reactive({
  owner: { id: null, name: "", readOnly: false },
  errors: { 1: "", 2: "", 3: "", 4: "", 5: "" },
  allError: "",
});

export const isOthers = () => !!auth.me && !!editor.owner.id && editor.owner.id !== auth.me.id;

export const showError = (step, msg) => { editor.errors[step] = msg; };
export const clearError = step => { editor.errors[step] = ""; };

export function loadCharacter(data, owner) {
  Object.assign(character, structuredClone(data));
  editor.owner = owner ?? { id: auth.me?.id ?? null, name: auth.me?.username ?? "", readOnly: false };
  for (const k in editor.errors) editor.errors[k] = "";
  rememberSnap(character.id, snapshot(serialize(character)));
}

let saveTimer = null;

// Пустой черновик без имени и клана не сохраняется; чужого персонажа сохраняет только админ
export function saveCurrent() {
  clearTimeout(saveTimer);
  if (!auth.me || editor.owner.readOnly) return;
  if (!character.name && !character.clanId) return;
  const data = serialize(character);
  const snap = snapshot(data);
  if (isUnchanged(data.id, snap)) return;
  const mine = editor.owner.id === auth.me.id;
  if (mine && !roster.characters[data.id] && (isFull() || isRejected(data.id))) {
    showError(character.step, `Лимит — ${auth.charLimit} персонажей на аккаунт, этот персонаж не сохранится. ` +
      "Освободите место в «Мои персонажи».");
    return;
  }
  if (mine) { roster.characters[data.id] = data; rememberLast(data.id); }
  rememberSnap(data.id, snap);
  queueSave(data, editor.owner.id);
}

watch(character, () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCurrent, 400);
}, { deep: true });

window.addEventListener("pagehide", saveCurrent);
document.addEventListener("visibilitychange", () => { if (document.hidden) saveCurrent(); });

watch(() => roster.rejection, r => { if (r?.id === character.id) showError(character.step, r.message); });

// Одежда, недоступная новому клану, меняется на повседневную
watchEffect(() => {
  const c = rules.clothing();
  if (!c || !rules.clothingAllowed(c)) character.clothingId = DEFAULT_CLOTHING;
  if (character.session.packs > (rules.clothing()?.bloodPacks ?? 0)) character.session.packs = rules.clothing()?.bloodPacks ?? 0;
});

// Навык, ставший недоступным (сменили клан, сняли Анимализм), сбрасывается
watchEffect(() => {
  for (const p of SKILL_PICKS) {
    const sk = skillById(character.skills[p.key]);
    if (sk && (!rules.skillAllowed(sk) || sk.id === rules.clanSkillId())) character.skills[p.key] = null;
  }
});

export function goTo(step) {
  character.step = Math.min(Math.max(step, 1), TOTAL_STEPS);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function nextStep() {
  const err = rules.validators[character.step]();
  if (err) { showError(character.step, err); return; }
  clearError(character.step);
  goTo(character.step + 1);
}

// Переход по шагам вверху: можно, если все предыдущие шаги заполнены
export function jumpTo(step) {
  const bad = rules.firstInvalidStep(step - 1);
  if (bad) { goTo(bad); showError(bad, rules.validators[bad]()); return; }
  goTo(step);
}

const resumeStep = data => Math.min(data.step, rules.firstInvalidStep() ?? TOTAL_STEPS);

export function openMine(id, where) {
  const raw = roster.characters[id];
  if (!raw) return;
  saveCurrent();
  let data;
  try { data = sanitizeCharacter(raw); } catch { return; }
  loadCharacter(data);
  setMode("create");
  goTo(where === "sheet" ? (rules.firstInvalidStep() ?? TOTAL_STEPS) : 1);
}

export function openOwnLast() {
  const last = roster.characters[lastOpenedId()];
  let data = null;
  try { data = last ? sanitizeCharacter(last) : null; } catch { data = null; }
  loadCharacter(data || blankCharacter());
  goTo(data ? resumeStep(data) : 1);
}

export function startNew() {
  saveCurrent();
  if (isFull()) {
    setMode("roster");
    roster.error = `Лимит — ${auth.charLimit} персонажей на аккаунт. Удалите кого-нибудь, чтобы создать нового.`;
    return;
  }
  loadCharacter(blankCharacter());
  setMode("create");
  goTo(1);
}

export async function openOther(id, where) {
  editor.allError = "";
  const { data: row, error } = await fetchCharacter(id);
  if (error || !row) {
    editor.allError = error ? `Не удалось открыть: ${describeError(error, auth.charLimit)}.` : "Персонаж уже удалён.";
    return;
  }
  let data;
  try { data = sanitizeCharacter({ format: FILE_FORMAT, ...row.data, id: row.id }); }
  catch { editor.allError = "Персонаж повреждён."; return; }
  saveCurrent();
  const editable = auth.me.role === "admin" && where === "edit";
  markKnown(row.id);
  loadCharacter(data, { id: row.owner_id, name: row.owner?.username ?? "?", readOnly: !editable });
  setMode("create");
  goTo(editable ? 1 : TOTAL_STEPS);
}

// Чужой лист на просмотре: подтягиваем свежее состояние «В игре»
setInterval(async () => {
  if (!editor.owner.readOnly || document.hidden) return;
  const id = character.id;
  const { data: row } = await fetchCharacter(id);
  if (!row || character.id !== id || !editor.owner.readOnly) return;
  try { character.session = sanitizeCharacter({ format: FILE_FORMAT, ...row.data, id: row.id }).session; } catch { /* повреждённая запись */ }
}, 20000);

export function closeView() {
  saveCurrent();
  openOwnLast();
  setMode("all");
}
