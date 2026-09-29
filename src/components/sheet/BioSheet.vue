<script setup>
import { computed } from "vue";
import { BIO_FIELDS } from "../../data/bio.js";
import { character, rules } from "../../stores/editor.js";
import { alignmentName } from "../../data/alignment.js";
import { RETAINER_KINDS } from "../../data/retainers.js";

const clan = computed(() => rules.clan());
const text = id => (character.bio?.[id] ?? "").trim();
</script>

<template>
  <div id="bio" class="sheet bio">
    <section class="sh-head" style="grid-template-columns: 2fr 2fr 1fr">
      <div><span class="lbl">Описание персонажа</span><div class="sh-name">{{ character.name || "Безымянный" }}</div></div>
      <div><span class="lbl">Концепт</span>{{ character.concept || "—" }}
        <div v-if="alignmentName(character.alignment)" class="note">Мировоззрение: {{ alignmentName(character.alignment) }}</div></div>
      <div><span class="lbl">Клан</span>{{ clan?.name ?? "—" }}</div>
    </section>

    <div class="bio-body">
      <div v-if="character.avatar" class="portrait bio-portrait"
           :style="{ backgroundImage: `url('${character.avatar}')` }"></div>
      <section class="bio-sec bio-retainers">
        <div v-for="kind in RETAINER_KINDS" :key="kind.key">
          <h2>{{ kind.title }}</h2>
          <ul v-if="character[kind.key]?.length" class="ret-names">
            <li v-for="r in character[kind.key]" :key="r.id">{{ r.name }}</li>
          </ul>
          <div v-else class="lines"><div></div></div>
        </div>
      </section>
      <section v-for="f in BIO_FIELDS" :key="f.id" class="bio-sec">
        <h2>{{ f.title }}</h2>
        <p v-if="text(f.id)" class="bio-text">{{ text(f.id) }}</p>
        <div v-else class="lines"><div v-for="n in 3" :key="n"></div></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.bio-body::after { content: ""; display: block; clear: both; }
.bio-portrait { float: right; width: 42mm; height: 54mm; margin: 10px 0 8px 12px; }
.bio-text { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.bio-retainers { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ret-names { margin: 0; padding-left: 18px; columns: 2; column-gap: 16px; }
.ret-names li { break-inside: avoid; overflow-wrap: anywhere; }
</style>
