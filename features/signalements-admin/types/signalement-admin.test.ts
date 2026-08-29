import { describe, expect, it } from "vitest";
import { signalementTab, updatesLabel } from "@/features/signalements-admin/types/signalement-admin";

describe("signalementTab", () => {
  it("mappe chaque statut backend vers son onglet d'affichage", () => {
    expect(signalementTab("NOUVEAU")).toBe("validation");
    expect(signalementTab("EN_COURS")).toBe("encours");
    expect(signalementTab("RESOLU")).toBe("resolu");
    expect(signalementTab("REJETE")).toBe("rejete");
  });
});

describe("updatesLabel", () => {
  it("accorde le libellé selon le nombre de mises à jour", () => {
    expect(updatesLabel(0)).toBe("aucune mise à jour");
    expect(updatesLabel(1)).toBe("1 mise à jour");
    expect(updatesLabel(2)).toBe("2 mises à jour");
  });
});
