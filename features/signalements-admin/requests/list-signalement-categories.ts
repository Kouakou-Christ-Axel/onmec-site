import { apiFetch } from "@/lib/api-client";
import type { SignalementCategorie } from "@/features/signalements-admin/types/signalement-admin";

interface CategorieSignalementResponseDto {
  id: string;
  nom: string;
}

export async function listSignalementCategories(): Promise<SignalementCategorie[]> {
  const categories = await apiFetch<CategorieSignalementResponseDto[]>("/categorie-signalement");
  return categories.map((c) => ({ id: c.id, nom: c.nom }));
}
