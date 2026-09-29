<script setup>
import { buildLocked } from "../../stores/editor.js";
</script>

<template>
  <p v-if="buildLocked()" class="lock-banner">🔒 Создание завершено: клан, характеристики, Человечность, дисциплины и навыки
    меняет только Мастер. Очки Дисциплин, которые он выдаст, можно потратить — уровни дисциплин только растут.</p>
</template>

<style scoped>
.lock-banner { margin: 0 0 16px; padding: 10px 14px; border: 1px solid var(--gold); border-radius: 6px; color: var(--gold); }
</style>
