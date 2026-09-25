import { reactive } from "vue";
import { lsGet, lsSet } from "../lib/storage.js";

const STORAGE_KEY = "wod-music";
const TRACK = `${import.meta.env.BASE_URL}music/theme.mp3`;

export const music = reactive({
  on: lsGet(STORAGE_KEY) !== "off",
  available: true,
});

const audio = new Audio(TRACK);
audio.loop = true;
audio.volume = 0.35;
audio.addEventListener("error", () => { music.available = false; });

// Браузер не даёт играть звук до первого действия человека — тогда ждём первого клика или клавиши
function play() {
  if (!music.on || !music.available) return;
  audio.play().catch(() => {
    const retry = () => { if (music.on) audio.play().catch(() => {}); };
    document.addEventListener("pointerdown", retry, { once: true });
    document.addEventListener("keydown", retry, { once: true });
  });
}

export function toggleMusic() {
  music.on = !music.on;
  lsSet(STORAGE_KEY, music.on ? "on" : "off");
  if (music.on) play();
  else audio.pause();
}

play();
