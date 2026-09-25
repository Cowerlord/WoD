<script setup>
import { computed } from "vue";
import { rules } from "../../stores/editor.js";
import { fmt, speedText } from "../../character/format.js";

const s = computed(() => rules.combatStats());
const acNote = computed(() => [rules.armor() ? `${rules.armor().name} +${rules.armor().ac}` : "", rules.passiveNote("ac").trim()]
  .filter(Boolean).join(" · "));
const initNote = computed(() => s.value.initAdvantage ? "всегда с преимуществом"
  : s.value.initDisadvantage ? "с помехой (тяжёлая броня)"
  : rules.armor()?.init ? `${fmt(rules.armor().init)} от брони` : "");
</script>

<template>
  <section>
    <h2>Бой</h2>
    <div class="cb">
      <span class="lbl">Хиты (HP), максимум</span>
      <div class="row"><span class="v">{{ s.hp }}</span><span v-if="rules.passiveNote('hp')" class="note">{{ rules.passiveNote("hp").trim() }}</span></div>
      <div class="note">Текущие: <span class="blank"></span></div>
      <div v-if="s.tempHP" class="note">Временные HP: <span class="blank"></span></div>
    </div>
    <div class="cb">
      <span class="lbl">Пункты Крови</span>
      <span class="track"><i v-for="n in s.bp" :key="n"></i></span>
    </div>
    <div class="cb">
      <span class="lbl">Класс Доспеха</span>
      <div class="row"><span class="v">{{ s.ac }}</span><span v-if="acNote" class="note">{{ acNote }}</span></div>
      <div v-if="rules.armor()?.note" class="note">{{ rules.armor().note }}</div>
    </div>
    <div class="cb">
      <span class="lbl">Инициатива</span>
      <div class="row"><span class="v">{{ fmt(s.init) }}</span><span v-if="initNote" class="note">{{ initNote }}</span></div>
    </div>
    <div class="cb">
      <span class="lbl">Скорость</span>
      <div class="row"><span class="v">{{ s.speed }}</span><span v-if="rules.passiveNote('speed')" class="note">{{ rules.passiveNote("speed").trim() }}</span></div>
      <div class="note">{{ speedText(s.speed) }}{{ s.noDash ? ". Рывок нельзя (тяжёлая броня)" : "" }}</div>
    </div>
  </section>
</template>
