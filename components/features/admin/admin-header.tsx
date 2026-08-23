"use client";

import { Search, Bell } from "lucide-react";
import { useAdminShell, ADMIN_ROLES } from "@/components/features/admin/admin-shell-context";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconButton } from "@/components/ui/icon-button";

export function AdminHeader() {
  const { role, setRole } = useAdminShell();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border-subtle bg-[#faf8f5]/90 px-5 backdrop-blur-md md:px-8">
      <div className="w-[min(320px,34vw)]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-n-400" />
          <Input type="search" placeholder="Rechercher un signalement, un article…" className="pl-9" />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="w-[210px]">
          <Select aria-label="Rôle de démonstration" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            {ADMIN_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <IconButton icon={Bell} label="Notifications" variant="ghost" />
      </div>
    </header>
  );
}
