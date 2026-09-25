<script setup>
import { ref } from "vue";
import { auth } from "../stores/auth.js";
import { login } from "../stores/session.js";

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const busy = ref(false);

// Браузер сохраняет пароль только из поля type=password, поэтому перед отправкой прячем его
async function submit() {
  showPassword.value = false;
  busy.value = true;
  await login(username.value, password.value);
  busy.value = false;
}
</script>

<template>
  <div id="auth-screen">
    <div class="panel">
      <h2>Вход</h2>
      <p v-if="auth.status === 'loading'" class="hint">Подключаюсь к серверу…</p>
      <form v-else method="post" action="#" @submit.prevent="submit">
        <label class="field"><span>Ник</span>
          <input v-model="username" type="text" name="username" autocomplete="username"
                 autocapitalize="none" spellcheck="false" required minlength="3" maxlength="24"
                 placeholder="ник, который выдал Мастер">
        </label>
        <label class="field"><span>Пароль</span>
          <span class="pw-wrap">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" name="password"
                   autocomplete="current-password" required minlength="6">
            <button type="button" class="pw-toggle" :class="{ on: showPassword }"
                    :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                    :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                    @click="showPassword = !showPassword">👁</button>
          </span>
        </label>
        <div class="error">{{ auth.error }}</div>
        <button type="submit" class="primary" :disabled="busy">Войти</button>
        <p class="hint" style="margin:14px 0 0">Нет логина или забыли пароль — спросите Мастера.</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
#auth-screen { max-width: 420px; margin: 0 auto; }
button[type=submit] { width: 100%; margin-top: 6px; }
label.field .pw-wrap {
  position: relative; display: block; margin: 0;
  font-family: var(--font-body); font-size: inherit; letter-spacing: normal; color: inherit;
}
.pw-wrap input { padding-right: 48px; font-family: Georgia, "Times New Roman", serif; }
.pw-toggle {
  position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
  padding: 4px 8px; border: 0; background: none; font-size: 1rem; letter-spacing: 0; opacity: .6;
}
.pw-toggle:hover, .pw-toggle.on { background: none; opacity: 1; }
</style>
