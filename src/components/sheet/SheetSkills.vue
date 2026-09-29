<script setup>
import { rules } from "../../stores/editor.js";
import { fmt } from "../../character/format.js";
import SheetWeapon from "./SheetWeapon.vue";
import SkillsTable from "../common/SkillsTable.vue";
</script>

<template>
  <section>
    <h2>Мастерство</h2>
    <p v-if="rules.mastery()" class="mastery"><b>{{ rules.mastery().name }} {{ fmt(rules.mastery().bonus) }}</b> — к попаданию</p>
    <p v-else class="note">—</p>
    <SheetWeapon />
    <div v-if="rules.clothing()" class="cb cloth">
      <span class="lbl">Одежда</span>
      <b>{{ rules.clothing().name }}</b>
      <div class="note">Пакеты крови: <span class="track"><i v-for="n in rules.clothing().bloodPacks" :key="n"></i></span></div>
    </div>
    <h2>Навыки</h2>
    <p class="sk-hint">Проверка: d20 + итог (мод. характеристики + бонус навыка).</p>
    <SkillsTable roll />
  </section>
</template>
