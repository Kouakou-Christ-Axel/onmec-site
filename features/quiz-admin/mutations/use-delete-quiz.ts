"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteJson } from "@/lib/fetch-json";

export function useDeleteQuiz() {
  return useMutation({
    mutationFn: (id: string) => deleteJson(`/api/admin/quiz/${id}`),
  });
}
