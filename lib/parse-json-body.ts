import { NextResponse } from "next/server";
import type { ZodType } from "zod";

type ParseResult<T> = { success: true; data: T } | { success: false; response: NextResponse };

/**
 * Forme d'erreur alignee sur le ValidationPipe par defaut de NestJS
 * (onmec_backend/src/main.ts n'a pas d'exceptionFactory custom).
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { statusCode: 400, message: ["Corps de requete invalide"], error: "Bad Request" },
        { status: 400 },
      ),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          statusCode: 400,
          message: result.error.issues.map((issue) => issue.message),
          error: "Bad Request",
        },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: result.data };
}
