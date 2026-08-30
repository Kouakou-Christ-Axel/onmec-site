"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { ResetAdminPassword } from "@/features/admin-users/types/admin-user";

export function useResetPasswordAdminUser() {
  return useMutation({
    mutationFn: (adminUserId: string) =>
      postJson<ResetAdminPassword>(`/api/admin/utilisateurs/${adminUserId}/reset-password`, {}),
  });
}
