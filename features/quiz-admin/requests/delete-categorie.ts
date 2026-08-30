import { apiFetch } from "@/lib/api-client";

export function deleteCategorie(id: string, reassignTo?: string): Promise<{ id: string }> {
  const query = reassignTo ? `?reassignTo=${encodeURIComponent(reassignTo)}` : "";
  return apiFetch<{ id: string }>(`/quizz/categories/${id}${query}`, { method: "DELETE" });
}
