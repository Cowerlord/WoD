<script setup>
import { computed } from "vue";
import { ABILITIES, CONFIG } from "../../data/config.js";
import { character, editor, clearError } from "../../stores/editor.js";
import { modOf, fmt } from "../../character/format.js";
import RuleLink from "../common/RuleLink.vue";
import VSelect from "../common/VSelect.vue";

const takenByOther = (key, v) => Object.entries(character.abilities).some(([k, val]) => k !== key && val === v);

const pool = computed(() => {
  const left = Object.values(character.abilities).filter(v => v != null);
  return CONFIG.abilityArray.map(v => {
    const i = left.indexOf(v);
    if (i !== -1) left.splice(i, 1);
    return { v, used: i !== -1 };
  });
});

const optionsFor = key => [
  { value: null, label: "—" },
  ...CONFIG.abilityArray.map(v => ({ value: v, label: String(v), disabled: takenByOther(key, v), hint: takenByOther(key, v) ? "занято" : "" })),
];

function assign(key, v) {
  character.abilities[key] = v;
  clearError(2);
}
</script>

<template>
  <div class="panel">
    <h2>Характеристики</h2>
    <p class="hint">Распределите значения из массива. Каждое число можно использовать только один раз.
      <RuleLink rule="basics">Как считаются модификаторы?</RuleLink></p>
    <div class="pool">Массив: <span v-for="(p, i) in pool" :key="i" class="chip" :class="{ used: p.used }">{{ p.v }}</span></div>
    <div class="abilities">
      <div v-for="a in ABILITIES" :key="a.key" class="ability">
        <div class="name">{{ a.name }}</div>
        <div class="abbr">{{ a.abbr }}</div>
        <VSelect class="ab-select" :model-value="character.abilities[a.key]" :options="optionsFor(a.key)"
                 @update:model-value="assign(a.key, $event)" />
        <div class="mod">{{ character.abilities[a.key] == null ? "" : fmt(modOf(character.abilities[a.key])) }}</div>
      </div>
    </div>
    <div class="error">{{ editor.errors[2] }}</div>
  </div>
</template>

<style scoped>
.abilities { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.ability {
  background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px;
  padding: 12px; text-align: center;
}
.ability .name { font-family: var(--font-title); font-size: .85rem; color: var(--gold); letter-spacing: .06em; }
.ability .abbr { font-size: .75rem; color: var(--text-dim); }
.ab-select { margin: 8px 0; }
.ab-select :deep(.vs-value) { text-align: center; }
.ability .mod { font-family: var(--font-title); font-size: 1.6rem; color: var(--blood-bright); min-height: 1.2em; }
.pool { margin-bottom: 16px; }
.chip {
  display: inline-block; min-width: 38px; padding: 4px 8px; margin: 0 4px 4px 0; text-align: center;
  border: 1px solid var(--blood); border-radius: 4px; font-family: var(--font-title);
}
.chip.used { opacity: .25; text-decoration: line-through; }
</style>
