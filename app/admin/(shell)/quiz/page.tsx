import { listQuiz } from "@/features/quiz-admin/requests/list-quiz";
import { listCategories } from "@/features/quiz-admin/requests/list-categories";
import { QuizAdminClient } from "@/components/features/quiz-admin/quiz-admin-client";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    categorieId?: string;
    difficulte?: string;
    page?: string;
  }>;
}

export default async function QuizPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [quiz, categories] = await Promise.all([
    listQuiz({
      search: params.search,
      categorieId: params.categorieId,
      difficulte: params.difficulte,
      page: params.page ? Number(params.page) : 1,
    }),
    listCategories(),
  ]);
  return (
    <QuizAdminClient
      initialTab={
        params.tab === "categories" || params.tab === "resultats" ? params.tab : "liste"
      }
      initialData={quiz}
      initialCategories={categories}
    />
  );
}
