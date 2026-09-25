<script setup>
import { computed } from "vue";
import { DISCIPLINE_ATTACKS } from "../../data/disciplines.js";
import { BLOOD_PACK } from "../../data/clothing.js";
import { HEALING } from "../../data/combat.js";
import { character, rules } from "../../stores/editor.js";
import { rollAttack, rollDamageOnly, rollInitiative, rollGrapple, rollStealth, drinkBloodPack } from "../../stores/rolls.js";
import { heal, whyCannotHeal, newCombat, newSession } from "../../stores/play.js";
import { distText, discipline } from "../../character/format.js";
import ConfirmButton from "../common/ConfirmButton.vue";

defineProps({ locked: { type: Boolean, default: false } });

const attacks = computed(() => {
  const list = [];
  const w = rules.weapon();
  if (w) list.push({ key: w.id, a: w, sub: `${w.type} · ${distText(w.distance)}` });
  for (const a of DISCIPLINE_ATTACKS) {
    if (!rules.hasDisc(a.discipline, a.level)) continue;
    list.push({ key: a.name, a, sub: `${discipline(a.discipline).name} ${a.level} · ${a.note}` });
  }
  return list;
});
const statsOf = a => rules.weaponStats(a);
const healBlock = computed(() => whyCannotHeal());
</script>

<template>
  <div class="combat">
    <div class="actions">
      <button type="button" class="roll-btn primary" @click="rollInitiative">🎲 Инициатива</button>
      <button type="button" class="roll-btn" :disabled="locked || !!healBlock" :title="healBlock" @click="heal">
        ✚ Лечение ({{ HEALING.cost }}, {{ rules.healAmount() }})</button>
      <button type="button" class="roll-btn" :disabled="locked || !character.session.packs" :title="BLOOD_PACK.text" @click="drinkBloodPack">
        🩸 Пакет крови ({{ character.session.packs }})</button>
      <button type="button" class="roll-btn" @click="rollGrapple">Захват / укус</button>
      <button v-if="rules.weapon()?.concealable" type="button" class="roll-btn" @click="rollStealth">Спрятать оружие</button>
    </div>
    <p v-if="healBlock && !locked" class="hint small">Лечение недоступно: {{ healBlock }}</p>

    <div class="cards">
      <div v-for="x in attacks" :key="x.key" class="atk">
        <div class="atk-head">
          <b>{{ x.a.name.replace(/\s*\(.*\)$/, "") }}</b>
          <span>{{ x.a.save ? statsOf(x.a).attack : `d20 ${statsOf(x.a).attack}` }} · {{ statsOf(x.a).damage }}</span>
        </div>
        <small>{{ x.sub }}</small>
        <div class="atk-btns">
          <button v-if="!x.a.save" type="button" class="roll-btn primary" @click="rollAttack(x.a)">⚔ Атака</button>
          <button type="button" class="roll-btn" @click="x.a.save ? rollAttack(x.a) : rollDamageOnly(x.a)">Урон</button>
        </div>
      </div>
    </div>

    <div v-if="!locked" class="actions end">
      <ConfirmButton @confirm="newCombat">Новый бой</ConfirmButton>
      <ConfirmButton @confirm="newSession">Новая сессия</ConfirmButton>
    </div>
    <p v-if="!locked" class="hint small">«Новый бой» снимает эффекты, состояния, временные HP и «раз за бой». «Новая сессия» ещё и восполняет ПК.</p>
  </div>
</template>

<style scoped>
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.actions button { padding: 8px 12px; font-size: .8rem; }
.actions.end { margin: 16px 0 4px; }
.small { font-size: .85rem; margin: -4px 0 10px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
.atk { background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; }
.atk-head { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.atk-head b { font-family: var(--font-title); letter-spacing: .04em; }
.atk-head span { color: var(--gold); font-family: var(--font-title); }
.atk small { display: block; color: var(--text-dim); font-size: .8rem; margin: 4px 0 8px; }
.atk-btns { display: flex; gap: 8px; }
.atk-btns button { flex: 1; padding: 8px; font-size: .8rem; }
</style>
