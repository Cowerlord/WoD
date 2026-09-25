<script setup>
import { computed, ref } from "vue";
import { DISCIPLINE_ATTACKS } from "../../data/disciplines.js";
import { rules } from "../../stores/editor.js";
import { useCost, whyCannotUse, useDiscipline } from "../../stores/play.js";
import { rollAttack } from "../../stores/rolls.js";
import { discipline } from "../../character/format.js";
import Modal from "../common/Modal.vue";

const props = defineProps({
  id: { type: String, required: true },
  level: { type: Number, required: true },
});
const emit = defineEmits(["close"]);

// used — какой уровень уже применён в этом окне (0 — ещё ничего)
const used = ref(0);
const d = computed(() => discipline(props.id));
const text = lvl => rules.fillTokens(d.value.short?.[lvl] ?? d.value.levels[lvl] ?? "");
const canUpgrade = computed(() => used.value === 1 && rules.hasDisc(props.id, 3));
const upgradeBlock = computed(() => whyCannotUse(props.id, 3, true));
const block = computed(() => whyCannotUse(props.id, props.level));
const attacksOf = lvl => DISCIPLINE_ATTACKS.filter(a => a.discipline === props.id && a.level === lvl);

function confirm() {
  if (useDiscipline(props.id, props.level)) used.value = props.level;
}
function upgrade() {
  if (useDiscipline(props.id, 3, true)) used.value = 3;
}
</script>

<template>
  <Modal :title="`${d.name}, ур. ${used || level}`" @close="emit('close')">
    <template v-if="!used">
      <p>{{ text(level) }}</p>
      <p class="cost">Потратить <b>{{ useCost(id, level) }} ПК</b>{{ level === 3 ? " (ур. 1 + усиление)" : "" }}?</p>
      <div class="error">{{ block }}</div>
      <div class="btns">
        <button type="button" class="primary" :disabled="!!block" @click="confirm">Использовать</button>
        <button type="button" @click="emit('close')">Отмена</button>
      </div>
    </template>

    <template v-else>
      <p class="done">✓ Ур. {{ used }} применён: {{ text(used) }}</p>
      <div v-if="attacksOf(used).length" class="btns">
        <button v-for="a in attacksOf(used)" :key="a.name" type="button" class="roll-btn primary" @click="rollAttack(a)">
          🎲 {{ a.name.replace(/\s*\(.*\)$/, "") }}</button>
      </div>
      <div v-if="canUpgrade" class="upgrade">
        <p><b>Усилить до ур. 3</b> — ещё {{ useCost(id, 3, true) }} ПК: {{ text(3) }}</p>
        <div class="error">{{ upgradeBlock }}</div>
        <div class="btns">
          <button type="button" class="primary" :disabled="!!upgradeBlock" @click="upgrade">Усилить</button>
          <button type="button" @click="emit('close')">Готово</button>
        </div>
      </div>
      <div v-else class="btns"><button type="button" @click="emit('close')">Готово</button></div>
    </template>
  </Modal>
</template>

<style scoped>
.cost { color: var(--gold); }
.done { color: #f0c060; }
.btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.btns button { padding: 8px 16px; font-size: .85rem; }
.upgrade { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); }
</style>
