import { ABILITIES, CONFIG, TOTAL_STEPS } from "../data/config.js";
import { CLANS } from "../data/clans.js";
import { WEAPONS } from "../data/weapons.js";
import { ARMOR } from "../data/armor.js";
import { SKILLS, SKILL_PICKS } from "../data/skills.js";
import { blankCharacter } from "./blank.js";

export const FILE_FORMAT = "vtm-character";
export const AVATAR_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

export const cleanText = (v, max) => v
  .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, "")
  .replace(/\s{2,}/g, " ")
  .slice(0, max);

export function clampInt(v, min, max, fallback) {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export function serialize(character) {
  return { format: FILE_FORMAT, version: 1, ...JSON.parse(JSON.stringify(character)), updatedAt: new Date().toISOString() };
}

// Данные из файла или с сервера проверяются поле за полем
export function sanitizeCharacter(d) {
  if (!d || typeof d !== "object" || d.format !== FILE_FORMAT) throw new Error("Это не файл персонажа.");
  const out = blankCharacter();
  if (typeof d.id === "string" && /^[\w-]{1,40}$/.test(d.id)) out.id = d.id;
  out.name = cleanText(String(d.name ?? ""), CONFIG.nameMaxLength).trim();
  out.concept = cleanText(String(d.concept ?? ""), CONFIG.conceptMaxLength).trim();

  const clan = CLANS.find(x => x.id === d.clanId);
  out.clanId = clan ? clan.id : null;

  const used = new Set();
  for (const a of ABILITIES) {
    const v = Number(d.abilities?.[a.key]);
    if (CONFIG.abilityArray.includes(v) && !used.has(v)) { out.abilities[a.key] = v; used.add(v); }
  }

  const disciplines = d.disciplines && typeof d.disciplines === "object" ? d.disciplines : {};
  for (const [id, lvl] of Object.entries(disciplines)) {
    const l = Number(lvl);
    if (clan?.disciplines.includes(id) && Number.isInteger(l) && l >= 1 && l <= CONFIG.maxDisciplineLevel) out.disciplines[id] = l;
  }

  out.bonusPoints = clampInt(d.bonusPoints, 0, CONFIG.maxBonusPoints, 0);
  out.weaponId = WEAPONS.some(w => w.id === d.weaponId) ? d.weaponId : null;
  out.generation = CONFIG.generationOptions.includes(Number(d.generation)) ? Number(d.generation) : CONFIG.generationOptions[0];
  out.bloodPotency = clampInt(d.bloodPotency, 1, 5, CONFIG.startingBloodPotency);
  out.humanity = clampInt(d.humanity, 0, CONFIG.maxHumanity, CONFIG.startingHumanity);
  out.avatar = typeof d.avatar === "string" && d.avatar.length < 4_000_000 && AVATAR_RE.test(d.avatar) ? d.avatar : null;

  for (const pick of SKILL_PICKS) {
    const id = d.skills?.[pick.key];
    if (SKILLS.some(k => k.id === id) && id !== clan?.skill && !Object.values(out.skills).includes(id)) out.skills[pick.key] = id;
  }

  out.armorId = ARMOR.some(a => a.id === d.armorId) ? d.armorId : null;
  out.step = clampInt(d.step, 1, TOTAL_STEPS, 1);
  return out;
}
