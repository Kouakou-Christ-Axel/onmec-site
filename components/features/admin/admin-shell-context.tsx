"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AdminRoleLabel } from "@/features/admin-auth/lib/map-admin-role";

export type AdminRole = AdminRoleLabel;

interface AdminShellState {
  id: string;
  role: AdminRole;
  fullname: string;
  email: string;
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
  canMembres: boolean;
  canQuiz: boolean;
}

const AdminShellContext = createContext<AdminShellState | null>(null);

interface AdminShellProviderProps {
  children: ReactNode;
  id: string;
  initialRole?: AdminRole;
  fullname?: string;
  email?: string;
}

export function AdminShellProvider({
  children,
  id,
  initialRole = "Administrateur national",
  fullname = "",
  email = "",
}: AdminShellProviderProps) {
  const value = useMemo<AdminShellState>(
    () => ({
      id,
      role: initialRole,
      fullname,
      email,
      canSig: initialRole !== "Chargée de communication",
      canEdito: initialRole !== "Modérateur",
      canUsers: initialRole === "Administrateur national",
      canMembres: initialRole !== "Chargée de communication",
      canQuiz: initialRole !== "Modérateur",
    }),
    [id, initialRole, fullname, email],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error("useAdminShell must be used within AdminShellProvider");
  return ctx;
}
