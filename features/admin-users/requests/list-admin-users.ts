import { apiFetch } from "@/lib/api-client";
import type { AdminUserListResponse } from "@/features/admin-users/types/admin-user";
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export interface ListAdminUsersParams {
  search?: string;
  role?: AdminRole;
  page?: number;
  limit?: number;
}

export function listAdminUsers(params: ListAdminUsersParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));
  return apiFetch<AdminUserListResponse>(`/admins?${query}`);
}
