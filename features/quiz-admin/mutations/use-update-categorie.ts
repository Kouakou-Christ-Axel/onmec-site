"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";
import type { CategorieFormInput } from "@/features/quiz-admin/schemas/categorie-form-schema";

interface Input extends Partial<CategorieFormInput> {
  id: string;
}

export function useUpdateCategorie() {
  return useMutation({
    mutationFn: ({ id, ...body }: Input) =>
      patchJson<QuizCategorie>(`/api/admin/quiz-categories/${id}`, body),
  });
}
