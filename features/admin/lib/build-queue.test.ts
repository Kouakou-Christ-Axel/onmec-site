import { describe, expect, it } from "vitest";
import { buildQueue } from "./build-queue";

describe("buildQueue", () => {
  it("inclut les signalements en validation quand canSig est vrai", () => {
    const items = buildQueue({ canSig: true, canEdito: false, canUsers: false });
    expect(items.filter((i) => i.kind === "Signalement")).toHaveLength(4);
    expect(items.every((i) => i.kind === "Signalement")).toBe(true);
  });

  it("exclut les signalements quand canSig est faux", () => {
    const items = buildQueue({ canSig: false, canEdito: true, canUsers: false });
    expect(items.some((i) => i.kind === "Signalement")).toBe(false);
  });

  it("ajoute les items éditoriaux uniquement si canEdito", () => {
    const withEdito = buildQueue({ canSig: false, canEdito: true, canUsers: false });
    const withoutEdito = buildQueue({ canSig: false, canEdito: false, canUsers: false });
    expect(withEdito.some((i) => i.kind === "Article")).toBe(true);
    expect(withoutEdito.some((i) => i.kind === "Article")).toBe(false);
  });

  it("ajoute l'item accès uniquement si canUsers", () => {
    const items = buildQueue({ canSig: false, canEdito: false, canUsers: true });
    expect(items.some((i) => i.kind === "Accès")).toBe(true);
  });

  it("retourne un tableau vide sans aucune permission", () => {
    expect(buildQueue({ canSig: false, canEdito: false, canUsers: false })).toEqual([]);
  });
});
