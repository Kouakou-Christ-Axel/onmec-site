import { apiFetch } from "@/lib/api-client";
import type { AuthTokens } from "@/features/auth/types/auth";

export function refreshTokenRequest(refreshToken: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/refresh-token", {
    method: "GET",
    headers: { Authorization: `Bearer ${refreshToken}` },
    auth: false,
  });
}
