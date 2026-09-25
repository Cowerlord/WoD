<script setup>
import { computed, ref, watch } from "vue";
import { character, rules } from "../../stores/editor.js";
import { setHP, setTempHP, setBP, setHumanity, activeChips, removeChip, undo, undoRemove } from "../../stores/play.js";
import { lsGet, lsSet } from "../../lib/storage.js";
import { showImage } from "../../stores/lightbox.js";
import { fmt } from "../../character/format.js";

const s = computed(() => character.session);
const live = computed(() => rules.live());
const stats = computed(() => rules.combatStats());
const hpPercent = computed(() => Math.round((live.value.hp / live.value.max) * 100));
// Свёрнутая шапка не отвлекает во время игры; состояние запоминается
const collapsed = ref(lsGet("wod-play-collapsed") ?? true);
watch(collapsed, v => lsSet("wod-play-collapsed", v));
const chips = computed(() => activeChips());
const props = defineProps({ locked: { type: Boolean, default: false } });
const tapChip = chip => { if (!props.locked) removeChip(chip); };
const stageText = computed(() => {
  if (live.value.hp === 0) return "0 HP";
  return live.value.stage?.level ? `Ранения ур. ${live.value.stage.level}` : "Здоров";
});
</script>

<template>
  <div class="vitals-wrap">
    <div v-if="collapsed" class="strip" :class="{ bad: live.stage?.level || live.severe }" title="Развернуть" @click="collapsed = false">
      <div class="strip-main">
        <b>{{ live.hp }}/{{ live.max }} HP</b><span v-if="s.tempHP" class="temp-hp">+{{ s.tempHP }}</span>
        <b>ПК {{ s.bp }}/{{ rules.maxBP() }}</b>
        <span>{{ stageText }}{{ live.severe ? ` · ${live.severe.cheatName}` : "" }}</span>
        <span class="toggle">▼</span>
      </div>
    </div>

    <div v-else class="vitals" :class="{ locked }">
      <div class="who" title="Свернуть" @click="collapsed = true">
        <div class="ava" :class="{ zoom: character.avatar }" :style="character.avatar ? { backgroundImage: `url('${character.avatar}')` } : {}"
             @click.stop="showImage(character.avatar)"></div>
        <div class="name">
          <b>{{ character.name || "Безымянный" }}</b>
          <small>{{ rules.clan()?.name }} · КД {{ stats.ac }} · Иниц. {{ fmt(stats.init) }} · Скорость {{ stats.speed }}</small>
        </div>
        <span class="stage" :class="{ bad: live.stage?.level || live.severe }">{{ stageText }}{{ live.severe ? ` · ${live.severe.cheatName}` : "" }}</span>
        <span class="toggle">▲</span>
      </div>

      <div class="bar"><i :style="{ width: `${hpPercent}%` }"></i><b>{{ live.hp }} / {{ live.max }} HP</b>
        <em v-if="s.tempHP">+{{ s.tempHP }} врем.</em></div>
      <div class="btns">
        <button type="button" :disabled="locked" @click="setHP(live.hp - 5)">−5</button>
        <button type="button" :disabled="locked" @click="setHP(live.hp - 1)">−1</button>
        <button type="button" :disabled="locked" @click="setHP(live.hp + 1)">+1</button>
        <button type="button" :disabled="locked" @click="setHP(live.hp + 5)">+5</button>
        <span class="temp">врем.
          <button type="button" :disabled="locked" @click="setTempHP(s.tempHP - 1)">−</button>
          <b>{{ s.tempHP }}</b>
          <button type="button" :disabled="locked" @click="setTempHP(s.tempHP + 1)">+</button>
        </span>
      </div>

      <div class="row two">
        <div>
          <span class="field-lbl">Пункты Крови · {{ s.bp }} / {{ rules.maxBP() }}</span>
          <div class="pips">
            <button v-for="n in rules.maxBP()" :key="n" type="button" class="pip" :class="{ full: n <= s.bp }"
                    :disabled="locked" :aria-label="`ПК: ${n}`" @click="setBP(n === s.bp ? n - 1 : n)"></button>
          </div>
        </div>
        <div>
          <span class="field-lbl">Человечность</span>
          <div class="hum">
            <button type="button" :disabled="locked" @click="setHumanity(live.humanity - 1)">−</button>
            <b>{{ live.humanity }}</b>
            <button type="button" :disabled="locked" @click="setHumanity(live.humanity + 1)">+</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="chips.length || undo.text" class="chips">
      <button v-for="c in chips" :key="c.kind + c.key" type="button" class="chip" :disabled="locked"
              :title="locked ? '' : 'Нажмите, чтобы снять'" @click="tapChip(c)">{{ c.label }}</button>
      <span v-if="undo.text" class="undo">{{ undo.text }} · <button type="button" @click="undoRemove">Вернуть</button></span>
    </div>
  </div>
</template>

<style scoped>
.vitals-wrap {
  position: sticky; top: 0; z-index: 6; margin-bottom: 14px;
  background: rgba(21,13,15,.97); border: 1px solid var(--blood); border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,.6);
}
.strip { padding: 8px 12px; cursor: pointer; font-size: .9rem; }
.strip-main { display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
.temp-hp { color: #f0c060 !important; }
.toggle { color: var(--blood-bright); font-size: .75rem; margin-left: auto; }
.who { cursor: pointer; }
.strip b { font-family: var(--font-title); letter-spacing: .03em; }
.strip span { color: var(--text-dim); }
.strip.bad span { color: #ffb3b3; }
.vitals { padding: 12px 14px; }
.who { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.ava { width: 44px; height: 54px; flex: 0 0 auto; border: 1px dashed var(--blood); border-radius: 4px; background: var(--bg-input) center / cover no-repeat; }
.ava.zoom { cursor: zoom-in; }
.name { flex: 1; min-width: 0; }
.name b { display: block; font-family: var(--font-title); letter-spacing: .04em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.name small { color: var(--text-dim); font-size: .8rem; }
.stage { font-size: .8rem; padding: 2px 8px; border: 1px solid var(--border); border-radius: 10px; color: var(--text-dim); white-space: nowrap; }
.stage.bad { color: #ffb3b3; border-color: var(--blood-bright); }
.bar { position: relative; height: 28px; border-radius: 4px; background: var(--bg-input); border: 1px solid var(--border); overflow: hidden; }
.bar i { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, #5c0a10, var(--blood-bright)); transition: width .3s; }
.bar b, .bar em { position: relative; line-height: 26px; padding-left: 10px; font-family: var(--font-title); font-size: .9rem; }
.bar em { font-style: normal; color: #f0c060; }
.btns { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
.btns button, .hum button, .temp button { padding: 4px 12px; font-size: .9rem; letter-spacing: 0; }
.temp { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; color: var(--text-dim); font-size: .85rem; }
.row.two { display: grid; grid-template-columns: 1fr auto; gap: 14px; margin-top: 10px; }
.pips { display: flex; flex-wrap: wrap; gap: 6px; }
.pip { width: 24px; height: 24px; padding: 0; border-radius: 50%; border: 2px solid var(--blood); background: transparent; }
.pip.full { background: var(--blood-bright); box-shadow: 0 0 8px rgba(193,18,31,.6); }
.hum { display: flex; align-items: center; gap: 8px; }
.hum b { min-width: 24px; text-align: center; font-family: var(--font-title); font-size: 1.3rem; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 0 12px 10px; }
.chip { padding: 3px 10px; font-family: var(--font-body); font-size: .85rem; letter-spacing: 0; color: #f0c060; border: 1px solid #f0c060; border-radius: 12px; }
.chip:hover { background: rgba(240,192,96,.12); }
.chip:disabled { opacity: 1; cursor: default; }
.undo { font-size: .8rem; color: var(--text-dim); }
.undo button { padding: 2px 8px; font-size: .75rem; }
.locked button:disabled { opacity: .8; cursor: default; }
@media (max-width: 640px) {
  .row.two { grid-template-columns: 1fr; }
  .temp { margin-left: 0; }
}
</style>
