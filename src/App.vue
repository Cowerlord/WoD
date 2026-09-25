<script setup>
import { watch } from "vue";
import { auth } from "./stores/auth.js";
import { ui } from "./stores/ui.js";
import { editor, saveCurrent } from "./stores/editor.js";
import { roster } from "./stores/roster.js";
import AppHeader from "./components/AppHeader.vue";
import LoginScreen from "./components/LoginScreen.vue";
import Wizard from "./components/wizard/Wizard.vue";
import MyCharacters from "./components/roster/MyCharacters.vue";
import AllCharacters from "./components/roster/AllCharacters.vue";
import RulesPage from "./components/rules/RulesPage.vue";

watch(() => ui.mode, (mode, prev) => {
  if (prev === "roster") roster.error = "";
  if (prev === "all") editor.allError = "";
  if (mode === "roster" || mode === "all") {
    saveCurrent();
    window.scrollTo({ top: 0 });
  }
});
</script>

<template>
  <div class="app" :class="{ readonly: editor.owner.readOnly }">
    <AppHeader />
    <LoginScreen v-if="auth.status !== 'in'" />
    <template v-else>
      <RulesPage v-if="ui.mode === 'rules'" />
      <MyCharacters v-else-if="ui.mode === 'roster'" />
      <AllCharacters v-else-if="ui.mode === 'all'" />
      <Wizard v-show="ui.mode === 'create'" />
    </template>
  </div>
</template>
