import { cookies } from "next/headers";
import { getApiBaseUrl } from "@/config/env";
import { AUTH_TOKEN_COOKIE } from "@/config/auth";
import { ApiError } from "@/lib/api-error";

async function readTokenCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_TOKEN_COOKIE)?.value;
}

interface ApiFetchOptions extends Omit<RequestInit, "headers"> {
  /** Attache le cookie de session en Authorization: Bearer. Defaut: true. */
  auth?: boolean;
  headers?: HeadersInit;
}

/**
 * Point d'entree unique vers l'API onmec_backend (NestJS).
 * Ne jamais appeler `fetch` directement vers l'API ailleurs dans le code.
 * Server-only (depend de next/headers) : ne jamais importer depuis un fichier "use client".
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth && !requestHeaders.has("Authorization")) {
    const token = await readTokenCookie();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: requestHeaders,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
