import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";

/** Une erreur non-ApiError doit remonter comme 500 via le framework, jamais etre masquee silencieusement. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(error.body, { status: error.status });
  }
  throw error;
}
