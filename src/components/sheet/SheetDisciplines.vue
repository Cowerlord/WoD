<script setup>
import { DISCIPLINE_ATTACKS } from "../../data/disciplines.js";
import { rules } from "../../stores/editor.js";
import { discipline, levelTag, abbrOf } from "../../character/format.js";
import { rollAttack } from "../../stores/rolls.js";

const levelsOf = lvl => Array.from({ length: lvl }, (_, i) => i + 1);
const shortText = (id, k) => rules.fillTokens(discipline(id).short?.[k] ?? discipline(id).levels[k] ?? "");
const attacksOf = (id, lvl) => DISCIPLINE_ATTACKS.filter(a => a.discipline === id && a.level <= lvl);

function attackLine(a) {
  const st = rules.weaponStats(a);
  const roll = a.save ? `цель: спасбросок ${abbrOf(a.save)}${a.dc ? ` (Сл. ${rules.saveDCof(a)})` : ""}` : `попадание d20 ${st.attack}`;
  const severe = a.aggr ? ` · аггр., тяжёлое ранение: Сл. ${rules.severeDC(a)}` : "";
  return `⚔ ${a.name.replace(/\s*\(.*\)$/, "")}: ${roll}, урон ${st.damage} · дист. ${a.distance.join("–")}${severe}`;
}
</script>

<template>
  <section>
    <h2>Дисциплины</h2>
    <div v-for="[id, lvl] in rules.learnedDisciplines()" :key="id" class="dsc">
      <div class="dsc-name">{{ discipline(id).name }} (Уровень {{ lvl }})</div>
      <p v-for="k in levelsOf(lvl)" :key="k">
        <span class="lv">Ур {{ k }} ({{ levelTag(discipline(id).levels[k] || "") }}):</span> {{ shortText(id, k) }}
      </p>
      <p v-for="a in attacksOf(id, lvl)" :key="a.name" class="atk rollable" title="Бросить" @click="rollAttack(a)">{{ attackLine(a) }}</p>
    </div>
    <p v-if="!rules.learnedDisciplines().length" class="note">—</p>
    <div v-if="rules.clan()?.ability" class="dsc">
      <div class="dsc-name">{{ rules.clan().ability.name }} (клановая)</div>
      <p><span class="lv">{{ rules.clan().ability.cost }}:</span> {{ rules.clan().ability.text }}</p>
    </div>
  </section>
</template>
