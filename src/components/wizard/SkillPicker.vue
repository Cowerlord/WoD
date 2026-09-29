<script setup>
import { ABILITIES } from "../../data/config.js";
import { SKILLS, CORE_SKILLS, SKILL_PICKS } from "../../data/skills.js";
import { character, editor, rules, clearError, buildLocked } from "../../stores/editor.js";
import { isAdmin } from "../../stores/auth.js";
import { skillById } from "../../character/rules.js";
import { abbrOf, fmt } from "../../character/format.js";
import VSelect from "../common/VSelect.vue";
import SkillsTable from "../common/SkillsTable.vue";
import LevelPanel from "./LevelPanel.vue";

const choiceSkills = SKILLS.filter(k => k.abilities);

function disabled(pick, sk) {
  const other = SKILL_PICKS.find(o => o.key !== pick.key);
  return sk.id === rules.clanSkillId() || sk.id === character.skills[other.key];
}
const optionsFor = pick => [
  { value: null, label: "—" },
  ...CORE_SKILLS.map(k => ({
    value: k.id, label: k.name, disabled: disabled(pick, k),
    group: k.abilities ? k.abilities.map(abbrOf).join(" / ") : ABILITIES.find(a => a.key === k.ability).name,
    hint: k.id === rules.clanSkillId() ? "уже от клана" : "",
  })),
];

const frozen = () => editor.owner.readOnly || buildLocked();

function choose(pick, id) {
  if (frozen()) return;
  character.skills[pick.key] = id || null;
  clearError(3);
}

// Клан: дополнительный навык +2 или один из основных +1
const clanOptions = () => rules.clanSkillOptions().map((id, i) => ({ id, sk: skillById(id), value: i === 0 ? 2 : 1 }));
function chooseClan(id) {
  if (frozen()) return;
  character.clanSkill = id;
  for (const p of SKILL_PICKS) if (character.skills[p.key] === id) character.skills[p.key] = null;   // клановый навык нельзя выбрать ещё раз
  clearError(3);
}

function setAbility(skillId, ability) {
  if (frozen()) return;
  if (!character.skillAbility) character.skillAbility = {};
  character.skillAbility[skillId] = ability;
}
</script>

<template>
  <div>
    <div v-if="rules.clan()" class="clan-choice">
      <span class="field-title">Навык от клана — {{ rules.clan().name }}</span>
      <div class="clan-opts">
        <label v-for="o in clanOptions()" :key="o.id" class="clan-opt" :class="{ on: rules.clanSkillId() === o.id && character.clanSkill }">
          <input type="radio" name="clan-skill" :value="o.id" :checked="character.clanSkill === o.id"
                 :disabled="frozen()" @change="chooseClan(o.id)">
          <b>{{ o.sk.name }} +{{ o.value }}</b>
          <small>{{ o.sk.core ? "основной" : "дополнительный" }} · {{ o.sk.hint }}</small>
        </label>
      </div>
    </div>

    <div class="skill-row">
      <label v-for="p in SKILL_PICKS" :key="p.key" class="field skill-pick"><span>Основной навык +{{ p.bonus }}</span>
        <VSelect :model-value="character.skills[p.key]" :options="optionsFor(p)" :disabled="frozen()"
                 @update:model-value="choose(p, $event)" />
        <small v-if="skillById(character.skills[p.key])" class="skill-hint">{{ skillById(character.skills[p.key]).hint }}</small>
      </label>
    </div>

    <div v-for="sk in choiceSkills" :key="sk.id" class="ability-choice">
      <span>{{ sk.name }} бросается через:</span>
      <button v-for="a in sk.abilities" :key="a" type="button" :class="{ on: rules.skillAbility(sk) === a }"
              :disabled="frozen()" @click="setAbility(sk.id, a)">
        {{ ABILITIES.find(x => x.key === a).name }} ({{ fmt(rules.mod(a)) }})</button>
    </div>

    <h3>Ваши навыки</h3>
    <SkillsTable class="picker-table" :edit="isAdmin()" />
    <p v-if="isAdmin()" class="hint">Мастер: −/+ в таблице — навыки, выданные за события и уровни (потолок навыка +5).</p>
    <LevelPanel v-if="isAdmin()" />
  </div>
</template>

<style scoped>
.field-title { display: block; font-family: var(--font-title); font-size: .8rem; letter-spacing: .08em; color: var(--gold); margin-bottom: 6px; }
.clan-choice { margin-bottom: 14px; }
.clan-opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
.clan-opt {
  display: grid; gap: 2px; padding: 8px 10px; cursor: pointer;
  background: var(--bg-input); border: 1px solid var(--border); border-radius: 4px;
}
.clan-opt input { position: absolute; opacity: 0; pointer-events: none; }
.clan-opt.on { border-color: var(--blood-bright); background: rgba(139,0,0,.2); }
.clan-opt small { color: var(--text-dim); }
.skill-hint { display: block; margin-top: 4px; color: var(--text-dim); font-style: italic; font-family: var(--font-body); letter-spacing: 0; text-transform: none; font-size: .85rem; }
.skill-row { display: flex; gap: 12px; flex-wrap: wrap; }
.skill-pick { flex: 1 1 220px; }
.ability-choice { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 4px 0 12px; }
.ability-choice button { padding: 4px 12px; font-size: .85rem; }
.ability-choice button.on { background: var(--blood); color: #fff; }
.picker-table { width: 100%; max-width: 520px; }
.picker-table :deep(td), .picker-table :deep(th) { padding: 3px 6px; border-bottom: 1px solid var(--border); }
.picker-table :deep(tr.own td) { color: var(--gold); font-weight: 700; }
</style>
