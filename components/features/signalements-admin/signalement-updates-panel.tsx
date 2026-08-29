"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  updatesLabel,
  type SignalementUpdate,
} from "@/features/signalements-admin/types/signalement-admin";

interface SignalementUpdatesPanelProps {
  updates: SignalementUpdate[];
  loading: boolean;
  pending: boolean;
  onAdd: (texte: string) => void;
}

function formatUpdateDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function SignalementUpdatesPanel({
  updates,
  loading,
  pending,
  onAdd,
}: SignalementUpdatesPanelProps) {
  const [maj, setMaj] = useState("");

  const addUpdate = () => {
    if (!maj.trim()) return;
    onAdd(maj.trim());
    setMaj("");
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        {loading ? "Chargement…" : updatesLabel(updates.length)}
      </span>
      {!loading && updates.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {updates.map((u) => (
            <span key={u.id} className="flex flex-col gap-0.5 border-l-2 border-orange-500 pl-3.5">
              <span className="text-[0.6875rem] text-muted-foreground">
                {formatUpdateDate(u.createdAt)} · {u.auteur?.fullname ?? "—"}
              </span>
              <span className="text-sm leading-relaxed text-text-body">{u.texte}</span>
            </span>
          ))}
        </div>
      ) : null}
      {!loading && updates.length === 0 ? (
        <span className="text-[0.8125rem] text-muted-foreground">
          Aucune mise à jour. Le citoyen ne voit encore que son signalement.
        </span>
      ) : null}
      <Field
        label="Ajouter une mise à jour"
        hint="Visible par le citoyen dans l'app, avec la date et votre nom"
      >
        <Textarea
          rows={3}
          value={maj}
          onChange={(e) => setMaj(e.target.value)}
          placeholder="Ex. Signalement transmis à la mairie de Cocody, intervention annoncée pour le 28/08."
        />
      </Field>
      <span>
        <Button
          variant="deep"
          size="sm"
          icon={Send}
          disabled={!maj.trim() || pending}
          onClick={addUpdate}
        >
          Publier la mise à jour
        </Button>
      </span>
    </div>
  );
}
