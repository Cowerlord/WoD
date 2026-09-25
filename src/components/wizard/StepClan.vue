<script setup>
import { CONFIG } from "../../data/config.js";
import { CLANS } from "../../data/clans.js";
import { character, editor, rules, clearError } from "../../stores/editor.js";
import TextField from "../common/TextField.vue";
import RuleLink from "../common/RuleLink.vue";
import ClanDetails from "../common/ClanDetails.vue";
import AvatarField from "./AvatarField.vue";

const humanityOptions = Array.from({ length: CONFIG.maxHumanity + 1 }, (_, h) => h);

function selectClan(id) {
  if (character.clanId !== id) character.disciplines = {};
  character.clanId = id;
  clearError(1);
}
</script>

<template>
  <div class="panel">
    <h2>Кто ты, дитя ночи?</h2>
    <TextField v-model="character.name" label="Имя" :max="CONFIG.nameMaxLength" placeholder="Например: Виктор Ланской" />
    <TextField v-model="character.concept" label="Концепт" :max="CONFIG.conceptMaxLength"
               placeholder="Например: Бывший следователь, потерявший веру" />
    <AvatarField />
    <label class="field"><span>Человечность</span>
      <select v-model.number="character.humanity">
        <option v-for="h in humanityOptions" :key="h" :value="h">{{ h }}{{ h === CONFIG.startingHumanity ? " (старт)" : "" }}</option>
      </select>
    </label>
    <label class="field"><span>Поколение</span>
      <select v-model.number="character.generation">
        <option v-for="g in CONFIG.generationOptions" :key="g" :value="g">{{ g }}-е Поколение (Неофит)</option>
      </select>
    </label>
    <p class="hint">Все персонажи начинают Неофитами с Силой Крови 1.
      <RuleLink rule="generations">Что такое Поколение?</RuleLink></p>

    <h3>Клан</h3>
    <div class="card-grid">
      <label v-for="c in CLANS" :key="c.id" class="card" :class="{ selected: c.id === character.clanId }">
        <input type="radio" name="clan" :value="c.id" :checked="c.id === character.clanId" @change="selectClan(c.id)">
        {{ c.name }}<small>{{ c.subName }}</small>
      </label>
    </div>
    <div class="info-box"><ClanDetails v-if="rules.clan()" :clan="rules.clan()">
      <b style="font-family:var(--font-title);color:var(--blood-bright)">{{ rules.clan().name }}</b>
      <i> {{ rules.clan().subName }}</i>
      <template #tags-label>Дисциплины клана: </template>
    </ClanDetails></div>
    <div class="error">{{ editor.errors[1] }}</div>
  </div>
</template>
