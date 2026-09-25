import { supabase } from "./supabase.js";

const table = () => supabase.from("characters");
const toRow = data => ({ name: data.name, clan_id: data.clanId, data });

export const fetchProfile = id => supabase.from("profiles").select("id, username, role").eq("id", id).single();
export const fetchLimit = () => supabase.rpc("character_limit");
export const fetchMine = ownerId => table().select("id, data, updated_at").eq("owner_id", ownerId);

export const fetchOthers = myId => table()
  .select("id, owner_id, name, clan_id, updated_at, avatar:data->>avatar, abilities:data->abilities, disciplines:data->disciplines, session:data->session, owner:profiles(username)")
  .neq("owner_id", myId)
  .order("updated_at", { ascending: false });

export const fetchParty = () => table()
  .select("id, name, clan_id, abilities:data->abilities, disciplines:data->disciplines, armorId:data->>armorId, session:data->session, owner:profiles(username)")
  .order("name");

export const fetchCharacter = id => table()
  .select("id, owner_id, data, owner:profiles(username)").eq("id", id).maybeSingle();

export const updateCharacter = data => table().update(toRow(data)).eq("id", data.id).select("id");
export const insertCharacter = data => table().insert({ id: data.id, ...toRow(data) });
export const deleteCharacter = id => table().delete().eq("id", id).select("id");

export function describeError(err, limit) {
  const m = String(err?.message || "");
  if (m.includes("CHARACTER_LIMIT")) return `лимит — ${limit} персонажей на аккаунт`;
  if (err?.code === "GONE") return "персонаж удалён с сервера";
  if (err?.code === "42501") return "нет прав";
  if (err?.code === "23514") return "данные не прошли проверку (слишком большой портрет?)";
  if (/fetch|network|load failed/i.test(m)) return "нет связи с сервером";
  return m || "неизвестная ошибка";
}

// Ошибки базы (SQLSTATE из 5 символов) повторять бессмысленно, сетевые — повторяем
export const isRetryable = err => err?.code !== "GONE" && !/^[0-9A-Z]{5}$/.test(err?.code || "");
