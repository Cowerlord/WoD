<script setup>
import { ref } from "vue";
import { auth } from "../../stores/auth.js";
import { roster, isFull, addMine } from "../../stores/roster.js";
import { lsGet, lsSet } from "../../lib/storage.js";
import { sanitizeCharacter } from "../../character/sanitize.js";
import ConfirmButton from "../common/ConfirmButton.vue";

// Персонажи из версии без аккаунтов, оставшиеся в этом браузере
const LEGACY_KEY = "vtm-roster-v1";
const read = () => {
  const d = lsGet(LEGACY_KEY);
  return d?.characters && typeof d.characters === "object" ? Object.values(d.characters) : [];
};
const legacy = ref(read());

function move() {
  const left = [];
  let moved = 0;
  for (const raw of legacy.value) {
    let data;
    try { data = sanitizeCharacter(raw); } catch { continue; }
    if (isFull()) { left.push(raw); continue; }
    addMine(data, typeof raw.updatedAt === "string" ? raw.updatedAt : undefined);
    moved++;
  }
  lsSet(LEGACY_KEY, left.length ? { characters: Object.fromEntries(left.map(c => [c.id, c])), lastId: null } : null);
  legacy.value = read();
  roster.error = left.length
    ? `Перенесено: ${moved}. Не поместились из-за лимита (${auth.charLimit}): ${left.length} — освободите место и нажмите «Перенести» ещё раз.`
    : "";
}

function drop() {
  lsSet(LEGACY_KEY, null);
  legacy.value = [];
}
</script>

<template>
  <div v-if="legacy.length" class="notice">
    <p>В этом браузере остались персонажи из версии без аккаунтов: {{ legacy.length }}. Перенести их в ваш аккаунт?</p>
    <button type="button" class="primary" @click="move">Перенести в аккаунт</button>
    <ConfirmButton @confirm="drop">Удалить с устройства</ConfirmButton>
  </div>
</template>

<style scoped>
.notice {
  margin: 0 0 16px; padding: 12px 14px; border: 1px dashed var(--gold); border-radius: 4px;
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
.notice p { margin: 0; flex: 1 1 240px; }
.notice button { padding: 6px 14px; font-size: .8rem; }
</style>
