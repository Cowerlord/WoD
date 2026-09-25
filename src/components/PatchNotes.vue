<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { PATCHES } from "../data/patches.js";
import { lsGet, lsSet } from "../lib/storage.js";

const SEEN_KEY = "wod-patch-seen";
const open = ref(false);
const unseen = ref(lsGet(SEEN_KEY) !== PATCHES[0]?.id);

function show() {
  open.value = true;
  unseen.value = false;
  lsSet(SEEN_KEY, PATCHES[0]?.id);
}

const onKey = e => { if (e.key === "Escape") open.value = false; };
watch(open, v => v ? document.addEventListener("keydown", onKey) : document.removeEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
</script>

<template>
  <button type="button" class="patches-btn" title="История патчей" @click="show">
    📜 Патчи<span v-if="unseen" class="dot"></span>
  </button>
  <div v-if="open" class="backdrop" @click.self="open = false">
    <div class="panel dialog" role="dialog" aria-label="История патчей">
      <div class="dialog-head">
        <h2>История патчей</h2>
        <button type="button" class="close" aria-label="Закрыть" @click="open = false">✕</button>
      </div>
      <section v-for="p in PATCHES" :key="p.id" class="patch">
        <h3>{{ p.title }} <small>{{ p.date }}</small></h3>
        <ul><li v-for="(c, i) in p.changes" :key="i">{{ c }}</li></ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.patches-btn { position: relative; padding: 6px 12px; font-size: .8rem; border-color: var(--border); }
.dot {
  position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; border-radius: 50%;
  background: var(--blood-bright); box-shadow: 0 0 8px var(--blood-bright);
}
.backdrop {
  position: fixed; inset: 0; z-index: 10; background: rgba(0,0,0,.7);
  display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; overflow-y: auto;
}
.dialog { width: 100%; max-width: 600px; text-align: left; }
.dialog-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.dialog-head h2 { margin: 0; }
.close { padding: 4px 12px; border-color: var(--border); letter-spacing: 0; }
.patch h3 small { font-family: var(--font-body); color: var(--text-dim); letter-spacing: 0; margin-left: 6px; }
.patch ul { margin: 0; padding-left: 22px; }
.patch li { margin-bottom: 4px; }
</style>
