<script setup>
import { computed } from "vue";
import { WOUND_STAGES, HEALING } from "../../data/combat.js";
import { BEAST, BEAST_FAIL, HUMANITY_SCALE } from "../../data/beast.js";
import { FEEDING } from "../../data/feeding.js";
import { character, rules } from "../../stores/editor.js";
import { fmt, woundRange } from "../../character/format.js";
import { rollSave, rollGrapple, rollHeal } from "../../stores/rolls.js";

const clan = computed(() => rules.clan());
const maxHP = computed(() => rules.combatStats().hp);

const currentStage = computed(() => rules.live().stage?.level ?? null);

const baneTitle = computed(() => clan.value.bane.name === "Слабость клана" ? clan.value.name : clan.value.bane.name);
const humanityLine = HUMANITY_SCALE.charAt(0).toLowerCase() + HUMANITY_SCALE.slice(1);
</script>

<template>
  <div id="cheat" class="sheet cheat">
    <section class="sh-head" style="grid-template-columns: 2fr 1fr 1fr">
      <div><span class="lbl">Шпаргалка</span><div class="sh-name">{{ character.name || "Безымянный" }}</div></div>
      <div><span class="lbl">Клан</span>{{ clan?.name ?? "—" }}</div>
      <div><span class="lbl">Макс. HP</span>{{ maxHP }}</div>
    </section>

    <section>
      <h2>Стадии ранений</h2>
      <table>
        <thead><tr><th></th><th>Уровень</th><th>HP</th><th>Эффект</th></tr></thead>
        <tbody>
          <tr v-for="w in WOUND_STAGES.filter(x => x.level > 0)" :key="w.level" :class="{ current: w.level === currentStage }">
            <td><span class="box"></span></td>
            <td style="white-space:nowrap"><b>Уровень {{ w.level }}</b>{{ w.cheatName ? ` (${w.cheatName})` : "" }}</td>
            <td style="white-space:nowrap">{{ woundRange(w, maxHP) }}</td>
            <td>{{ w.short || w.effects.join(" ") }}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin:4px 0 0;font-size:9.5pt"><b>Крит</b> (натуральная 20): кости урона ×2; аггр. атакой — тяжёлое ранение без спасброска.
        <b>Солнце:</b> 1d10 аггр. за ход; <b>огонь:</b> 2d6 (свеча 1d4); по вампиру ×2{{ clan?.id === "lasombra" ? " (у вас ×3)" : "" }}.</p>
    </section>

    <section v-if="clan?.bane">
      <h2>Клановая слабость — {{ baneTitle }}</h2>
      <p style="margin:0">{{ clan.bane.text }}</p>
      <div v-if="clan.id === 'malkavian'" class="lines" style="margin-top:4px"><div>Моё расстройство:</div></div>
    </section>

    <section>
      <h2>Зверь (Бешенство)</h2>
      <table>
        <thead><tr><th>Триггер</th><th>Сл.</th><th>При провале</th></tr></thead>
        <tbody>
          <tr v-for="b in BEAST" :key="b.id">
            <td><b>{{ b.name }}:</b> {{ b.trigger }}<template v-if="b.clan?.[clan?.id]"> — <b>у вас {{ b.clan[clan.id] }}</b></template></td>
            <td>{{ b.dc }}{{ b.id === "rage" && clan?.id === "brujah" ? " (14 в Праведном гневе)" : "" }}</td>
            <td>{{ b.fail }}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin:4px 0 0;font-size:9.5pt"><span class="rollable" @click="rollSave('wis', 'Бешенство: спасбросок ВОС')">Спасбросок ВОС d20 {{ fmt(rules.mod("wis")) }}.</span> {{ BEAST_FAIL }}
        Человечность — {{ humanityLine }}</p>
    </section>

    <section>
      <h2>Питание и кровь</h2>
      <ul>
        <li v-for="f in FEEDING" :key="f.name"><b>{{ f.name }}:</b> {{ f.text }}
          <template v-if="f.name === 'Голодное Безумие' && clan?.id === 'gangrel'"> Гангрел — без спасброска (см. слабость клана).</template>
          <b v-if="f.name === 'Захват'" class="rollable" @click="rollGrapple"> Ваш бросок: d20 {{ fmt(rules.mod("str") + rules.skillBonus("athletics")) }}.</b>
        </li>
        <li><b class="rollable" @click="rollHeal">Лечение</b> <span class="box"></span> (раз за бой): {{ HEALING.cost }} → {{ rules.healAmount() }} HP (1d4 + ИНТ), бонусное действие.
          Нельзя во время питья, на 3-м уровне ранений и в течение 1 хода после аггр. урона.</li>
      </ul>
    </section>
  </div>
</template>
