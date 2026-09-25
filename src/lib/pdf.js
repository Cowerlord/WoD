// Генератор PDF подгружается только по нажатию кнопки
let busy = false;

export async function downloadPdf(el, filename) {
  if (busy) return;
  busy = true;
  try {
    const { default: html2pdf } = await import("html2pdf.js");
    // Прокрутка во время генерации сбивает координаты html2canvas — блокируем её
    document.documentElement.classList.add("pdf-busy");
    el.classList.add("pdf-export");
    await html2pdf().set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff", scrollX: 0, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css"], avoid: ["section", "tr"] },
    }).from(el).save();
  } finally {
    el.classList.remove("pdf-export");
    document.documentElement.classList.remove("pdf-busy");
    busy = false;
  }
}
