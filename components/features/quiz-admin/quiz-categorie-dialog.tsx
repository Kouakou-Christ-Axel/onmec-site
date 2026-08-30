"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateCategorie } from "@/features/quiz-admin/mutations/use-create-categorie";
import { useUpdateCategorie } from "@/features/quiz-admin/mutations/use-update-categorie";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";

interface QuizCategorieDialogProps {
  open: boolean;
  categorie: QuizCategorie | null;
  onClose: () => void;
  onSaved: (categorie: QuizCategorie) => void;
}

/**
 * Le parent doit monter ce composant avec `key={categorie?.id ?? "new"}` : le changement de clé
 * force React à remonter le formulaire (état local réinitialisé) au lieu de synchroniser les
 * champs via un effet — pattern recommandé par React pour "reset state with a key".
 */
export function QuizCategorieDialog({
  open,
  categorie,
  onClose,
  onSaved,
}: QuizCategorieDialogProps) {
  const [nom, setNom] = useState(categorie?.nom ?? "");
  const [description, setDescription] = useState(categorie?.description ?? "");
  const createMutation = useCreateCategorie();
  const updateMutation = useUpdateCategorie();

  function handleClose() {
    createMutation.reset();
    updateMutation.reset();
    onClose();
  }

  function submit() {
    if (!nom.trim()) return;
    const input = { nom: nom.trim(), description: description || undefined };
    const onSuccess = (saved: QuizCategorie) => {
      onSaved(saved);
      handleClose();
    };
    if (categorie) {
      updateMutation.mutate({ id: categorie.id, ...input }, { onSuccess });
    } else {
      createMutation.mutate(input, { onSuccess });
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            {categorie ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <Field label="Nom">
          <Input value={nom} onChange={(e) => setNom(e.target.value)} disabled={pending} />
        </Field>
        <Field label="Description" hint="Facultatif">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </Field>
        {isError ? (
          <p className="text-sm text-verdict-false">Échec de l’enregistrement — réessayez.</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!nom.trim() || pending} onClick={submit}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" onClick={handleClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
