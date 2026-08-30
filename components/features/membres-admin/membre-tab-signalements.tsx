"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";

interface SignalementResume {
  id: string;
  titre: string;
  statut: string;
  createdAt: string;
}

interface SignalementsResponse {
  data: SignalementResume[];
}

export function MembreTabSignalements({ membreId }: { membreId: string }) {
  const query = useQuery({
    queryKey: ["membre", membreId, "signalements"],
    queryFn: () => getJson<SignalementsResponse>(`/api/admin/membres/${membreId}/signalements`),
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    );
  }

  if (query.isError) {
    return <p className="text-sm text-verdict-false">Impossible de charger les signalements.</p>;
  }

  const signalements = query.data?.data ?? [];
  if (signalements.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun signalement pour ce membre.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {signalements.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between gap-2.5 rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm"
        >
          <span className="truncate text-text-body">{s.titre}</span>
          <Tag>{s.statut}</Tag>
        </li>
      ))}
    </ul>
  );
}
