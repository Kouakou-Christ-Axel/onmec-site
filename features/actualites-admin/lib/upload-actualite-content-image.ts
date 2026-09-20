import { postJson } from "@/lib/fetch-json";
import { putFileToUploadUrl } from "@/lib/upload-to-r2";
import { buildR2PublicUrl } from "@/lib/r2-public-url";
// import type est efface a la compilation : reutiliser cette forme n'importe pas apiFetch
// (server-only) dans ce fichier client, seulement la forme des donnees echangees avec la route.
import type { ActualiteUploadUrlResult } from "@/features/actualites-admin/requests/request-upload-url";

/** Upload une image du corps de l'article et renvoie son URL publique définitive. */
export async function uploadActualiteContentImage(file: File): Promise<{ url: string }> {
  const { key, uploadUrl } = await postJson<ActualiteUploadUrlResult>(
    "/api/admin/actualites/upload-image",
    { filename: file.name, contentType: file.type },
  );
  await putFileToUploadUrl(uploadUrl, file, file.type);
  return { url: buildR2PublicUrl(key) };
}
