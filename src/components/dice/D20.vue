<script setup>
defineProps({
  value: { type: [Number, String], default: 20 },
  rolling: { type: Boolean, default: false },
  tone: { type: String, default: "" },
});
</script>

<template>
  <svg class="d20" :class="[tone, { rolling }]" viewBox="0 0 100 100" aria-hidden="true">
    <polygon class="face" points="50,4 90,27 90,73 50,96 10,73 10,27" />
    <polygon class="inner" points="50,30 73,66 27,66" />
    <polyline class="edge" points="10,27 50,30 50,4 50,30 90,27" />
    <polyline class="edge" points="90,27 73,66 90,73 73,66 50,96" />
    <polyline class="edge" points="50,96 27,66 10,73 27,66 10,27" />
    <text x="50" y="58" text-anchor="middle" dominant-baseline="middle">{{ value }}</text>
  </svg>
</template>

<style scoped>
.d20 { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 0 10px rgba(193,18,31,.6)); }
.face { fill: #3a0508; stroke: var(--blood-bright); stroke-width: 2.5; stroke-linejoin: round; }
.inner { fill: #5c0a10; stroke: var(--blood-bright); stroke-width: 2; stroke-linejoin: round; }
.edge { fill: none; stroke: var(--blood-bright); stroke-width: 1.5; opacity: .7; }
text { fill: #fff; font-family: var(--font-title); font-size: 22px; font-weight: 700; }
.crit { filter: drop-shadow(0 0 14px rgba(255,200,80,.9)); }
.crit .face, .crit .inner, .crit .edge { stroke: #f0c060; }
.fumble .face { fill: #1d1a1b; }
.fumble .face, .fumble .inner, .fumble .edge { stroke: #777; }
.rolling { animation: tumble .75s cubic-bezier(.3,.7,.4,1); }
@keyframes tumble {
  0% { transform: translateY(-60px) rotate(-200deg) scale(.6); opacity: 0; }
  45% { transform: translateY(6px) rotate(40deg) scale(1.05); opacity: 1; }
  70% { transform: translateY(-10px) rotate(-12deg) scale(1); }
  100% { transform: translateY(0) rotate(0) scale(1); }
}
@media (prefers-reduced-motion: reduce) { .rolling { animation: none; } }
</style>
