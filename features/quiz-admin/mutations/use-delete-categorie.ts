"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteJson } from "@/lib/fetch-json";

interface DeleteCategorieInput {
  id: string;
  reassignTo?: string;
}

export function useDeleteCategorie() {
  return useMutation({
    mutationFn: ({ id, reassignTo }: DeleteCategorieInput) =>
      deleteJson(
        `/api/admin/quiz-categories/${id}${reassignTo ? `?reassignTo=${reassignTo}` : ""}`,
      ),
  });
}
