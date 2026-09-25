<script setup>
import { ref } from "vue";

// Опасное действие срабатывает со второго нажатия
const emit = defineEmits(["confirm"]);
const armed = ref(false);
let timer = null;

function click() {
  if (armed.value) {
    clearTimeout(timer);
    armed.value = false;
    emit("confirm");
    return;
  }
  armed.value = true;
  timer = setTimeout(() => { armed.value = false; }, 3000);
}
</script>

<template>
  <button type="button" @click="click">{{ armed ? "Точно?" : "" }}<slot v-if="!armed" /></button>
</template>
