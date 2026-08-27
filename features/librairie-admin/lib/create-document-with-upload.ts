import { postJson } from "@/lib/fetch-json";
import { putFileToUploadUrl } from "@/features/librairie-admin/lib/upload-to-r2";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";
// import type est efface a la compilation : reutiliser ces formes n'importe pas apiFetch
// (server-only) dans ce fichier client, seulement la forme des donnees echangees avec la route.
import type {
  UploadUrlRequest,
  UploadUrlResult,
} from "@/features/librairie-admin/requests/request-upload-url";

export type CreateDocumentStep = "upload-fichier" | "upload-cover" | "finalisation";

export interface CreateDocumentInput {
  title: string;
  description: string;
  categorie: string;
  file: File;
  cover: File | null;
  onStep?: (step: CreateDocumentStep) => void;
}

function requestUploadUrl(body: UploadUrlRequest): Promise<UploadUrlResult> {
  return postJson<UploadUrlResult>("/api/admin/librairie/upload-url", body);
}

export async function createDocumentWithUpload(
  input: CreateDocumentInput,
): Promise<AdminLibrairieDocument> {
  input.onStep?.("upload-fichier");
  const fichierUpload = await requestUploadUrl({
    filename: input.file.name,
    contentType: input.file.type,
    kind: "fichier",
  });
  await putFileToUploadUrl(fichierUpload.uploadUrl, input.file, input.file.type);

  let coverKey: string | undefined;
  if (input.cover) {
    input.onStep?.("upload-cover");
    const coverUpload = await requestUploadUrl({
      filename: input.cover.name,
      contentType: input.cover.type,
      kind: "cover",
      documentId: fichierUpload.documentId,
    });
    await putFileToUploadUrl(coverUpload.uploadUrl, input.cover, input.cover.type);
    coverKey = coverUpload.key;
  }

  input.onStep?.("finalisation");
  return postJson<AdminLibrairieDocument>("/api/admin/librairie", {
    title: input.title,
    description: input.description || undefined,
    categorie: input.categorie || undefined,
    fichierKey: fichierUpload.key,
    coverKey,
  });
}
