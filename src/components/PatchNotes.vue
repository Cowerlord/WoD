<script setup>
import { ref } from "vue";
import { PATCHES } from "../data/patches.js";
import { lsGet, lsSet } from "../lib/storage.js";
import Modal from "./common/Modal.vue";

const SEEN_KEY = "wod-patch-seen";
const open = ref(false);
const unseen = ref(lsGet(SEEN_KEY) !== PATCHES[0]?.id);

function show() {
  open.value = true;
  unseen.value = false;
  lsSet(SEEN_KEY, PATCHES[0]?.id);
}
</script>

<template>
  <button type="button" class="patches-btn" title="История патчей" @click="show">
    📜 Патчи<span v-if="unseen" class="dot"></span>
  </button>
  <Modal v-if="open" title="История патчей" @close="open = false">
    <section v-for="p in PATCHES" :key="p.id" class="patch">
      <h3>{{ p.title }} <small>{{ p.date }}</small></h3>
      <ul><li v-for="(c, i) in p.changes" :key="i">{{ c }}</li></ul>
    </section>
  </Modal>
</template>

<style scoped>
.patches-btn { position: relative; padding: 6px 12px; font-size: .8rem; border-color: var(--border); }
.dot {
  position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; border-radius: 50%;
  background: var(--blood-bright); box-shadow: 0 0 8px var(--blood-bright);
}
.patch h3 small { font-family: var(--font-body); color: var(--text-dim); letter-spacing: 0; margin-left: 6px; }
.patch ul { margin: 0; padding-left: 22px; }
.patch li { margin-bottom: 4px; }
</style>
