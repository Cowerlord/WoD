<script setup>
import { computed, ref } from "vue";
import { editor } from "../../stores/editor.js";
import PlayVitals from "./PlayVitals.vue";
import PlayCombat from "./PlayCombat.vue";
import PlayDisciplines from "./PlayDisciplines.vue";
import PlayChecks from "./PlayChecks.vue";
import PlayState from "./PlayState.vue";

const tabs = [
  { id: "combat", title: "Бой", component: PlayCombat },
  { id: "disciplines", title: "Дисциплины", component: PlayDisciplines },
  { id: "checks", title: "Проверки", component: PlayChecks },
  { id: "state", title: "Состояние", component: PlayState },
];
const tab = ref("combat");
const locked = computed(() => editor.owner.readOnly);
</script>

<template>
  <div class="play no-print">
    <PlayVitals :locked="locked" />
    <div class="tabs" role="tablist">
      <button v-for="t in tabs" :key="t.id" type="button" role="tab" :class="{ on: tab === t.id }" @click="tab = t.id">{{ t.title }}</button>
    </div>
    <div class="panel">
      <component :is="tabs.find(t => t.id === tab).component" :locked="locked" />
    </div>
  </div>
</template>

<style scoped>
.tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; }
.tabs button { padding: 10px 4px; font-size: .8rem; }
.tabs button.on { background: var(--blood); color: #fff; }
@media (max-width: 640px) { .tabs button { font-size: .7rem; letter-spacing: .02em; } }
</style>
