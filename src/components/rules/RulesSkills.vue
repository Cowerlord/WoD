<script setup>
import { ABILITIES } from "../../data/config.js";
import { SKILLS } from "../../data/skills.js";
import { CLANS } from "../../data/clans.js";
import { skillById } from "../../character/rules.js";

const groups = ABILITIES.map(a => ({ a, list: SKILLS.filter(k => k.ability === a.key) })).filter(g => g.list.length);
const clanSkills = CLANS.map(c => `${c.name} — ${skillById(c.skill)?.name ?? "—"}`).join(" · ");
</script>

<template>
  <p>Проверка навыка = d20 + мод. характеристики + бонус навыка. Клан даёт 1 навык на <b>+2</b>;
     при создании игрок выбирает ещё два: один на <b>+2</b>, другой на <b>+1</b>.
     «Обращение с животными» доступно только с Анимализмом (у Гангрела — от клана).</p>
  <div class="table-wrap"><table>
    <tr><th>Характеристика</th><th>Навыки</th></tr>
    <tr v-for="g in groups" :key="g.a.key"><td><b>{{ g.a.name }}</b></td><td>{{ g.list.map(k => k.name).join(", ") }}</td></tr>
  </table></div>
  <h3>Навык клана</h3>
  <p>{{ clanSkills }}</p>
</template>
