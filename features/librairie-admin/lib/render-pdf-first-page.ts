import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { WEBP_QUALITY } from "@/lib/image-limits";

const TARGET_WIDTH_PX = 1000;

export async function renderFirstPdfPageToFile(file: File): Promise<File> {
  // Import dynamique : pdfjs-dist touche des API navigateur (DOMMatrix) au chargement du module,
  // absentes du runtime SSR (Cloudflare Workers). Un import statique casse le rendu serveur.
  const { GlobalWorkerOptions, getDocument } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const page = await pdf.getPage(1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = TARGET_WIDTH_PX / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de créer le contexte canvas.");
  }

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );
  if (!blob) {
    throw new Error("Impossible de générer l’aperçu du PDF.");
  }

  const coverFileName = file.name.replace(/\.\w+$/, "") + ".webp";
  return new File([blob], coverFileName, { type: "image/webp" });
}
