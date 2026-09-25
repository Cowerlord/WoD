<script setup>
import { CLOTHING, LATER_CLOTHING, BLOOD_PACK } from "../../data/clothing.js";
import { CLANS } from "../../data/clans.js";

const who = c => c.excludeClans?.length
  ? `все, кроме: ${c.excludeClans.map(id => CLANS.find(x => x.id === id)?.name).join(", ")}`
  : "все кланы";
</script>

<template>
  <p>На старте (шаг 4) доступны три стиля; выбор ограничен кланом. Одежда определяет, сколько пакетов крови можно
     носить незаметно, и даёт социальные эффекты. Длинный плащ и тактическая одежда на старте недоступны.</p>
  <div class="table-wrap"><table>
    <thead><tr><th>Одежда</th><th>Кому</th><th>Пакеты</th><th>Оружие</th><th>Эффект</th></tr></thead>
    <tbody>
      <tr v-for="c in CLOTHING" :key="c.id">
        <td><b>{{ c.name }}</b></td><td>{{ who(c) }}</td><td>{{ c.bloodPacks }}</td><td>{{ c.weapons }}</td><td>{{ c.effect }}</td>
      </tr>
    </tbody>
  </table></div>
  <p><b>{{ BLOOD_PACK.text }}</b></p>
  <h3>Позже в игре</h3>
  <p>На старте недоступны.</p>
  <ul><li v-for="c in LATER_CLOTHING" :key="c.name"><b>{{ c.name }}</b> — пакетов крови: {{ c.bloodPacks }}. {{ c.effect }}</li></ul>
</template>
