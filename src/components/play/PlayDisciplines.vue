<script setup>
import { computed, ref } from "vue";
import { ABILITIES } from "../../data/config.js";
import { character, rules } from "../../stores/editor.js";
import { useCost, whyCannotSurge, useSurge, surgeText, bloodLocked, toggleCondition, setBP } from "../../stores/play.js";
import { discipline, levelCost, levelTag } from "../../character/format.js";
import DisciplineDialog from "./DisciplineDialog.vue";
import Modal from "../common/Modal.vue";

defineProps({ locked: { type: Boolean, default: false } });

const dialog = ref(null);
const surgeOpen = ref(false);
const surgePick = ref(null);
const levelsOf = lvl => Array.from({ length: lvl }, (_, i) => i + 1);
const text = (id, k) => rules.fillTokens(discipline(id).short?.[k] ?? discipline(id).levels[k] ?? "");
const isActive = (id, k) => levelCost(discipline(id).levels[k]) > 0;
const surgeBlock = computed(() => whyCannotSurge());
const fury = computed(() => rules.clan()?.id === "brujah");
const furyOn = computed(() => character.session.conditions.includes("fury"));

function confirmSurge() {
  if (surgePick.value && useSurge(surgePick.value)) surgeOpen.value = false;
}
function useFury() {
  if (furyOn.value || character.session.bp < 1) return;
  setBP(character.session.bp - 1);
  toggleCondition("fury");
}
</script>

<template>
  <div class="discs">
    <p v-if="bloodLocked()" class="error">Паралич крови: Дисциплины и Сила Крови недоступны.</p>

    <div class="dcard surge">
      <div class="head"><b>Интенсификация Крови</b><span>1 ПК</span></div>
      <p>{{ surgeText() }}.</p>
      <button type="button" class="primary" :disabled="locked || !!surgeBlock" :title="surgeBlock"
              @click="surgePick = character.session.surge; surgeOpen = true">Использовать</button>
    </div>

    <div v-for="[id, lvl] in rules.learnedDisciplines()" :key="id" class="dcard">
      <div class="head"><b>{{ discipline(id).name }}</b><span>ур. {{ lvl }}</span></div>
      <div v-for="k in levelsOf(lvl)" :key="k" class="lvl">
        <div class="lvl-text"><em>Ур {{ k }} · {{ levelTag(discipline(id).levels[k] || "") }}</em> {{ text(id, k) }}</div>
        <button v-if="k === 1 && isActive(id, 1)" type="button" class="primary" :disabled="locked" @click="dialog = { id, level: 1 }">
          Использовать ({{ useCost(id, 1) }} ПК)</button>
        <button v-if="k === 3 && isActive(id, 3)" type="button" :disabled="locked" @click="dialog = { id, level: 3 }">
          Сразу ур. 3 ({{ useCost(id, 3) }} ПК)</button>
      </div>
    </div>
    <p v-if="!rules.learnedDisciplines().length" class="hint">Дисциплины не изучены.</p>

    <div v-if="rules.clan()?.ability" class="dcard">
      <div class="head"><b>{{ rules.clan().ability.name }}</b><span>{{ rules.clan().ability.cost }}</span></div>
      <p>{{ rules.clan().ability.text }}</p>
      <button v-if="fury" type="button" class="primary" :disabled="locked || furyOn || character.session.bp < 1" @click="useFury">
        {{ furyOn ? "Действует до конца боя" : "Использовать (1 ПК)" }}</button>
    </div>

    <DisciplineDialog v-if="dialog" :id="dialog.id" :level="dialog.level" @close="dialog = null" />
    <Modal v-if="surgeOpen" title="Интенсификация Крови" @close="surgeOpen = false">
      <p>{{ surgeText() }}. Выберите характеристику — потратится 1 ПК.</p>
      <div class="picks">
        <button v-for="a in ABILITIES" :key="a.key" type="button" :class="{ on: surgePick === a.key }" @click="surgePick = a.key">{{ a.abbr }}</button>
      </div>
      <div class="error">{{ surgeBlock }}</div>
      <div class="btns">
        <button type="button" class="primary" :disabled="!surgePick || !!surgeBlock" @click="confirmSurge">Потратить 1 ПК</button>
        <button type="button" @click="surgeOpen = false">Отмена</button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.discs { display: grid; gap: 10px; }
.dcard { background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; }
.dcard.surge { border-color: var(--blood); }
.head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.head b { font-family: var(--font-title); letter-spacing: .04em; color: var(--blood-bright); }
.head span { color: var(--gold); font-size: .85rem; }
.dcard p { margin: 0 0 8px; color: var(--text-dim); }
.lvl { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; padding: 6px 0; border-top: 1px solid var(--border); }
.lvl-text { flex: 1 1 240px; color: var(--text-dim); }
.lvl-text em { font-style: normal; color: var(--gold); font-family: var(--font-title); font-size: .75rem; margin-right: 4px; }
.dcard button { padding: 6px 12px; font-size: .75rem; }
.picks { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
.picks button { padding: 8px 14px; }
.picks button.on { background: var(--blood); color: #fff; }
.btns { display: flex; gap: 8px; margin-top: 10px; }
.btns button { padding: 8px 16px; font-size: .85rem; }
</style>
