<script setup>
import { CLANS } from "../../data/clans.js";
import ClanDetails from "../common/ClanDetails.vue";
</script>

<template>
  <ClanDetails v-for="c in CLANS" :key="c.id" :clan="c" class="entry">
    <b class="title">{{ c.name }}</b> — <i>{{ c.subName }}</i>
  </ClanDetails>
</template>
