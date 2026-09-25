<script setup>
import { nextTick, onMounted, watch } from "vue";
import { ui } from "../../stores/ui.js";
import RulesBasics from "./RulesBasics.vue";
import RulesClans from "./RulesClans.vue";
import RulesDisciplines from "./RulesDisciplines.vue";
import RulesWeapons from "./RulesWeapons.vue";
import RulesWounds from "./RulesWounds.vue";
import RulesFeeding from "./RulesFeeding.vue";
import RulesBeast from "./RulesBeast.vue";
import RulesSkills from "./RulesSkills.vue";
import RulesArmor from "./RulesArmor.vue";
import RulesHumanity from "./RulesHumanity.vue";
import RulesGenerations from "./RulesGenerations.vue";

const sections = [
  { id: "basics", title: "Основы", component: RulesBasics },
  { id: "clans", title: "Кланы", component: RulesClans },
  { id: "disciplines", title: "Дисциплины", component: RulesDisciplines },
  { id: "weapons", title: "Оружие", component: RulesWeapons },
  { id: "wounds", title: "Урон и ранения", component: RulesWounds },
  { id: "feeding", title: "Питание", component: RulesFeeding },
  { id: "beast", title: "Зверь и Узы Крови", component: RulesBeast },
  { id: "skills", title: "Навыки", component: RulesSkills },
  { id: "armor", title: "Броня", component: RulesArmor },
  { id: "humanity", title: "Человечность", component: RulesHumanity },
  { id: "generations", title: "Поколение и Сила Крови", component: RulesGenerations },
];

const scrollTo = id => document.getElementById(`rule-${id}`)?.scrollIntoView({ behavior: "smooth" });

async function showTarget() {
  await nextTick();
  if (ui.ruleTarget) scrollTo(ui.ruleTarget);
  else window.scrollTo({ top: 0 });
}

onMounted(showTarget);
watch(() => ui.ruleTarget, showTarget);
</script>

<template>
  <div id="mode-rules">
    <div class="rules">
      <nav class="rules-toc">
        <a v-for="s in sections" :key="s.id" :href="`#rule-${s.id}`" @click.prevent="scrollTo(s.id)">{{ s.title }}</a>
      </nav>
      <div class="rules-body">
        <section v-for="s in sections" :id="`rule-${s.id}`" :key="s.id" class="panel">
          <h2>{{ s.title }}</h2>
          <component :is="s.component" />
        </section>
      </div>
    </div>
  </div>
</template>
