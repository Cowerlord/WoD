import { supabase } from "./supabase.js";

export const fetchCampaign = () => supabase.from("campaign").select("heat").eq("id", 1).maybeSingle();
export const saveHeat = heat => supabase.from("campaign").update({ heat }).eq("id", 1).select("heat");
