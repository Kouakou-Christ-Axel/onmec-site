import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type AdminRoleLabel = "Administrateur national" | "Chargée de communication" | "Modérateur";

const ADMIN_ROLE_LABELS: Record<AdminRole, AdminRoleLabel> = {
  ADMIN_NATIONAL: "Administrateur national",
  CHARGE_COMMUNICATION: "Chargée de communication",
  MODERATEUR: "Modérateur",
};

/**
 * `AdminRoleLabel` est structurellement identique au type `AdminRole` exporté
 * par `components/features/admin/admin-shell-context.tsx` — pas d'import
 * croisé feature/component, la compatibilité TypeScript est structurelle.
 */
export function mapAdminRole(role: AdminRole): AdminRoleLabel {
  return ADMIN_ROLE_LABELS[role];
}
