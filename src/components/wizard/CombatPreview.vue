<script setup>
import { computed } from "vue";
import { CONFIG } from "../../data/config.js";
import { rules } from "../../stores/editor.js";
import { fmt, abbrOf, speedText } from "../../character/format.js";

const s = computed(() => rules.combatStats());
const initNote = computed(() => {
  const a = rules.armor();
  return `d20 ${fmt(rules.mod("dex"))} (ЛОВ)${rules.passiveNote("init")}${a?.init ? ` ${fmt(a.init)} (${a.name})` : ""}` +
    (s.value.initAdvantage ? ", с преимуществом" : s.value.initDisadvantage ? ", с помехой (тяжёлая броня)" : "");
});
</script>

<template>
  <div class="stat-row">
    <div class="stat"><div class="lbl">Хиты (HP)</div><div class="val">{{ s.hp }}</div>
      <div class="formula">{{ CONFIG.baseHP }} {{ fmt(CONFIG.hpConMultiplier * rules.mod("con")) }} ({{ CONFIG.hpConMultiplier }} × ВЫН){{ rules.passiveNote("hp") }}</div></div>
    <div class="stat"><div class="lbl">Класс Доспеха</div><div class="val">{{ s.ac }}</div>
      <div class="formula">{{ CONFIG.baseAC }} {{ fmt(rules.mod("dex")) }} (ЛОВ){{ rules.passiveNote("ac") }}</div></div>
    <div class="stat"><div class="lbl">Пункты Крови</div><div class="val">{{ s.bp }}</div>
      <div class="formula">фиксированно у неофитов</div></div>
    <div class="stat"><div class="lbl">Скорость</div><div class="val">{{ s.speed }}</div>
      <div class="formula">{{ speedText(s.speed) }}{{ rules.passiveNote("speed") }}</div></div>
    <div class="stat"><div class="lbl">Инициатива</div><div class="val">{{ fmt(s.init) }}</div>
      <div class="formula">{{ initNote }}</div></div>
    <div v-for="d in rules.saveDCs()" :key="d.id" class="stat"><div class="lbl">Сложность {{ d.label }}</div><div class="val">{{ d.value }}</div>
      <div class="formula">{{ CONFIG.saveDCBase }} {{ fmt(rules.mod(d.ability)) }} ({{ abbrOf(d.ability) }})</div></div>
  </div>
</template>

<style scoped>
.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; }
.stat {
  text-align: center; padding: 14px 8px; border: 1px solid var(--blood); border-radius: 4px;
  background: radial-gradient(circle, rgba(139,0,0,.25), transparent 70%);
}
.val { font-family: var(--font-title); font-size: 2rem; color: #fff; }
.lbl { font-size: .85rem; color: var(--gold); font-family: var(--font-title); letter-spacing: .06em; }
.formula { font-size: .8rem; color: var(--text-dim); }
@media (max-width: 640px) { .stat-row { grid-template-columns: 1fr; } }
</style>
