<script setup>
import { ABILITIES, CONFIG } from "../../data/config.js";
import { BLOOD_SURGE } from "../../data/blood.js";
import { HUMANITY_SCALE } from "../../data/beast.js";
import { character, rules } from "../../stores/editor.js";
import { fmt } from "../../character/format.js";
</script>

<template>
  <section>
    <div class="portrait" :style="character.avatar ? { backgroundImage: `url('${character.avatar}')` } : {}">
      <span v-if="!character.avatar" class="lbl">Портрет</span>
    </div>
    <h2>Характеристики</h2>
    <table class="ab-table"><tbody>
      <tr v-for="a in ABILITIES" :key="a.key">
        <td class="ab-n">{{ a.abbr }}</td>
        <td class="ab-v">{{ character.abilities[a.key] ?? "—" }}</td>
        <td class="ab-m">{{ fmt(rules.mod(a.key)) }}</td>
      </tr>
    </tbody></table>
    <p class="surge"><b>{{ BLOOD_SURGE.name }}</b> — бонусное, {{ BLOOD_SURGE.cost }}:
      +{{ BLOOD_SURGE.scoreBonus }} к любой характеристике (мод. +1) до конца боя.</p>
    <div class="hum">
      <span class="lbl">Человечность · на старте {{ character.humanity }}</span>
      <span class="track"><i v-for="n in CONFIG.maxHumanity" :key="n"></i></span>
      <div class="note">{{ HUMANITY_SCALE }}</div>
    </div>
  </section>
</template>
