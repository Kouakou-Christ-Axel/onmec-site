import { getQuiz } from "@/features/quiz-admin/requests/get-quiz";
import { QuizEditorForm } from "@/components/features/quiz-admin/quiz-editor-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModifierQuizPage({ params }: PageProps) {
  const { id } = await params;
  const quiz = await getQuiz(id);
  return <QuizEditorForm quiz={quiz} />;
}
