"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TYPES_RESSOURCE } from "@/features/admin/data/ressources";

interface NewRessourceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (titre: string, type: string) => void;
}

export function NewRessourceDialog({ open, onClose, onCreate }: NewRessourceDialogProps) {
  const [type, setType] = useState<string>(TYPES_RESSOURCE[0]);
  const [titre, setTitre] = useState("");

  const submit = () => {
    if (!titre.trim()) return;
    onCreate(titre.trim(), type);
    setTitre("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <span className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Site public
          </span>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">Nouvelle ressource</span>
        </span>
        <IconButton icon={X} label="Fermer" onClick={onClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <Field label="Type de ressource">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES_RESSOURCE.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Titre de la ressource" hint="Phrase capitalisée, 2 à 10 mots. Le fichier se téléverse à l’étape suivante.">
          <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Ce que dit la loi sur le vote des étudiants" />
        </Field>
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!titre.trim()} onClick={submit}>
          Créer le brouillon
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">Rien n’est publié à cette étape</span>
      </div>
    </Dialog>
  );
}
