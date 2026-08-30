"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { ChangerStatutAdminUserInput } from "@/features/admin-users/schemas/changer-statut-admin-user-schema";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

interface Input extends ChangerStatutAdminUserInput {
  adminUserId: string;
}

export function useChangerStatutAdminUser() {
  return useMutation({
    mutationFn: ({ adminUserId, ...body }: Input) =>
      patchJson<AdminUser>(`/api/admin/utilisateurs/${adminUserId}/statut`, body),
  });
}
