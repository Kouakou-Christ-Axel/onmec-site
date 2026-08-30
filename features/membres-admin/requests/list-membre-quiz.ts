import { apiFetch } from "@/lib/api-client";

export function listMembreQuiz(id: string) {
  return apiFetch(`/quizz/results/${id}`);
}
