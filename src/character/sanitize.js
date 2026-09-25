import { ABILITIES, CONFIG, TOTAL_STEPS } from "../data/config.js";
import { CLANS } from "../data/clans.js";
import { WEAPONS } from "../data/weapons.js";
import { ARMOR } from "../data/armor.js";
import { CLOTHING, DEFAULT_CLOTHING } from "../data/clothing.js";
import { SKILLS, SKILL_PICKS } from "../data/skills.js";
import { blankCharacter } from "./blank.js";
import { generationInfo } from "../data/blood.js";

export const NOTES_MAX = 2000;

export const FILE_FORMAT = "vtm-character";
export const AVATAR_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

export const cleanText = (v, max) => v
  .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, "")
  .replace(/\s{2,}/g, " ")
  .slice(0, max);

const cleanNotes = v => String(v ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").slice(0, NOTES_MAX);

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
  out.generation = CONFIG.adminGenerations.includes(Number(d.generation)) ? Number(d.generation) : CONFIG.playerGeneration;
  out.bloodPotency = generationInfo(out.generation).potency;
  out.humanity = clampInt(d.humanity, 0, CONFIG.maxHumanity, CONFIG.startingHumanity);
  out.avatar = typeof d.avatar === "string" && d.avatar.length < 4_000_000 && AVATAR_RE.test(d.avatar) ? d.avatar : null;

  for (const pick of SKILL_PICKS) {
    const id = d.skills?.[pick.key];
    if (SKILLS.some(k => k.id === id) && id !== clan?.skill && !Object.values(out.skills).includes(id)) out.skills[pick.key] = id;
  }

  out.armorId = ARMOR.some(a => a.id === d.armorId) ? d.armorId : null;
  const clothing = CLOTHING.find(c => c.id === d.clothingId);
  out.clothingId = clothing && !clothing.excludeClans?.includes(out.clanId) ? clothing.id : DEFAULT_CLOTHING;
  out.step = clampInt(d.step, 1, TOTAL_STEPS, 1);

  const s = d.session && typeof d.session === "object" ? d.session : {};
  out.session = {
    hp: s.hp == null ? null : clampInt(s.hp, 0, 999, null),
    tempHP: clampInt(s.tempHP, 0, 99, 0),
    bp: clampInt(s.bp, 0, generationInfo(out.generation).maxBP, generationInfo(out.generation).maxBP),
    packs: clampInt(s.packs, 0, CLOTHING.find(c => c.id === out.clothingId).bloodPacks, 0),
    humanity: s.humanity == null ? null : clampInt(s.humanity, 0, CONFIG.maxHumanity, null),
    severe: clampInt(s.severe, 0, 2, 0),
    used: { heal: !!s.used?.heal, shield: !!s.used?.shield },
    notes: cleanNotes(s.notes),
  };
  return out;
}
