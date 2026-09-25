<script setup>
import { computed } from "vue";
import { CLANS } from "../../data/clans.js";
import { AVATAR_RE } from "../../character/sanitize.js";
import { fmtDate } from "../../character/format.js";
import { showImage } from "../../stores/lightbox.js";

const props = defineProps({
  character: { type: Object, required: true },
  status: { type: String, default: "" },
});
const clanName = computed(() => CLANS.find(c => c.id === props.character.clanId)?.name ?? "клан не выбран");
const avatar = computed(() => {
  const a = props.character.avatar;
  return typeof a === "string" && AVATAR_RE.test(a) ? a : null;
});
</script>

<template>
  <div class="roster-card">
    <div class="roster-ava" :class="{ zoom: avatar }" :style="avatar ? { backgroundImage: `url('${avatar}')` } : {}"
         @click="showImage(avatar)"></div>
    <div class="roster-info">
      <b>{{ character.name || "Безымянный" }}</b>
      <small>{{ clanName }}<template v-if="character.updatedAt"> · {{ fmtDate(character.updatedAt) }}</template></small>
      <small v-if="status" class="status">{{ status }}</small>
    </div>
    <div class="roster-actions"><slot /></div>
  </div>
</template>

<style scoped>
.roster-card {
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; padding: 10px;
}
.roster-ava { width: 48px; height: 60px; flex: 0 0 auto; border: 1px dashed var(--blood); border-radius: 3px; background: center / cover no-repeat; }
.roster-ava.zoom { cursor: zoom-in; }
.roster-info { flex: 1 1 160px; min-width: 0; overflow-wrap: anywhere; }
.roster-info b { font-family: var(--font-title); letter-spacing: .04em; display: block; }
.roster-info small { color: var(--text-dim); }
.roster-info .status { display: block; color: var(--gold); }
.roster-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.roster-actions :slotted(button) { padding: 6px 12px; font-size: .8rem; }
.roster-actions :slotted(button.danger) { border-color: #ff6b6b; color: #ffb3b3; }
</style>
