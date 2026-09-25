export function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}

export function lsSet(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch { /* приватный режим или нет места */ }
}
