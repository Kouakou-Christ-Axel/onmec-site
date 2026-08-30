"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Tag } from "@/components/ui/tag";
import { Select } from "@/components/ui/select";
import { LibrairiePagination } from "@/components/features/librairie/librairie-pagination";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useSignalementsList } from "@/features/signalements-admin/queries/use-signalements-list";
import { useSignalementUpdates } from "@/features/signalements-admin/queries/use-signalement-updates";
import { useUpdateSignalement } from "@/features/signalements-admin/mutations/use-update-signalement";
import { useCreateSignalementUpdate } from "@/features/signalements-admin/mutations/use-create-signalement-update";
import { syncUrlParams } from "@/lib/sync-url";
import { SignalementDrawer } from "./signalement-drawer";
import {
  SIGNALEMENT_TAB_META,
  STATUT_BY_TAB,
  signalementTab,
  type SignalementCategorie,
  type SignalementListResponse,
  type SignalementStatutApi,
  type SignalementTab,
} from "@/features/signalements-admin/types/signalement-admin";

const TAB_ORDER: SignalementTab[] = ["validation", "encours", "resolu", "rejete"];

interface SignalementsAdminClientProps {
  initialTab: SignalementTab | "tous";
  initialCategorieId: string;
  initialPageNum: number;
  initialData: SignalementListResponse;
  initialCategories: SignalementCategorie[];
  initialOpenId: string | null;
}

export function SignalementsAdminClient({
  initialTab,
  initialCategorieId,
  initialPageNum,
  initialData,
  initialCategories,
  initialOpenId,
}: SignalementsAdminClientProps) {
  const shell = useAdminShell();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SignalementTab | "tous">(initialTab);
  const [categorieId, setCategorieId] = useState(initialCategorieId);
  const [page, setPage] = useState(initialPageNum);
  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  const updateMutation = useUpdateSignalement();
  const createUpdateMutation = useCreateSignalementUpdate();

  const statut: SignalementStatutApi | "" = tab === "tous" ? "" : STATUT_BY_TAB[tab];
  const listQuery = useSignalementsList({ statut, categorieId, page, initialData });
  const data = listQuery.data ?? initialData;
  const updatesQuery = useSignalementUpdates(openId);

  useEffect(() => {
    syncUrlParams({
      tab: tab === "tous" ? "" : tab,
      categorieId,
      page: page > 1 ? String(page) : "",
      open: openId ?? "",
    });
  }, [tab, categorieId, page, openId]);

  const openSignalement = data.data.find((s) => s.id === openId) ?? null;

  function invalidateList() {
    queryClient.invalidateQueries({ queryKey: ["signalements-list"] });
  }

  function handleChangeStatut(id: string, next: SignalementStatutApi) {
    updateMutation.mutate(
      { id, statut: next },
      { onSuccess: invalidateList, onError: () => toast.error("Une erreur est survenue. Réessayez.") },
    );
  }

  function handleChangeValidation(id: string, validation: boolean) {
    updateMutation.mutate(
      { id, validation },
      { onSuccess: invalidateList, onError: () => toast.error("Une erreur est survenue. Réessayez.") },
    );
  }

  function handleAddUpdate(id: string, texte: string) {
    createUpdateMutation.mutate(
      { id, texte },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["signalement-updates", id] }),
        onError: () => toast.error("Une erreur est survenue. Réessayez."),
      },
    );
  }

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Application mobile
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Signalements
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            {data.meta.total} signalement{data.meta.total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Tag
          tone="outline"
          size="md"
          active={tab === "tous"}
          onClick={() => {
            setTab("tous");
            setPage(1);
          }}
        >
          Tous
        </Tag>
        {TAB_ORDER.map((t) => (
          <Tag
            key={t}
            tone="outline"
            size="md"
            active={tab === t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
          >
            {SIGNALEMENT_TAB_META[t].label}
          </Tag>
        ))}
        <span className="ml-auto w-57.5">
          <Select
            value={categorieId}
            onChange={(e) => {
              setCategorieId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Toutes les catégories</option>
            {initialCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </Select>
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[minmax(200px,1fr)_158px_112px_140px_96px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Signalement</span>
            <span>Catégorie</span>
            <span>Reçu</span>
            <span>Statut</span>
            <span>App</span>
          </div>
          {data.data.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="grid w-full grid-cols-[minmax(200px,1fr)_158px_112px_140px_96px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-left text-sm last:border-b-0 hover:bg-n-50"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-ink">{r.titre}</span>
                <span className="truncate text-xs text-muted-foreground">{r.adresse}</span>
              </span>
              <span className="truncate text-[0.8125rem] text-muted-foreground">
                {r.categorie?.nom ?? "—"}
              </span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                {new Date(r.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <span>
                <Tag tone={SIGNALEMENT_TAB_META[signalementTab(r.statut)].tone}>
                  {SIGNALEMENT_TAB_META[signalementTab(r.statut)].label}
                </Tag>
              </span>
              <span>
                <Tag tone={r.validation ? "blue" : "neutral"} icon={r.validation ? Eye : EyeOff}>
                  {r.validation ? "Publié" : "Masqué"}
                </Tag>
              </span>
            </button>
          ))}
        </div>
      </div>

      <LibrairiePagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />

      <SignalementDrawer
        signalement={openSignalement}
        onClose={() => setOpenId(null)}
        onChangeStatut={handleChangeStatut}
        onChangeValidation={handleChangeValidation}
        pending={updateMutation.isPending || !shell.canSig}
        updates={updatesQuery.data ?? []}
        updatesLoading={updatesQuery.isLoading}
        addingUpdate={createUpdateMutation.isPending}
        onAddUpdate={handleAddUpdate}
      />
    </div>
  );
}
