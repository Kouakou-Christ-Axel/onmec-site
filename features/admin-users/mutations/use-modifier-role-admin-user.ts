"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { ModifierRoleAdminUserInput } from "@/features/admin-users/schemas/modifier-role-admin-user-schema";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

interface Input extends ModifierRoleAdminUserInput {
  adminUserId: string;
}

export function useModifierRoleAdminUser() {
  return useMutation({
    mutationFn: ({ adminUserId, ...body }: Input) =>
      patchJson<AdminUser>(`/api/admin/utilisateurs/${adminUserId}`, body),
  });
}
