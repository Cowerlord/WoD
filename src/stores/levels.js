import { reactive } from "vue";
import { fetchLevel, fetchLevels, saveLevel } from "../api/characters.js";

// Уровни персонажей (1…10) — только для Мастера. Персонаж без записи — 1-й уровень.
export const LEVEL_MIN = 1;
export const LEVEL_MAX = 10;

export const levels = reactive({ byId: {}, error: "" });

const explain = err => {
  const m = String(err?.message || "");
  if (err?.code === "42P01" || /character_levels/.test(m) && /not exist|schema cache/i.test(m)) return "таблица уровней ещё не создана — выполните SQL из supabase/levels.sql";
  if (err?.code === "23503") return "сначала сохраните персонажа (он должен быть на сервере)";
  if (err?.code === "42501") return "нет прав";
  return m || "ошибка сервера";
};

export async function loadLevel(id) {
  if (!id) return;
  const { data, error } = await fetchLevel(id);
  levels.error = error ? explain(error) : "";
  if (!error) levels.byId[id] = data?.level ?? LEVEL_MIN;
}

export async function loadAllLevels() {
  const { data, error } = await fetchLevels();
  if (error) return;
  for (const r of data) levels.byId[r.character_id] = r.level;
}

export async function changeLevel(id, level) {
  const { error } = await saveLevel(id, level);
  levels.error = error ? explain(error) : "";
  if (error) return false;
  levels.byId[id] = level;
  return true;
}
