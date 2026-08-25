import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type AdminRoleLabel = "Administrateur national" | "Chargée de communication" | "Modérateur";

const ADMIN_ROLE_LABELS: Record<AdminRole, AdminRoleLabel> = {
  ADMIN_NATIONAL: "Administrateur national",
  CHARGE_COMMUNICATION: "Chargée de communication",
  MODERATEUR: "Modérateur",
};

/**
 * Liste des 3 libellés de rôle admin, dérivée de `ADMIN_ROLE_LABELS` — source de vérité unique
 * pour cette liste. `components/features/admin/admin-shell-context.tsx` dérive son type
 * `AdminRole` (import de type de `AdminRoleLabel`) et sa constante `ADMIN_ROLES` de cette liste
 * plutôt que de les redéclarer.
 */
export const ADMIN_ROLE_LABELS_LIST: AdminRoleLabel[] = Object.values(ADMIN_ROLE_LABELS);

export function mapAdminRole(role: AdminRole): AdminRoleLabel {
  return ADMIN_ROLE_LABELS[role];
}
