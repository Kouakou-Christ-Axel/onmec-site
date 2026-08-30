"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Coins, UserX, UserCheck } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { LibrairiePagination } from "@/components/features/librairie/librairie-pagination";
import { useMembresList } from "@/features/membres-admin/queries/use-membres-list";
import { syncUrlParams } from "@/lib/sync-url";
import { MembreDetailDrawer } from "./membre-detail-drawer";
import { AjusterPointsDialog } from "./ajuster-points-dialog";
import { ChangerEtatMembreDialog } from "./changer-etat-membre-dialog";
import type { MembreAdmin, MembreListResponse } from "@/features/membres-admin/types/membre-admin";

const ETAT_LABEL: Record<MembreAdmin["etat"], string> = {
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
  BANNI: "Banni",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

interface MembresAdminClientProps {
  initialData: MembreListResponse;
}

export function MembresAdminClient({ initialData }: MembresAdminClientProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [etat, setEtat] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MembreAdmin | null>(null);
  const [ajusterPoints, setAjusterPoints] = useState<MembreAdmin | null>(null);
  const [changerEtat, setChangerEtat] = useState<MembreAdmin | null>(null);

  const membresQuery = useMembresList({ search: debouncedQuery, etat, page, initialData });
  const data = membresQuery.data ?? initialData;

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    syncUrlParams({ q: debouncedQuery, etat, page: page > 1 ? String(page) : "" });
  }, [debouncedQuery, etat, page]);

  function invalidateList() {
    queryClient.invalidateQueries({ queryKey: ["membres-list"] });
  }

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
          Espace membre
        </span>
        <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
          Membres
        </h1>
        <p className="text-[0.9375rem] text-muted-foreground">
          {data.meta.total} membre{data.meta.total > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un membre…"
          className="max-w-72"
        />
        <Select
          value={etat}
          onChange={(e) => {
            setEtat(e.target.value);
            setPage(1);
          }}
          className="w-44"
        >
          <option value="">Tous les états</option>
          <option value="ACTIF">Actif</option>
          <option value="SUSPENDU">Suspendu</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[minmax(0,1fr)_140px_160px_140px_140px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Membre</span>
            <span>État</span>
            <span>Inscrit le</span>
            <span>Vérifié</span>
            <span className="text-right">Actions</span>
          </div>
          {data.data.map((membre) => (
            <div
              key={membre.id}
              className="grid grid-cols-[minmax(0,1fr)_140px_160px_140px_140px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setSelected(membre)}
                className="truncate text-left font-medium text-ink hover:underline"
              >
                {membre.nom}
                <span className="block text-xs font-normal text-muted-foreground">
                  {membre.email}
                </span>
              </button>
              <span>
                <Tag tone={membre.etat === "ACTIF" ? "blue" : "outline"}>
                  {ETAT_LABEL[membre.etat]}
                </Tag>
              </span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                {formatDate(membre.dateInscription)}
              </span>
              <span className="text-[0.8125rem] text-muted-foreground">
                {membre.emailVerifie ? "Oui" : "Non"}
              </span>
              <span className="flex justify-end gap-1.5">
                <IconButton
                  icon={Coins}
                  label="Ajuster les points"
                  size="sm"
                  onClick={() => setAjusterPoints(membre)}
                />
                <IconButton
                  icon={membre.etat === "ACTIF" ? UserX : UserCheck}
                  label={membre.etat === "ACTIF" ? "Désactiver" : "Réactiver"}
                  size="sm"
                  onClick={() => setChangerEtat(membre)}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <LibrairiePagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />

      <MembreDetailDrawer membre={selected} onClose={() => setSelected(null)} />
      <AjusterPointsDialog
        membre={ajusterPoints}
        onClose={() => setAjusterPoints(null)}
        onAjuste={invalidateList}
      />
      <ChangerEtatMembreDialog
        membre={changerEtat}
        onClose={() => setChangerEtat(null)}
        onChange={invalidateList}
      />
    </div>
  );
}
