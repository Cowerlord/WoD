<script setup>
import { splitLevel } from "../../character/format.js";

defineProps({
  levels: { type: Object, required: true },
  owned: { type: Number, default: Infinity },
});
</script>

<template>
  <p v-for="(text, lvl) in levels" :key="lvl" class="lvl" :class="{ 'not-owned': Number(lvl) > owned }">
    <span class="lvl-n">Ур. {{ lvl }}</span>
    <template v-if="splitLevel(text).head"> <b>{{ splitLevel(text).head }}:</b></template>{{ splitLevel(text).body }}
  </p>
</template>
