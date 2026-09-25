<script setup>
import { character, rules } from "../../stores/editor.js";
import SheetAbilities from "./SheetAbilities.vue";
import SheetCombat from "./SheetCombat.vue";
import SheetSkills from "./SheetSkills.vue";
import SheetDisciplines from "./SheetDisciplines.vue";
</script>

<template>
  <div id="sheet" class="sheet">
    <section class="sh-head">
      <div><span class="lbl">Имя</span><div class="sh-name" :class="{ long: character.name.length > 24 }">{{ character.name || "Безымянный" }}</div></div>
      <div><span class="lbl">Концепт</span>{{ character.concept || "—" }}</div>
      <div><span class="lbl">Клан</span>{{ rules.clan()?.name ?? "—" }}</div>
      <div><span class="lbl">Поколение</span>{{ character.generation }}-е</div>
      <div><span class="lbl">Сила Крови</span>{{ character.bloodPotency }}</div>
    </section>
    <div class="sh-cols">
      <SheetAbilities />
      <SheetCombat />
      <SheetSkills />
      <SheetDisciplines />
    </div>
  </div>
</template>
