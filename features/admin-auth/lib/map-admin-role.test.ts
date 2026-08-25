import { describe, expect, it } from "vitest";
import { mapAdminRole } from "@/features/admin-auth/lib/map-admin-role";

describe("mapAdminRole", () => {
  it("maps ADMIN_NATIONAL to its display label", () => {
    expect(mapAdminRole("ADMIN_NATIONAL")).toBe("Administrateur national");
  });

  it("maps CHARGE_COMMUNICATION to its display label", () => {
    expect(mapAdminRole("CHARGE_COMMUNICATION")).toBe("Chargée de communication");
  });

  it("maps MODERATEUR to its display label", () => {
    expect(mapAdminRole("MODERATEUR")).toBe("Modérateur");
  });
});
