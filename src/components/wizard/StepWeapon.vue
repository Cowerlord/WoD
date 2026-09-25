<script setup>
import { computed } from "vue";
import { CONFIG } from "../../data/config.js";
import { WEAPONS, UNARMED_ID } from "../../data/weapons.js";
import { ARMOR } from "../../data/armor.js";
import { CLOTHING } from "../../data/clothing.js";
import { CLANS } from "../../data/clans.js";
import { DISCIPLINE_ATTACKS } from "../../data/disciplines.js";
import { character, editor, rules, clearError } from "../../stores/editor.js";
import { fmt, damageFormula, distText, discipline } from "../../character/format.js";
import RuleLink from "../common/RuleLink.vue";
import VSelect from "../common/VSelect.vue";

const w = computed(() => rules.weapon());
const stats = computed(() => w.value && rules.weaponStats(w.value));
const upgrade = computed(() => w.value && rules.weaponUpgrade(w.value));
const claws = computed(() => w.value?.id === UNARMED_ID && rules.hasDisc("protean")
  ? DISCIPLINE_ATTACKS.find(x => x.discipline === "protean" && x.level === 1) : null);

const armorOptions = [
  { value: null, label: "Без брони (КД = 10 + ЛОВ)" },
  ...ARMOR.map(a => ({ value: a.id, label: `${a.name}: КД ${CONFIG.baseAC + a.ac}`, hint: a.note || "без штрафов" })),
];

const lockedFor = c => (c.excludeClans || []).map(id => CLANS.find(x => x.id === id)?.name).join(", ");
const cloth = computed(() => rules.clothing());

function selectClothing(c) {
  if (!rules.clothingAllowed(c)) return;
  character.clothingId = c.id;
  clearError(4);
}

function selectWeapon(id) {
  character.weaponId = id;
  clearError(4);
}
</script>

<template>
  <div class="panel">
    <h2>Оружие</h2>
    <p class="hint">Выберите оружие, с которым ваш персонаж выходит в ночь.
      <RuleLink rule="weapons">Таблица оружия</RuleLink></p>
    <div class="card-grid">
      <label v-for="x in WEAPONS" :key="x.id" class="card" :class="{ selected: x.id === character.weaponId }">
        <input type="radio" name="weapon" :value="x.id" :checked="x.id === character.weaponId" @change="selectWeapon(x.id)">
        {{ x.name }} <small>{{ damageFormula(x, rules.weaponDie(x)) }} · {{ x.type }}</small>
      </label>
    </div>
    <div class="info-box">
      <template v-if="w">
        <b style="font-family:var(--font-title);color:var(--blood-bright)">{{ w.name }}</b>
        <p>Атака: <b>{{ stats.attack }}</b> · Урон: <b>{{ stats.damage }}</b> {{ w.type }} · Дистанция: {{ distText(w.distance) }}</p>
        <p>{{ w.description }}</p>
        <p v-if="upgrade">🩸 Ваше {{ discipline(upgrade.discipline).name }} усиливает удар до <b>{{ upgrade.die }}</b>.</p>
        <p v-if="claws">🩸 {{ claws.name }}: {{ damageFormula(claws) }}, {{ claws.type.toLowerCase() }} урон ({{ claws.note }})</p>
        <p><i>Скрытое ношение:</i>
          <template v-if="w.concealable">Ловкость (Скрытность) против Сложности {{ rules.stealthDC() }} — ваш бросок d20 {{ fmt(rules.stealthRoll()) }}{{ rules.stealthAdvNote() }}.</template>
          <template v-else>{{ w.stealth }}.</template>
          <RuleLink rule="weapons">Подробнее</RuleLink></p>
      </template>
      <span v-else style="color:var(--text-dim);font-style:italic">Выберите оружие.</span>
    </div>

    <h3>Одежда</h3>
    <p class="hint">На старте доступны три стиля; некоторые закрыты для вашего клана.</p>
    <div class="card-grid">
      <label v-for="c in CLOTHING" :key="c.id" class="card"
             :class="{ selected: c.id === character.clothingId, locked: !rules.clothingAllowed(c) }">
        <input type="radio" name="clothing" :value="c.id" :checked="c.id === character.clothingId"
               :disabled="!rules.clothingAllowed(c)" @change="selectClothing(c)">
        {{ c.name }}
        <small v-if="!rules.clothingAllowed(c)">🔒 недоступна: {{ lockedFor(c) }}</small>
        <small v-else>Пакетов крови: {{ c.bloodPacks }}</small>
      </label>
    </div>
    <div v-if="cloth" class="info-box">
      <b style="font-family:var(--font-title);color:var(--blood-bright)">{{ cloth.name }}</b>
      <p>Пакетов крови незаметно: <b>{{ cloth.bloodPacks }}</b> · Оружие: {{ cloth.weapons }}</p>
      <p>{{ cloth.effect }}</p>
    </div>

    <h3>Броня</h3>
    <label class="field armor-field"><span>На старте брони нет — её выдаёт Мастер в игре</span>
      <VSelect v-model="character.armorId" :options="armorOptions" />
    </label>
    <div class="error">{{ editor.errors[4] }}</div>
  </div>
</template>

<style scoped>
.armor-field { max-width: 480px; }
.card.locked { opacity: .45; cursor: not-allowed; }
.card.locked:hover { border-color: var(--border); }
</style>
