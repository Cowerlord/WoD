<script setup>
import { ref, nextTick } from "vue";
import { character, editor, rules, saveCurrent, showError, clearError, lockBuild, isOthers } from "../../stores/editor.js";
import { SHEET_STEP } from "../../data/config.js";
import { serialize } from "../../character/sanitize.js";
import { downloadJson } from "../../lib/files.js";
import { downloadPdf } from "../../lib/pdf.js";
import { printPart } from "../../lib/print.js";
import CharacterSheet from "../sheet/CharacterSheet.vue";
import CheatSheet from "../sheet/CheatSheet.vue";
import Modal from "../common/Modal.vue";

const pdfBusy = ref("");
const safeName = () => character.name.replace(/[\\/:*?"<>|]+/g, "").trim() || "Персонаж";
const PDF_TITLES = { sheet: "лист персонажа", cheat: "шпаргалка" };

// Шпаргалка — сворачиваемый блок (по умолчанию свёрнут); для печати и PDF она раскрывается
const cheatOpen = ref(false);
async function unfold(part) {
  if (part === "cheat") { cheatOpen.value = true; await nextTick(); }
}

async function print(part) {
  await unfold(part);
  printPart(part);
}

async function pdf(part) {
  pdfBusy.value = part;
  clearError(SHEET_STEP);
  try {
    await unfold(part);
    await downloadPdf(document.getElementById(part), `${safeName()} — ${PDF_TITLES[part]}.pdf`);
  } catch {
    showError(SHEET_STEP, "Не удалось подготовить PDF. Нажмите «Распечатать» и выберите принтер «Сохранить как PDF».");
  } finally {
    pdfBusy.value = "";
  }
}

function exportFile() {
  saveCurrent();
  downloadJson(serialize(character), character.name);
}

// «Завершить создание»: после подтверждения сборку меняет только Мастер
const confirmOpen = ref(false);
const canFinish = () => !character.locked && !editor.owner.readOnly && !isOthers() && !rules.firstInvalidStep();
function finish() {
  lockBuild();
  confirmOpen.value = false;
}
</script>

<template>
  <div class="panel">
    <div v-if="canFinish()" class="finish no-print">
      <div>
        <b>Персонаж готов?</b>
        <p class="hint">Завершите создание — и клан, характеристики, Человечность, дисциплины и навыки будет менять только Мастер.</p>
      </div>
      <button class="primary" type="button" @click="confirmOpen = true">🔒 Завершить создание</button>
    </div>
    <p v-else-if="character.locked" class="locked-note no-print">🔒 Создание завершено: сборку персонажа меняет только Мастер.</p>

    <div id="sheet-block">
      <div class="export-row">
        <button class="primary big" type="button" :disabled="!!pdfBusy" @click="pdf('sheet')">
          {{ pdfBusy === "sheet" ? "Готовлю PDF…" : "🩸 Скачать лист PDF" }}</button>
        <button class="big" type="button" @click="print('sheet')">🖨 Распечатать лист</button>
        <button class="big" type="button" @click="exportFile">💾 Сохранить в файл</button>
      </div>
      <CharacterSheet />
    </div>

    <details id="cheat-block" class="fold" :open="cheatOpen" @toggle="cheatOpen = $event.target.open">
      <summary class="no-print">
        <span class="fold-title">Шпаргалка по правилам</span>
        <span class="hint">{{ cheatOpen ? "свернуть" : "развернуть" }}</span>
      </summary>
      <p class="hint no-print">Отдельный лист со стадиями ранений, слабостью клана и правилами питания.</p>
      <div class="export-row">
        <button class="primary big" type="button" :disabled="!!pdfBusy" @click="pdf('cheat')">
          {{ pdfBusy === "cheat" ? "Готовлю PDF…" : "📜 Скачать шпаргалку PDF" }}</button>
        <button class="big" type="button" @click="print('cheat')">🖨 Распечатать шпаргалку</button>
      </div>
      <CheatSheet />
    </details>
    <div class="error">{{ editor.errors[SHEET_STEP] }}</div>

    <Modal v-if="confirmOpen" title="Сохранить персонажа?" @close="confirmOpen = false">
      <p>После этого <b>клан, характеристики, Человечность, дисциплины и навыки</b> изменит только Мастер.</p>
      <p class="hint">Останутся свободными: имя, концепт, портрет, мировоззрение, оружие, броня, одежда, описание, Стадо и Гули.
        Очки Дисциплин, которые выдаст Мастер, вы сможете потратить сами.</p>
      <div class="modal-actions">
        <button class="primary" type="button" @click="finish">🔒 Сохранить и завершить</button>
        <button type="button" @click="confirmOpen = false">Ещё подумаю</button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.finish {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-bottom: 20px; padding: 12px 16px; border: 1px solid var(--gold); border-radius: 6px;
}
.finish p { margin: 4px 0 0; }
.locked-note { color: var(--gold); margin: 0 0 16px; }
.modal-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.fold { margin-top: 32px; border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; }
.fold summary {
  cursor: pointer; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap;
}
.fold[open] summary { margin-bottom: 8px; }
.fold-title { font-family: var(--font-title); color: var(--blood-bright); font-size: 1.3rem; letter-spacing: .08em; }
@media print { .fold { margin: 0; border: 0; padding: 0; } }
</style>
