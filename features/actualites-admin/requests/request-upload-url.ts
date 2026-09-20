import { apiFetch } from "@/lib/api-client";

export interface ActualiteUploadUrlRequest {
  filename: string;
  contentType: string;
}

export interface ActualiteUploadUrlResult {
  key: string;
  uploadUrl: string;
  expiresIn: number;
}

/** Couverture de l'actualité — `POST /actualites/upload-url` côté backend. */
export function requestActualiteCoverUploadUrl(
  body: ActualiteUploadUrlRequest,
): Promise<ActualiteUploadUrlResult> {
  return apiFetch<ActualiteUploadUrlResult>("/actualites/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Image insérée dans le corps de l'article — `POST /actualites/upload-image` côté backend. */
export function requestActualiteContentUploadUrl(
  body: ActualiteUploadUrlRequest,
): Promise<ActualiteUploadUrlResult> {
  return apiFetch<ActualiteUploadUrlResult>("/actualites/upload-image", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
