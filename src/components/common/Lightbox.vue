<script setup>
import { onBeforeUnmount, watch } from "vue";
import { lightbox, hideImage } from "../../stores/lightbox.js";

const onKey = e => { if (e.key === "Escape") hideImage(); };
watch(() => lightbox.src, src => {
  if (src) document.addEventListener("keydown", onKey);
  else document.removeEventListener("keydown", onKey);
});
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="lightbox.src" class="lightbox" @click="hideImage">
        <img :src="lightbox.src" alt="Портрет">
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed; inset: 0; z-index: 40; cursor: zoom-out;
  display: flex; align-items: center; justify-content: center; padding: 24px;
  background: rgba(0,0,0,.85);
}
img {
  height: 90vh; width: auto; max-width: 100%; object-fit: contain; border-radius: 6px;
  box-shadow: 0 0 40px rgba(193,18,31,.35);
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media print { .lightbox { display: none; } }
</style>
