<script setup>
import { CONFIG } from "../../data/config.js";
</script>

<template>
  <p>Шкала от 0 до {{ CONFIG.maxHumanity }}. У всех персонажей на старте — <b>{{ CONFIG.startingHumanity }}</b>.</p>
  <div class="table-wrap"><table>
    <tr><th>Человечность</th><th>Эффект</th></tr>
    <tr><td><b>9–10</b></td><td>Проверки Бешенства с преимуществом</td></tr>
    <tr><td><b>4–8</b></td><td>Без бонусов и штрафов</td></tr>
    <tr><td><b>0–3</b></td><td>Проверки Бешенства с помехой</td></tr>
  </table></div>
  <p>Человечность также влияет на репутацию в городе и среди Сородичей.</p>
</template>
