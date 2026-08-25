import { describe, expect, it } from "vitest";
import { sortRessources } from "./sort-ressources";
import type { Ressource } from "@/features/ressources/types/ressource";

const base: Omit<Ressource, "slug" | "title" | "date" | "downloads" | "pages"> = {
  theme: "Institutions",
  format: "PDF",
  acces: "Public",
  weight: "1 Mo",
  excerpt: "",
  body: "",
};

const items: Ressource[] = [
  { ...base, slug: "a", title: "Bravo", date: "01/01/2026", downloads: 100, pages: 20 },
  { ...base, slug: "b", title: "Alpha", date: "15/03/2026", downloads: 500, pages: 5 },
  { ...base, slug: "c", title: "Charlie", date: "10/02/2026", downloads: 10, pages: 40 },
];

describe("sortRessources", () => {
  it('trie par date décroissante pour "recent"', () => {
    expect(sortRessources(items, "recent").map((r) => r.slug)).toEqual(["b", "c", "a"]);
  });

  it('trie par titre alphabétique pour "az"', () => {
    expect(sortRessources(items, "az").map((r) => r.slug)).toEqual(["b", "a", "c"]);
  });

  it('trie par téléchargements décroissants pour "downloads"', () => {
    expect(sortRessources(items, "downloads").map((r) => r.slug)).toEqual(["b", "a", "c"]);
  });

  it('trie par nombre de pages décroissant pour "pages"', () => {
    expect(sortRessources(items, "pages").map((r) => r.slug)).toEqual(["c", "a", "b"]);
  });

  it("ne mute pas le tableau d'entrée", () => {
    const copy = [...items];
    sortRessources(items, "az");
    expect(items).toEqual(copy);
  });
});
