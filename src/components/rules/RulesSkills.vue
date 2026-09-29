<script setup>
import { ABILITIES } from "../../data/config.js";
import { CORE_SKILLS, BONUS_SKILLS, SKILL_MAX } from "../../data/skills.js";
import { CLANS } from "../../data/clans.js";
import { skillById } from "../../character/rules.js";

const abil = k => (k.abilities ?? [k.ability]).map(a => ABILITIES.find(x => x.key === a).name).join(" или ");
</script>

<template>
  <p>Проверка навыка = d20 + мод. характеристики + бонус навыка. При создании игрок выбирает из <b>основных</b> навыков
     два: один на <b>+2</b>, другой на <b>+1</b>. <b>Дополнительные</b> навыки даёт клан и Мастер — за события и рост персонажа.
     Бонус одного навыка — не больше <b>+{{ SKILL_MAX }}</b>.</p>
  <h3>Основные навыки</h3>
  <div class="table-wrap"><table><tbody>
    <tr><th>Навык</th><th>Хар-ка</th><th>Что входит</th></tr>
    <tr v-for="k in CORE_SKILLS" :key="k.id"><td><b>{{ k.name }}</b></td><td>{{ abil(k) }}</td><td>{{ k.hint }}</td></tr>
  </tbody></table></div>
  <p>Запугивание бросается через Силу или Харизму — игрок выбирает заранее, и навык стоит в этой группе на листе.</p>
  <h3>Дополнительные навыки</h3>
  <div class="table-wrap"><table><tbody>
    <tr><th>Навык</th><th>Хар-ка</th><th>Что входит</th></tr>
    <tr v-for="k in BONUS_SKILLS" :key="k.id"><td><b>{{ k.name }}</b></td><td>{{ abil(k) }}</td><td>{{ k.hint }}</td></tr>
  </tbody></table></div>
  <h3>Навык от клана</h3>
  <p>Клан даёт на выбор: свой дополнительный навык <b>+2</b> или один из двух основных <b>+1</b>.</p>
  <div class="table-wrap"><table><tbody>
    <tr><th>Клан</th><th>Дополнительный +2</th><th>или основной +1</th></tr>
    <tr v-for="c in CLANS" :key="c.id"><td><b>{{ c.name }}</b></td><td>{{ skillById(c.clanSkills.bonus).name }}</td>
      <td>{{ c.clanSkills.core.map(id => skillById(id).name).join(" / ") }}</td></tr>
  </tbody></table></div>
</template>
