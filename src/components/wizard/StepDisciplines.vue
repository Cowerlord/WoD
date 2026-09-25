<script setup>
import { CONFIG } from "../../data/config.js";
import { character, editor, rules, showError, clearError } from "../../stores/editor.js";
import { isAdmin } from "../../stores/auth.js";
import { clampInt } from "../../character/sanitize.js";
import { discipline, dots } from "../../character/format.js";
import RuleLink from "../common/RuleLink.vue";
import DisciplineLevels from "../common/DisciplineLevels.vue";
import SkillPicker from "./SkillPicker.vue";
import CombatPreview from "./CombatPreview.vue";

const levels = Array.from({ length: CONFIG.maxDisciplineLevel + 1 }, (_, l) => l);
const pointsLeft = () => rules.pointsBudget() - rules.pointsSpent();

function setLevel(id, lvl) {
  if (lvl - rules.discLevel(id) > pointsLeft()) { showError(3, "Не хватает очков Дисциплин."); return; }
  if (lvl === 0) delete character.disciplines[id];
  else character.disciplines[id] = lvl;
  clearError(3);
}

const setBonus = v => { character.bonusPoints = clampInt(v, 0, CONFIG.maxBonusPoints, 0); };
</script>

<template>
  <div class="panel">
    <h2>Дисциплины</h2>
    <p class="hint">У вас <b>3 очка</b>: уровень дисциплины стоит столько очков, какой он по счёту.
      Можно взять три дисциплины на ур. 1, одну на ур. 2 и одну на ур. 1 — или одну сразу на ур. 3.
      <RuleLink rule="disciplines">Все дисциплины</RuleLink></p>
    <template v-if="isAdmin()">
      <label class="field bonus-field"><span>Доп. очки Дисциплин от Мастера</span>
        <input type="number" min="0" :max="CONFIG.maxBonusPoints" inputmode="numeric"
               :value="character.bonusPoints" @input="setBonus($event.target.value)">
      </label>
      <p class="hint" style="margin-top:-8px">На старте 0. Выдавать очки может только Мастер: откройте персонажа игрока через «Все персонажи» → «Изменить».</p>
    </template>
    <p v-else-if="character.bonusPoints" class="bonus-given">Доп. очки Дисциплин от Мастера: <b>+{{ character.bonusPoints }}</b></p>
    <p v-else class="hint">Дополнительные очки Дисциплин выдаёт Мастер после сессий.</p>

    <template v-if="rules.clan()">
      <div class="pool">Очки Дисциплин: <b>{{ pointsLeft() }}</b> из {{ rules.pointsBudget() }} свободно
        <span class="dots">{{ dots(rules.pointsSpent(), rules.pointsBudget()) }}</span></div>
      <div class="disc-list">
        <div v-for="id in rules.clan().disciplines" :key="id" class="disc" :class="{ selected: rules.discLevel(id) }">
          <div style="flex:1">
            <div class="disc-head">
              <b>{{ discipline(id).name }}</b>
              <span class="lvl-picker" title="Уровень">
                <button v-for="lvl in levels" :key="lvl" type="button" :class="{ on: lvl === rules.discLevel(id) }"
                        :disabled="lvl - rules.discLevel(id) > pointsLeft()" @click="setLevel(id, lvl)">
                  {{ lvl === 0 ? "—" : lvl }}
                </button>
              </span>
            </div>
            <DisciplineLevels :levels="discipline(id).levels" :owned="rules.discLevel(id)" />
          </div>
        </div>
      </div>
      <h3>Навыки</h3>
      <p class="hint">Клан даёт один навык на +2. Выберите ещё два: один на +2, другой на +1.
        Проверка навыка = d20 + мод. характеристики + бонус навыка.</p>
      <SkillPicker />
      <h3>Боевые параметры</h3>
      <CombatPreview />
    </template>
    <div class="error">{{ editor.errors[3] }}</div>
  </div>
</template>

<style scoped>
.bonus-field { max-width: 320px; }
.bonus-given { color: var(--gold); margin: 0 0 16px; }
.pool { margin-bottom: 16px; }
.dots { color: var(--blood-bright); letter-spacing: .1em; }
.disc-list { display: grid; gap: 10px; }
.disc {
  display: flex; gap: 12px; align-items: flex-start;
  background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; padding: 12px;
}
.disc.selected { border-color: var(--blood-bright); background: rgba(139,0,0,.2); }
.disc-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.disc-head b { font-family: var(--font-title); letter-spacing: .05em; }
.lvl-picker { display: inline-flex; gap: 4px; }
.lvl-picker button { padding: 4px 12px; font-size: .85rem; min-width: 38px; }
.lvl-picker button.on { background: var(--blood); color: #fff; }
.disc :deep(p) { margin: 4px 0 0; color: var(--text-dim); }
.disc :deep(p.lvl b) { font-family: var(--font-body); color: var(--text); letter-spacing: 0; }
</style>
