"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AdminRole = "Administrateur national" | "Chargée de communication" | "Modérateur";

export const ADMIN_ROLES: AdminRole[] = ["Administrateur national", "Chargée de communication", "Modérateur"];

interface AdminShellState {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
}

const AdminShellContext = createContext<AdminShellState | null>(null);

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>("Administrateur national");

  const value = useMemo<AdminShellState>(
    () => ({
      role,
      setRole,
      canSig: role !== "Chargée de communication",
      canEdito: role !== "Modérateur",
      canUsers: role === "Administrateur national",
    }),
    [role],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error("useAdminShell must be used within AdminShellProvider");
  return ctx;
}
