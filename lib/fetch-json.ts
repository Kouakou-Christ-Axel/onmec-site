import { ApiError } from "@/lib/api-error";

/**
 * Transport browser-safe : appelle les route handlers de onmec-site lui-meme
 * (meme origine), jamais le backend directement. Zero dependance next/headers.
 */
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  return parseJsonResponse<T>(response);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return sendJson<T>(path, "POST", body);
}

export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  return sendJson<T>(path, "PATCH", body);
}

export async function deleteJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { method: "DELETE" });
  return parseJsonResponse<T>(response);
}

/** Ne jamais poser Content-Type ici : fetch doit fixer lui-meme le boundary multipart. */
export async function sendFormData<T>(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
): Promise<T> {
  const response = await fetch(path, { method, body: formData });
  return parseJsonResponse<T>(response);
}

async function sendJson<T>(path: string, method: "POST" | "PATCH", body: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<T>(response);
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}
