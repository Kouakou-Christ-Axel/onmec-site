"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { useModifierRoleAdminUser } from "@/features/admin-users/mutations/use-modifier-role-admin-user";
import { modifierRoleAdminUserSchema } from "@/features/admin-users/schemas/modifier-role-admin-user-schema";
import { mapAdminRole } from "@/features/admin-auth/lib/map-admin-role";
import { backendMessage } from "@/features/admin-users/lib/backend-error-message";
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

const ROLES = modifierRoleAdminUserSchema.shape.role.options;

interface ModifierRoleAdminUserDialogProps {
  adminUser: AdminUser | null;
  isSelf: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function ModifierRoleAdminUserDialog({
  adminUser,
  isSelf,
  onClose,
  onChanged,
}: ModifierRoleAdminUserDialogProps) {
  const [role, setRole] = useState<AdminRole>(adminUser?.role ?? "MODERATEUR");
  const mutation = useModifierRoleAdminUser();

  function handleOpenAutoFocus() {
    if (adminUser) setRole(adminUser.role);
  }

  function handleClose() {
    mutation.reset();
    onClose();
  }

  function submit() {
    if (!adminUser) return;
    mutation.mutate(
      { adminUserId: adminUser.id, role },
      {
        onSuccess: () => {
          onChanged();
          handleClose();
        },
      },
    );
  }

  const pending = mutation.isPending;
  const disabled = pending || isSelf;

  return (
    <Dialog open={adminUser !== null} onClose={handleClose} onOpenAutoFocus={handleOpenAutoFocus}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            Modifier le rôle{adminUser ? ` de ${adminUser.fullname}` : ""}
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        {isSelf ? (
          <p className="text-sm text-muted-foreground">
            Vous ne pouvez pas modifier votre propre rôle.
          </p>
        ) : null}
        <Field label="Rôle">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            disabled={disabled}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {mapAdminRole(r)}
              </option>
            ))}
          </Select>
        </Field>
        {mutation.isError ? (
          <p className="text-sm text-verdict-false">
            {backendMessage(mutation.error, "Échec de la modification — réessayez.")}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={disabled} onClick={submit}>
          {pending ? "…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" onClick={handleClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
