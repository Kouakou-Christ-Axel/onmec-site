import { WEBP_QUALITY } from "@/features/actualites-admin/lib/image-limits";

export async function convertToWebp(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de créer le contexte canvas.");
  }
  ctx.drawImage(bitmap, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );
  if (!blob) {
    throw new Error("Impossible de convertir l’image en WebP.");
  }

  const webpFileName = file.name.replace(/\.\w+$/, "") + ".webp";
  return new File([blob], webpFileName, { type: "image/webp" });
}
