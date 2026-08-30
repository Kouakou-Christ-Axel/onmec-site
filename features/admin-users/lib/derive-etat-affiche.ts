import type { AdminUser, AdminUserEtat } from "@/features/admin-users/types/admin-user";

export function deriveEtatAffiche(
  admin: Pick<AdminUser, "isActive" | "mustChangePassword" | "lastLoginAt">,
): AdminUserEtat {
  if (!admin.isActive) return "Inactif";
  if (admin.mustChangePassword && admin.lastLoginAt === null) return "Invitation";
  return "Actif";
}
