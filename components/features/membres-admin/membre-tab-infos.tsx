"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import { Tag } from "@/components/ui/tag";
import { Skeleton } from "@/components/ui/skeleton";
import type { MembreAdmin } from "@/features/membres-admin/types/membre-admin";

const ETAT_LABEL: Record<MembreAdmin["etat"], string> = {
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
  BANNI: "Banni",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function MembreTabInfos({ membreId }: { membreId: string }) {
  const query = useQuery({
    queryKey: ["membre", membreId, "infos"],
    queryFn: () => getJson<MembreAdmin>(`/api/admin/membres/${membreId}`),
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <p className="text-sm text-verdict-false">Impossible de charger le profil.</p>;
  }

  const membre = query.data;
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2.5">
        <Tag tone={membre.etat === "ACTIF" ? "blue" : "outline"}>{ETAT_LABEL[membre.etat]}</Tag>
        <Tag tone={membre.emailVerifie ? "neutral" : "outline"}>
          {membre.emailVerifie ? "Email vérifié" : "Email non vérifié"}
        </Tag>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-y-2 text-text-body">
        <span className="text-muted-foreground">Email</span>
        <span>{membre.email}</span>
        <span className="text-muted-foreground">Téléphone</span>
        <span>{membre.telephone ?? "—"}</span>
        <span className="text-muted-foreground">Inscrit le</span>
        <span>{formatDate(membre.dateInscription)}</span>
      </div>
    </div>
  );
}
