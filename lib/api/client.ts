import { getAuthToken } from "@/lib/api/auth-cookies";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081/api/v1";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`Requete API en echec (${status})`);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "headers"> {
  /** Attache le cookie de session en Authorization: Bearer. Defaut: true. */
  auth?: boolean;
  headers?: HeadersInit;
}

/**
 * Point d'entree unique vers l'API onmec_backend (NestJS).
 * Ne jamais appeler `fetch` directement vers l'API ailleurs dans le code.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && init.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth && !requestHeaders.has("Authorization")) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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
