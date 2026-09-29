<script setup>
import { ref } from "vue";
import { character, editor, showError, clearError } from "../../stores/editor.js";
import { BIO_STEP } from "../../data/config.js";
import { downloadPdf } from "../../lib/pdf.js";
import { printPart } from "../../lib/print.js";
import BioSheet from "../sheet/BioSheet.vue";
import RetainersEditor from "./RetainersEditor.vue";
import { BIO_FIELDS, BIO_MAX, blankBio } from "../../data/bio.js";

const pdfBusy = ref(false);
const safeName = () => character.name.replace(/[\\/:*?"<>|]+/g, "").trim() || "Персонаж";
const bioValue = id => character.bio?.[id] ?? "";
function setBio(id, value) {
  if (!character.bio) character.bio = blankBio();
  character.bio[id] = value.slice(0, BIO_MAX);
}

async function pdf() {
  pdfBusy.value = true;
  clearError(BIO_STEP);
  try {
    await downloadPdf(document.getElementById("bio"), `${safeName()} — описание.pdf`);
  } catch {
    showError(BIO_STEP, "Не удалось подготовить PDF. Нажмите «Распечатать» и выберите принтер «Сохранить как PDF».");
  } finally {
    pdfBusy.value = false;
  }
}
</script>

<template>
  <div class="panel">
    <h2>Описание персонажа</h2>
    <p class="hint">Отдельный лист: на главный лист персонажа не попадает. Шаг необязательный.
      Пустые разделы печатаются линиями — их можно дописать от руки.</p>
    <div id="bio-block">
      <div class="export-row">
        <button class="primary big" type="button" :disabled="pdfBusy" @click="pdf">
          {{ pdfBusy ? "Готовлю PDF…" : "📖 Скачать описание PDF" }}</button>
        <button class="big" type="button" @click="printPart('bio')">🖨 Распечатать описание</button>
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
    </div>
    <div class="error">{{ editor.errors[BIO_STEP] }}</div>
  </div>
</template>

<style scoped>
.bio-form { margin: 12px 0 20px; }
.bio-form textarea { resize: vertical; }
.counter { display: block; text-align: right; font-size: .8rem; color: var(--text-dim); margin-top: 2px; }
</style>
