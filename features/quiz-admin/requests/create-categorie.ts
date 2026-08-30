import { apiFetch } from "@/lib/api-client";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";
import type { CategorieFormInput } from "@/features/quiz-admin/schemas/categorie-form-schema";

export function createCategorie(input: CategorieFormInput): Promise<QuizCategorie> {
  return apiFetch<QuizCategorie>("/quizz/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
