<script setup>
import { computed } from "vue";
import { ABILITIES } from "../../data/config.js";
import { SKILLS, SKILL_MAX } from "../../data/skills.js";
import { character, rules } from "../../stores/editor.js";
import { fmt } from "../../character/format.js";
import { rollSkill } from "../../stores/rolls.js";

// Навыки вертикальным списком по характеристикам: «СИЛА (+2) → Атлетика … +4».
// edit — режим Мастера: видны все дополнительные навыки и кнопки −/+ для выданных бонусов.
const props = defineProps({ edit: { type: Boolean, default: false }, roll: { type: Boolean, default: false } });

const groups = computed(() => ABILITIES.map(a => ({
  a,
  list: SKILLS.filter(sk => rules.skillAbility(sk) === a.key && (props.edit || rules.skillAllowed(sk))),
})).filter(g => g.list.length));

const granted = id => character.bonusSkills?.[id] || 0;
function grant(id, delta) {
  if (!character.bonusSkills) character.bonusSkills = {};
  const next = granted(id) + delta;
  if (next < 0 || (delta > 0 && rules.skillBonus(id) >= SKILL_MAX)) return;
  if (next) character.bonusSkills[id] = next;
  else delete character.bonusSkills[id];
}
const click = sk => { if (props.roll) rollSkill(sk); };
</script>

<template>
  <table class="sk-table" :class="{ 'sk-edit': edit }">
    <colgroup><col><col class="c-n"><col class="c-t"></colgroup>
    <tbody v-for="g in groups" :key="g.a.key">
      <tr class="sk-group"><th colspan="3">{{ g.a.name }} <span>{{ fmt(rules.mod(g.a.key)) }}</span></th></tr>
      <tr v-for="sk in g.list" :key="sk.id" :class="{ own: rules.skillBonus(sk.id), rollable: roll, extra: !sk.core }"
          :title="roll ? 'Бросить проверку' : sk.hint" @click="click(sk)">
        <td>{{ sk.name }}<small v-if="!sk.core" class="sk-extra"> доп.</small></td>
        <td class="sk-n">{{ rules.skillBonus(sk.id) ? fmt(rules.skillBonus(sk.id)) : "" }}</td>
        <td class="sk-t">
          <template v-if="edit">
            <button type="button" class="sk-btn" :disabled="!granted(sk.id)" @click.stop="grant(sk.id, -1)">−</button>
            <span class="sk-granted" :title="'Выдано Мастером'">{{ granted(sk.id) ? `+${granted(sk.id)}` : "·" }}</span>
            <button type="button" class="sk-btn" :disabled="rules.skillBonus(sk.id) >= SKILL_MAX" @click.stop="grant(sk.id, 1)">+</button>
          </template>
          <template v-else>{{ fmt(rules.skillTotal(sk)) }}</template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.c-n { width: 18%; }
.c-t { width: 20%; }
.sk-edit .c-t { width: 110px; }
.sk-group th { text-align: left; font-family: var(--font-title); letter-spacing: .08em; text-transform: uppercase; font-size: .8em; padding-top: 6px; }
.sk-group span { font-family: var(--font-body); letter-spacing: 0; text-transform: none; }
.sk-extra { opacity: .7; font-size: .8em; }
.sk-n { text-align: right; white-space: nowrap; }
.sk-t { text-align: right; white-space: nowrap; font-weight: 700; }
.sk-btn { padding: 0 8px; min-width: 26px; line-height: 1.5; font-size: .9rem; }
.sk-granted { display: inline-block; min-width: 2.2em; text-align: center; font-weight: 400; }
</style>
