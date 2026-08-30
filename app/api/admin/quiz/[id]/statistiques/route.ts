import { NextResponse } from "next/server";
import { getQuizStats } from "@/features/quiz-admin/requests/get-quiz-stats";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const stats = await getQuizStats(id);
    return NextResponse.json(stats);
  } catch (error) {
    return toErrorResponse(error);
  }
}
