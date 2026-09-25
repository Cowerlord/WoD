<script setup>
import { setMode } from "../../stores/ui.js";

defineProps({ rule: { type: String, required: true } });
</script>

<template>
  <button type="button" class="rule-link" @click="setMode('rules', rule)"><slot /></button>
</template>
