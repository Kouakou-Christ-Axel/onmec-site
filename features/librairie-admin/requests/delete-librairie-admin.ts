import { apiFetch } from "@/lib/api-client";

export function deleteLibrairieAdmin(id: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/librairie/${id}`, { method: "DELETE" });
}
