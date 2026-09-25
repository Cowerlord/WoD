<script setup>
import { CONFIG } from "../../data/config.js";
import { CLANS } from "../../data/clans.js";
import { character, editor, rules, clearError } from "../../stores/editor.js";
import TextField from "../common/TextField.vue";
import RuleLink from "../common/RuleLink.vue";
import ClanDetails from "../common/ClanDetails.vue";
import AvatarField from "./AvatarField.vue";
import VSelect from "../common/VSelect.vue";
import { generationInfo } from "../../data/blood.js";
import { isAdmin } from "../../stores/auth.js";

const humanityOptions = Array.from({ length: CONFIG.maxHumanity + 1 }, (_, h) =>
  ({ value: h, label: `${h}${h === CONFIG.startingHumanity ? " (старт)" : ""}` }));
const genLabel = g => `${g}-е Поколение (${generationInfo(g).status})`;
const generationOptions = CONFIG.adminGenerations.map(g => ({
  value: g, label: genLabel(g), hint: `Сила Крови ${generationInfo(g).potency}, до ${generationInfo(g).maxBP} ПК`,
}));

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
      <VSelect v-model="character.humanity" :options="humanityOptions" />
    </label>
    <label v-if="isAdmin()" class="field"><span>Поколение (меняет только Мастер)</span>
      <VSelect v-model="character.generation" :options="generationOptions" />
    </label>
    <p v-else class="gen">Поколение: <b>{{ genLabel(character.generation) }}</b>, Сила Крови {{ character.bloodPotency }}</p>
    <p class="hint">Все персонажи начинают Неофитами 12-го Поколения; Поколение меняет только Мастер.
      <RuleLink rule="generations">Что такое Поколение?</RuleLink></p>

    <h3>Клан</h3>
    <div class="card-grid">
      <label v-for="c in CLANS" :key="c.id" class="card" :class="{ selected: c.id === character.clanId }">
        <input type="radio" name="clan" :value="c.id" :checked="c.id === character.clanId" @change="selectClan(c.id)">
        {{ c.name }} <small> {{ c.subName }}</small>
      </label>
    </div>
    <div class="info-box"><ClanDetails v-if="rules.clan()" :clan="rules.clan()">
      <b style="font-family:var(--font-title);color:var(--blood-bright)">{{ rules.clan().name }} - </b>
      <i> {{ rules.clan().subName }}</i>
      <template #tags-label>Дисциплины клана: </template>
    </ClanDetails></div>
    <div class="error">{{ editor.errors[1] }}</div>
  </div>
</template>

<style scoped>
.gen { margin: 0 0 14px; }
.gen b { color: var(--gold); }
</style>
