"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";

export function useAdminLogout() {
  return useMutation({
    mutationFn: () =>
      postJson<{ ok: true }>("/api/auth/admin/logout", {}),
  });
}
