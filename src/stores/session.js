import { supabase, LOGIN_DOMAIN, USERNAME_RE } from "../api/supabase.js";
import { fetchProfile, fetchLimit, fetchMine } from "../api/characters.js";
import { blankCharacter } from "../character/blank.js";
import { auth } from "./auth.js";
import { setMode } from "./ui.js";
import { loadRoster, resetRoster, flush } from "./roster.js";
import { loadCharacter, openOwnLast, saveCurrent } from "./editor.js";

function authErrorText(err) {
  const m = String(err?.message || err || "");
  const code = err?.code;
  if (code === "invalid_credentials" || /invalid login credentials/i.test(m)) return "Неверный ник или пароль.";
  if (/rate limit/i.test(m) || String(code).startsWith("over_")) return "Слишком много попыток — подождите пару минут.";
  if (/fetch|network|load failed/i.test(m)) return "Нет связи с сервером. Проверьте интернет.";
  return `Ошибка: ${m}`;
}

async function enterApp(user) {
  const [profile, limit, mine] = await Promise.all([fetchProfile(user.id), fetchLimit(), fetchMine(user.id)]);
  if (profile.error) throw profile.error;
  if (mine.error) throw mine.error;
  auth.me = profile.data;
  if (Number.isInteger(limit.data)) auth.charLimit = limit.data;
  loadRoster(mine.data);
  setMode("create");
  openOwnLast();
  auth.error = "";
  auth.status = "in";
}

function resetSession() {
  auth.me = null;
  resetRoster();
  loadCharacter(blankCharacter());
  auth.status = "out";
}

export async function initSession() {
  supabase.auth.onAuthStateChange(event => {
    if (event === "SIGNED_OUT" && auth.me) setTimeout(resetSession);
  });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { auth.status = "out"; return; }
  try { await enterApp(session.user); }
  catch (err) { auth.error = authErrorText(err); auth.status = "out"; }
}

export async function login(username, password) {
  const name = username.trim().toLowerCase();
  if (!USERNAME_RE.test(name) || password.length < 6) { auth.error = "Неверный ник или пароль."; return; }
  auth.error = "";
  try {
    const res = await supabase.auth.signInWithPassword({ email: `${name}@${LOGIN_DOMAIN}`, password });
    if (res.error) throw res.error;
    await enterApp(res.data.user);
  } catch (err) {
    auth.error = authErrorText(err);
  }
}

// Что не успело уйти на сервер, останется в очереди этого браузера до следующего входа
export async function logout() {
  saveCurrent();
  await flush();
  await supabase.auth.signOut({ scope: "local" });
  if (auth.me) resetSession();
}

export async function changePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (!error) return "";
  if (error.code === "same_password") return "Новый пароль совпадает со старым.";
  if (error.code === "weak_password") return "Слишком простой пароль.";
  return authErrorText(error);
}
