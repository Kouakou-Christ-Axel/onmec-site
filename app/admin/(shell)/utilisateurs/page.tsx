import { listAdminUsers } from "@/features/admin-users/requests/list-admin-users";
import { AdminUsersClient } from "@/components/features/admin-users/admin-users-client";
import { DROITS } from "@/features/admin/data/droits";
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function UtilisateursPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await listAdminUsers({
    search: params.q,
    role: params.role as AdminRole | undefined,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <AdminUsersClient initialData={result} />

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        <div className="border-b border-border-subtle px-5 pt-4.5 pb-3.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Droits par rôle
          </span>
          <p className="mt-2 text-[0.8125rem] text-muted-foreground">Oui · Non — accès binaire</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_150px_150px] gap-3 border-b border-border-subtle bg-n-50 px-5 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
              <span>Capacité</span>
              <span className="text-center">Admin national</span>
              <span className="text-center">Communication</span>
              <span className="text-center">Modération</span>
            </div>
            {DROITS.map((d) => (
              <div
                key={d.capacite}
                className="grid grid-cols-[minmax(0,1fr)_150px_150px_150px] items-center gap-3 border-b border-border-subtle px-5 py-2.5 text-sm last:border-b-0"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-ink">{d.libelle}</span>
                  <span className="text-xs text-muted-foreground">{d.capacite}</span>
                </span>
                <span className="text-center text-text-body">
                  {d.administrateur ? "Oui" : "Non"}
                </span>
                <span className="text-center text-text-body">
                  {d.communication ? "Oui" : "Non"}
                </span>
                <span className="text-center text-text-body">{d.moderation ? "Oui" : "Non"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
