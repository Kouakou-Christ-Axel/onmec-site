import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type AdminUserEtat = "Actif" | "Invitation" | "Inactif";

export interface AdminUser {
  id: string;
  fullname: string;
  email: string;
  phone: string | null;
  role: AdminRole;
  avatar: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  meta: AdminUserListMeta;
}

/** Résultat de création : mot de passe temporaire visible une seule fois. */
export interface CreatedAdminUser extends AdminUser {
  password: string;
}

/** Résultat d'une réinitialisation de mot de passe. */
export interface ResetAdminPassword {
  email: string;
  password: string;
}
