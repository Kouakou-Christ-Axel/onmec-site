"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChangerEtatMembre } from "@/features/membres-admin/mutations/use-changer-etat-membre";
import type { MembreAdmin } from "@/features/membres-admin/types/membre-admin";

interface ChangerEtatMembreDialogProps {
  membre: MembreAdmin | null;
  onClose: () => void;
  onChange: () => void;
}

export function ChangerEtatMembreDialog({
  membre,
  onClose,
  onChange,
}: ChangerEtatMembreDialogProps) {
  const [raison, setRaison] = useState("");
  const mutation = useChangerEtatMembre();

  const desactiver = membre?.etat === "ACTIF";

  function handleClose() {
    setRaison("");
    mutation.reset();
    onClose();
  }

  function submit() {
    if (!membre) return;
    mutation.mutate(
      {
        membreId: membre.id,
        statut: desactiver ? "SUSPENDU" : "ACTIF",
        raison: desactiver ? raison || undefined : undefined,
      },
      {
        onSuccess: () => {
          onChange();
          handleClose();
        },
      },
    );
  }

  const pending = mutation.isPending;

  return (
    <Dialog open={membre !== null} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            {desactiver ? "Désactiver" : "Réactiver"}
            {membre ? ` ${membre.nom}` : ""} ?
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        {desactiver ? (
          <Field label="Motif" hint="Facultatif">
            <Input value={raison} onChange={(e) => setRaison(e.target.value)} disabled={pending} />
          </Field>
        ) : (
          <p className="text-sm text-muted-foreground">
            Le membre retrouvera un accès complet à l’application.
          </p>
        )}
        {mutation.isError ? (
          <p className="text-sm text-verdict-false">Échec du changement d’état — réessayez.</p>
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
