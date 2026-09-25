<script setup>
import { computed } from "vue";
import { CONFIG } from "../../data/config.js";
import { character, editor, rules } from "../../stores/editor.js";
import { NOTES_MAX } from "../../character/sanitize.js";
import VSelect from "../common/VSelect.vue";

const s = computed(() => character.session);
const live = computed(() => rules.live());
const locked = computed(() => editor.owner.readOnly);
const hasShield = computed(() => rules.hasDisc("fortitude"));

const severeOptions = [
  { value: 0, label: "нет" },
  { value: 1, label: "Ур. 3 — Обгорание", hint: "нельзя лечиться" },
  { value: 2, label: "Ур. 4 — Паралич крови", hint: "нельзя Дисциплины и Силу Крови" },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function setHP(v) {
  const hp = clamp(v, 0, live.value.max);
  s.value.hp = hp === live.value.max ? null : hp;
}
const setTemp = v => { s.value.tempHP = clamp(v, 0, 99); };
const setBP = v => { s.value.bp = clamp(v, 0, CONFIG.baseBP); };
const setHumanity = v => { s.value.humanity = clamp(v, 0, CONFIG.maxHumanity); };

function newCombat() {
  s.value.used = { heal: false, shield: false };
  s.value.tempHP = 0;
}
function newSession() {
  newCombat();
  s.value.bp = CONFIG.baseBP;
}
</script>

<template>
  <div class="panel live no-print" :class="{ locked }">
    <div class="live-head">
      <h2>В игре</h2>
      <div v-if="!locked" class="live-actions">
        <button type="button" @click="newCombat">Новый бой</button>
        <button type="button" @click="newSession">Новая сессия</button>
      </div>
    </div>
    <p class="hint">Текущее состояние персонажа. Сохраняется само, Мастер видит его во «Всех персонажах».</p>

    <div class="counters">
      <div class="counter">
        <span class="field-lbl">Хиты</span>
        <div class="ctl">
          <button type="button" :disabled="locked" @click="setHP(live.hp - 1)">−</button>
          <input type="number" :value="live.hp" :disabled="locked" min="0" :max="live.max" inputmode="numeric"
                 @change="setHP(Number($event.target.value))">
          <span class="of">/ {{ live.max }}</span>
          <button type="button" :disabled="locked" @click="setHP(live.hp + 1)">+</button>
        </div>
      </div>
      <div class="counter">
        <span class="field-lbl">Временные HP</span>
        <div class="ctl">
          <button type="button" :disabled="locked" @click="setTemp(s.tempHP - 1)">−</button>
          <input type="number" :value="s.tempHP" :disabled="locked" min="0" inputmode="numeric"
                 @change="setTemp(Number($event.target.value))">
          <button type="button" :disabled="locked" @click="setTemp(s.tempHP + 1)">+</button>
        </div>
      </div>
      <div class="counter">
        <span class="field-lbl">Пункты Крови</span>
        <div class="pips">
          <button v-for="n in CONFIG.baseBP" :key="n" type="button" class="pip" :class="{ full: n <= s.bp }"
                  :disabled="locked" :aria-label="`ПК: ${n}`" @click="setBP(n === s.bp ? n - 1 : n)"></button>
          <span class="of">{{ s.bp }} / {{ CONFIG.baseBP }}</span>
        </div>
      </div>
      <div class="counter">
        <span class="field-lbl">Человечность</span>
        <div class="ctl">
          <button type="button" :disabled="locked" @click="setHumanity(live.humanity - 1)">−</button>
          <span class="val">{{ live.humanity }}</span>
          <button type="button" :disabled="locked" @click="setHumanity(live.humanity + 1)">+</button>
        </div>
      </div>
    </div>

    <div class="row2">
      <label class="field"><span>Тяжёлые ранения</span>
        <VSelect v-model="s.severe" :options="severeOptions" :disabled="locked" />
      </label>
      <div class="field">
        <span class="field-lbl">Раз за бой</span>
        <label class="check"><input v-model="s.used.heal" type="checkbox" :disabled="locked"> Лечение потрачено</label>
        <label v-if="hasShield" class="check"><input v-model="s.used.shield" type="checkbox" :disabled="locked"> Щит Брони потрачен</label>
      </div>
    </div>

    <div class="status">
      <b>Состояние:</b>&nbsp;      <template v-if="live.hp === 0">0 HP — {{ live.stage?.short ?? "Торпор" }}</template>
      <template v-else-if="live.stage && live.stage.level > 0">Уровень {{ live.stage.level }} — {{ live.stage.short }}</template>
      <template v-else>здоров, штрафов нет.</template>
      <template v-if="live.severe"><br><b>{{ live.severe.cheatName }}:</b> {{ live.severe.short }}</template>
    </div>

    <label class="field notes"><span>Заметки (снаряжение, деньги, зацепки)</span>
      <textarea v-model="s.notes" :disabled="locked" :maxlength="NOTES_MAX" rows="3"></textarea>
    </label>
  </div>
</template>

<style scoped>
.live { margin-bottom: 20px; }
.live-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.live-head h2 { margin: 0; }
.live-actions { display: flex; gap: 8px; }
.live-actions button { padding: 6px 12px; font-size: .75rem; }
.live .hint { margin: 8px 0 14px; }
.counters { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 12px; }
.counter { background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; padding: 10px; }
.ctl, .pips { display: flex; align-items: center; gap: 6px; }
.ctl button { padding: 4px 12px; font-size: 1rem; letter-spacing: 0; }
.ctl input { width: 64px; text-align: center; padding: 6px; font-family: var(--font-title); font-size: 1.2rem; }
.val { min-width: 40px; text-align: center; font-family: var(--font-title); font-size: 1.4rem; }
.of { color: var(--text-dim); font-size: .9rem; }
.pip { width: 24px; height: 24px; padding: 0; border-radius: 50%; border: 2px solid var(--blood); background: transparent; }
.pip.full { background: var(--blood-bright); box-shadow: 0 0 8px rgba(193,18,31,.6); }
.pips .of { margin-left: 6px; white-space: nowrap; }
.pip { flex: 0 0 auto; }
.row2 { display: flex; gap: 16px; flex-wrap: wrap; }
.row2 > * { flex: 1 1 240px; }
.check { display: block; font-family: var(--font-body); font-size: 1rem; letter-spacing: 0; color: var(--text); margin: 2px 0; }
.check input { accent-color: var(--blood-bright); margin-right: 6px; }
.status { padding: 10px 14px; border-left: 3px solid var(--blood-bright); background: rgba(139,0,0,.08); margin-bottom: 14px; }
.notes textarea { resize: vertical; }
.locked button:disabled, .locked input:disabled, .locked select:disabled, .locked textarea:disabled { opacity: .8; cursor: default; }
</style>
