"use client";

import { X, Check } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DialogTitle, useLastNonNull } from "@/components/ui/dialog";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SignalementModerationPanel } from "./signalement-moderation-panel";
import { SignalementUpdatesPanel } from "./signalement-updates-panel";
import {
  SIGNALEMENT_TAB_META,
  signalementTab,
  type SignalementAdmin,
  type SignalementStatutApi,
  type SignalementUpdate,
} from "@/features/signalements-admin/types/signalement-admin";

const ETAPES: { statut: SignalementStatutApi; label: string }[] = [
  { statut: "NOUVEAU", label: "En validation" },
  { statut: "EN_COURS", label: "En cours" },
  { statut: "RESOLU", label: "Résolu" },
];

interface SignalementDrawerProps {
  signalement: SignalementAdmin | null;
  onClose: () => void;
  onChangeStatut: (id: string, statut: SignalementStatutApi) => void;
  onChangeValidation: (id: string, validation: boolean) => void;
  pending: boolean;
  updates: SignalementUpdate[];
  updatesLoading: boolean;
  addingUpdate: boolean;
  onAddUpdate: (id: string, texte: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function SignalementDrawer({
  signalement,
  onClose,
  onChangeStatut,
  onChangeValidation,
  pending,
  updates,
  updatesLoading,
  addingUpdate,
  onAddUpdate,
}: SignalementDrawerProps) {
  const shown = useLastNonNull(signalement);
  if (!shown) return null;

  const currentIndex = ETAPES.findIndex((e) => e.statut === shown.statut);

  return (
    <Drawer open={signalement !== null} onClose={onClose}>
      <div className="flex items-center justify-between gap-3.5 border-b border-border-subtle bg-surface-card px-5.5 py-4.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Signalement citoyen
          </span>
          <span className="flex items-center gap-2.5">
            <span className="text-base font-semibold text-ink tabular-nums">
              {shown.id.slice(0, 8)}
            </span>
            <Tag tone={SIGNALEMENT_TAB_META[signalementTab(shown.statut)].tone}>
              {SIGNALEMENT_TAB_META[signalementTab(shown.statut)].label}
            </Tag>
          </span>
        </span>
        <IconButton icon={X} label="Fermer" onClick={onClose} />
      </div>

      <div className="flex flex-1 flex-col gap-5.5 overflow-auto p-5.5">
        <div className="grid grid-cols-3 gap-2">
          {ETAPES.map((etape, i) => (
            <span key={etape.statut} className="flex flex-col gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full border-2 ${
                  i < currentIndex
                    ? "border-verdict-true bg-verdict-true"
                    : i === currentIndex
                      ? "border-orange-500 bg-orange-500"
                      : "border-n-300 bg-transparent"
                }`}
              />
              <span
                className={`text-xs ${i === currentIndex ? "font-semibold text-ink" : "text-muted-foreground"}`}
              >
                {etape.label}
              </span>
            </span>
          ))}
        </div>

        <DialogTitle asChild>
          <h2 className="text-[1.375rem] leading-tight font-semibold tracking-[-0.026em] text-ink">
            {shown.titre}
          </h2>
        </DialogTitle>

        <div className="grid grid-cols-2 gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4 text-[0.8125rem]">
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-semibold text-ink">{shown.categorie?.nom ?? "—"}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Reçu le</span>
            <span className="font-semibold text-ink">{formatDate(shown.createdAt)}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Localisation</span>
            <span className="font-semibold text-ink">{shown.adresse}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Signalé par</span>
            <span className="font-semibold text-ink">{shown.citoyen?.fullname ?? "—"}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Visible dans l’app</span>
            <span className="font-semibold text-ink">{shown.validation ? "Publié" : "Masqué"}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Description du citoyen
          </span>
          <p className="text-[0.9375rem] leading-relaxed text-text-body">{shown.description}</p>
        </div>

        <SignalementModerationPanel
          signalement={shown}
          disabled={pending}
          onChangeStatut={(statut) => onChangeStatut(shown.id, statut)}
          onChangeValidation={(validation) => onChangeValidation(shown.id, validation)}
        />

        <SignalementUpdatesPanel
          updates={updates}
          loading={updatesLoading}
          pending={addingUpdate}
          onAdd={(texte) => onAddUpdate(shown.id, texte)}
        />
      </div>

      <div className="flex flex-none flex-wrap items-center gap-2.5 border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" icon={Check} onClick={onClose}>
          Enregistrer et fermer
        </Button>
        <Button variant="ghost" disabled={pending} onClick={() => onChangeStatut(shown.id, "REJETE")}>
          Rejeter le signalement
        </Button>
        <span className="flex-[1_0_100%] text-xs text-muted-foreground">
          Les mises à jour et le statut sont visibles par le citoyen dans l’app.
        </span>
      </div>
    </Drawer>
  );
}
