<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { master, loadParty, partyMember, addPlayers, addEnemies, rollAll, sortEntries, nextTurn, prevTurn, removeEntry, endCombat } from "../../stores/master.js";
import { fmt } from "../../character/format.js";
import ConfirmButton from "../common/ConfirmButton.vue";
import { campaign, changeHeat, heatLevel } from "../../stores/campaign.js";
import { MASQUERADE } from "../../data/masquerade.js";

const picked = ref([]);
const enemy = reactive({ name: "", hp: 10, ac: 10, initMod: 0, count: 1 });
const notInCombat = computed(() => master.party.filter(p => !master.entries.some(e => e.charId === p.id)));

function addPicked() {
  addPlayers(picked.value);
  picked.value = [];
}

function addEnemy() {
  if (!enemy.name.trim()) return;
  addEnemies({ name: enemy.name.trim(), hp: Math.max(1, Number(enemy.hp) || 1), ac: Number(enemy.ac) || 10,
    initMod: Number(enemy.initMod) || 0, count: Number(enemy.count) || 1 });
  enemy.name = "";
  enemy.count = 1;
}

// Первый раунд: первая половина по инициативе атакует с преимуществом
const firstStrike = i => master.round === 1 && master.entries.every(e => e.init != null) && i < Math.floor(master.entries.length / 2);

const setHP = (e, v) => { e.hp = Math.max(0, Math.min(e.maxHp, Math.round(Number(v) || 0))); };
const setInit = (e, v) => { e.init = v === "" ? null : Math.round(Number(v)); };

let timer = null;
onMounted(() => {
  loadParty();
  timer = setInterval(() => { if (!document.hidden) loadParty(); }, 20000);
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div id="mode-master">
    <div class="panel">
      <div class="head">
        <h2>Бой · раунд {{ master.round }}</h2>
        <div class="actions">
          <button type="button" :disabled="!master.entries.length" @click="prevTurn">◀ Назад</button>
          <button type="button" class="primary" :disabled="!master.entries.length" @click="nextTurn">Следующий ход ▶</button>
        </div>
      </div>
      <div class="actions tools">
        <button type="button" :disabled="!master.entries.length" @click="rollAll(false)">🎲 Инициатива всем</button>
        <button type="button" :disabled="!master.entries.length" @click="rollAll(true)">🎲 Только без инициативы</button>
        <button type="button" :disabled="!master.entries.length" @click="sortEntries">Сортировать</button>
        <ConfirmButton :disabled="!master.entries.length" @confirm="endCombat">Завершить бой</ConfirmButton>
      </div>
      <p v-if="!master.entries.length" class="hint">Добавьте игроков и противников ниже.</p>
      <table v-else class="order">
        <thead><tr><th>Иниц.</th><th>Кто</th><th>КД</th><th>Хиты</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(e, i) in master.entries" :key="e.id"
              :class="{ current: i === master.turn, down: e.kind === 'npc' && e.hp === 0, pc: e.kind === 'pc' }">
            <td>
              <input class="num" type="number" :value="e.init ?? ''" placeholder="—" @change="setInit(e, $event.target.value)">
              <small>{{ fmt(e.initMod || 0) }}{{ e.initMode === "adv" ? " ↑" : e.initMode === "dis" ? " ↓" : "" }}</small>
            </td>
            <td>
              <b>{{ i === master.turn ? "▶ " : "" }}{{ e.name }}</b>
              <em v-if="firstStrike(i)" class="adv">атака с преимуществом</em>
              <small v-if="e.kind === 'pc'">{{ partyMember(e.charId)?.owner }} · {{ partyMember(e.charId)?.status }}</small>
              <small v-else>противник</small>
            </td>
            <td>{{ e.kind === "pc" ? partyMember(e.charId)?.ac ?? "—" : e.ac }}</td>
            <td>
              <template v-if="e.kind === 'pc'">{{ partyMember(e.charId)?.hp ?? "—" }} / {{ partyMember(e.charId)?.max ?? "—" }}</template>
              <div v-else class="hp">
                <button type="button" @click="setHP(e, e.hp - 5)">−5</button>
                <button type="button" @click="setHP(e, e.hp - 1)">−1</button>
                <input class="num" type="number" :value="e.hp" @change="setHP(e, $event.target.value)">
                <span class="of">/ {{ e.maxHp }}</span>
                <button type="button" @click="setHP(e, e.hp + 1)">+1</button>
              </div>
            </td>
            <td><button type="button" class="x" aria-label="Убрать" @click="removeEntry(e.id)">✕</button></td>
          </tr>
        </tbody>
      </table>
      <p class="hint legend">↑ — инициатива с преимуществом, ↓ — с помехой. В первом раунде первая половина по инициативе
        атакует с преимуществом. Хиты игроков приходят с их листов (обновляются сами).</p>
    </div>

    <div class="panel masq">
      <h3>Маскарад · Жара {{ campaign.heat }} / {{ MASQUERADE.max }}</h3>
      <p v-if="!campaign.loaded" class="error">Нет таблицы campaign в базе — выполните SQL из supabase/schema.sql.</p>
      <template v-else>
        <div class="heat-row">
          <button type="button" :disabled="campaign.heat === 0" @click="changeHeat(-1)">−</button>
          <span v-for="n in MASQUERADE.max" :key="n" class="flame" :class="{ on: n <= campaign.heat }">🔥</span>
          <button type="button" :disabled="campaign.heat === MASQUERADE.max" @click="changeHeat(1)">+</button>
        </div>
        <p class="hint">{{ heatLevel()?.text || "Спокойно." }} Растёт: {{ MASQUERADE.triggers.join(", ").toLowerCase() }}.
          <template v-for="l in MASQUERADE.levels" :key="l.at"> На {{ l.at }}: {{ l.text.toLowerCase() }}</template>
          Игроки видят Жару в шапке сайта.</p>
      </template>
    </div>

    <div class="cols">
      <div class="panel">
        <h3>Игроки</h3>
        <div class="error">{{ master.error }}</div>
        <p v-if="!notInCombat.length" class="hint">Все персонажи уже в бою.</p>
        <label v-for="p in notInCombat" :key="p.id" class="pick">
          <input v-model="picked" type="checkbox" :value="p.id">
          <span><b>{{ p.name }}</b> <small>{{ p.owner }} · {{ p.status }}</small></span>
        </label>
        <div class="actions">
          <button type="button" class="primary" :disabled="!picked.length" @click="addPicked">Добавить выбранных</button>
          <button type="button" :disabled="!notInCombat.length" @click="addPlayers(notInCombat.map(p => p.id))">Добавить всех</button>
        </div>
      </div>
      <div class="panel">
        <h3>Противник</h3>
        <form class="enemy" @submit.prevent="addEnemy">
          <label class="field wide"><span>Название</span><input v-model="enemy.name" type="text" placeholder="Коп, гуль, охотник…" maxlength="40"></label>
          <label class="field"><span>Хиты</span><input v-model="enemy.hp" type="number" min="1"></label>
          <label class="field"><span>КД</span><input v-model="enemy.ac" type="number" min="0"></label>
          <label class="field"><span>Мод. иниц.</span><input v-model="enemy.initMod" type="number"></label>
          <label class="field"><span>Сколько</span><input v-model="enemy.count" type="number" min="1" max="20"></label>
          <button type="submit" class="primary" :disabled="!enemy.name.trim()">Добавить</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel + .cols, .cols { margin-top: 16px; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.head h2 { margin: 0; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.actions button { padding: 8px 14px; font-size: .8rem; }
.tools { margin: 14px 0; }
.order { width: 100%; border-collapse: collapse; }
.order th { font-family: var(--font-title); font-size: .7rem; letter-spacing: .06em; color: var(--gold); text-align: left; padding: 6px; border-bottom: 1px solid var(--border); }
.order td { padding: 8px 6px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.order td small { display: block; color: var(--text-dim); font-size: .8rem; }
.order tr.current td { background: rgba(139,0,0,.25); }
.order tr.current td:first-child { box-shadow: inset 3px 0 0 var(--blood-bright); }
.order tr.down { opacity: .45; }
.order tr.down b { text-decoration: line-through; }
.order tr.pc b { color: var(--gold); }
.adv { display: inline-block; margin-left: 6px; padding: 0 6px; font-size: .7rem; font-style: normal; color: #f0c060; border: 1px solid #f0c060; border-radius: 8px; }
.num { width: 64px; padding: 4px 6px; text-align: center; }
.hp { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.hp button { padding: 3px 8px; font-size: .75rem; letter-spacing: 0; }
.of { color: var(--text-dim); font-size: .9rem; }
.x { padding: 3px 8px; border-color: var(--border); letter-spacing: 0; }
.legend { margin: 10px 0 0; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.masq { margin-top: 16px; }
.masq h3 { margin-top: 0; }
.heat-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.heat-row button { padding: 4px 14px; letter-spacing: 0; }
.flame { font-size: 1.4rem; opacity: .2; filter: grayscale(1); }
.flame.on { opacity: 1; filter: none; }
.cols h3 { margin-top: 0; }
.pick { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; cursor: pointer; }
.pick input { margin-top: 6px; accent-color: var(--blood-bright); }
.pick small { color: var(--text-dim); display: block; }
.enemy { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0 10px; align-items: end; }
.enemy .wide { grid-column: 1 / -1; }
.enemy button { grid-column: 1 / -1; }
.enemy input[type=number] { width: 100%; }
@media (max-width: 760px) {
  .cols { grid-template-columns: 1fr; }
  .enemy { grid-template-columns: 1fr 1fr; }
  .order th:nth-child(3), .order td:nth-child(3) { display: none; }
}
</style>
