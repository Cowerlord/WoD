import { reactive } from "vue";
import { auth } from "./auth.js";
import { lsGet, lsSet } from "../lib/storage.js";
import { newId } from "../character/blank.js";
import { FILE_FORMAT } from "../character/sanitize.js";
import {
  updateCharacter, insertCharacter, deleteCharacter, describeError, isRetryable,
} from "../api/characters.js";

// Мои персонажи (id → данные в формате serialize) и статус сохранения на сервер
export const roster = reactive({
  characters: {},
  error: "",
  saveStatus: "",
  saveFailed: false,
  rejection: null,
});

const knownOnServer = new Set();
const lastSnap = new Map();
const rejected = new Set();
// Последняя неотправленная версия каждого персонажа; дублируется в localStorage до отправки
const outbox = new Map();
let flushRun = null;
let retryTimer = null;

export const snapshot = d => JSON.stringify({ ...d, step: null, updatedAt: null });
export const myCount = () => Object.keys(roster.characters).length;
export const isFull = () => myCount() >= auth.charLimit;
export const isUnchanged = (id, snap) => lastSnap.get(id) === snap;
export const rememberSnap = (id, snap) => lastSnap.set(id, snap);
export const isRejected = id => rejected.has(id);
export const markKnown = id => knownOnServer.add(id);

const lastKey = () => `vtm-last-${auth.me.id}`;
const outboxKey = () => `vtm-outbox-${auth.me.id}`;
export const lastOpenedId = () => lsGet(lastKey());
export const rememberLast = id => lsSet(lastKey(), id);

function setStatus(kind, msg = "") {
  roster.saveFailed = kind === "error";
  roster.saveStatus = { idle: "", saving: "Сохраняю…", saved: "✓ Сохранено", error: `⚠ ${msg}` }[kind];
}

const backupOutbox = () => { if (auth.me) lsSet(outboxKey(), outbox.size ? [...outbox.values()] : null); };

export function loadRoster(rows) {
  roster.characters = {};
  for (const row of rows) {
    roster.characters[row.id] = { format: FILE_FORMAT, version: 1, ...row.data, id: row.id, updatedAt: row.updated_at };
    knownOnServer.add(row.id);
  }
  for (const item of lsGet(outboxKey()) || []) {
    if (!item?.data?.id) continue;
    if (item.ownerId === auth.me.id) roster.characters[item.data.id] = item.data;
    outbox.set(item.data.id, item);
  }
  setStatus("idle");
  if (outbox.size) flush();
}

export function resetRoster() {
  clearTimeout(retryTimer);
  roster.characters = {};
  roster.error = "";
  [knownOnServer, lastSnap, rejected, outbox].forEach(x => x.clear());
  setStatus("idle");
}

export function queueSave(data, ownerId) {
  outbox.set(data.id, { data, ownerId });
  backupOutbox();
  flush();
}

async function send(item, retried = false) {
  const { data, ownerId } = item;
  if (knownOnServer.has(data.id)) {
    const { data: rows, error } = await updateCharacter(data);
    if (error) return error;
    if (rows.length) return null;
    knownOnServer.delete(data.id);
    if (ownerId !== auth.me.id) return { code: "GONE" };
  }
  const { error } = await insertCharacter(data);
  if (error?.code === "23505" && !retried) {
    knownOnServer.add(data.id);
    return send(item, true);
  }
  if (!error) knownOnServer.add(data.id);
  return error;
}

function onRejected({ data, ownerId }, err) {
  lastSnap.delete(data.id);
  if (ownerId === auth.me.id && !knownOnServer.has(data.id)) {
    delete roster.characters[data.id];
    if (String(err?.message).includes("CHARACTER_LIMIT")) rejected.add(data.id);
  }
  roster.rejection = { id: data.id, message: `Персонаж не сохранён на сервере: ${describeError(err, auth.charLimit)}.` };
}

export function flush() {
  flushRun ??= (async () => {
    clearTimeout(retryTimer);
    let failed = null;
    while (outbox.size && auth.me) {
      const [id, item] = outbox.entries().next().value;
      setStatus("saving");
      const err = await send(item).catch(e => e);
      if (!auth.me) break;
      if (err && isRetryable(err)) { failed = err; break; }
      if (outbox.get(id) === item) outbox.delete(id);
      if (err) { failed = err; onRejected(item, err); }
    }
    backupOutbox();
    if (!auth.me) return;
    if (!failed) setStatus("saved");
    else if (isRetryable(failed)) { setStatus("error", "нет связи, повторю…"); retryTimer = setTimeout(flush, 5000); }
    else setStatus("error", `не сохранено: ${describeError(failed, auth.charLimit)}`);
  })().finally(() => { flushRun = null; });
  return flushRun;
}

export async function deleteMine(id) {
  // Персонаж может ещё отправляться на сервер: дожидаемся, иначе он останется в базе после удаления
  if (outbox.has(id) || flushRun) await flush();
  outbox.delete(id);
  backupOutbox();
  if (knownOnServer.has(id)) {
    const { error } = await deleteCharacter(id);
    if (error) { roster.error = `Не удалось удалить: ${describeError(error, auth.charLimit)}.`; return false; }
    knownOnServer.delete(id);
  }
  delete roster.characters[id];
  lastSnap.delete(id);
  rejected.clear();
  if (lastOpenedId() === id) rememberLast(null);
  return true;
}

export async function deleteAny(id) {
  const { data, error } = await deleteCharacter(id);
  if (error || !data.length) return error ? describeError(error, auth.charLimit) : "нет прав";
  outbox.delete(id);
  knownOnServer.delete(id);
  return "";
}

// Импорт и перенос всегда создают нового персонажа с новым id
export function addMine(data, updatedAt = new Date().toISOString()) {
  const saved = { format: FILE_FORMAT, version: 1, ...data, id: newId(), updatedAt };
  if (auth.me.role !== "admin") saved.bonusPoints = 0;
  roster.characters[saved.id] = saved;
  lastSnap.set(saved.id, snapshot(saved));
  queueSave(saved, auth.me.id);
  return saved.id;
}
