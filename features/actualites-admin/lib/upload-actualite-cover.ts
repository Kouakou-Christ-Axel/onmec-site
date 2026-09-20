import { postJson } from "@/lib/fetch-json";
import { putFileToUploadUrl } from "@/lib/upload-to-r2";
// import type est efface a la compilation : reutiliser cette forme n'importe pas apiFetch
// (server-only) dans ce fichier client, seulement la forme des donnees echangees avec la route.
import type { ActualiteUploadUrlResult } from "@/features/actualites-admin/requests/request-upload-url";

/** Upload l'image de couverture et renvoie la clé R2 à passer en `imageKey`. */
export async function uploadActualiteCover(file: File): Promise<string> {
  const { key, uploadUrl } = await postJson<ActualiteUploadUrlResult>(
    "/api/admin/actualites/upload-url",
    { filename: file.name, contentType: file.type },
  );
  await putFileToUploadUrl(uploadUrl, file, file.type);
  return key;
}
