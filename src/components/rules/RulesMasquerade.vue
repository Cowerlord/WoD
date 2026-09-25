<script setup>
import { MASQUERADE } from "../../data/masquerade.js";
</script>

<template>
  <p>«<b>Жара</b>» — от 0 до {{ MASQUERADE.max }} на весь город, общая для всех; её видно в шапке сайта, меняет Мастер.</p>
  <p><b>+1 к Жаре:</b> {{ MASQUERADE.triggers.join(", ").toLowerCase() }}.</p>
  <ul><li v-for="l in MASQUERADE.levels" :key="l.at"><b>{{ l.at }}:</b> {{ l.text }}</li></ul>
</template>
