"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { Categorie } from "@/features/actualites-admin/types/actualite-admin";

export function useCategories() {
  return useQuery({
    queryKey: ["actualites-admin-categories"],
    queryFn: () => getJson<Categorie[]>("/api/admin/actualites/categories"),
  });
}
