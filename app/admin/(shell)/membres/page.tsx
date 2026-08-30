import { listMembres } from "@/features/membres-admin/requests/list-membres";
import { MembresAdminClient } from "@/components/features/membres-admin/membres-admin-client";

interface PageProps {
  searchParams: Promise<{ q?: string; etat?: string; page?: string }>;
}

export default async function MembresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await listMembres({
    search: params.q,
    statut: params.etat as never,
    page: params.page ? Number(params.page) : 1,
  });
  return <MembresAdminClient initialData={result} />;
}
