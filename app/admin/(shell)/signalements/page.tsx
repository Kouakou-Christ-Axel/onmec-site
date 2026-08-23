"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Select } from "@/components/ui/select";
import { SignalementDrawer } from "@/components/features/admin/signalement-drawer";
import {
  SIGNALEMENTS,
  CATEGORIES_SIGNALEMENT,
  STATUT_META,
  updatesLabel,
  type Signalement,
  type SignalementStatut,
} from "@/features/admin/data/signalements";

type Filtre = "tous" | SignalementStatut;

export default function SignalementsPage() {
  const searchParams = useSearchParams();
  const [signalements, setSignalements] = useState<Signalement[]>(SIGNALEMENTS);
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [categorie, setCategorie] = useState("Toutes les catégories");
  const [openId, setOpenId] = useState<string | null>(searchParams.get("open"));

  const openSignalement = signalements.find((s) => s.id === openId) ?? null;

  const count = (statut: SignalementStatut) => signalements.filter((s) => s.statut === statut).length;

  const rows = useMemo(
    () =>
      signalements.filter(
        (s) => (filtre === "tous" || s.statut === filtre) && (categorie === "Toutes les catégories" || s.categorie === categorie),
      ),
    [signalements, filtre, categorie],
  );

  const patch = (id: string, p: Partial<Signalement>) => {
    setSignalements((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
  };

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Application mobile</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">Signalements</h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            En validation → En cours → Résolu · vous décidez de ce qui est visible dans l’app · 34 signalements
            clôturés les mois précédents
          </p>
        </div>
        <Button variant="secondary" icon={Download}>
          Exporter le mois
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Tag tone="outline" size="md" active={filtre === "tous"} onClick={() => setFiltre("tous")}>
          Tous
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "validation"} onClick={() => setFiltre("validation")}>
          En validation · {count("validation")}
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "encours"} onClick={() => setFiltre("encours")}>
          En cours · {count("encours")}
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "resolu"} onClick={() => setFiltre("resolu")}>
          Résolu · {count("resolu")}
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "rejete"} onClick={() => setFiltre("rejete")}>
          Rejeté · {count("rejete")}
        </Tag>
        <span className="ml-auto w-57.5">
          <Select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            <option>Toutes les catégories</option>
            {CATEGORIES_SIGNALEMENT.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[116px_minmax(200px,1fr)_158px_84px_124px_112px_96px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>N° de suivi</span>
            <span>Signalement</span>
            <span>Catégorie</span>
            <span>Reçu</span>
            <span>Responsable</span>
            <span>Statut</span>
            <span>App</span>
          </div>
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="grid w-full grid-cols-[116px_minmax(200px,1fr)_158px_84px_124px_112px_96px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-left text-sm last:border-b-0 hover:bg-n-50"
            >
              <span className="text-[0.8125rem] font-semibold text-muted-foreground tabular-nums">{r.id}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-ink">{r.sujet}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {r.lieu} · {updatesLabel(r.updates.length)}
                </span>
              </span>
              <span className="truncate text-[0.8125rem] text-muted-foreground">{r.categorie}</span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">{r.recu.slice(0, 5)}</span>
              <span className="text-[0.8125rem] text-[#2b3646]">{r.responsable || "—"}</span>
              <span>
                <Tag tone={STATUT_META[r.statut].tone}>{STATUT_META[r.statut].label}</Tag>
              </span>
              <span>
                <Tag tone={r.publie ? "blue" : "neutral"} icon={r.publie ? Eye : EyeOff}>
                  {r.publie ? "Publié" : "Masqué"}
                </Tag>
              </span>
            </button>
          ))}
        </div>
      </div>

      <SignalementDrawer signalement={openSignalement} onClose={() => setOpenId(null)} onChange={patch} />
    </div>
  );
}
