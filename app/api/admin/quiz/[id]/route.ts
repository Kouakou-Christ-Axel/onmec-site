import { NextResponse } from "next/server";
import { getQuiz } from "@/features/quiz-admin/requests/get-quiz";
import { updateQuiz } from "@/features/quiz-admin/requests/update-quiz";
import { deleteQuiz } from "@/features/quiz-admin/requests/delete-quiz";
import { quizFormSchema } from "@/features/quiz-admin/schemas/quiz-form-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const quiz = await getQuiz(id);
    return NextResponse.json(quiz);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, quizFormSchema);
  if (!parsed.success) return parsed.response;

  try {
    const quiz = await updateQuiz(id, parsed.data);
    return NextResponse.json(quiz);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await deleteQuiz(id);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
