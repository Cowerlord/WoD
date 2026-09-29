import { ABILITIES, CONFIG } from "../data/config.js";
import { blankBio } from "../data/bio.js";
import { DEFAULT_CLOTHING } from "../data/clothing.js";

export const newId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const blankSession = () => ({
  hp: null,
  tempHP: 0,
  bp: CONFIG.baseBP,
  packs: 0,
  humanity: null,
  severe: 0,
  used: { heal: false, shield: false },
  effects: [],
  surge: null,
  conditions: [],
  notes: "",
});

export function blankCharacter() {
  return {
    id: newId(),
    step: 1,
    name: "",
    concept: "",
    clanId: null,
    abilities: Object.fromEntries(ABILITIES.map(a => [a.key, null])),
    disciplines: {},
    bonusPoints: 0,
    weaponId: null,
    generation: CONFIG.playerGeneration,
    bloodPotency: CONFIG.startingBloodPotency,
    humanity: CONFIG.startingHumanity,
    avatar: null,
    skills: { two: null, one: null },   // стартовые выборы из основных навыков: +2 и +1
    clanSkill: null,            // навык от клана (id из clan.clanSkills): дополнительный +2 или основной +1
    skillAbility: {},           // характеристика броска для навыков с выбором: { intimidation: "str" | "cha" }
    bonusSkills: {},            // навыки от Мастера (события, уровни): { id: бонус } — меняет только админ
    armorId: null,
    bio: blankBio(),            // описание персонажа — отдельный лист
    alignment: null,            // мировоззрение (id из ALIGNMENTS) или null
    herd: [],                   // Стадо: [{ id, name, desc }]
    ghouls: [],                 // Гули: [{ id, name, desc }]
    clothingId: DEFAULT_CLOTHING,
    session: blankSession(),
  };
}
