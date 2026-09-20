/**
 * PUT direct vers une URL presignee R2 — exception documentee au patron BFF de ce projet : le
 * serveur onmec-site ne recoit jamais les octets du fichier, seule cette fonction parle a un hote
 * tiers (voir docs/superpowers/specs/2026-08-27-librairie-frontend-design.md).
 */
export async function putFileToUploadUrl(
  uploadUrl: string,
  file: File | Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Échec de l'envoi du fichier vers le stockage (${response.status})`);
  }
}
