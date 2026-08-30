"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, ShieldEllipsis, UserX, UserCheck, KeyRound } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { LibrairiePagination } from "@/components/features/librairie/librairie-pagination";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useAdminUsersList } from "@/features/admin-users/queries/use-admin-users-list";
import { deriveEtatAffiche } from "@/features/admin-users/lib/derive-etat-affiche";
import { mapAdminRole } from "@/features/admin-auth/lib/map-admin-role";
import { modifierRoleAdminUserSchema } from "@/features/admin-users/schemas/modifier-role-admin-user-schema";
import { syncUrlParams } from "@/lib/sync-url";
import { CreerAdminUserDialog } from "./creer-admin-user-dialog";
import { ModifierRoleAdminUserDialog } from "./modifier-role-admin-user-dialog";
import { ChangerStatutAdminUserDialog } from "./changer-statut-admin-user-dialog";
import { ResetPasswordAdminUserDialog } from "./reset-password-admin-user-dialog";
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";
import type { AdminUser, AdminUserListResponse } from "@/features/admin-users/types/admin-user";

const ROLES = modifierRoleAdminUserSchema.shape.role.options;

const ETAT_TONE = {
  Actif: "blue",
  Invitation: "neutral",
  Inactif: "outline",
} as const;

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";
}

interface AdminUsersClientProps {
  initialData: AdminUserListResponse;
}

export function AdminUsersClient({ initialData }: AdminUsersClientProps) {
  const shell = useAdminShell();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [role, setRole] = useState<AdminRole | "">("");
  const [page, setPage] = useState(1);
  const [creerOpen, setCreerOpen] = useState(false);
  const [modifierRole, setModifierRole] = useState<AdminUser | null>(null);
  const [changerStatut, setChangerStatut] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState<AdminUser | null>(null);

  const usersQuery = useAdminUsersList({ search: debouncedQuery, role, page, initialData });
  const data = usersQuery.data ?? initialData;

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    syncUrlParams({ q: debouncedQuery, role, page: page > 1 ? String(page) : "" });
  }, [debouncedQuery, role, page]);

  function invalidateList() {
    queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
  }

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Accès
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Utilisateurs et droits
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            {data.meta.total} administrateur{data.meta.total > 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setCreerOpen(true)}>
          Inviter un administrateur
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un administrateur…"
          className="max-w-72"
        />
        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as AdminRole | "");
            setPage(1);
          }}
          className="w-56"
        >
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {mapAdminRole(r)}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[minmax(0,1fr)_210px_150px_120px_160px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Membre</span>
            <span>Rôle</span>
            <span>Dernière connexion</span>
            <span>État</span>
            <span className="text-right">Actions</span>
          </div>
          {data.data.map((utilisateur) => {
            const isSelf = utilisateur.id === shell.id;
            const etat = deriveEtatAffiche(utilisateur);
            return (
              <div
                key={utilisateur.id}
                className="grid grid-cols-[minmax(0,1fr)_210px_150px_120px_160px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
              >
                <span className="flex flex-col gap-0.5 truncate">
                  <span className="truncate font-semibold text-ink">{utilisateur.fullname}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {utilisateur.email}
                  </span>
                </span>
                <span className="text-text-body">{mapAdminRole(utilisateur.role)}</span>
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  {formatDate(utilisateur.lastLoginAt)}
                </span>
                <span>
                  <Tag tone={ETAT_TONE[etat]}>{etat}</Tag>
                </span>
                <span className="flex justify-end gap-1.5">
                  <IconButton
                    icon={ShieldEllipsis}
                    label="Modifier le rôle"
                    title={
                      isSelf ? "Vous ne pouvez pas modifier votre propre rôle." : "Modifier le rôle"
                    }
                    size="sm"
                    disabled={isSelf}
                    onClick={() => setModifierRole(utilisateur)}
                  />
                  <IconButton
                    icon={utilisateur.isActive ? UserX : UserCheck}
                    label={utilisateur.isActive ? "Désactiver" : "Réactiver"}
                    title={
                      isSelf && utilisateur.isActive
                        ? "Vous ne pouvez pas désactiver votre propre compte."
                        : utilisateur.isActive
                          ? "Désactiver"
                          : "Réactiver"
                    }
                    size="sm"
                    disabled={isSelf && utilisateur.isActive}
                    onClick={() => setChangerStatut(utilisateur)}
                  />
                  <IconButton
                    icon={KeyRound}
                    label="Réinitialiser le mot de passe"
                    title="Réinitialiser le mot de passe"
                    size="sm"
                    onClick={() => setResetPassword(utilisateur)}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <LibrairiePagination
        page={data.meta.page}
        totalPages={data.meta.totalPages}
        onChange={setPage}
      />

      <CreerAdminUserDialog
        open={creerOpen}
        onClose={() => setCreerOpen(false)}
        onCreated={invalidateList}
      />
      <ModifierRoleAdminUserDialog
        adminUser={modifierRole}
        isSelf={modifierRole !== null && modifierRole.id === shell.id}
        onClose={() => setModifierRole(null)}
        onChanged={invalidateList}
      />
      <ChangerStatutAdminUserDialog
        adminUser={changerStatut}
        onClose={() => setChangerStatut(null)}
        onChanged={invalidateList}
      />
      <ResetPasswordAdminUserDialog
        adminUser={resetPassword}
        onClose={() => setResetPassword(null)}
        onDone={invalidateList}
      />
    </div>
  );
}
