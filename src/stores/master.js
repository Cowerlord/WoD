import { reactive, watch } from "vue";
import { lsGet, lsSet } from "../lib/storage.js";
import { fetchParty } from "../api/characters.js";
import { FILE_FORMAT, sanitizeCharacter } from "../character/sanitize.js";
import { characterRules, liveSummary } from "../character/rules.js";

const KEY = "wod-master";
const saved = lsGet(KEY);

// Счётчик инициативы Мастера: хранится только в браузере Мастера
export const master = reactive({
  round: saved?.round ?? 1,
  turn: saved?.turn ?? 0,
  entries: saved?.entries ?? [],
  party: [],
  error: "",
});

watch(() => [master.round, master.turn, master.entries], () => {
  lsSet(KEY, { round: master.round, turn: master.turn, entries: master.entries });
}, { deep: true });

let seq = Date.now();
const uid = () => `e${(seq++).toString(36)}`;

export async function loadParty() {
  const { data, error } = await fetchParty();
  if (error) { master.error = "Не удалось загрузить персонажей."; return; }
  master.error = "";
  master.party = data.map(row => {
    const ch = sanitizeCharacter({ format: FILE_FORMAT, clanId: row.clan_id, abilities: row.abilities,
      disciplines: row.disciplines, armorId: row.armorId, session: row.session });
    const r = characterRules(ch);
    const st = r.combatStats();
    return {
      id: row.id, name: row.name || "Безымянный", owner: row.owner?.username ?? "?",
      ac: st.ac, init: st.init, initMode: st.initAdvantage ? "adv" : st.initDisadvantage ? "dis" : "normal",
      status: liveSummary(ch), hp: r.live().hp, max: r.live().max,
    };
  });
}

export const partyMember = id => master.party.find(p => p.id === id) || null;

export function addPlayers(ids) {
  for (const id of ids) {
    if (master.entries.some(e => e.charId === id)) continue;
    const p = partyMember(id);
    if (p) master.entries.push({ id: uid(), kind: "pc", charId: id, name: p.name, initMod: p.init, initMode: p.initMode, init: null });
  }
}

export function addEnemies({ name, hp, ac, initMod, count }) {
  const n = Math.max(1, Math.min(20, count || 1));
  for (let i = 1; i <= n; i++) {
    master.entries.push({
      id: uid(), kind: "npc", name: n > 1 ? `${name} ${i}` : name,
      hp, maxHp: hp, ac, initMod, initMode: "normal", init: null,
    });
  }
}

const d20 = () => 1 + Math.floor(Math.random() * 20);
function rollInit(e) {
  const a = d20(), b = d20();
  const kept = e.initMode === "adv" ? Math.max(a, b) : e.initMode === "dis" ? Math.min(a, b) : a;
  e.init = kept + (e.initMod || 0);
}

export function rollAll(onlyEmpty = false) {
  master.entries.filter(e => !onlyEmpty || e.init == null).forEach(rollInit);
  sortEntries();
}

export function sortEntries() {
  master.entries.sort((a, b) => (b.init ?? -99) - (a.init ?? -99) || (b.initMod || 0) - (a.initMod || 0));
  master.turn = 0;
}

const alive = e => e.kind === "pc" || e.hp > 0;

export function nextTurn() {
  if (!master.entries.length) return;
  let i = master.turn;
  for (let step = 0; step < master.entries.length; step++) {
    i++;
    if (i >= master.entries.length) { i = 0; master.round++; }
    if (alive(master.entries[i])) break;
  }
  master.turn = i;
}

export function prevTurn() {
  if (!master.entries.length) return;
  master.turn--;
  if (master.turn < 0) { master.turn = master.entries.length - 1; master.round = Math.max(1, master.round - 1); }
}

export function removeEntry(id) {
  const i = master.entries.findIndex(e => e.id === id);
  if (i === -1) return;
  master.entries.splice(i, 1);
  if (master.turn >= master.entries.length) master.turn = 0;
}

export function endCombat() {
  master.entries = master.entries.filter(e => e.kind === "pc").map(e => ({ ...e, init: null }));
  master.round = 1;
  master.turn = 0;
}
