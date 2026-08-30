"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/components/ui/cn";
import { MembreTabInfos } from "./membre-tab-infos";
import { MembreTabSignalements } from "./membre-tab-signalements";
import { MembreTabQuiz } from "./membre-tab-quiz";
import { MembreTabAVenir } from "./membre-tab-a-venir";
import type { MembreAdmin } from "@/features/membres-admin/types/membre-admin";

const ONGLETS = [
  { id: "infos", label: "Infos" },
  { id: "signalements", label: "Signalements" },
  { id: "quiz", label: "Quiz" },
  { id: "commentaires", label: "Commentaires" },
  { id: "points", label: "Points" },
  { id: "notifications", label: "Notifications" },
] as const;
type OngletId = (typeof ONGLETS)[number]["id"];

interface MembreDetailDrawerProps {
  membre: MembreAdmin | null;
  onClose: () => void;
}

export function MembreDetailDrawer({ membre, onClose }: MembreDetailDrawerProps) {
  const [onglet, setOnglet] = useState<OngletId>("infos");

  return (
    <Drawer open={membre !== null} onClose={onClose} title={membre ? membre.nom : "Membre"}>
      {membre ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3.5 border-b border-border-subtle bg-surface-card px-5.5 py-5">
            <h2 className="text-xl font-semibold text-ink">{membre.nom}</h2>
            <IconButton icon={X} label="Fermer" onClick={onClose} />
          </div>
          <div
            role="tablist"
            aria-label="Onglets de la fiche membre"
            className="flex gap-1 overflow-x-auto border-b border-border-subtle px-5.5"
          >
            {ONGLETS.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                id={`membre-tab-${o.id}`}
                aria-selected={onglet === o.id}
                aria-controls={`membre-panel-${o.id}`}
                onClick={() => setOnglet(o.id)}
                className={cn(
                  "shrink-0 px-3 py-2 text-sm font-medium",
                  onglet === o.id
                    ? "border-b-2 border-orange-500 text-ink"
                    : "text-muted-foreground hover:text-ink",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`membre-panel-${onglet}`}
            aria-labelledby={`membre-tab-${onglet}`}
            className="flex-1 overflow-y-auto p-5.5"
          >
            {onglet === "infos" && <MembreTabInfos membreId={membre.id} />}
            {onglet === "signalements" && <MembreTabSignalements membreId={membre.id} />}
            {onglet === "quiz" && <MembreTabQuiz membreId={membre.id} />}
            {onglet === "commentaires" && (
              <MembreTabAVenir message="Filtre par auteur pas encore disponible côté API." />
            )}
            {onglet === "points" && (
              <MembreTabAVenir message="Journal des ajustements de points pas encore exposé par l'API." />
            )}
            {onglet === "notifications" && (
              <MembreTabAVenir message="Historique des notifications pas encore exposé par l'API." />
            )}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
