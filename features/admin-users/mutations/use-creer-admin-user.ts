"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { CreerAdminUserInput } from "@/features/admin-users/schemas/creer-admin-user-schema";
import type { CreatedAdminUser } from "@/features/admin-users/types/admin-user";

export function useCreerAdminUser() {
  return useMutation({
    mutationFn: (input: CreerAdminUserInput) =>
      postJson<CreatedAdminUser>("/api/admin/utilisateurs", input),
  });
}
