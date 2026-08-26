import { ArticleEditor } from "@/components/features/admin/article-editor";
import { getActualiteAdmin } from "@/features/actualites-admin/requests/get-actualite-admin";

export default async function ModifierArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actualite = await getActualiteAdmin(id);
  return <ArticleEditor existing={actualite} />;
}
