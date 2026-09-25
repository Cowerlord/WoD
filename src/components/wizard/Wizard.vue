<script setup>
import { TOTAL_STEPS } from "../../data/config.js";
import { character, editor, isOthers, goTo, nextStep, jumpTo, startNew, closeView } from "../../stores/editor.js";
import StepClan from "./StepClan.vue";
import StepAbilities from "./StepAbilities.vue";
import StepDisciplines from "./StepDisciplines.vue";
import StepWeapon from "./StepWeapon.vue";
import StepSheet from "./StepSheet.vue";

const steps = [
  { title: "Клан", component: StepClan },
  { title: "Характеристики", component: StepAbilities },
  { title: "Дисциплины", component: StepDisciplines },
  { title: "Оружие", component: StepWeapon },
  { title: "Лист", component: StepSheet },
];
</script>

<template>
  <div id="mode-create">
    <div v-if="isOthers()" class="view-banner">
      <span v-if="editor.owner.readOnly">Персонаж игрока <b>{{ editor.owner.name }}</b> — только просмотр.</span>
      <span v-else>Вы редактируете персонажа игрока <b>{{ editor.owner.name }}</b> как админ. Изменения сохраняются автоматически.</span>
      <button type="button" @click="closeView">← К списку</button>
    </div>

    <ol class="steps">
      <li v-for="(s, i) in steps" :key="s.title"
          :class="{ active: character.step === i + 1, done: character.step > i + 1 }" @click="jumpTo(i + 1)">
        {{ s.title }}
      </li>
    </ol>

    <div v-for="(s, i) in steps" :id="`step-${i + 1}`" :key="s.title" class="step" :class="{ active: character.step === i + 1 }">
      <component :is="s.component" />
    </div>

    <div class="nav">
      <button type="button" :disabled="character.step === 1" @click="goTo(character.step - 1)">← Назад</button>
      <button type="button" class="no-print" @click="startNew">+ Новый персонаж</button>
      <span class="spacer"></span>
      <button v-show="character.step < TOTAL_STEPS" type="button" class="primary" @click="nextStep">Далее →</button>
    </div>
  </div>
</template>

<style scoped>
.steps {
  display: flex; gap: 6px; list-style: none; padding: 0; margin: 0 0 24px;
  counter-reset: step;
}
.steps li {
  flex: 1; text-align: center; padding: 10px 4px; cursor: pointer;
  font-family: var(--font-title); font-size: .78rem; letter-spacing: .06em;
  border-bottom: 3px solid var(--border); color: var(--text-dim);
  transition: .2s;
}
.steps li::before { counter-increment: step; content: counter(step) ". "; }
.steps li.active { color: var(--text); border-color: var(--blood-bright); }
.steps li.done { color: var(--gold); border-color: var(--blood); }

.step { display: none; }
.step.active { display: block; animation: fade .3s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.view-banner {
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px;
  padding: 10px 14px; border: 1px solid var(--gold); border-radius: 4px; background: rgba(184,155,94,.1);
}
.view-banner span { flex: 1 1 240px; }
.view-banner button { padding: 6px 14px; font-size: .8rem; }

.nav { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; }
.nav .spacer { flex: 1; }
.app.readonly .steps, .app.readonly .nav { display: none; }

@media (max-width: 640px) {
  .steps li { font-size: 0; }
  .steps li::before { font-size: .8rem; }
}
</style>
