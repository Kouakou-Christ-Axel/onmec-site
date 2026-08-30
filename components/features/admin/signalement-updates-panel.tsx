"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { updatesLabel, type Signalement } from "@/features/admin/data/signalements";

interface SignalementUpdatesPanelProps {
  signalement: Signalement;
  onChange: (id: string, patch: Partial<Signalement>) => void;
}

export function SignalementUpdatesPanel({ signalement, onChange }: SignalementUpdatesPanelProps) {
  const [maj, setMaj] = useState("");

  const addUpdate = () => {
    if (!maj.trim()) return;
    onChange(signalement.id, {
      updates: [
        ...signalement.updates,
        { date: new Date().toLocaleDateString("fr-FR"), auteur: "Vous", texte: maj.trim() },
      ],
    });
    setMaj("");
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        {updatesLabel(signalement.updates.length)}
      </span>
      {signalement.updates.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {signalement.updates.map((u, i) => (
            <span key={i} className="flex flex-col gap-0.5 border-l-2 border-orange-500 pl-3.5">
              <span className="text-[0.6875rem] text-muted-foreground">
                {u.date} · {u.auteur}
              </span>
              <span className="text-sm leading-relaxed text-text-body">{u.texte}</span>
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[0.8125rem] text-muted-foreground">
          Aucune mise à jour. Le citoyen ne voit encore que son signalement.
        </span>
      )}
      <Field
        label="Ajouter une mise à jour"
        hint="Visible par le citoyen dans l’app, avec la date et votre nom"
      >
        <Textarea
          rows={3}
          value={maj}
          onChange={(e) => setMaj(e.target.value)}
          placeholder="Ex. Signalement transmis à la mairie de Cocody, intervention annoncée pour le 28/08."
        />
      </Field>
      <span>
        <Button variant="deep" size="sm" icon={Send} disabled={!maj.trim()} onClick={addUpdate}>
          Publier la mise à jour
        </Button>
      </span>
    </div>
  );
}
