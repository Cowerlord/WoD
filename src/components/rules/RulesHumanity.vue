<script setup>
import { CONFIG } from "../../data/config.js";
import { HUMANITY_CHANGES, HUMANITY_ZERO } from "../../data/beast.js";
import { fmt } from "../../character/format.js";
</script>

<template>
  <p>Шкала от 0 до {{ CONFIG.maxHumanity }}. У всех персонажей на старте — <b>{{ CONFIG.startingHumanity }}</b>.</p>
  <div class="table-wrap"><table>
    <tr><th>Человечность</th><th>Спасброски от Бешенства</th></tr>
    <tr><td><b>9–10</b></td><td>+2 и с преимуществом</td></tr>
    <tr><td><b>7–8</b></td><td>+2</td></tr>
    <tr><td><b>4–6</b></td><td>без бонусов и штрафов</td></tr>
    <tr><td><b>0–3</b></td><td>с помехой</td></tr>
  </table></div>
  <h3>Как меняется</h3>
  <ul><li v-for="c in HUMANITY_CHANGES" :key="c.text">{{ c.text }}: <b>{{ fmt(c.delta) }}</b></li></ul>
  <p><b>{{ HUMANITY_ZERO }}</b></p>
  <p>Человечность также влияет на репутацию в городе и среди Сородичей.</p>
</template>
