<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";

// options: [{ value, label, disabled?, hint?, group? }]
// Список часто стоит внутри <label>: клики по нему отменяются (prevent), иначе label снова «нажмёт» кнопку и откроет список
const props = defineProps({
  modelValue: { type: null, default: null },
  options: { type: Array, required: true },
  placeholder: { type: String, default: "—" },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const root = ref(null);
const list = ref(null);
const open = ref(false);
const up = ref(false);
const active = ref(-1);

const selected = computed(() => props.options.find(o => o.value === props.modelValue) || null);
const enabled = i => props.options[i] && !props.options[i].disabled;

function onOutside(e) {
  if (!root.value?.contains(e.target)) close();
}

async function show() {
  if (props.disabled) return;
  const box = root.value.getBoundingClientRect();
  const below = window.innerHeight - box.bottom;
  up.value = below < 280 && box.top > below;
  active.value = Math.max(0, props.options.findIndex(o => o.value === props.modelValue));
  if (!enabled(active.value)) active.value = props.options.findIndex(o => !o.disabled);
  open.value = true;
  document.addEventListener("pointerdown", onOutside);
  await nextTick();
  list.value?.querySelector(".active")?.scrollIntoView({ block: "nearest" });
}

function close() {
  open.value = false;
  document.removeEventListener("pointerdown", onOutside);
}

function choose(o) {
  if (o.disabled) return;
  emit("update:modelValue", o.value);
  close();
}

function move(step) {
  let i = active.value;
  for (let n = 0; n < props.options.length; n++) {
    i = (i + step + props.options.length) % props.options.length;
    if (enabled(i)) break;
  }
  active.value = i;
  nextTick(() => list.value?.querySelector(".active")?.scrollIntoView({ block: "nearest" }));
}

function onKey(e) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (!open.value) show();
    else move(e.key === "ArrowDown" ? 1 : -1);
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (open.value && enabled(active.value)) choose(props.options[active.value]);
    else if (!open.value) show();
  } else if (e.key === "Escape" || e.key === "Tab") {
    close();
  }
}

onBeforeUnmount(close);
</script>

<template>
  <div ref="root" class="vselect" :class="{ open, up, disabled }">
    <button type="button" class="vs-btn" :disabled="disabled" aria-haspopup="listbox" :aria-expanded="open"
            @click="open ? close() : show()" @keydown="onKey">
      <div class="vs-value" :class="{ placeholder: !selected }">{{ selected?.label ?? placeholder }}</div>
      <div class="vs-arrow">▾</div>
    </button>
    <div v-if="open" ref="list" class="vs-list" role="listbox" @click.prevent>
      <template v-for="(o, i) in options" :key="String(o.value)">
        <div v-if="o.group && o.group !== options[i - 1]?.group" class="vs-group">{{ o.group }}</div>
        <div role="option" class="vs-opt" :class="{ sel: o.value === modelValue, active: i === active, off: o.disabled }"
             :aria-selected="o.value === modelValue" :aria-disabled="!!o.disabled"
             @mousedown.prevent @mouseenter="enabled(i) && (active = i)" @click.prevent="choose(o)">
          {{ o.label }}<small v-if="o.hint" class="vs-hint">{{ o.hint }}</small>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.vselect { position: relative; width: 100%; }
.vs-btn {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 10px 12px; text-align: left; font: inherit; letter-spacing: 0;
  background: var(--bg-input); color: var(--text); border: 1px solid var(--border); border-radius: 4px;
}
.vs-btn:hover { background: var(--bg-input); border-color: var(--blood); }
.vs-btn:focus-visible, .open .vs-btn { outline: none; border-color: var(--blood-bright); box-shadow: 0 0 0 2px rgba(193,18,31,.25); }
.vs-btn:disabled { opacity: .8; cursor: default; border-color: var(--border); }
.vs-value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vs-value.placeholder { color: var(--text-dim); }
.vs-arrow { color: var(--blood-bright); transition: transform .15s; }
.open .vs-arrow { transform: rotate(180deg); }
.vs-list {
  position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 30;
  max-height: 280px; overflow-y: auto; padding: 4px 0; text-align: left;
  background: var(--bg-panel); border: 1px solid var(--blood); border-radius: 4px;
  box-shadow: 0 12px 30px rgba(0,0,0,.7);
}
.up .vs-list { top: auto; bottom: calc(100% + 4px); }
.vs-group {
  padding: 8px 12px 4px; font-family: var(--font-title); font-size: .7rem; letter-spacing: .08em;
  text-transform: uppercase; color: var(--gold);
}
.vs-opt { padding: 7px 12px; cursor: pointer; line-height: 1.25; }
.vs-opt.active { background: rgba(193,18,31,.2); }
.vs-opt.sel { color: #fff; background: rgba(139,0,0,.45); }
.vs-opt.off { color: #5a4a48; cursor: not-allowed; }
.vs-hint { display: block; font-size: .8rem; color: var(--text-dim); font-style: italic; }
.vs-opt.off .vs-hint { color: #5a4a48; }
</style>
