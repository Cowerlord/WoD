<script setup>
import { auth, isAdmin } from "../stores/auth.js";
import { ui, setMode } from "../stores/ui.js";
import { roster } from "../stores/roster.js";
import { logout } from "../stores/session.js";
import { music, toggleMusic, nextTrack, hasPlaylist } from "../stores/music.js";
import { ref } from "vue";
import PatchNotes from "./PatchNotes.vue";
import ChangePassword from "./ChangePassword.vue";
import { campaign, heatLevel } from "../stores/campaign.js";
import { MASQUERADE } from "../data/masquerade.js";

const passwordOpen = ref(false);

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
      <button v-if="music.available && hasPlaylist" type="button" class="music" title="Следующий трек"
              aria-label="Следующий трек" @click="nextTrack">⏭</button>
    </div>
    <h1>Становление Сородича</h1>
    <template v-if="auth.status === 'in'">
      <div class="modes" role="tablist">
        <button v-for="[id, label] in modes" :key="id" type="button" :class="{ on: ui.mode === id }" @click="setMode(id)">
          {{ label }}
        </button>
        <button v-if="isAdmin()" type="button" :class="{ on: ui.mode === 'master' }" @click="setMode('master')">Мастер</button>
      </div>
      <div class="user-bar">
        <span><b>{{ auth.me.username }}</b> <span v-if="isAdmin()" class="role">· админ</span></span>
        <span v-if="campaign.loaded" class="heat" :class="{ hot: campaign.heat >= 3 }"
              :title="heatLevel()?.text || 'Маскарад спокоен'">🔥 Маскарад {{ campaign.heat }}/{{ MASQUERADE.max }}</span>
        <span :class="{ err: roster.saveFailed }">{{ roster.saveStatus }}</span>
        <button type="button" @click="passwordOpen = true">Пароль</button>
        <button type="button" @click="logout">Выйти</button>
      </div>
    </template>
    <ChangePassword v-if="passwordOpen" @close="passwordOpen = false" />
  </header>
</template>

<style scoped>
.app-header { position: relative; }
.corner { display: flex; gap: 6px; align-items: center; justify-content: flex-end; margin-bottom: 6px; }
.music { padding: 6px 10px; font-size: 1.1rem; letter-spacing: 0; border-color: var(--border); }
.music.off { opacity: .6; }

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
.heat { color: var(--text-dim); }
.heat.hot { color: #ffb3b3; }
</style>
