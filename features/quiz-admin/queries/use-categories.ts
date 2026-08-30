"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";

export function useCategories() {
  return useQuery({
    queryKey: ["quiz-categories"],
    queryFn: () => getJson<QuizCategorie[]>("/api/admin/quiz-categories"),
  });
}
