import { listLibrairieAdmin } from "@/features/librairie-admin/requests/list-librairie-admin";
import { listLibrairieCategories } from "@/features/librairie/requests/list-librairie-categories";
import { LibrairieAdminClient } from "@/components/features/librairie-admin/librairie-admin-client";

export default async function RessourcesPage() {
  const [{ data: documents }, categories] = await Promise.all([
    listLibrairieAdmin(),
    listLibrairieCategories(),
  ]);

  return <LibrairieAdminClient initialDocuments={documents} categories={categories} />;
}
