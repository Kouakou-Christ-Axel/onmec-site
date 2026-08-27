import { apiFetch } from "@/lib/api-client";

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
  kind: "fichier" | "cover";
  documentId?: string;
}

export interface UploadUrlResult {
  key: string;
  uploadUrl: string;
  expiresIn: number;
  documentId: string;
}

export function requestUploadUrl(body: UploadUrlRequest): Promise<UploadUrlResult> {
  return apiFetch<UploadUrlResult>("/librairie/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
