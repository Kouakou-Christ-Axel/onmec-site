"use client";

import { useState } from "react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface NewCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (categorie: string) => void;
}

export function NewCategoryDialog({ open, onClose, onAdd }: NewCategoryDialogProps) {
  const [name, setName] = useState("");

  function handleClose() {
    setName("");
    onClose();
  }

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    handleClose();
  }

  return (
    // Ouvert depuis add-document-page, plein écran opaque en z-95 : cf. cover-image-cropper.
    <Dialog open={open} onClose={handleClose} overlayClassName="z-100" className="p-5.5">
      <DialogTitle asChild>
        <span className="text-lg font-semibold tracking-[-0.02em] text-ink">
          Nouvelle catégorie
        </span>
      </DialogTitle>
      <div className="mt-4">
        <Field label="Nom">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleAdd} disabled={!name.trim()}>
          Ajouter
        </Button>
      </div>
    </Dialog>
  );
}
