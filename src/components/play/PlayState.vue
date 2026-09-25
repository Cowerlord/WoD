<script setup>
import { computed } from "vue";
import { CONDITIONS } from "../../data/play.js";
import { HUMANITY_CHANGES, HUMANITY_ZERO } from "../../data/beast.js";
import { BLOOD_PACK } from "../../data/clothing.js";
import { character, rules } from "../../stores/editor.js";
import { toggleCondition, setHumanity, setPacks } from "../../stores/play.js";
import { NOTES_MAX } from "../../character/sanitize.js";
import { fmt } from "../../character/format.js";
import VSelect from "../common/VSelect.vue";

defineProps({ locked: { type: Boolean, default: false } });

const s = computed(() => character.session);
const live = computed(() => rules.live());
const conditions = computed(() => CONDITIONS.filter(c => !c.clan || c.clan === rules.clan()?.id));
const severeOptions = [
  { value: 0, label: "нет" },
  { value: 1, label: "Ур. 3 — Обгорание", hint: "нельзя лечиться" },
  { value: 2, label: "Ур. 4 — Паралич крови", hint: "нельзя Дисциплины и Силу Крови" },
];
</script>

<template>
  <div class="state">
    <label class="field"><span>Тяжёлые ранения</span>
      <VSelect v-model="s.severe" :options="severeOptions" :disabled="locked" />
    </label>
    <p v-if="live.severe" class="hint">{{ live.severe.short }}</p>

    <h3>Состояния</h3>
    <div class="conds">
      <button v-for="c in conditions" :key="c.id" type="button" :class="{ on: s.conditions.includes(c.id) }"
              :disabled="locked" :title="c.note" @click="toggleCondition(c.id)">{{ c.name }}</button>
    </div>
<p></p>
    <p class="hint">{{ conditions.filter(c => s.conditions.includes(c.id)).map(c => `${c.name}: ${c.note}`).join(" · ") || "Нажмите, чтобы включить — учитывается в бросках." }}</p>

    <h3>Человечность · {{ live.humanity }}</h3>
    <div class="hum">
      <button v-for="h in HUMANITY_CHANGES" :key="h.text" type="button" :disabled="locked" @click="setHumanity(live.humanity + h.delta)">
        {{ h.text }} <b>{{ fmt(h.delta) }}</b></button>
    </div>
    <p v-if="live.humanity === 0" class="error">{{ HUMANITY_ZERO }}</p>

    <template v-if="rules.clothing()">
      <h3>{{ rules.clothing().name }}</h3>
      <p class="hint">{{ rules.clothing().effect }}</p>
      <div class="packs">Пакеты крови ({{ BLOOD_PACK.dice }} ПК, действием):
        <button type="button" :disabled="locked" @click="setPacks(s.packs - 1)">−</button>
        <b>{{ s.packs }} / {{ rules.clothing().bloodPacks }}</b>
        <button type="button" :disabled="locked" @click="setPacks(s.packs + 1)">+</button>
      </div>
    </template>

    <label class="field notes"><span>Заметки (снаряжение, деньги, зацепки)</span>
      <textarea v-model="s.notes" :disabled="locked" :maxlength="NOTES_MAX" rows="4"></textarea>
    </label>
  </div>
</template>

<style scoped>
.state h3 { margin: 16px 0 8px; }
.conds, .hum { display: flex; flex-wrap: wrap; gap: 6px; }
.conds button, .hum button { padding: 6px 12px; font-size: .8rem; }
.conds button.on { background: var(--blood); color: #fff; }
.hum b { color: var(--gold); margin-left: 4px; }
.packs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.packs button { padding: 4px 12px; letter-spacing: 0; }
.notes { margin-top: 16px; }
.notes textarea { resize: vertical; }
</style>
