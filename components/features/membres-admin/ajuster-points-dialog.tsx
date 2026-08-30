"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAjusterPoints } from "@/features/membres-admin/mutations/use-ajuster-points";
import { ajusterPointsSchema } from "@/features/membres-admin/schemas/ajuster-points-schema";
import type { MembreAdmin } from "@/features/membres-admin/types/membre-admin";

interface AjusterPointsDialogProps {
  membre: MembreAdmin | null;
  onClose: () => void;
  onAjuste: () => void;
}

export function AjusterPointsDialog({ membre, onClose, onAjuste }: AjusterPointsDialogProps) {
  const [delta, setDelta] = useState("");
  const [raison, setRaison] = useState("");
  const mutation = useAjusterPoints();

  function handleClose() {
    setDelta("");
    setRaison("");
    mutation.reset();
    onClose();
  }

  function submit() {
    if (!membre) return;
    const parsed = ajusterPointsSchema.safeParse({ delta: Number(delta), raison });
    if (!parsed.success) return;
    mutation.mutate(
      { membreId: membre.id, ...parsed.data },
      {
        onSuccess: () => {
          onAjuste();
          handleClose();
        },
      },
    );
  }

  const pending = mutation.isPending;
  const parsedDelta = Number(delta);
  const valid =
    delta.trim() !== "" && !Number.isNaN(parsedDelta) && parsedDelta !== 0 && raison.trim() !== "";

  return (
    <Dialog open={membre !== null} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            Ajuster les points{membre ? ` — ${membre.nom}` : ""}
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <Field label="Delta" hint="Nombre positif ou négatif, ex. 50 ou -20">
          <Input
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            disabled={pending}
          />
        </Field>
        <Field label="Raison">
          <Input value={raison} onChange={(e) => setRaison(e.target.value)} disabled={pending} />
        </Field>
        {mutation.isError ? (
          <p className="text-sm text-verdict-false">Échec de l’ajustement — réessayez.</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!valid || pending} onClick={submit}>
          {pending ? "Enregistrement…" : "Ajuster"}
        </Button>
        <Button variant="ghost" onClick={handleClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
