"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { AdminLoginInput } from "@/features/admin-auth/schemas/admin-login-schema";
import type { AdminUser } from "@/features/admin-auth/types/admin-auth";

export function useAdminLogin() {
  return useMutation({
    mutationFn: (input: AdminLoginInput) =>
      postJson<AdminUser>("/api/auth/admin/login", input),
  });
}
