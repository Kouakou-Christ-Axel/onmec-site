import { apiFetch } from "@/lib/api-client";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";

interface CategorieQuizResponseDto {
  id: string;
  nom: string;
  description?: string | null;
  quizCount: number;
}

export async function listCategories(): Promise<QuizCategorie[]> {
  const categories = await apiFetch<CategorieQuizResponseDto[]>("/quizz/categories");
  return categories.map((c) => ({
    id: c.id,
    nom: c.nom,
    description: c.description ?? null,
    quizCount: c.quizCount,
  }));
}
