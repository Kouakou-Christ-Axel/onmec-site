"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { useResetPasswordAdminUser } from "@/features/admin-users/mutations/use-reset-password-admin-user";
import { backendMessage } from "@/features/admin-users/lib/backend-error-message";
import { MotDePasseTemporaireReveal } from "./mot-de-passe-temporaire-reveal";
import type { AdminUser, ResetAdminPassword } from "@/features/admin-users/types/admin-user";

interface ResetPasswordAdminUserDialogProps {
  adminUser: AdminUser | null;
  onClose: () => void;
  onDone: () => void;
}

export function ResetPasswordAdminUserDialog({
  adminUser,
  onClose,
  onDone,
}: ResetPasswordAdminUserDialogProps) {
  const [result, setResult] = useState<ResetAdminPassword | null>(null);
  const mutation = useResetPasswordAdminUser();

  function handleClose() {
    const hadResult = result !== null;
    setResult(null);
    mutation.reset();
    onClose();
    if (hadResult) onDone();
  }

  function submit() {
    if (!adminUser) return;
    mutation.mutate(adminUser.id, { onSuccess: setResult });
  }

  const pending = mutation.isPending;

  return (
    <Dialog open={adminUser !== null} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            {result ? "Mot de passe réinitialisé" : "Réinitialiser le mot de passe ?"}
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>

      {result ? (
        <MotDePasseTemporaireReveal
          password={result.password}
          description={`Ce mot de passe ne sera plus jamais affiché. Notez-le ou transmettez-le maintenant à ${adminUser?.fullname} (${result.email}) — aucun email n’est envoyé automatiquement.`}
        />
      ) : (
        <div className="flex flex-col gap-4.5 p-5.5">
          <p className="text-sm text-muted-foreground">
            {adminUser?.fullname} devra utiliser ce nouveau mot de passe temporaire à sa prochaine
            connexion.
          </p>
          {mutation.isError ? (
            <p className="text-sm text-verdict-false">
              {backendMessage(mutation.error, "Échec de la réinitialisation — réessayez.")}
            </p>
          ) : null}
        </div>
      )}

      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        {result ? (
          <Button variant="primary" onClick={handleClose}>
            J’ai noté le mot de passe, fermer
          </Button>
        ) : (
          <>
            <Button variant="primary" disabled={pending} onClick={submit}>
              {pending ? "…" : "Réinitialiser"}
            </Button>
            <Button variant="ghost" onClick={handleClose} disabled={pending}>
              Annuler
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}
