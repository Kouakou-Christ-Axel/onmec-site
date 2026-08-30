"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";
import type { CategorieFormInput } from "@/features/quiz-admin/schemas/categorie-form-schema";

export function useCreateCategorie() {
  return useMutation({
    mutationFn: (input: CategorieFormInput) =>
      postJson<QuizCategorie>("/api/admin/quiz-categories", input),
  });
}
