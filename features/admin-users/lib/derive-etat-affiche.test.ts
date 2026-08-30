import { describe, expect, it } from "vitest";
import { deriveEtatAffiche } from "./derive-etat-affiche";

describe("deriveEtatAffiche", () => {
  it("retourne Inactif si isActive est faux", () => {
    expect(
      deriveEtatAffiche({ isActive: false, mustChangePassword: true, lastLoginAt: null }),
    ).toBe("Inactif");
  });

  it("retourne Invitation si mustChangePassword et jamais connecté", () => {
    expect(
      deriveEtatAffiche({ isActive: true, mustChangePassword: true, lastLoginAt: null }),
    ).toBe("Invitation");
  });

  it("retourne Actif sinon", () => {
    expect(
      deriveEtatAffiche({
        isActive: true,
        mustChangePassword: false,
        lastLoginAt: "2026-08-01T00:00:00.000Z",
      }),
    ).toBe("Actif");
  });
});
