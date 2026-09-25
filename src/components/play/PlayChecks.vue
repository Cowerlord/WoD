<script setup>
import { computed, ref } from "vue";
import { ABILITIES, DIFFICULTY } from "../../data/config.js";
import { SKILLS } from "../../data/skills.js";
import { rules } from "../../stores/editor.js";
import { rollAbility, rollSave, rollSkill, rollFrenzy } from "../../stores/rolls.js";
import { abbrOf, fmt } from "../../character/format.js";

const query = ref("");
const skills = computed(() => SKILLS.filter(rules.skillAllowed)
  .filter(k => !query.value.trim() || k.name.toLowerCase().includes(query.value.trim().toLowerCase())));
const total = sk => rules.mod(sk.ability) + rules.skillBonus(sk.id);
</script>

<template>
  <div class="checks">
    <p class="dc">Сложности: <template v-for="(d, i) in DIFFICULTY" :key="d.dc">{{ i ? " · " : "" }}<b>{{ d.dc }}</b> {{ d.name }}</template></p>

    <h3>Характеристики</h3>
    <div class="grid">
      <button v-for="a in ABILITIES" :key="a.key" type="button" class="roll-btn" @click="rollAbility(a.key)">
        {{ a.abbr }} <b>{{ fmt(rules.mod(a.key)) }}</b></button>
    </div>

    <h3>Спасброски</h3>
    <div class="grid">
      <button v-for="a in ABILITIES" :key="a.key" type="button" class="roll-btn" @click="rollSave(a.key)">
        {{ a.abbr }} <b>{{ fmt(rules.mod(a.key)) }}</b></button>
      <button type="button" class="roll-btn wide" @click="rollFrenzy">🐺 Бешенство (ВОС{{ rules.frenzy().bonus ? " +2" : "" }})</button>
    </div>

    <h3>Навыки</h3>
    <input v-model="query" type="text" class="search" placeholder="Найти навык…">
    <div class="skills">
      <button v-for="sk in skills" :key="sk.id" type="button" class="roll-btn skill" :class="{ own: rules.skillBonus(sk.id) }" @click="rollSkill(sk)">
        <span>{{ sk.name }}</span><small>{{ abbrOf(sk.ability) }}{{ rules.skillBonus(sk.id) ? ` · навык ${fmt(rules.skillBonus(sk.id))}` : "" }}</small>
        <b>{{ fmt(total(sk)) }}</b>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dc { color: var(--text-dim); font-size: .9rem; margin: 0 0 6px; }
.dc b { color: var(--gold); }
.checks h3 { margin: 14px 0 8px; }
.grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.grid button { padding: 8px 4px; font-size: .8rem; }
.grid button b { display: block; font-size: 1.1rem; color: #fff; }
.grid .wide { grid-column: 1 / -1; }
.search { margin-bottom: 8px; }
.skills { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 6px; }
.skill { display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto; text-align: left; padding: 8px 10px; letter-spacing: 0; font-family: var(--font-body); font-size: 1rem; border-color: var(--border); }
.skill span { grid-column: 1; }
.skill small { grid-column: 1; color: var(--text-dim); font-size: .75rem; }
.skill b { grid-column: 2; grid-row: 1 / 3; align-self: center; font-family: var(--font-title); font-size: 1.2rem; }
.skill.own { border-color: var(--blood-bright); }
.skill.own span { color: var(--gold); }
@media (max-width: 640px) { .grid { grid-template-columns: repeat(3, 1fr); } }
</style>
