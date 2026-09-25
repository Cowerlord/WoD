import { ABILITIES, CONFIG } from "../data/config.js";

export const newId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

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
    generation: CONFIG.generationOptions[0],
    bloodPotency: CONFIG.startingBloodPotency,
    humanity: CONFIG.startingHumanity,
    avatar: null,
    skills: { two: null, one: null },
    armorId: null,
  };
}
