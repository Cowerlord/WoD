import { ABILITIES, CONFIG, TOTAL_STEPS } from "../data/config.js";
import { CLANS } from "../data/clans.js";
import { WEAPONS } from "../data/weapons.js";
import { ARMOR } from "../data/armor.js";
import { CLOTHING, DEFAULT_CLOTHING } from "../data/clothing.js";
import { SKILLS, SKILL_PICKS, SKILL_ALIASES, SKILL_MAX } from "../data/skills.js";
import { blankCharacter, newId } from "./blank.js";
import { generationInfo } from "../data/blood.js";
import { COMBAT_EFFECTS, CONDITIONS } from "../data/play.js";
import { BIO_FIELDS, BIO_MAX } from "../data/bio.js";
import { ALIGNMENTS } from "../data/alignment.js";
import { RETAINER_KINDS, RETAINER_NAME_MAX, RETAINER_DESC_MAX } from "../data/retainers.js";

export const NOTES_MAX = 2000;

export const FILE_FORMAT = "vtm-character";
export const AVATAR_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

export const cleanText = (v, max) => v
  .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, "")
  .replace(/\s{2,}/g, " ")
  .slice(0, max);

const cleanNotes = v => String(v ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").slice(0, NOTES_MAX);
const cleanBio = v => String(v ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").slice(0, BIO_MAX);

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

  // Навык от клана: выбранный вариант; если не выбран (старые персонажи) — дополнительный навык клана
  const clanOpts = clan?.clanSkills ? [clan.clanSkills.bonus, ...clan.clanSkills.core] : [];
  out.clanSkill = clanOpts.includes(d.clanSkill) ? d.clanSkill : (clan?.clanSkills?.bonus ?? null);

  // Стартовые выборы — только основные навыки, не клановый и без повторов; старые id переносятся на новые
  for (const pick of SKILL_PICKS) {
    const raw = d.skills?.[pick.key];
    const id = SKILL_ALIASES[raw] ?? raw;
    const sk = SKILLS.find(k => k.id === id);
    if (sk?.core && id !== out.clanSkill && !Object.values(out.skills).includes(id)) out.skills[pick.key] = id;
  }

  // Навыки от Мастера: { id: 1…SKILL_MAX }
  const granted = d.bonusSkills && typeof d.bonusSkills === "object" ? d.bonusSkills : {};
  out.bonusSkills = {};
  for (const [raw, v] of Object.entries(granted)) {
    const id = SKILL_ALIASES[raw] ?? raw;
    const n = clampInt(v, 0, SKILL_MAX, 0);
    if (n && SKILLS.some(k => k.id === id)) out.bonusSkills[id] = Math.min(SKILL_MAX, (out.bonusSkills[id] || 0) + n);
  }

  // Характеристика броска для навыков с выбором (Запугивание: СИЛ или ХАР)
  out.skillAbility = {};
  for (const sk of SKILLS.filter(k => k.abilities)) {
    const a = d.skillAbility?.[sk.id];
    if (sk.abilities.includes(a)) out.skillAbility[sk.id] = a;
  }

  out.armorId = ARMOR.some(a => a.id === d.armorId) ? d.armorId : null;
  const clothing = CLOTHING.find(c => c.id === d.clothingId);
  out.clothingId = clothing && !clothing.excludeClans?.includes(out.clanId) ? clothing.id : DEFAULT_CLOTHING;
  out.step = clampInt(d.step, 1, TOTAL_STEPS, 1);
  const bio = d.bio && typeof d.bio === "object" ? d.bio : {};
  out.bio = Object.fromEntries(BIO_FIELDS.map(f => [f.id, cleanBio(bio[f.id])]));
  out.alignment = ALIGNMENTS.some(a => a.id === d.alignment) ? d.alignment : null;
  for (const kind of RETAINER_KINDS) {
    const list = Array.isArray(d[kind.key]) ? d[kind.key] : [];
    out[kind.key] = list.slice(0, kind.max).map(r => ({
      id: typeof r?.id === "string" && /^[\w-]{1,40}$/.test(r.id) ? r.id : newId(),
      name: cleanText(String(r?.name ?? ""), RETAINER_NAME_MAX).trim(),
      desc: cleanText(String(r?.desc ?? ""), RETAINER_DESC_MAX).trim(),
    })).filter(r => r.name);
  }

  const s = d.session && typeof d.session === "object" ? d.session : {};
  out.session = {
    hp: s.hp == null ? null : clampInt(s.hp, 0, 999, null),
    tempHP: clampInt(s.tempHP, 0, 99, 0),
    bp: clampInt(s.bp, 0, generationInfo(out.generation).maxBP, generationInfo(out.generation).maxBP),
    packs: clampInt(s.packs, 0, CLOTHING.find(c => c.id === out.clothingId).bloodPacks, 0),
    humanity: s.humanity == null ? null : clampInt(s.humanity, 0, CONFIG.maxHumanity, null),
    severe: clampInt(s.severe, 0, 2, 0),
    used: { heal: !!s.used?.heal, shield: !!s.used?.shield },
    effects: Array.isArray(s.effects) ? [...new Set(s.effects.filter(e => COMBAT_EFFECTS[e]))] : [],
    surge: ABILITIES.some(a => a.key === s.surge) ? s.surge : null,
    conditions: Array.isArray(s.conditions) ? [...new Set(s.conditions.filter(c => CONDITIONS.some(x => x.id === c)))] : [],
    notes: cleanNotes(s.notes),
  };
  return out;
}
