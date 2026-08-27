"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle, useLastNonNull } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateDocument } from "@/features/librairie-admin/mutations/use-update-document";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

interface EditDocumentDialogProps {
  document: AdminLibrairieDocument | null;
  categories: string[];
  onClose: () => void;
  onUpdated: (document: AdminLibrairieDocument) => void;
}

export function EditDocumentDialog({
  document,
  categories,
  onClose,
  onUpdated,
}: EditDocumentDialogProps) {
  const shown = useLastNonNull(document);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const updateDocument = useUpdateDocument();

  // Re-initialise les champs a chaque nouveau document edite — comportement attendu d'un formulaire
  // controle par une prop externe, pas une derivation a bannir.
  useEffect(() => {
    if (!document) return;
    setTitle(document.title);
    setDescription(document.description ?? "");
    setCategorie(document.categorie ?? "");
  }, [document]);

  if (!shown) return null;

  function submit() {
    if (!document || !title.trim()) return;
    updateDocument.mutate(
      { id: document.id, title: title.trim(), description, categorie },
      { onSuccess: (updated) => onUpdated(updated) },
    );
  }

  const pending = updateDocument.isPending;

  return (
    <Dialog open={document !== null} onClose={onClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            Modifier « {shown.title} »
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={onClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <Field label="Titre">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={pending} />
        </Field>
        <Field label="Description" hint="Facultatif">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </Field>
        <Field label="Catégorie">
          <Input
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            disabled={pending}
            list="librairie-categories-edit"
          />
          <datalist id="librairie-categories-edit">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        {updateDocument.isError ? (
          <p className="text-sm text-verdict-false">Échec de la mise à jour — réessayez.</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!title.trim() || pending} onClick={submit}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
