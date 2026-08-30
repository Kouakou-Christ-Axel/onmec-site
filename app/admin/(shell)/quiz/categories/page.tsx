import { redirect } from "next/navigation";

export default function QuizCategoriesPage() {
  redirect("/admin/quiz?tab=categories");
}
