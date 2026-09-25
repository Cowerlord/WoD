<script setup>
import { ABILITIES } from "../../data/config.js";
import { SKILLS, SKILL_PICKS } from "../../data/skills.js";
import { character, rules, clearError } from "../../stores/editor.js";
import { skillById } from "../../character/rules.js";
import { abbrOf } from "../../character/format.js";

const groups = ABILITIES.map(a => ({ a, list: SKILLS.filter(k => k.ability === a.key) })).filter(g => g.list.length);
const clanSkill = () => skillById(rules.clanSkillId());

function disabled(pick, sk) {
  const other = SKILL_PICKS.find(o => o.key !== pick.key);
  return sk.id === rules.clanSkillId() || sk.id === character.skills[other.key] || !rules.skillAllowed(sk);
}
const why = sk => !rules.skillAllowed(sk) ? " (нужен Анимализм)" : sk.id === rules.clanSkillId() ? " (уже от клана)" : "";

function choose(pick, id) {
  character.skills[pick.key] = id || null;
  clearError(3);
}
</script>

<template>
  <div>
    <p class="clan-skill">От клана: <b>{{ clanSkill() ? `${clanSkill().name} +2` : "—" }}</b>
      <span v-if="clanSkill()" class="hint"> ({{ abbrOf(clanSkill().ability) }})</span></p>
    <div class="skill-row">
      <label v-for="p in SKILL_PICKS" :key="p.key" class="field skill-pick"><span>Навык +{{ p.bonus }}</span>
        <select :value="character.skills[p.key] ?? ''" @change="choose(p, $event.target.value)">
          <option value="">—</option>
          <optgroup v-for="g in groups" :key="g.a.key" :label="g.a.name">
            <option v-for="k in g.list" :key="k.id" :value="k.id" :disabled="disabled(p, k)">{{ k.name }}{{ why(k) }}</option>
          </optgroup>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.skill-row { display: flex; gap: 12px; flex-wrap: wrap; }
.skill-pick { flex: 1 1 220px; }
.clan-skill { margin: 0 0 10px; }
</style>
