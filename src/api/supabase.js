import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://buvvkcrctqexempzcmus.supabase.co";
// Публичный ключ: данные защищают политики доступа в базе (supabase/schema.sql)
const SUPABASE_KEY = "sb_publishable_5voLV8TOWyNO5tkx7pV6Ng_kGU_BaKD";

// Ник превращается в служебный email — так же, как в private.create_player
export const LOGIN_DOMAIN = "players.wod.local";
export const USERNAME_RE = /^[a-z0-9_.-]{3,24}$/;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
