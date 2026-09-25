<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { dice, hideRoll, reroll, rollFree } from "../../stores/dice.js";
import { fmt } from "../../character/format.js";
import D20 from "./D20.vue";

const r = computed(() => dice.current);
const flicker = ref(20);
let timer = null;
watch(() => dice.rolling, on => {
  clearInterval(timer);
  if (on) timer = setInterval(() => { flicker.value = 1 + Math.floor(Math.random() * 20); }, 60);
});
// Клик мимо закрывает лоток и меню кубиков; новый бросок (строка листа, кнопка броска, меню) — не закрывает лоток
const ROLL_TARGETS = ".tray, .rollable, .roll-btn, .free";
const freeOpen = ref(false);
function onOutside(e) {
  if (dice.current && !e.target.closest(ROLL_TARGETS)) hideRoll();
  if (freeOpen.value && !e.target.closest(".free")) freeOpen.value = false;
}
onMounted(() => document.addEventListener("pointerdown", onOutside));
onBeforeUnmount(() => {
  clearInterval(timer);
  document.removeEventListener("pointerdown", onOutside);
});

const face = computed(() => {
  if (dice.rolling) return flicker.value;
  if (!r.value) return 20;
  if (r.value.free) return r.value.free.value;
  return r.value.d20 ? r.value.d20.kept : r.value.damage?.total ?? "";
});
const tone = computed(() => r.value?.crit ? "crit" : r.value?.fumble ? "fumble" : "");
const modeText = { adv: "с преимуществом", dis: "с помехой" };

const FREE = [4, 6, 8, 10, 12, 20, 100];
</script>

<template>
  <div class="dice-layer no-print">
    <Transition name="tray">
      <div v-if="r" class="tray" :class="tone" @click.self="hideRoll">
        <div class="die"><D20 :key="r.id" :value="face" :rolling="dice.rolling" :tone="tone" /></div>
        <div class="text">
          <div class="label">{{ r.request.label }}</div>
          <template v-if="!dice.rolling">
            <div v-if="r.free" class="total">{{ r.free.value }} <small>из d{{ r.free.sides }}</small></div>
            <template v-else>
              <div v-if="r.d20" class="line">
                <span class="total">{{ r.total }}</span>
                <span class="math">
                  {{ r.d20.rolls.length > 1 ? `d20 ${modeText[r.request.mode]} (` : `d20 (` }}<template v-for="(v, i) in r.d20.rolls" :key="i">{{ i ? ", " : "" }}<b :class="{ dropped: r.d20.rolls.length > 1 && (v !== r.d20.kept || (i && r.d20.rolls[0] === v)) }">{{ v }}</b></template>)
                  {{ r.request.mod ? fmt(r.request.mod) : "" }}
                </span>
              </div>
              <div v-if="r.request.target" class="flag" :class="{ gold: r.total >= r.request.target }">
                {{ r.total >= r.request.target ? "Успех" : "Провал" }} (Сложность {{ r.request.target }})</div>
              <div v-if="r.crit" class="flag gold">Натуральная 20!{{ r.damage ? " Кости урона ×2." : "" }}</div>
              <div v-if="r.crit && r.request.critNote" class="flag gold">{{ r.request.critNote }}</div>
              <div v-else-if="r.fumble" class="flag">Натуральная 1.</div>
              <div v-if="r.damage" class="line dmg">
                <span class="total">{{ r.damage.total }}</span>
                <span class="math">урон {{ r.damage.expr }}{{ r.damage.crit ? " (крит)" : "" }}: {{ r.damage.rolls.join(" + ") }}{{ r.damage.bonus ? ` ${fmt(r.damage.bonus)}` : "" }}</span>
              </div>
              <div v-for="n in r.request.notes || []" :key="n" class="note">{{ n }}</div>
            </template>
          </template>
          <div v-if="!dice.rolling && r.d20" class="again">
            <button type="button" @click="reroll('adv')">С преимуществом</button>
            <button type="button" @click="reroll('dis')">С помехой</button>
            <button type="button" @click="reroll('normal')">Обычно</button>
          </div>
        </div>
        <button type="button" class="x" aria-label="Закрыть" @click="hideRoll">✕</button>
      </div>
    </Transition>

    <div class="free">
      <div v-if="freeOpen" class="free-list">
        <button v-for="s in FREE" :key="s" type="button" @click="rollFree(s)">d{{ s }}</button>
      </div>
      <button type="button" class="fab" :class="{ on: freeOpen }" title="Бросить кубик" aria-label="Бросить кубик"
              @click="freeOpen = !freeOpen">🎲</button>
    </div>
  </div>
</template>

<style scoped>
.tray {
  position: fixed; left: 50%; bottom: 12vh; transform: translateX(-50%); z-index: 15;
  width: min(460px, calc(100vw - 32px)); display: flex; gap: 14px; align-items: center;
  padding: 14px 40px 14px 14px; border: 1px solid var(--blood-bright); border-radius: 8px;
  background: rgba(21,13,15,.96); box-shadow: 0 10px 40px rgba(0,0,0,.8), 0 0 30px rgba(193,18,31,.25);
}
.tray.crit { border-color: #f0c060; }
.die { flex: 0 0 84px; height: 84px; }
.text { flex: 1; min-width: 0; }
.label { font-family: var(--font-title); color: var(--gold); letter-spacing: .05em; font-size: .9rem; }
.line { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.total { font-family: var(--font-title); font-size: 2rem; color: #fff; line-height: 1.1; }
.total small { font-size: .9rem; color: var(--text-dim); }
.dmg .total { font-size: 1.5rem; color: #ffb3b3; }
.math { color: var(--text-dim); font-size: .95rem; }
.math b { color: var(--text); }
.math b.dropped { color: var(--text-dim); text-decoration: line-through; font-weight: 400; }
.flag { color: #ffb3b3; font-size: .9rem; }
.flag.gold { color: #f0c060; }
.note { color: var(--text-dim); font-size: .85rem; font-style: italic; }
.again { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.again button { padding: 4px 10px; font-size: .7rem; }
.x { position: absolute; top: 6px; right: 6px; padding: 2px 8px; border: 0; font-size: .9rem; letter-spacing: 0; }

.free { position: fixed; right: 16px; bottom: 16px; z-index: 14; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.free-list { display: flex; flex-direction: column; gap: 6px; }
.free-list button { padding: 6px 14px; font-size: .8rem; background: var(--bg-panel); }
.fab { width: 52px; height: 52px; padding: 0; border-radius: 50%; font-size: 1.5rem; letter-spacing: 0;
  background: var(--bg-panel); box-shadow: 0 4px 16px rgba(0,0,0,.6); }
.fab.on { background: var(--blood); }

.tray-enter-active { transition: opacity .2s, transform .2s; }
.tray-leave-active { transition: opacity .25s; }
.tray-enter-from { opacity: 0; transform: translate(-50%, 20px); }
.tray-leave-to { opacity: 0; }
@media print { .dice-layer { display: none; } }
</style>
