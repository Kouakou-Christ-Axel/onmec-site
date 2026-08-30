import { listSignalements } from "@/features/signalements-admin/requests/list-signalements";
import { listSignalementCategories } from "@/features/signalements-admin/requests/list-signalement-categories";
import { SignalementsAdminClient } from "@/components/features/signalements-admin/signalements-admin-client";
import { STATUT_BY_TAB, type SignalementTab } from "@/features/signalements-admin/types/signalement-admin";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    categorieId?: string;
    page?: string;
    open?: string;
  }>;
}

const VALID_TABS: SignalementTab[] = ["validation", "encours", "resolu", "rejete"];

export default async function SignalementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab: SignalementTab | "tous" = VALID_TABS.includes(params.tab as SignalementTab)
    ? (params.tab as SignalementTab)
    : "tous";
  const categorieId = params.categorieId ?? "";
  const page = params.page ? Number(params.page) : 1;

  const [signalements, categories] = await Promise.all([
    listSignalements({
      statut: tab === "tous" ? undefined : STATUT_BY_TAB[tab],
      categorieId: categorieId || undefined,
      page,
    }),
    listSignalementCategories(),
  ]);

  return (
    <SignalementsAdminClient
      initialTab={tab}
      initialCategorieId={categorieId}
      initialPageNum={page}
      initialData={signalements}
      initialCategories={categories}
      initialOpenId={params.open ?? null}
    />
  );
}
