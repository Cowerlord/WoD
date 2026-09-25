<script setup>
import { ref } from "vue";
import { auth } from "../stores/auth.js";
import { changePassword } from "../stores/session.js";
import Modal from "./common/Modal.vue";

const emit = defineEmits(["close"]);
const password = ref("");
const repeat = ref("");
const error = ref("");
const done = ref(false);
const busy = ref(false);

async function submit() {
  error.value = "";
  if (password.value.length < 6) { error.value = "Пароль — минимум 6 символов."; return; }
  if (password.value !== repeat.value) { error.value = "Пароли не совпадают."; return; }
  busy.value = true;
  error.value = await changePassword(password.value);
  busy.value = false;
  if (!error.value) {
    done.value = true;
    setTimeout(() => emit("close"), 1500);
  }
}
</script>

<template>
  <Modal title="Смена пароля" @close="emit('close')">
    <p v-if="done" class="ok">✓ Пароль изменён. Браузер предложит обновить сохранённый пароль.</p>
    <form v-else method="post" action="#" @submit.prevent="submit">
      <input type="text" name="username" autocomplete="username" :value="auth.me.username" hidden>
      <label class="field"><span>Новый пароль</span>
        <input v-model="password" type="password" name="new-password" autocomplete="new-password" required minlength="6">
      </label>
      <label class="field"><span>Ещё раз</span>
        <input v-model="repeat" type="password" name="repeat-password" autocomplete="new-password" required minlength="6">
      </label>
      <div class="error">{{ error }}</div>
      <button type="submit" class="primary" :disabled="busy">Сменить пароль</button>
    </form>
  </Modal>
</template>

<style scoped>
.ok { color: var(--gold); margin: 0; }
button[type=submit] { margin-top: 6px; }
</style>
