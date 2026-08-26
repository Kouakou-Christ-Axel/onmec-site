import { listActualitesAdmin } from "@/features/actualites-admin/requests/list-actualites-admin";
import { ActualitesAdminClient } from "@/components/features/admin/actualites-admin-client";

export default async function ActualitesPage() {
  const { data } = await listActualitesAdmin();
  return <ActualitesAdminClient initialActualites={data} />;
}
