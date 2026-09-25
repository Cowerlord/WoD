<script setup>
import { onBeforeUnmount, onMounted } from "vue";

defineProps({ title: { type: String, required: true } });
const emit = defineEmits(["close"]);

const onKey = e => { if (e.key === "Escape") emit("close"); };
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="emit('close')">
      <div class="panel dialog" role="dialog" :aria-label="title">
        <div class="dialog-head">
          <h2>{{ title }}</h2>
          <button type="button" class="close" aria-label="Закрыть" @click="emit('close')">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed; inset: 0; z-index: 20; background: rgba(0,0,0,.7);
  display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; overflow-y: auto;
}
.dialog { width: 100%; max-width: 600px; text-align: left; }
.dialog-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.dialog-head h2 { margin: 0; }
.close { padding: 4px 12px; border-color: var(--border); letter-spacing: 0; }
@media print { .backdrop { display: none; } }
</style>
