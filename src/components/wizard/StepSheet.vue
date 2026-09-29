<script setup>
import { ref, computed, nextTick } from "vue";
import { character, editor, saveCurrent, showError, clearError } from "../../stores/editor.js";
import { serialize } from "../../character/sanitize.js";
import { downloadJson } from "../../lib/files.js";
import { downloadPdf } from "../../lib/pdf.js";
import { printPart } from "../../lib/print.js";
import CharacterSheet from "../sheet/CharacterSheet.vue";
import CheatSheet from "../sheet/CheatSheet.vue";
import BioSheet from "../sheet/BioSheet.vue";
import RetainersEditor from "./RetainersEditor.vue";
import { BIO_FIELDS, BIO_MAX, blankBio } from "../../data/bio.js";

const pdfBusy = ref("");
const safeName = () => character.name.replace(/[\\/:*?"<>|]+/g, "").trim() || "Персонаж";

const PDF_TITLES = { sheet: "лист персонажа", cheat: "шпаргалка", bio: "описание" };

// Шпаргалка и описание — сворачиваемые блоки (по умолчанию свёрнуты); для печати и PDF они раскрываются
const bioOpen = ref(false);
const cheatOpen = ref(false);
async function unfold(part) {
  if (part === "bio") bioOpen.value = true;
  if (part === "cheat") cheatOpen.value = true;
  await nextTick();
}
const bioFilled = computed(() => BIO_FIELDS.filter(f => (character.bio?.[f.id] ?? "").trim()).length);
const bioValue = id => character.bio?.[id] ?? "";
function setBio(id, value) {
  if (!character.bio) character.bio = blankBio();
  character.bio[id] = value.slice(0, BIO_MAX);
}

async function print(part) {
  await unfold(part);
  printPart(part);
}

async function pdf(part) {
  pdfBusy.value = part;
  clearError(5);
  try {
    await unfold(part);
    const el = document.getElementById(part);
    await downloadPdf(el, `${safeName()} — ${PDF_TITLES[part]}.pdf`);
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

    <details id="bio-block" class="fold" :open="bioOpen" @toggle="bioOpen = $event.target.open">
      <summary class="no-print">
        <span class="fold-title">Описание персонажа</span>
        <span class="hint">заполнено {{ bioFilled }} из {{ BIO_FIELDS.length }} · {{ bioOpen ? "свернуть" : "развернуть" }}</span>
      </summary>
      <p class="hint no-print">Отдельный лист: на главный лист персонажа не попадает.
        Пустые разделы печатаются линиями — их можно дописать от руки.</p>
      <div class="export-row">
        <button class="primary big" type="button" :disabled="!!pdfBusy" @click="pdf('bio')">
          {{ pdfBusy === "bio" ? "Готовлю PDF…" : "📖 Скачать описание PDF" }}</button>
        <button class="big" type="button" @click="print('bio')">🖨 Распечатать описание</button>
      </div>
      <div class="bio-form no-print">
        <label v-for="f in BIO_FIELDS" :key="f.id" class="field">
          <span>{{ f.title }}</span>
          <textarea rows="3" :maxlength="BIO_MAX" :placeholder="f.hint" :disabled="editor.owner.readOnly"
                    :value="bioValue(f.id)" @input="setBio(f.id, $event.target.value)"></textarea>
          <small class="counter">{{ bioValue(f.id).length }} / {{ BIO_MAX }}</small>
        </label>
      </div>
      <RetainersEditor class="no-print" />
      <h3 class="no-print">Как будет выглядеть лист</h3>
      <BioSheet />
    </details>
    <div class="error">{{ editor.errors[5] }}</div>
  </div>
</template>

<style scoped>
.fold { margin-top: 32px; border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; }
.fold summary {
  cursor: pointer; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap;
}
.fold[open] summary { margin-bottom: 8px; }
.fold-title { font-family: var(--font-title); color: var(--blood-bright); font-size: 1.3rem; letter-spacing: .08em; }
.bio-form { margin: 12px 0 20px; }
.bio-form textarea { resize: vertical; }
.counter { display: block; text-align: right; font-size: .8rem; color: var(--text-dim); margin-top: 2px; }
@media print { .fold { margin: 0; border: 0; padding: 0; } }
</style>
