<script setup>
import { SKILLS } from "../../data/skills.js";
import { rules } from "../../stores/editor.js";
import { fmt, abbrOf } from "../../character/format.js";
import SheetWeapon from "./SheetWeapon.vue";
</script>

<template>
  <section>
    <h2>Мастерство</h2>
    <p v-if="rules.mastery()" class="mastery"><b>{{ rules.mastery().name }} {{ fmt(rules.mastery().bonus) }}</b> — к попаданию</p>
    <p v-else class="note">—</p>
    <SheetWeapon />
    <h2>Навыки</h2>
    <p class="sk-hint">Проверка: d20 + итог. Итог = мод. характеристики + бонус навыка.</p>
    <table class="sk-table">
      <thead><tr><th>Навык</th><th>Хар.</th><th>Нав.</th><th>Итог</th></tr></thead>
      <tbody>
        <tr v-for="sk in SKILLS.filter(rules.skillAllowed)" :key="sk.id" :class="{ own: rules.skillBonus(sk.id) }">
          <td>{{ sk.name }}</td>
          <td class="sk-n">{{ abbrOf(sk.ability) }} {{ fmt(rules.mod(sk.ability)) }}</td>
          <td class="sk-n">{{ rules.skillBonus(sk.id) ? fmt(rules.skillBonus(sk.id)) : "" }}</td>
          <td class="sk-t">{{ fmt(rules.mod(sk.ability) + rules.skillBonus(sk.id)) }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
