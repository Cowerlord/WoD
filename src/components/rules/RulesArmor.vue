<script setup>
import { CONFIG } from "../../data/config.js";
import { ARMOR } from "../../data/armor.js";
</script>

<template>
  <p>Без брони КД = 10 + мод. Ловкости. В любой броне Ловкость к КД <b>не</b> добавляется. На старте брони нет.</p>
  <div class="table-wrap"><table>
    <tr><th>Броня</th><th>КД</th><th>Штрафы</th></tr>
    <tr v-for="a in ARMOR" :key="a.id"><td><b>{{ a.name }}</b></td><td>{{ CONFIG.baseAC + a.ac }}</td><td>{{ a.note || "нет" }}</td></tr>
  </table></div>
</template>
