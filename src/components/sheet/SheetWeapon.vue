<script setup>
import { computed } from "vue";
import { STEALTH_DC } from "../../data/weapons.js";
import { rules } from "../../stores/editor.js";
import { fmt, distText, discipline } from "../../character/format.js";

const w = computed(() => rules.weapon());
const st = computed(() => rules.weaponStats(w.value));
const damageNote = computed(() => {
  const up = rules.weaponUpgrade(w.value);
  return w.value.addMod === false ? "без модификатора к урону" : up ? `${discipline(up.discipline).name} ${up.level}` : "";
});
</script>

<template>
  <template v-if="w">
    <h2>Оружие</h2>
    <div class="cb wpn">
      <span class="lbl">{{ w.name }}</span>
      <div class="row"><span class="v">d20 {{ st.attack }}</span><span class="note">попадание</span></div>
      <div class="note">{{ rules.attackNote(w) || "без бонусов" }}</div>
      <div class="row"><span class="v">{{ st.damage }}</span><span class="note">урон</span></div>
      <div class="note">{{ w.type }}{{ damageNote ? ` · ${damageNote}` : "" }}</div>
      <div class="note"><b>Дистанция:</b> {{ distText(w.distance) }}</div>
      <div class="note"><b>Спрятать от охраны и полиции:</b>
        <template v-if="w.concealable">
          Бросок d20 <b>{{ fmt(rules.stealthRoll()) }}</b> ({{ rules.stealthParts() }}){{ rules.stealthAdvNote() }}.
          <b>{{ STEALTH_DC }} и выше</b> — оружие не заметили.
        </template>
        <template v-else>Прятать нечего — оружия нет.</template>
      </div>
    </div>
  </template>
</template>
