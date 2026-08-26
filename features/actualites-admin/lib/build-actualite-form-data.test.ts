import { describe, expect, it } from "vitest";
import { buildActualiteFormData } from "@/features/actualites-admin/lib/build-actualite-form-data";

describe("buildActualiteFormData", () => {
  it("inclut tous les champs texte et la categorie", () => {
    const formData = buildActualiteFormData(
      { title: "Titre", excerpt: "Chapo", content: "<p>Corps</p>", date: "2026-08-26" },
      "cat-1",
      null,
    );
    expect(formData.get("title")).toBe("Titre");
    expect(formData.get("excerpt")).toBe("Chapo");
    expect(formData.get("content")).toBe("<p>Corps</p>");
    expect(formData.get("date")).toBe("2026-08-26");
    expect(formData.get("categorieId")).toBe("cat-1");
    expect(formData.has("image")).toBe(false);
  });

  it("inclut l'image seulement si fournie", () => {
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    const formData = buildActualiteFormData(
      { title: "T", excerpt: "E", content: "C", date: "2026-08-26" },
      "cat-1",
      file,
    );
    expect(formData.get("image")).toBe(file);
  });
});
