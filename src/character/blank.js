import { ABILITIES, CONFIG } from "../data/config.js";

export const newId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const blankSession = () => ({
  hp: null,
  tempHP: 0,
  bp: CONFIG.baseBP,
  humanity: null,
  severe: 0,
  used: { heal: false, shield: false },
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
    generation: CONFIG.generationOptions[0],
    bloodPotency: CONFIG.startingBloodPotency,
    humanity: CONFIG.startingHumanity,
    avatar: null,
    skills: { two: null, one: null },
    armorId: null,
    session: blankSession(),
  };
}
