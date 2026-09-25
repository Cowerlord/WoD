<script setup>
import { computed, ref } from "vue";
import { auth } from "../../stores/auth.js";
import { roster, myCount, isFull, deleteMine, addMine } from "../../stores/roster.js";
import { character, loadCharacter, openMine, startNew } from "../../stores/editor.js";
import { sanitizeCharacter } from "../../character/sanitize.js";
import { liveSummary } from "../../character/rules.js";
import { blankCharacter } from "../../character/blank.js";
import { downloadJson } from "../../lib/files.js";
import CharacterCard from "../common/CharacterCard.vue";
import ConfirmButton from "../common/ConfirmButton.vue";
import LegacyNotice from "./LegacyNotice.vue";

const fileInput = ref(null);
const list = computed(() => Object.values(roster.characters)
  .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))));

function status(ch) {
  try { return liveSummary(sanitizeCharacter(ch)); } catch { return ""; }
}

function exportOne(ch) {
  try { downloadJson(sanitizeCharacter(ch), ch.name); } catch { /* повреждённая запись */ }
}

async function remove(id) {
  roster.error = "";
  if (await deleteMine(id) && character.id === id) loadCharacter(blankCharacter());
}

async function importFile(e) {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    if (file.size > 6 * 1024 * 1024) throw new Error("Файл слишком большой.");
    const data = sanitizeCharacter(JSON.parse(await file.text()));
    if (isFull()) throw new Error(`лимит — ${auth.charLimit} персонажей на аккаунт.`);
    openMine(addMine(data), "sheet");
  } catch (err) {
    roster.error = `Не удалось загрузить: ${err instanceof SyntaxError ? "файл повреждён." : err.message}`;
  }
}
</script>

<template>
  <div id="mode-roster">
    <div class="panel">
      <h2>Мои персонажи</h2>
      <p class="hint">Персонажи сохраняются на сервере автоматически и доступны с любого устройства после входа.
        Файл — запасная копия или способ передать персонажа без аккаунта.</p>
      <p class="roster-count">Персонажей: {{ myCount() }} из {{ auth.charLimit }}</p>
      <LegacyNotice />
      <div class="export-row">
        <button type="button" class="primary" :disabled="isFull()" @click="startNew">+ Новый персонаж</button>
        <button type="button" :disabled="isFull()" @click="fileInput.click()">📂 Импорт из файла</button>
        <input ref="fileInput" type="file" accept=".json,application/json" hidden @change="importFile">
      </div>
      <div class="error">{{ roster.error }}</div>
      <div class="roster">
        <CharacterCard v-for="ch in list" :key="ch.id" :character="ch" :status="status(ch)">
          <button type="button" @click="openMine(ch.id, 'sheet')">Лист</button>
          <button type="button" @click="openMine(ch.id, 'edit')">Изменить</button>
          <button type="button" @click="exportOne(ch)">💾 В файл</button>
          <ConfirmButton class="danger" @confirm="remove(ch.id)">Удалить</ConfirmButton>
        </CharacterCard>
        <p v-if="!list.length" class="hint">Пока нет сохранённых персонажей.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roster { display: grid; gap: 10px; margin-top: 16px; }
.roster-count { font-family: var(--font-title); color: var(--gold); margin: 0 0 12px; }
</style>
