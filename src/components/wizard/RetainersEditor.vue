<script setup>
import { ref } from "vue";
import { character, editor } from "../../stores/editor.js";
import { newId } from "../../character/blank.js";
import { cleanText } from "../../character/sanitize.js";
import { RETAINER_KINDS, RETAINER_NAME_MAX, RETAINER_DESC_MAX } from "../../data/retainers.js";
import ConfirmButton from "../common/ConfirmButton.vue";

// Черновики формы «добавить» — отдельно для Стада и Гулей
const draft = ref(Object.fromEntries(RETAINER_KINDS.map(k => [k.key, { name: "", desc: "" }])));

const list = key => character[key] ?? [];
const full = kind => list(kind.key).length >= kind.max;

function add(kind) {
  const d = draft.value[kind.key];
  const name = cleanText(d.name, RETAINER_NAME_MAX).trim();
  if (!name || full(kind) || editor.owner.readOnly) return;
  if (!Array.isArray(character[kind.key])) character[kind.key] = [];
  character[kind.key].push({ id: newId(), name, desc: cleanText(d.desc, RETAINER_DESC_MAX).trim() });
  draft.value[kind.key] = { name: "", desc: "" };
}

function remove(kind, id) {
  character[kind.key] = list(kind.key).filter(r => r.id !== id);
}
</script>

<template>
  <div class="retainers">
    <section v-for="kind in RETAINER_KINDS" :key="kind.key" class="ret-kind">
      <h3>{{ kind.title }} <span class="hint">{{ list(kind.key).length }} / {{ kind.max }}</span></h3>
      <p class="hint">{{ kind.hint }}</p>

      <div v-if="list(kind.key).length" class="ret-grid">
        <div v-for="r in list(kind.key)" :key="r.id" class="ret-card">
          <input v-model="r.name" type="text" :maxlength="RETAINER_NAME_MAX" :disabled="editor.owner.readOnly"
                 class="ret-name" aria-label="Имя">
          <textarea v-model="r.desc" rows="2" :maxlength="RETAINER_DESC_MAX" :disabled="editor.owner.readOnly"
                    placeholder="Коротко: кто это и чем полезен" aria-label="Описание"></textarea>
          <ConfirmButton v-if="!editor.owner.readOnly" class="ret-del" @confirm="remove(kind, r.id)">✕ Убрать</ConfirmButton>
        </div>
      </div>
      <p v-else class="hint">Пока никого.</p>

      <form v-if="!editor.owner.readOnly" class="ret-add" @submit.prevent="add(kind)">
        <input v-model="draft[kind.key].name" type="text" :maxlength="RETAINER_NAME_MAX" :disabled="full(kind)"
               :placeholder="full(kind) ? `Максимум ${kind.max}` : 'Имя'">
        <input v-model="draft[kind.key].desc" type="text" :maxlength="RETAINER_DESC_MAX" :disabled="full(kind)"
               placeholder="Короткое описание">
        <button type="submit" :disabled="full(kind) || !draft[kind.key].name.trim()">+ Добавить {{ kind.noun }}</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.retainers { margin: 8px 0 20px; }
.ret-kind + .ret-kind { margin-top: 18px; }
.ret-kind h3 { display: flex; gap: 10px; align-items: baseline; }
.ret-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 10px; }
.ret-card {
  display: grid; gap: 6px; padding: 10px;
  background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px;
}
.ret-name { font-family: var(--font-title); letter-spacing: .04em; }
.ret-card textarea { resize: vertical; font-size: .95rem; }
.ret-del { justify-self: end; padding: 4px 10px; font-size: .8rem; }
.ret-add { display: flex; gap: 8px; flex-wrap: wrap; }
.ret-add input { flex: 1 1 180px; width: auto; }
.ret-add button { padding: 8px 16px; }
</style>
