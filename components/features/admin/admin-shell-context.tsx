"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AdminRole = "Administrateur national" | "Chargée de communication" | "Modérateur";

export const ADMIN_ROLES: AdminRole[] = ["Administrateur national", "Chargée de communication", "Modérateur"];

interface AdminShellState {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
  fullname: string;
  email: string;
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
}

const AdminShellContext = createContext<AdminShellState | null>(null);

interface AdminShellProviderProps {
  children: ReactNode;
  initialRole?: AdminRole;
  fullname?: string;
  email?: string;
}

export function AdminShellProvider({
  children,
  initialRole = "Administrateur national",
  fullname = "",
  email = "",
}: AdminShellProviderProps) {
  const [role, setRole] = useState<AdminRole>(initialRole);

  const value = useMemo<AdminShellState>(
    () => ({
      role,
      setRole,
      fullname,
      email,
      canSig: role !== "Chargée de communication",
      canEdito: role !== "Modérateur",
      canUsers: role === "Administrateur national",
    }),
    [role, fullname, email],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error("useAdminShell must be used within AdminShellProvider");
  return ctx;
}
