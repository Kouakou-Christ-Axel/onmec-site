import { listLibrairieCategories } from "@/features/librairie/requests/list-librairie-categories";
import { AddDocumentPage } from "@/components/features/librairie-admin/add-document-page";

export default async function NouveauDocumentPage() {
  const categories = await listLibrairieCategories();
  return <AddDocumentPage categories={categories} />;
}
