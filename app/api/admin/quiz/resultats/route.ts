import { NextResponse } from "next/server";
import { listResults } from "@/features/quiz-admin/requests/list-results";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  try {
    const results = await listResults({
      page: params.get("page") ? Number(params.get("page")) : undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
      quizId: params.get("quizId") ?? undefined,
    });
    return NextResponse.json(results);
  } catch (error) {
    return toErrorResponse(error);
  }
}
