"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { AdminUserListResponse } from "@/features/admin-users/types/admin-user";

interface UseAdminUsersListParams {
  search: string;
  role: string;
  page: number;
  initialData: AdminUserListResponse;
}

export function useAdminUsersList({ search, role, page, initialData }: UseAdminUsersListParams) {
  return useQuery({
    queryKey: ["admin-users-list", search, role, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      params.set("page", String(page));
      return getJson<AdminUserListResponse>(`/api/admin/utilisateurs?${params}`);
    },
    initialData: search || role || page !== 1 ? undefined : initialData,
    placeholderData: keepPreviousData,
  });
}
