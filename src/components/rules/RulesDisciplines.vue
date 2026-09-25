<script setup>
import { CONFIG } from "../../data/config.js";
import { CLANS } from "../../data/clans.js";
import { DISCIPLINES } from "../../data/disciplines.js";
import DisciplineLevels from "../common/DisciplineLevels.vue";

const clansOf = id => CLANS.filter(c => c.disciplines.includes(id)).map(c => c.name).join(", ") || "—";
</script>

<template>
  <p>Каждая дисциплина имеет 3 уровня: <b>Ур. 1</b> — активная способность, <b>Ур. 2</b> — пассивная,
     <b>Ур. 3</b> — усиление активной. Изученный уровень включает все предыдущие.</p>
  <h3>Выбор при создании</h3>
  <p>У игрока <b>{{ CONFIG.disciplinePoints }} очка Дисциплин</b> (только дисциплины своего клана). После сессий Мастер
     выдаёт выжившим дополнительные очки. Варианты на старте:</p>
  <ul>
    <li>три разные дисциплины на <b>Ур. 1</b>;</li>
    <li>одна дисциплина на <b>Ур. 2</b> (открывает мощную пассивку) и вторая на <b>Ур. 1</b>;</li>
    <li>всего одна дисциплина, но сразу на <b>Ур. 3</b> (сверхсильный активный навык).</li>
  </ul>
  <h3>Все дисциплины</h3>
  <div v-for="(d, id) in DISCIPLINES" :key="id" class="entry">
    <b class="title">{{ d.name }}</b>
    <div class="hint" style="margin:0 0 4px">Кланы: {{ clansOf(id) }}</div>
    <DisciplineLevels :levels="d.levels" />
  </div>
</template>
