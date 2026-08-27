import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

export type SortKey = "recent" | "az" | "pages";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "az", label: "A → Z" },
  { value: "pages", label: "Nombre de pages" },
];

export function sortDocuments(
  list: PublicLibrairieDocument[],
  sort: SortKey,
): PublicLibrairieDocument[] {
  const sorted = [...list];
  switch (sort) {
    case "recent":
      return sorted.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );
    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    case "pages":
      return sorted.sort((a, b) => (b.pageCount ?? -1) - (a.pageCount ?? -1));
    default:
      return sorted;
  }
}
