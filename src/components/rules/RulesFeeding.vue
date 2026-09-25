<script setup>
import { FEEDING } from "../../data/feeding.js";
</script>

<template>
  <ul>
    <li v-for="f in FEEDING" :key="f.name"><b>{{ f.name }}:</b> {{ f.text }}</li>
  </ul>
  <p>Клановые ограничения на питание — см. слабость Вентру в разделе «Кланы».</p>
</template>
