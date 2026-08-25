"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { AdminChangePasswordInput } from "@/features/admin-auth/schemas/admin-change-password-schema";

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: (input: AdminChangePasswordInput) =>
      postJson<{ message: string }>("/api/auth/admin/change-password", input),
  });
}
