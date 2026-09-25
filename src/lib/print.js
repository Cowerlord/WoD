import { nextTick } from "vue";

export async function printPart(part) {
  document.body.classList.toggle("print-cheat", part === "cheat");
  await nextTick();
  window.print();
}

window.addEventListener("afterprint", () => document.body.classList.remove("print-cheat"));
