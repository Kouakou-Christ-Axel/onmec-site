"use client";

import { useState, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateDocument } from "@/features/librairie-admin/mutations/use-create-document";
import type { CreateDocumentStep } from "@/features/librairie-admin/lib/create-document-with-upload";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

const STEP_LABELS: Record<CreateDocumentStep, string> = {
  "upload-fichier": "Envoi du document…",
  "upload-cover": "Envoi de la couverture…",
  finalisation: "Enregistrement…",
};

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  onCreated: (document: AdminLibrairieDocument) => void;
}

export function UploadDocumentDialog({
  open,
  onClose,
  categories,
  onCreated,
}: UploadDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [step, setStep] = useState<CreateDocumentStep | null>(null);

  const createDocument = useCreateDocument();

  function reset() {
    setTitle("");
    setDescription("");
    setCategorie("");
    setFile(null);
    setCover(null);
    setStep(null);
    createDocument.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    setCover(event.target.files?.[0] ?? null);
  }

  function submit() {
    if (!title.trim() || !file) return;
    createDocument.mutate(
      { title: title.trim(), description, categorie, file, cover, onStep: setStep },
      {
        onSuccess: (document) => {
          onCreated(document);
          handleClose();
        },
      },
    );
  }

  const pending = createDocument.isPending;

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <span className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Site public
          </span>
          <DialogTitle asChild>
            <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
              Nouveau document
            </span>
          </DialogTitle>
        </span>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
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
        <Field label="Catégorie" hint="Libre — tapez une nouvelle catégorie ou choisissez-en une">
          <Input
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            disabled={pending}
            list="librairie-categories"
          />
          <datalist id="librairie-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Fichier PDF" hint="Obligatoire">
          <Input type="file" accept="application/pdf" onChange={handleFileChange} disabled={pending} />
        </Field>
        <Field label="Couverture" hint="Facultatif — jpg, png ou webp">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            disabled={pending}
          />
        </Field>
        {step ? <p className="text-sm text-muted-foreground">{STEP_LABELS[step]}</p> : null}
        {createDocument.isError ? (
          <p className="text-sm text-verdict-false">
            Échec{step ? ` pendant : ${STEP_LABELS[step]}` : ""} — réessayez.
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!title.trim() || !file || pending} onClick={submit}>
          {pending ? "Envoi…" : "Créer le document"}
        </Button>
        <Button variant="ghost" onClick={handleClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
