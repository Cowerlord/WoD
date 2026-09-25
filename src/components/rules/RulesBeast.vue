<script setup>
import { BEAST, BEAST_FAIL, BLOOD_BOND } from "../../data/beast.js";
import { CLANS } from "../../data/clans.js";

const clanNotes = b => Object.entries(b.clan || {})
  .map(([id, v]) => `${CLANS.find(c => c.id === id)?.name}: ${v}`).join("; ") || "—";
</script>

<template>
  <h3>Зверь (Бешенство)</h3>
  <p>Одна механика на все срывы: спасбросок <b>Восприятия</b>. Человечность 7+ даёт <b>+2</b> (9–10 — ещё и с преимуществом),
     0–3 — с помехой.
     {{ BEAST_FAIL }} Преимущество и помеха гасят друг друга.</p>
  <div class="table-wrap"><table>
    <tr><th>Триггер</th><th>Сложность</th><th>Кланы</th><th>При провале</th></tr>
    <tr v-for="b in BEAST" :key="b.id">
      <td><b>{{ b.name }}</b>: {{ b.trigger }}</td><td>{{ b.dc }}</td><td>{{ clanNotes(b) }}</td><td>{{ b.fail }}</td>
    </tr>
  </table></div>

  <h3>Узы Крови</h3>
  <p>Один глоток крови вампира — +1 ступень Уз к нему (не больше одной ступени за ночь).
     Питьё из вампира (в том числе из врага в бою) даёт <b>одну ступень Уз за всё питьё</b>.
     Выпитый полностью вампир впадает в Торпор (если это вообще удастся).
     Ослабление и разрыв Уз — отдельная механика, будет позже.</p>
  <div class="table-wrap"><table>
    <tr><th>Ступень</th><th>Эффект</th></tr>
    <tr v-for="b in BLOOD_BOND" :key="b.level"><td><b>{{ b.level }}. {{ b.name }}</b></td><td>{{ b.text }}</td></tr>
  </table></div>
</template>
