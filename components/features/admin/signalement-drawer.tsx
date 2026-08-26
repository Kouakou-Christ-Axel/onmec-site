"use client";

import { X, Check } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DialogTitle, useLastNonNull } from "@/components/ui/dialog";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SignalementModerationPanel } from "@/components/features/admin/signalement-moderation-panel";
import { SignalementUpdatesPanel } from "@/components/features/admin/signalement-updates-panel";
import {
  ETAPES,
  STATUT_META,
  type Signalement,
  type SignalementStatut,
} from "@/features/admin/data/signalements";

interface SignalementDrawerProps {
  signalement: Signalement | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<Signalement>) => void;
}

export function SignalementDrawer({ signalement, onClose, onChange }: SignalementDrawerProps) {
  const shown = useLastNonNull(signalement);
  if (!shown) return null;

  const order: SignalementStatut[] = ["validation", "encours", "resolu"];
  const currentIndex = order.indexOf(shown.statut);

  return (
    <Drawer open={signalement !== null} onClose={onClose}>
      <div className="flex items-center justify-between gap-3.5 border-b border-border-subtle bg-surface-card px-5.5 py-4.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Signalement citoyen
          </span>
          <span className="flex items-center gap-2.5">
            <span className="text-base font-semibold text-ink tabular-nums">{shown.id}</span>
            <Tag tone={STATUT_META[shown.statut].tone}>{STATUT_META[shown.statut].label}</Tag>
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
            {shown.sujet}
          </h2>
        </DialogTitle>

        <div className="grid grid-cols-2 gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4 text-[0.8125rem]">
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-semibold text-ink">{shown.categorie}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Reçu le</span>
            <span className="font-semibold text-ink">{shown.recu}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Localisation</span>
            <span className="font-semibold text-ink">{shown.lieu}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Signalé par</span>
            <span className="font-semibold text-ink">{shown.auteur}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Visible dans l’app</span>
            <span className="font-semibold text-ink">{shown.publie ? "Publié" : "Masqué"}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Responsable</span>
            <span className="font-semibold text-ink">{shown.responsable || "—"}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Description du citoyen
          </span>
          <p className="text-[0.9375rem] leading-relaxed text-[#2b3646]">{shown.contenu}</p>
        </div>

        <SignalementModerationPanel signalement={shown} onChange={onChange} />

        <SignalementUpdatesPanel signalement={shown} onChange={onChange} />
      </div>

      <div className="flex flex-none flex-wrap items-center gap-2.5 border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" icon={Check} onClick={onClose}>
          Enregistrer et fermer
        </Button>
        <Button variant="ghost" onClick={() => onChange(shown.id, { statut: "rejete" })}>
          Rejeter le signalement
        </Button>
        <span className="flex-[1_0_100%] text-xs text-muted-foreground">
          Les mises à jour et le statut sont visibles par le citoyen dans l’app.
        </span>
      </div>
    </Drawer>
  );
}
