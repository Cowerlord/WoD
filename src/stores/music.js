import { reactive } from "vue";
import { lsGet, lsSet } from "../lib/storage.js";

const STORAGE_KEY = "wod-music";
// Треки играют по очереди, после последнего — снова первый
const TRACKS = ["theme.mp3", "theme2.mp3"].map(f => `${import.meta.env.BASE_URL}music/${f}`);

export const music = reactive({
  on: lsGet(STORAGE_KEY) !== "off",
  available: true,
});

const audio = new Audio();
audio.volume = 0.35;
let current = 0;
let failed = 0;

function load(i) {
  current = i % TRACKS.length;
  audio.src = TRACKS[current];
}

audio.addEventListener("ended", () => { load(current + 1); play(); });
audio.addEventListener("playing", () => { failed = 0; });
audio.addEventListener("error", () => {
  if (++failed >= TRACKS.length) { music.available = false; return; }
  load(current + 1);
  play();
});

// Браузер не даёт играть звук до первого действия человека — тогда ждём первого клика или клавиши
function play() {
  if (!music.on || !music.available) return;
  audio.play().catch(err => {
    if (err.name !== "NotAllowedError") return;
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

load(0);
play();
