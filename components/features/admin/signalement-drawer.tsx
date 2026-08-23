"use client";

import { useState } from "react";
import { X, Send, Check } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RESPONSABLES, type Signalement, type SignalementStatut } from "@/features/admin/data/signalements";

const STATUT_META: Record<SignalementStatut, { label: string; tone: "orange" | "blue" | "neutral" | "outline" }> = {
  validation: { label: "En validation", tone: "orange" },
  encours: { label: "En cours", tone: "blue" },
  resolu: { label: "Résolu", tone: "neutral" },
  rejete: { label: "Rejeté", tone: "outline" },
};

const ETAPES: { statut: SignalementStatut; label: string }[] = [
  { statut: "validation", label: "En validation" },
  { statut: "encours", label: "En cours" },
  { statut: "resolu", label: "Résolu" },
];

function updatesLabel(count: number): string {
  if (count === 0) return "aucune mise à jour";
  if (count === 1) return "1 mise à jour";
  return `${count} mises à jour`;
}

interface SignalementDrawerProps {
  signalement: Signalement | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<Signalement>) => void;
}

export function SignalementDrawer({ signalement, onClose, onChange }: SignalementDrawerProps) {
  const [maj, setMaj] = useState("");

  if (!signalement) return null;

  const order: SignalementStatut[] = ["validation", "encours", "resolu"];
  const currentIndex = order.indexOf(signalement.statut);

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
    <Drawer open={Boolean(signalement)} onClose={onClose}>
      <div className="flex items-center justify-between gap-3.5 border-b border-border-subtle bg-surface-card px-5.5 py-4.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Signalement citoyen
          </span>
          <span className="flex items-center gap-2.5">
            <span className="text-base font-semibold text-ink tabular-nums">{signalement.id}</span>
            <Tag tone={STATUT_META[signalement.statut].tone}>{STATUT_META[signalement.statut].label}</Tag>
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
                  i < currentIndex ? "border-verdict-true bg-verdict-true" : i === currentIndex ? "border-orange-500 bg-orange-500" : "border-n-300 bg-transparent"
                }`}
              />
              <span className={`text-xs ${i === currentIndex ? "font-semibold text-ink" : "text-muted-foreground"}`}>
                {etape.label}
              </span>
            </span>
          ))}
        </div>

        <h2 className="text-[1.375rem] leading-tight font-semibold tracking-[-0.026em] text-ink">
          {signalement.sujet}
        </h2>

        <div className="grid grid-cols-2 gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4 text-[0.8125rem]">
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-semibold text-ink">{signalement.categorie}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Reçu le</span>
            <span className="font-semibold text-ink">{signalement.recu}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Localisation</span>
            <span className="font-semibold text-ink">{signalement.lieu}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Signalé par</span>
            <span className="font-semibold text-ink">{signalement.auteur}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Visible dans l’app</span>
            <span className="font-semibold text-ink">{signalement.publie ? "Publié" : "Masqué"}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Responsable</span>
            <span className="font-semibold text-ink">{signalement.responsable || "—"}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Description du citoyen
          </span>
          <p className="text-[0.9375rem] leading-relaxed text-[#2b3646]">{signalement.contenu}</p>
        </div>

        <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">Modération</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange(signalement.id, { publie: true })}
              className={`h-9.5 rounded-md border text-sm font-semibold text-blue-700 ${signalement.publie ? "border-ink bg-white shadow-[5px_5px_0_var(--color-blue-500)]" : "border-border-strong bg-white"}`}
            >
              Afficher dans l’app
            </button>
            <button
              type="button"
              onClick={() => onChange(signalement.id, { publie: false })}
              className={`h-9.5 rounded-md border text-sm font-semibold text-[#2b3646] ${!signalement.publie ? "border-ink bg-white shadow-[5px_5px_0_var(--color-blue-500)]" : "border-border-strong bg-white"}`}
            >
              Masquer
            </button>
          </div>
          <span className="text-xs leading-relaxed text-muted-foreground">
            Un signalement masqué reste traité en interne, mais n’apparaît pas dans la carte publique de l’app.
          </span>
          <span className="h-px bg-border-subtle" />
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Statut du traitement
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ETAPES.map((etape) => (
              <button
                key={etape.statut}
                type="button"
                onClick={() => onChange(signalement.id, { statut: etape.statut })}
                className={`h-9.5 rounded-md border text-[0.8125rem] font-semibold text-ink ${signalement.statut === etape.statut ? "border-ink bg-white shadow-[5px_5px_0_var(--color-blue-500)]" : "border-border-strong bg-white"}`}
              >
                {etape.label}
              </button>
            ))}
          </div>
          <Field label="Responsable du suivi">
            <Select
              value={signalement.responsable}
              onChange={(e) => onChange(signalement.id, { responsable: e.target.value })}
            >
              <option value="">Choisir un responsable</option>
              {RESPONSABLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
        </div>

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
                  <span className="text-sm leading-relaxed text-[#2b3646]">{u.texte}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[0.8125rem] text-muted-foreground">
              Aucune mise à jour. Le citoyen ne voit encore que son signalement.
            </span>
          )}
          <Field label="Ajouter une mise à jour" hint="Visible par le citoyen dans l’app, avec la date et votre nom">
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
      </div>

      <div className="flex flex-none flex-wrap items-center gap-2.5 border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" icon={Check} onClick={onClose}>
          Enregistrer et fermer
        </Button>
        <Button variant="ghost" onClick={() => onChange(signalement.id, { statut: "rejete" })}>
          Rejeter le signalement
        </Button>
        <span className="flex-[1_0_100%] text-xs text-muted-foreground">
          Les mises à jour et le statut sont visibles par le citoyen dans l’app.
        </span>
      </div>
    </Drawer>
  );
}
