<script setup>
import { DAMAGE_TYPES, NON_AGGRAVATED_LIMIT, SEVERE_WOUND, SEVERE_RECOVERY, SUN_RULE, WOUND_STAGES, HEALING } from "../../data/combat.js";
</script>

<template>
  <h3>Типы урона</h3>
  <div v-for="d in DAMAGE_TYPES" :key="d.id" class="entry">
    <b class="title">{{ d.name }}</b><span class="hint" style="margin:0"> — {{ d.examples }}</span>
    <p>{{ d.rule }}</p>
  </div>
  <p>{{ NON_AGGRAVATED_LIMIT }}</p>

  <h3>Степень тяжёлого ранения</h3>
  <p>{{ SEVERE_WOUND }}</p>
  <p><b>Восстановление:</b> {{ SEVERE_RECOVERY }}</p>
  <p><b>Крит</b> аггравированной атакой (натуральная 20) — тяжёлое ранение без спасброска.</p>

  <h3>Солнце и огонь</h3>
  <p>{{ SUN_RULE }}</p>

  <h3>5 уровней ранений</h3>
  <div class="table-wrap"><table>
    <thead><tr><th>Уровень</th><th>Когда</th><th>Эффект</th></tr></thead>
    <tbody>
      <tr v-for="w in WOUND_STAGES" :key="w.level">
        <td style="white-space:nowrap">{{ w.icon }} <b>{{ w.level ? `Ур. ${w.level}` : "" }} {{ w.name }}</b></td>
        <td>{{ w.trigger }}</td>
        <td><template v-for="(e, i) in w.effects" :key="i"><br v-if="i">{{ e }}</template></td>
      </tr>
    </tbody>
  </table></div>

  <h3>Лечение</h3>
  <p>Вампир может потратить <b>{{ HEALING.cost }}</b>, чтобы восстановить 1d4 + мод. Интеллекта HP (бонусное действие,
     один раз за бой, не во время питья). Запрещено на 3-м уровне ранений и в течение 1 хода после аггравированного урона.
     Весь остальной урон лечится.</p>
</template>
