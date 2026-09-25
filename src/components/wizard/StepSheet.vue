<script setup>
import { ref } from "vue";
import { character, editor, saveCurrent, showError, clearError } from "../../stores/editor.js";
import { serialize } from "../../character/sanitize.js";
import { downloadJson } from "../../lib/files.js";
import { downloadPdf } from "../../lib/pdf.js";
import { printPart } from "../../lib/print.js";
import CharacterSheet from "../sheet/CharacterSheet.vue";
import CheatSheet from "../sheet/CheatSheet.vue";

const pdfBusy = ref("");
const safeName = () => character.name.replace(/[\\/:*?"<>|]+/g, "").trim() || "Персонаж";

async function pdf(part) {
  pdfBusy.value = part;
  clearError(5);
  try {
    const el = document.getElementById(part);
    await downloadPdf(el, `${safeName()} — ${part === "sheet" ? "лист персонажа" : "шпаргалка"}.pdf`);
  } catch {
    showError(5, "Не удалось подготовить PDF. Нажмите «Распечатать» и выберите принтер «Сохранить как PDF».");
  } finally {
    pdfBusy.value = "";
  }
}

function exportFile() {
  saveCurrent();
  downloadJson(serialize(character), character.name);
}

</script>

<template>
  <div class="panel">
    <div id="sheet-block">
      <div class="export-row">
        <button class="primary big" type="button" :disabled="!!pdfBusy" @click="pdf('sheet')">
          {{ pdfBusy === "sheet" ? "Готовлю PDF…" : "🩸 Скачать лист PDF" }}</button>
        <button class="big" type="button" @click="printPart('sheet')">🖨 Распечатать лист</button>
        <button class="big" type="button" @click="exportFile">💾 Сохранить в файл</button>
      </div>
      <CharacterSheet />
    </div>

    <div id="cheat-block">
      <h2 class="no-print">Шпаргалка по правилам</h2>
      <p class="hint no-print">Отдельный лист со стадиями ранений, слабостью клана и правилами питания.</p>
      <div class="export-row">
        <button class="primary big" type="button" :disabled="!!pdfBusy" @click="pdf('cheat')">
          {{ pdfBusy === "cheat" ? "Готовлю PDF…" : "📜 Скачать шпаргалку PDF" }}</button>
        <button class="big" type="button" @click="printPart('cheat')">🖨 Распечатать шпаргалку</button>
      </div>
      <CheatSheet />
    </div>
    <div class="error">{{ editor.errors[5] }}</div>
  </div>
</template>

<style scoped>
#cheat-block { margin-top: 32px; }
@media print { #cheat-block { margin: 0; } }
</style>
