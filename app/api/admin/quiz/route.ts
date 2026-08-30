import { NextResponse } from "next/server";
import { listQuiz } from "@/features/quiz-admin/requests/list-quiz";
import { createQuiz } from "@/features/quiz-admin/requests/create-quiz";
import { quizFormSchema } from "@/features/quiz-admin/schemas/quiz-form-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await listQuiz({
      categorieId: searchParams.get("categorieId") ?? undefined,
      difficulte: searchParams.get("difficulte") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, quizFormSchema);
  if (!parsed.success) return parsed.response;

  try {
    const quiz = await createQuiz(parsed.data);
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
