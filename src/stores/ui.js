import { reactive } from "vue";

export const ui = reactive({
  mode: "create",
  ruleTarget: null,
});

export function setMode(mode, ruleTarget = null) {
  ui.mode = mode;
  ui.ruleTarget = ruleTarget;
}
