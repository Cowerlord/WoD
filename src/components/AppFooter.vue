<template>
  <footer class="site-footer">© {{ new Date().getFullYear() }} MereshkaChtoTakoeINTerteiment. Все права защищены.</footer>
</template>

<style scoped>
.site-footer {
  margin-top: auto; padding: 40px 0 0; text-align: center;
  font-size: .7rem; letter-spacing: .04em; color: var(--text-dim); opacity: .7;
}
@media (max-width: 640px) { .site-footer { padding: 40px 72px 0; } }
@media print { .site-footer { display: none; } }
</style>
