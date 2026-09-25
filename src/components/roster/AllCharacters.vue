<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { auth, isAdmin } from "../../stores/auth.js";
import { deleteAny } from "../../stores/roster.js";
import { character, editor, openOther, openOwnLast } from "../../stores/editor.js";
import { fetchOthers, describeError } from "../../api/characters.js";
import { sanitizeCharacter, FILE_FORMAT } from "../../character/sanitize.js";
import { liveSummary } from "../../character/rules.js";
import CharacterCard from "../common/CharacterCard.vue";
import ConfirmButton from "../common/ConfirmButton.vue";

const rows = ref(null);

const groups = computed(() => {
  const map = new Map();
  for (const r of rows.value || []) {
    const owner = r.owner?.username ?? "?";
    if (!map.has(owner)) map.set(owner, []);
    const ch = sanitizeCharacter({ format: FILE_FORMAT, clanId: r.clan_id, abilities: r.abilities, disciplines: r.disciplines, session: r.session });
    map.get(owner).push({ id: r.id, name: r.name, clanId: r.clan_id, updatedAt: r.updated_at, avatar: r.avatar, status: liveSummary(ch) });
  }
  return [...map].sort(([a], [b]) => a.localeCompare(b));
});

async function load() {
  const { data, error } = await fetchOthers(auth.me.id);
  if (error) { rows.value = []; editor.allError = `Не удалось загрузить: ${describeError(error, auth.charLimit)}.`; return; }
  rows.value = data;
}

async function remove(id) {
  editor.allError = "";
  const err = await deleteAny(id);
  if (err) { editor.allError = `Не удалось удалить: ${err}.`; return; }
  if (character.id === id) openOwnLast();
  load();
}

// Мастер видит свежее состояние партии без перезагрузки
let timer = null;
onMounted(() => {
  load();
  timer = setInterval(() => { if (!document.hidden) load(); }, 20000);
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div id="mode-all">
    <div class="panel">
      <h2>Все персонажи</h2>
      <p class="hint">{{ isAdmin()
        ? "Вы админ: можете открыть, изменить или удалить любого персонажа."
        : "Персонажи других игроков — только для просмотра." }}</p>
      <div class="error">{{ editor.allError }}</div>
      <p v-if="rows === null" class="hint">Загрузка…</p>
      <p v-else-if="!groups.length && !editor.allError" class="hint">У других игроков пока нет персонажей.</p>
      <template v-for="[owner, list] in groups" :key="owner">
        <h3 class="roster-group">{{ owner }}</h3>
        <div class="roster">
          <CharacterCard v-for="ch in list" :key="ch.id" :character="ch" :status="ch.status">
            <button type="button" @click="openOther(ch.id, 'sheet')">Лист</button>
            <template v-if="isAdmin()">
              <button type="button" @click="openOther(ch.id, 'edit')">Изменить</button>
              <ConfirmButton class="danger" @confirm="remove(ch.id)">Удалить</ConfirmButton>
            </template>
          </CharacterCard>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.roster { display: grid; gap: 10px; margin-top: 16px; }
.roster-group { margin: 20px 0 0; font-family: var(--font-title); color: var(--gold); font-size: 1rem; letter-spacing: .06em; }
</style>
