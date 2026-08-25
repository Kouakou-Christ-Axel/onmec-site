import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-cookies";

/** Pas d'endpoint /auth/admin/logout cote backend : l'auth est stateless, on efface juste les cookies. */
export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
