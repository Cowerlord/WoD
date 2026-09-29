<script setup>
import { computed, watch } from "vue";
import { character, rules } from "../../stores/editor.js";
import { levels, loadLevel, changeLevel, LEVEL_MIN, LEVEL_MAX } from "../../stores/levels.js";

// Скрытый уровень — видит и меняет только Мастер. За каждый уровень выше 1-го: +1 очко Дисциплин и +1 усиление навыка.
const level = computed(() => levels.byId[character.id] ?? null);
const upgradesDue = computed(() => (level.value ?? LEVEL_MIN) - LEVEL_MIN);
watch(() => character.id, id => loadLevel(id), { immediate: true });

let busy = false;
async function step(delta) {
  const next = (level.value ?? LEVEL_MIN) + delta;
  if (busy || next < LEVEL_MIN || next > LEVEL_MAX) return;
  busy = true;
  try {
    if (await changeLevel(character.id, next)) {
      character.bonusPoints = Math.max(0, (character.bonusPoints || 0) + delta);   // очко Дисциплин за уровень
    }
  } finally { busy = false; }
}
</script>

<template>
  <div class="level-panel">
    <div class="lvl-head">
      <span class="field-title">🔒 Уровень — видит только Мастер</span>
      <div class="lvl-ctrl">
        <button type="button" :disabled="level == null || level <= LEVEL_MIN" @click="step(-1)">−</button>
        <b>{{ level ?? "…" }}</b> / {{ LEVEL_MAX }}
        <button type="button" :disabled="level == null || level >= LEVEL_MAX" @click="step(1)">Повысить</button>
      </div>
    </div>
    <p class="hint">Повышение даёт +1 очко Дисциплин (добавляется к доп. очкам выше — их можно поправить вручную)
      и +1 усиление навыка — выдайте его кнопкой «+» в таблице навыков.</p>
    <p class="lvl-budget">Усилений навыков по уровню: положено <b>{{ upgradesDue }}</b>,
      выдано Мастером всего <b>{{ rules.skillsSpentFromMaster() }}</b> (вместе с наградами за события).</p>
    <div class="lock-row">
      <span>Сборка: <b>{{ character.locked ? "🔒 зафиксирована" : "открыта" }}</b></span>
      <button type="button" @click="character.locked = !character.locked">{{ character.locked ? "Разблокировать" : "Зафиксировать" }}</button>
    </div>
    <p v-if="levels.error" class="error">Уровень: {{ levels.error }}</p>
  </div>
</template>

<style scoped>
.level-panel { margin-top: 16px; padding: 12px 14px; border: 1px dashed var(--gold); border-radius: 6px; }
.lvl-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.field-title { font-family: var(--font-title); font-size: .8rem; letter-spacing: .08em; color: var(--gold); }
.lvl-ctrl { display: flex; align-items: center; gap: 8px; }
.lvl-ctrl button { padding: 4px 12px; }
.lvl-ctrl b { font-size: 1.3rem; color: var(--blood-bright); }
.lvl-budget { margin: 6px 0 0; }
.lock-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
.lock-row button { padding: 4px 12px; }
</style>
