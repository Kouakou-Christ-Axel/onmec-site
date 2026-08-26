"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Tag } from "@/components/ui/tag";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { usePublierActualite } from "@/features/actualites-admin/mutations/use-publier-actualite";
import { useDepublierActualite } from "@/features/actualites-admin/mutations/use-depublier-actualite";
import { useDeleteActualite } from "@/features/actualites-admin/mutations/use-delete-actualite";
import type {
  ActualiteAdmin,
  StatutActualite,
} from "@/features/actualites-admin/types/actualite-admin";

const STATUT_LABELS: Record<StatutActualite, string> = {
  BROUILLON: "Brouillon",
  PUBLIEE: "Publiée",
  ARCHIVEE: "Archivée",
};

const STATUT_TONES: Record<StatutActualite, "orange" | "blue" | "neutral"> = {
  BROUILLON: "orange",
  PUBLIEE: "blue",
  ARCHIVEE: "neutral",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

interface ActualitesAdminClientProps {
  initialActualites: ActualiteAdmin[];
}

export function ActualitesAdminClient({ initialActualites }: ActualitesAdminClientProps) {
  const shell = useAdminShell();
  const router = useRouter();
  const [actualites, setActualites] = useState(initialActualites);
  const [pendingDelete, setPendingDelete] = useState<ActualiteAdmin | null>(null);

  const publier = usePublierActualite();
  const depublier = useDepublierActualite();
  const removeMutation = useDeleteActualite();

  function handleTogglePublication(actualite: ActualiteAdmin) {
    const mutation = actualite.statut === "PUBLIEE" ? depublier : publier;
    mutation.mutate(actualite.id, {
      onSuccess: (updated) => {
        setActualites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      },
      onError: () => {
        toast.error("Une erreur est survenue. Réessayez.");
      },
    });
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    removeMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        setActualites((prev) => prev.filter((item) => item.id !== pendingDelete.id));
        setPendingDelete(null);
      },
      onError: () => {
        toast.error("Une erreur est survenue. Réessayez.");
      },
    });
  }

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Site public
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Actualités et blog
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            Brouillon → Publié · rédaction par l’équipe communication
          </p>
        </div>
        {shell.canEdito ? (
          <Button
            variant="primary"
            icon={PenLine}
            onClick={() => router.push("/admin/actualites/nouveau")}
          >
            Nouvel article
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[minmax(0,1fr)_120px_156px_116px_140px_150px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Titre</span>
            <span>Statut</span>
            <span>Auteur</span>
            <span>Date</span>
            <span>Engagement</span>
            <span className="text-right">Actions</span>
          </div>
          {actualites.map((actualite) => {
            const togglePending =
              (publier.isPending && publier.variables === actualite.id) ||
              (depublier.isPending && depublier.variables === actualite.id);
            const deletePending =
              removeMutation.isPending && removeMutation.variables === actualite.id;
            const rowPending = togglePending || deletePending;

            return (
              <div
                key={actualite.id}
                className="grid grid-cols-[minmax(0,1fr)_120px_156px_116px_140px_150px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
              >
                <span className="font-medium text-ink">{actualite.title}</span>
                <span>
                  <Tag tone={STATUT_TONES[actualite.statut]}>{STATUT_LABELS[actualite.statut]}</Tag>
                </span>
                <span className="text-[0.8125rem] text-muted-foreground">
                  {actualite.author?.fullname ?? "—"}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  {formatDate(actualite.date)}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  {actualite.likesCount} ❤ · {actualite.commentsCount} 💬
                </span>
                <span className="flex justify-end gap-1.5">
                  {shell.canEdito ? (
                    <>
                      <IconButton
                        icon={Pencil}
                        label="Modifier"
                        size="sm"
                        disabled={rowPending}
                        onClick={() => router.push(`/admin/actualites/${actualite.id}/modifier`)}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={rowPending}
                        onClick={() => handleTogglePublication(actualite)}
                      >
                        {togglePending
                          ? "..."
                          : actualite.statut === "PUBLIEE"
                            ? "Dépublier"
                            : "Publier"}
                      </Button>
                      <IconButton
                        icon={Trash2}
                        label="Supprimer"
                        size="sm"
                        disabled={rowPending}
                        onClick={() => setPendingDelete(actualite)}
                      />
                    </>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Supprimer « ${pendingDelete?.title ?? ""} » ?`}
        description="Cette action est définitive."
        confirmLabel="Supprimer"
        destructive
        confirmPending={removeMutation.isPending}
      />
    </div>
  );
}
