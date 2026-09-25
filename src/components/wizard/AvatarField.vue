<script setup>
import { ref } from "vue";
import { character, showError, clearError } from "../../stores/editor.js";
import { resizeImage } from "../../lib/image.js";

const fileInput = ref(null);

async function onFile(e) {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) { showError(1, "Нужен файл-картинка (JPG, PNG…)."); return; }
  if (file.size > 20 * 1024 * 1024) { showError(1, "Картинка слишком большая (больше 20 МБ)."); return; }
  try {
    character.avatar = await resizeImage(file, 480);
    clearError(1);
  } catch {
    showError(1, "Не удалось прочитать картинку.");
  }
}
</script>

<template>
  <div class="avatar-field">
    <div class="avatar-preview" :style="character.avatar ? { backgroundImage: `url('${character.avatar}')` } : {}"></div>
    <div>
      <span class="field-lbl">Портрет</span>
      <div class="export-row">
        <button type="button" @click="fileInput.click()">🖼 Загрузить картинку</button>
        <button v-if="character.avatar" type="button" @click="character.avatar = null">Убрать</button>
      </div>
      <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile">
      <p class="hint" style="margin:6px 0 0">Без картинки на листе будет пустая рамка — портрет можно нарисовать от руки.</p>
    </div>
  </div>
</template>

<style scoped>
.avatar-field { display: flex; gap: 16px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.avatar-preview {
  width: 96px; height: 120px; flex: 0 0 auto; border: 1px dashed var(--blood); border-radius: 4px;
  background: var(--bg-input) center / cover no-repeat;
}
</style>
