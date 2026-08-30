import { apiFetch } from "@/lib/api-client";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";
import type { CategorieFormInput } from "@/features/quiz-admin/schemas/categorie-form-schema";

export function updateCategorie(
  id: string,
  input: Partial<CategorieFormInput>,
): Promise<QuizCategorie> {
  return apiFetch<QuizCategorie>(`/quizz/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
