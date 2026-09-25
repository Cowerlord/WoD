<script setup>
import { ref, watch } from "vue";
import { cleanText } from "../../character/sanitize.js";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, required: true },
  max: { type: Number, required: true },
  placeholder: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

// В поле остаются пробелы по краям, пока человек печатает; в персонажа уходит обрезанный текст
const text = ref(props.modelValue);
watch(() => props.modelValue, v => { if (v !== text.value.trim()) text.value = v; });

function onInput(e) {
  const v = cleanText(e.target.value, props.max);
  if (v !== e.target.value) e.target.value = v;
  text.value = v;
  emit("update:modelValue", v.trim());
}
</script>

<template>
  <label class="field"><span>{{ label }}</span>
    <input type="text" :value="text" :maxlength="max" :placeholder="placeholder" @input="onInput">
    <small class="counter" :class="{ full: text.length >= max }">{{ text.length }} / {{ max }}</small>
  </label>
</template>
