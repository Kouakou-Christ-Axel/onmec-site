import { apiFetch } from "@/lib/api-client";

export function deleteQuiz(id: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/quizz/${id}`, { method: "DELETE" });
}
