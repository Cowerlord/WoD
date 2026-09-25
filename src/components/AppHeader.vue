<script setup>
import { auth, isAdmin } from "../stores/auth.js";
import { ui, setMode } from "../stores/ui.js";
import { roster } from "../stores/roster.js";
import { logout } from "../stores/session.js";
import { music, toggleMusic } from "../stores/music.js";
import PatchNotes from "./PatchNotes.vue";

const modes = [
  ["create", "Создание персонажа"],
  ["roster", "Мои персонажи"],
  ["all", "Все персонажи"],
  ["rules", "Правила"],
];
</script>

<template>
  <header class="app-header">
    <div class="corner">
      <PatchNotes />
      <button v-if="music.available" type="button" class="music" :class="{ off: !music.on }"
              :title="music.on ? 'Выключить музыку' : 'Включить музыку'"
              :aria-label="music.on ? 'Выключить музыку' : 'Включить музыку'" @click="toggleMusic">
        {{ music.on ? "🔊" : "🔇" }}
      </button>
    </div>
    <h1>Становление Сородича</h1>
    <template v-if="auth.status === 'in'">
      <div class="modes" role="tablist">
        <button v-for="[id, label] in modes" :key="id" type="button" :class="{ on: ui.mode === id }" @click="setMode(id)">
          {{ label }}
        </button>
      </div>
      <div class="user-bar">
        <span><b>{{ auth.me.username }}</b> <span v-if="isAdmin()" class="role">· админ</span></span>
        <span :class="{ err: roster.saveFailed }">{{ roster.saveStatus }}</span>
        <button type="button" @click="logout">Выйти</button>
      </div>
    </template>
  </header>
</template>

<style scoped>
.app-header { position: relative; }
.corner { position: absolute; top: 0; right: 0; display: flex; gap: 6px; align-items: center; }
.music { padding: 6px 10px; font-size: 1.1rem; letter-spacing: 0; border-color: var(--border); }
.music.off { opacity: .6; }
h1 { padding: 0 150px; }
@media (max-width: 760px) {
  .corner { position: static; justify-content: flex-end; margin-bottom: 8px; }
  h1 { padding: 0; }
}
.modes { display: flex; justify-content: center; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.modes button { padding: 8px 20px; font-size: .85rem; }
.modes button.on { background: var(--blood); color: #fff; }
.user-bar {
  display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-top: 10px; color: var(--text-dim); font-size: .9rem;
}
.user-bar b { color: var(--text); font-family: var(--font-title); letter-spacing: .04em; }
.role { color: var(--gold); font-style: italic; }
.user-bar button { padding: 4px 12px; font-size: .75rem; }
.err { color: #ffb3b3; }
</style>
