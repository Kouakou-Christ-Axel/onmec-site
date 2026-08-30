"use client";

import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { useChangerStatutAdminUser } from "@/features/admin-users/mutations/use-changer-statut-admin-user";
import { backendMessage } from "@/features/admin-users/lib/backend-error-message";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

interface ChangerStatutAdminUserDialogProps {
  adminUser: AdminUser | null;
  onClose: () => void;
  onChanged: () => void;
}

export function ChangerStatutAdminUserDialog({
  adminUser,
  onClose,
  onChanged,
}: ChangerStatutAdminUserDialogProps) {
  const mutation = useChangerStatutAdminUser();
  const desactiver = adminUser?.isActive ?? false;

  function handleClose() {
    mutation.reset();
    onClose();
  }

  function submit() {
    if (!adminUser) return;
    mutation.mutate(
      { adminUserId: adminUser.id, isActive: !desactiver },
      {
        onSuccess: () => {
          onChanged();
          handleClose();
        },
      },
    );
  }

  const pending = mutation.isPending;

  return (
    <Dialog open={adminUser !== null} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            {desactiver ? "Désactiver" : "Réactiver"}
            {adminUser ? ` ${adminUser.fullname}` : ""} ?
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <p className="text-sm text-muted-foreground">
          {desactiver
            ? "Ce compte perdra immédiatement l’accès au back-office."
            : "Le compte retrouvera un accès complet au back-office."}
        </p>
        {mutation.isError ? (
          <p className="text-sm text-verdict-false">
            {backendMessage(mutation.error, "Échec du changement de statut — réessayez.")}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button
          variant="primary"
          className={desactiver ? "bg-verdict-false hover:bg-verdict-false/90" : undefined}
          disabled={pending}
          onClick={submit}
        >
          {pending ? "…" : desactiver ? "Désactiver" : "Réactiver"}
        </Button>
        <Button variant="ghost" onClick={handleClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
