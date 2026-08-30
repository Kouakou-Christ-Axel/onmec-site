import { NextResponse } from "next/server";
import { listMembreQuiz } from "@/features/membres-admin/requests/list-membre-quiz";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await listMembreQuiz(id);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
