"use client";

import { useState } from "react";
import { Upload, FilePlus, BookOpen, ShieldCheck, Users, Flag, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Alert } from "@/components/ui/alert";
import { NewRessourceDialog } from "@/components/features/admin/new-ressource-dialog";
import { RESSOURCES } from "@/features/admin/data/ressources";

const ICONS = [BookOpen, ShieldCheck, Users, Flag, GraduationCap];

export default function RessourcesPage() {
  const [showNew, setShowNew] = useState(false);
  const [brouillons, setBrouillons] = useState<string[]>([]);

  const enValidation = RESSOURCES.find((r) => r.statut === "en-validation");

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Site public</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Ressources pédagogiques
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            Soumission → Validation → En ligne · déposées par les encadreurs et les clubs
          </p>
        </div>
        <Button variant="primary" icon={Upload} onClick={() => setShowNew(true)}>
          Ajouter une ressource
        </Button>
      </div>

      {enValidation ? (
        <Alert tone="warning" title="Une ressource attend votre validation">
          « {enValidation.titre} », soumis le 19/08/2026 · {enValidation.meta}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brouillons.map((titre) => (
          <div key={titre} className="flex flex-col gap-3 rounded-lg border border-dashed border-ink/24 bg-orange-50 p-4.5">
            <FilePlus size={32} />
            <span className="text-base leading-tight font-semibold text-ink">{titre}</span>
            <span className="text-xs text-muted-foreground">Brouillon créé à l’instant · fichier à téléverser</span>
            <span className="mt-auto">
              <Button variant="secondary" size="sm">
                Compléter la fiche
              </Button>
            </span>
          </div>
        ))}

        {RESSOURCES.filter((r) => r.statut === "en-ligne").map((r, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={r.titre}
              className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-card p-4.5 transition-all hover:-translate-y-0.5 hover:border-orange-500"
            >
              <Icon size={32} />
              <span className="text-base leading-tight font-semibold text-ink">{r.titre}</span>
              <span className="text-xs text-muted-foreground">{r.meta}</span>
              <span className="mt-auto flex items-center justify-between gap-2.5">
                <Tag tone="blue">En ligne</Tag>
                <span className="text-[0.8125rem] text-[#2b3646] tabular-nums">{r.telechargements} téléchargements</span>
              </span>
            </div>
          );
        })}

        {enValidation ? (
          <div className="flex flex-col gap-3 rounded-lg border border-ink bg-surface-card p-4.5 shadow-[5px_5px_0_var(--color-blue-500)]">
            <GraduationCap size={32} />
            <span className="text-base leading-tight font-semibold text-ink">{enValidation.titre}</span>
            <span className="text-xs text-muted-foreground">{enValidation.meta}</span>
            <span className="mt-auto flex gap-2">
              <Button variant="primary" size="sm">
                Valider
              </Button>
              <Button variant="ghost" size="sm">
                Demander une correction
              </Button>
            </span>
          </div>
        ) : null}
      </div>

      <NewRessourceDialog
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={(titre) => {
          setBrouillons((prev) => [...prev, titre]);
          setShowNew(false);
        }}
      />
    </div>
  );
}
