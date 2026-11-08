import type { jsPDF } from "jspdf";

import boldUrl from "@/assets/fonts/sofia-sans/SofiaSans-Bold.ttf?url";
import regularUrl from "@/assets/fonts/sofia-sans/SofiaSans-Regular.ttf?url";

/** The family name to pass to `doc.setFont` or autoTable `styles.font` after `addSiteFont`. */
export const PDF_FONT = "SofiaSans";

const toBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  // In chunks, so a large font does not overflow the argument limit of fromCharCode.
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
};

const loadFont = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Шрифтът за PDF файла не можа да се зареди.");
  return toBase64(await response.arrayBuffer());
};

/**
 * Embeds Sofia Sans (the site's interface font) in a jsPDF document, because the built-in PDF
 * fonts have no Cyrillic letters. The files are fetched only when a PDF is made.
 */
export async function addSiteFont(doc: jsPDF) {
  const [regular, bold] = await Promise.all([loadFont(regularUrl), loadFont(boldUrl)]);
  doc.addFileToVFS("SofiaSans-Regular.ttf", regular);
  doc.addFont("SofiaSans-Regular.ttf", PDF_FONT, "normal");
  doc.addFileToVFS("SofiaSans-Bold.ttf", bold);
  doc.addFont("SofiaSans-Bold.ttf", PDF_FONT, "bold");
  doc.setFont(PDF_FONT, "normal");
}
