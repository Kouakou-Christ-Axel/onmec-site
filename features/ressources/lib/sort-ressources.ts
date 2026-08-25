import type { Ressource } from "@/features/ressources/types/ressource";

export type SortKey = "recent" | "az" | "downloads" | "pages";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "az", label: "A → Z" },
  { value: "downloads", label: "Plus téléchargés" },
  { value: "pages", label: "Nombre de pages" },
];

function parseFrenchDate(date: string): number {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

/** Trie une copie de `list` — l'ordre du tableau `RESSOURCES` n'est pas chronologique, donc
 * "recent" doit comparer les dates explicitement plutôt que se reposer sur l'ordre d'entrée. */
export function sortRessources(list: Ressource[], sort: SortKey): Ressource[] {
  const sorted = [...list];
  switch (sort) {
    case "recent":
      return sorted.sort((a, b) => parseFrenchDate(b.date) - parseFrenchDate(a.date));
    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    case "downloads":
      return sorted.sort((a, b) => b.downloads - a.downloads);
    case "pages":
      return sorted.sort((a, b) => b.pages - a.pages);
    default:
      return sorted;
  }
}
