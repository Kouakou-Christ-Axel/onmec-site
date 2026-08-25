import { apiFetch } from "@/lib/api-client";
import type { AdminSession } from "@/features/admin-auth/types/admin-auth";

export function adminMeRequest(): Promise<AdminSession> {
  return apiFetch<AdminSession>("/auth/admin/me");
}
