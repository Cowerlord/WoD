<script setup>
import { discipline } from "../../character/format.js";

defineProps({ clan: { type: Object, required: true } });
</script>

<template>
  <div>
    <slot />
    <p>{{ clan.description }}</p>
    <div>
      <slot name="tags-label" />
      <span v-for="d in clan.disciplines" :key="d" class="tag">{{ discipline(d).name }}</span>
    </div>
    <p v-if="clan.ability" class="bane" style="border-style:solid">
      <b>✦ {{ clan.ability.name }} [{{ clan.ability.cost }}]:</b> {{ clan.ability.text }}
    </p>
    <p v-if="clan.bane" class="bane"><b>⚠ {{ clan.bane.name }}:</b> {{ clan.bane.text }}</p>
  </div>
</template>
