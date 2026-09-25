<template>
  <footer class="site-footer">© {{ new Date().getFullYear() }} MereshkaChtoTakoeINTerteiment. Все права защищены.</footer>
</template>

<style scoped>
.site-footer {
  margin-top: 48px; padding-bottom: 76px; text-align: center;
  font-size: .7rem; letter-spacing: .04em; color: var(--text-dim); opacity: .7;
}
@media print { .site-footer { display: none; } }
</style>
