<script setup>
import { computed, ref } from "vue";
import { ALIGNMENTS } from "../../data/alignment.js";
import Modal from "../common/Modal.vue";

// Колесо мировоззрения: Добро сверху, Зло снизу, Закон слева, Хаос справа, «Истинно нейтральный» — в центре
const props = defineProps({ modelValue: { type: String, default: null }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const hovered = ref(null);

// Угол центра сектора (по часовой от верха) и «сторона» для цвета
const SECTORS = [
  { id: "ng", angle: 0,   tone: "good" },
  { id: "cg", angle: 45,  tone: "good" },
  { id: "cn", angle: 90,  tone: "neutral" },
  { id: "ce", angle: 135, tone: "evil" },
  { id: "ne", angle: 180, tone: "evil" },
  { id: "le", angle: 225, tone: "evil" },
  { id: "ln", angle: 270, tone: "neutral" },
  { id: "lg", angle: 315, tone: "good" },
];
const R_OUT = 150, R_IN = 58, R_TEXT = 106;

const rad = deg => (deg - 90) * Math.PI / 180;
const pt = (r, deg) => [r * Math.cos(rad(deg)), r * Math.sin(rad(deg))];
function sectorPath(a) {
  const [x1, y1] = pt(R_OUT, a - 22.5), [x2, y2] = pt(R_OUT, a + 22.5);
  const [x3, y3] = pt(R_IN, a + 22.5), [x4, y4] = pt(R_IN, a - 22.5);
  return `M${x1} ${y1} A${R_OUT} ${R_OUT} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${R_IN} ${R_IN} 0 0 0 ${x4} ${y4}Z`;
}
const byId = id => ALIGNMENTS.find(a => a.id === id);
// «Законно-добрый» → ["Законно-", "добрый"]; «Истинно нейтральный» → ["Истинно", "нейтральный"]
const lines = id => { const n = byId(id).name; const i = n.search(/[- ]/); return [n.slice(0, i + (n[i] === "-" ? 1 : 0)), n.slice(i + 1)]; };
const textPos = a => pt(R_TEXT, a);

const current = computed(() => byId(props.modelValue));
const shown = computed(() => byId(hovered.value) || current.value);

function pick(id) {
  emit("update:modelValue", id);
  open.value = false;
}
const onKey = (e, id) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(id); } };
</script>

<template>
  <div class="align-field">
    <button type="button" class="align-btn" :disabled="disabled" @click="open = true; hovered = null">
      <span v-if="current">☯ {{ current.name }}</span>
      <span v-else class="placeholder">☯ Выбрать мировоззрение</span>
    </button>
    <small v-if="current" class="align-hint">{{ current.hint }}</small>

    <Modal v-if="open" title="Мировоззрение" @close="open = false">
      <svg class="wheel" viewBox="-185 -185 370 370" role="radiogroup" aria-label="Колесо мировоззрения">
        <text class="axis" x="0" y="-163">ДОБРО</text>
        <text class="axis" x="0" y="175">ЗЛО</text>
        <text class="axis" x="-168" y="4" transform="rotate(-90 -168 0)">ЗАКОН</text>
        <text class="axis" x="168" y="4" transform="rotate(90 168 0)">ХАОС</text>

        <g v-for="s in SECTORS" :key="s.id" class="sector" :class="[s.tone, { on: modelValue === s.id }]"
           role="radio" tabindex="0" :aria-checked="modelValue === s.id" :aria-label="byId(s.id).name"
           @click="pick(s.id)" @keydown="onKey($event, s.id)" @mouseenter="hovered = s.id" @mouseleave="hovered = null"
           @focus="hovered = s.id" @blur="hovered = null">
          <path :d="sectorPath(s.angle)" />
          <text :x="textPos(s.angle)[0]" :y="textPos(s.angle)[1] - 5">{{ lines(s.id)[0] }}</text>
          <text :x="textPos(s.angle)[0]" :y="textPos(s.angle)[1] + 9">{{ lines(s.id)[1] }}</text>
        </g>

        <g class="sector neutral center" :class="{ on: modelValue === 'tn' }" role="radio" tabindex="0"
           :aria-checked="modelValue === 'tn'" aria-label="Истинно нейтральный"
           @click="pick('tn')" @keydown="onKey($event, 'tn')" @mouseenter="hovered = 'tn'" @mouseleave="hovered = null"
           @focus="hovered = 'tn'" @blur="hovered = null">
          <circle r="54" />
          <text y="-3">Истинно</text>
          <text y="11">нейтральный</text>
        </g>
      </svg>

      <div class="preview">
        <b>{{ shown ? shown.name : "Наведите на сектор" }}</b>
        <p>{{ shown ? shown.hint : "Мировоззрение задаёт отыгрыш и на механику не влияет." }}</p>
      </div>
      <div class="wheel-actions">
        <button v-if="modelValue" type="button" @click="pick(null)">Не выбирать</button>
        <button type="button" @click="open = false">Отмена</button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.align-btn { width: 100%; text-align: left; letter-spacing: .04em; }
.align-btn .placeholder { color: var(--text-dim); }
.align-hint { display: block; margin-top: 4px; color: var(--text-dim); font-style: italic; }

.wheel { display: block; width: 100%; max-width: 380px; margin: 0 auto; user-select: none; }
.wheel text { text-anchor: middle; font-family: var(--font-body); font-size: 11px; fill: var(--text); pointer-events: none; }
.wheel .axis { font-family: var(--font-title); font-size: 12px; letter-spacing: .2em; fill: var(--gold); }
.sector { cursor: pointer; outline: none; }
.sector path, .sector circle { stroke: var(--bg); stroke-width: 2; transition: fill .15s, filter .15s; }
.sector.good path { fill: #3b3423; }
.sector.neutral path, .sector.neutral circle { fill: #2a2428; }
.sector.evil path { fill: #3d0d12; }
.sector:hover path, .sector:hover circle, .sector:focus-visible path, .sector:focus-visible circle { filter: brightness(1.7); }
.sector.on path, .sector.on circle { fill: var(--blood); filter: none; }
.sector.on text { fill: #fff; font-weight: 700; }
.sector:focus-visible path, .sector:focus-visible circle { stroke: var(--gold); }

.preview { text-align: center; min-height: 3.6em; margin-top: 8px; }
.preview b { font-family: var(--font-title); color: var(--blood-bright); letter-spacing: .06em; }
.preview p { margin: 4px 0 0; color: var(--text-dim); }
.wheel-actions { display: flex; justify-content: center; gap: 10px; margin-top: 12px; }
.wheel-actions button { padding: 8px 18px; }
</style>
