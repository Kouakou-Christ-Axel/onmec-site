import { describe, expect, it } from "vitest";
import { sortDocuments } from "@/features/librairie/lib/sort-documents";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

function doc(overrides: Partial<PublicLibrairieDocument>): PublicLibrairieDocument {
  return {
    id: "id",
    title: "Titre",
    description: null,
    categorie: null,
    fileType: ".pdf",
    fileUrl: "https://cdn.example/doc.pdf",
    coverImage: null,
    pageCount: null,
    uploadedAt: "2026-01-01T00:00:00.000Z",
    auteur: "Auteur",
    ...overrides,
  };
}

describe("sortDocuments", () => {
  it("trie par date d'upload decroissante pour 'recent'", () => {
    const list = [
      doc({ id: "a", uploadedAt: "2026-01-01T00:00:00.000Z" }),
      doc({ id: "b", uploadedAt: "2026-06-01T00:00:00.000Z" }),
    ];
    expect(sortDocuments(list, "recent").map((d) => d.id)).toEqual(["b", "a"]);
  });

  it("trie par titre en respectant les accents francais pour 'az'", () => {
    const list = [doc({ id: "a", title: "Zoo" }), doc({ id: "b", title: "École" })];
    expect(sortDocuments(list, "az").map((d) => d.id)).toEqual(["b", "a"]);
  });

  it("trie par pageCount decroissant pour 'pages', valeurs null en dernier", () => {
    const list = [
      doc({ id: "a", pageCount: null }),
      doc({ id: "b", pageCount: 40 }),
      doc({ id: "c", pageCount: 10 }),
    ];
    expect(sortDocuments(list, "pages").map((d) => d.id)).toEqual(["b", "c", "a"]);
  });

  it("ne mute pas le tableau d'origine", () => {
    const list = [doc({ id: "a", title: "B" }), doc({ id: "b", title: "A" })];
    sortDocuments(list, "az");
    expect(list.map((d) => d.id)).toEqual(["a", "b"]);
  });
});
