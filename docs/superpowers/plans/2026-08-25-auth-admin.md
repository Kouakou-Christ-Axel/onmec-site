# Auth back-office (admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Branch the `/admin/connexion` screen onto the real onmec_backend back-office auth (`/api/v1/auth/admin/*`), add an edge session guard for `app/admin/(shell)/*`, and handle the mandatory first-login password change.

**Architecture:** New `features/admin-auth/` domain (types/schemas/requests/lib/mutations) mirrors the existing `features/auth/` layering. A root `proxy.ts` middleware enforces session presence and transparently refreshes expired access tokens for every `/admin/*` route except `/admin/connexion`. `app/admin/(shell)/layout.tsx` becomes an async Server Component that fetches `/auth/admin/me`, redirects to a new `/admin/changer-mot-de-passe` page when `mustChangePassword` is true, and seeds `AdminShellProvider` with the real role/fullname/email. Two currently member-scoped utilities (`setAuthCookies`/`clearAuthCookies`/`getRefreshToken`, `toErrorResponse`) move from `features/auth/lib/` to `lib/` so both the member and admin domains can use them without violating the project's layering rule.

**Tech Stack:** Next.js App Router on vinext 1.0.0-beta.8 (Cloudflare Workers target), React 19, TypeScript strict, Zod, TanStack Query, Tailwind CSS v4, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-25-auth-admin-design.md`

## Global Constraints

- Zod bounds come from the backend OpenAPI, not from the existing member schemas: email `z.email().max(254)` (not `.max(100)`), `change-password` new password `min(12).max(128)`, no `confirmPassword` field (the backend DTO has none).
- New domain folder is `features/admin-auth/` (matches the existing `components/features/admin-auth/`), never `features/auth-admin/`.
- Reuse the existing cookies `onmec_token`/`onmec_refresh_token` and `AUTH_COOKIE_OPTIONS` from `config/auth.ts` unchanged (no `maxAge` — session cookies, not "remember me"). Do not create admin-specific cookie names.
- No client-side retry-on-401 / refresh mutation. Token refresh lives only in `proxy.ts`. Do not create a `features/admin-auth/requests/admin-refresh-token.ts`.
- Kebab-case file names, ≤200 lines per file.
- `pnpm run typecheck` and `pnpm run lint` must be clean before every commit in this plan.
- Do not touch `InscriptionView`, `AttenteView`, `ExpireView`, or the member auth domain (`features/auth/*` other than the two files being relocated) — out of scope per the spec.

---

## Task 1: Relocate shared auth utilities out of the member domain into `lib/`

**Files:**
- Create: `lib/auth-cookies.ts`
- Create: `lib/to-error-response.ts`
- Delete: `features/auth/lib/auth-cookies.ts`
- Delete: `features/auth/lib/to-error-response.ts`
- Modify: `app/api/auth/login/route.ts`
- Modify: `app/api/auth/register/route.ts`
- Modify: `app/api/auth/verify-email/route.ts`
- Modify: `app/api/auth/refresh-token/route.ts`

**Interfaces:**
- Produces: `setAuthCookies(tokens: { token: string; refreshToken: string }): Promise<void>`, `clearAuthCookies(): Promise<void>`, `getRefreshToken(): Promise<string | undefined>` from `@/lib/auth-cookies`. `toErrorResponse(error: unknown): NextResponse` from `@/lib/to-error-response`.

This is a pure relocation — behavior must not change. `lib/` may only import from `config/` (never `features/`), which is why the token parameter is a locally-defined structural type instead of importing `AuthTokens` from `features/auth/types/auth.ts`.

- [ ] **Step 1: Create `lib/auth-cookies.ts`**

```ts
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/config/auth";

interface SessionTokens {
  token: string;
  refreshToken: string;
}

/**
 * Ecriture des cookies de session : appelable uniquement depuis un route handler
 * ou une Server Action. cookies().set()/delete() levent hors d'un contexte
 * de mutation (jamais depuis le render d'un Server Component/layout/page).
 * Partage entre tous les domaines d'auth (membre, admin) : un JWT porte son
 * propre claim `type`, donc les mêmes cookies servent aux deux.
 */
export async function setAuthCookies(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  store.set(AUTH_TOKEN_COOKIE, tokens.token, AUTH_COOKIE_OPTIONS);
  store.set(AUTH_REFRESH_COOKIE, tokens.refreshToken, AUTH_COOKIE_OPTIONS);
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_TOKEN_COOKIE);
  store.delete(AUTH_REFRESH_COOKIE);
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_REFRESH_COOKIE)?.value;
}
```

- [ ] **Step 2: Create `lib/to-error-response.ts`**

```ts
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";

/** Une erreur non-ApiError doit remonter comme 500 via le framework, jamais etre masquee silencieusement. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(error.body, { status: error.status });
  }
  throw error;
}
```

- [ ] **Step 3: Delete the old files and the now-empty directory**

```bash
rm features/auth/lib/auth-cookies.ts features/auth/lib/to-error-response.ts
rmdir features/auth/lib
```

- [ ] **Step 4: Update `app/api/auth/login/route.ts` imports**

Replace the full file content with:

```ts
import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { loginSchema } from "@/features/auth/schemas/login-schema";
import { loginRequest } from "@/features/auth/requests/login";
import { setAuthCookies } from "@/lib/auth-cookies";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, loginSchema);
  if (!parsed.success) return parsed.response;

  try {
    const auth = await loginRequest(parsed.data);
    await setAuthCookies(auth);

    const { token: _token, refreshToken: _refreshToken, ...user } = auth;
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 5: Update `app/api/auth/register/route.ts` imports**

Replace the full file content with:

```ts
import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { registerSchema } from "@/features/auth/schemas/register-schema";
import { registerRequest } from "@/features/auth/requests/register";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, registerSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await registerRequest(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 6: Update `app/api/auth/verify-email/route.ts` imports**

Replace the full file content with:

```ts
import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { verifyEmailSchema } from "@/features/auth/schemas/verify-email-schema";
import { verifyEmailRequest } from "@/features/auth/requests/verify-email";
import { setAuthCookies } from "@/lib/auth-cookies";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, verifyEmailSchema);
  if (!parsed.success) return parsed.response;

  try {
    const auth = await verifyEmailRequest(parsed.data);
    await setAuthCookies(auth);

    const { token: _token, refreshToken: _refreshToken, ...user } = auth;
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 7: Update `app/api/auth/refresh-token/route.ts` imports**

Replace the full file content with:

```ts
import { NextResponse } from "next/server";
import { refreshTokenRequest } from "@/features/auth/requests/refresh-token";
import { setAuthCookies, clearAuthCookies, getRefreshToken } from "@/lib/auth-cookies";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ message: "Session expiree" }, { status: 401 });
  }

  try {
    const tokens = await refreshTokenRequest(refreshToken);
    await setAuthCookies(tokens);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await clearAuthCookies();
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 8: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean, no errors referencing `features/auth/lib`.

- [ ] **Step 9: Manual smoke test — member login unaffected**

With the dev server running (`pnpm run dev`), run:

```bash
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"nobody@example.com","password":"x"}'
```

Expected: same `{"message":"Identifiants invalides",...}`-shaped 401 JSON as before the refactor (proves the relocation didn't change behavior).

- [ ] **Step 10: Commit**

```bash
git add lib/auth-cookies.ts lib/to-error-response.ts app/api/auth/login/route.ts app/api/auth/register/route.ts app/api/auth/verify-email/route.ts app/api/auth/refresh-token/route.ts
git add -u features/auth/lib
git commit -m "refactor(auth): move cookie/error-response helpers to lib/

Both the member and upcoming admin auth domains need these; features/lib
can only be imported by its own domain, so the domain-agnostic pieces
move to lib/ where the layering rule already expects them."
```

---

## Task 2: `features/admin-auth` — types and schemas

**Files:**
- Create: `features/admin-auth/types/admin-auth.ts`
- Create: `features/admin-auth/schemas/admin-login-schema.ts`
- Create: `features/admin-auth/schemas/admin-change-password-schema.ts`
- Test: `features/admin-auth/schemas/admin-login-schema.test.ts`
- Test: `features/admin-auth/schemas/admin-change-password-schema.test.ts`

**Interfaces:**
- Produces: types `AdminRole`, `AdminLoginResponse`, `AdminUser`, `AdminSession` from `@/features/admin-auth/types/admin-auth`. Schemas `adminLoginSchema`/`AdminLoginInput` from `@/features/admin-auth/schemas/admin-login-schema`, `adminChangePasswordSchema`/`AdminChangePasswordInput` from `@/features/admin-auth/schemas/admin-change-password-schema`.

- [ ] **Step 1: Create `features/admin-auth/types/admin-auth.ts`**

```ts
export type AdminRole = "ADMIN_NATIONAL" | "CHARGE_COMMUNICATION" | "MODERATEUR";

export interface AdminLoginResponse {
  id: string;
  email: string;
  fullname: string;
  phone: string | null;
  avatar: string | null;
  type: "admin";
  role: AdminRole;
  capabilities: string[];
  permissions: { modules: Record<string, string[]> };
  token: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

export type AdminUser = Omit<AdminLoginResponse, "token" | "refreshToken">;

export interface AdminSession {
  id: string;
  type: "admin";
  role: AdminRole;
  email: string;
  fullname: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
}
```

- [ ] **Step 2: Write the failing test for the login schema**

```ts
// features/admin-auth/schemas/admin-login-schema.test.ts
import { describe, expect, it } from "vitest";
import { adminLoginSchema } from "@/features/admin-auth/schemas/admin-login-schema";

describe("adminLoginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = adminLoginSchema.safeParse({
      email: "national@mec-ci.org",
      password: "MotDePasseSeed!2026",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an email over 254 characters", () => {
    const longEmail = `${"a".repeat(250)}@mec.org`;
    const result = adminLoginSchema.safeParse({ email: longEmail, password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = adminLoginSchema.safeParse({ email: "a@mec.org", password: "" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm run test -- admin-login-schema`
Expected: FAIL — `adminLoginSchema` is not defined (module does not exist yet).

- [ ] **Step 4: Create `features/admin-auth/schemas/admin-login-schema.ts`**

```ts
import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm run test -- admin-login-schema`
Expected: PASS, 3 tests.

- [ ] **Step 6: Write the failing test for the change-password schema**

```ts
// features/admin-auth/schemas/admin-change-password-schema.test.ts
import { describe, expect, it } from "vitest";
import { adminChangePasswordSchema } from "@/features/admin-auth/schemas/admin-change-password-schema";

describe("adminChangePasswordSchema", () => {
  it("accepts a valid password change", () => {
    const result = adminChangePasswordSchema.safeParse({
      oldPassword: "MotDePasseSeed!2026",
      password: "NouveauMotDePasseSeed!2026",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a new password under 12 characters", () => {
    const result = adminChangePasswordSchema.safeParse({
      oldPassword: "MotDePasseSeed!2026",
      password: "short1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty old password", () => {
    const result = adminChangePasswordSchema.safeParse({
      oldPassword: "",
      password: "NouveauMotDePasseSeed!2026",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `pnpm run test -- admin-change-password-schema`
Expected: FAIL — module does not exist yet.

- [ ] **Step 8: Create `features/admin-auth/schemas/admin-change-password-schema.ts`**

```ts
import { z } from "zod";

export const adminChangePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  password: z.string().min(12).max(128),
});

export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;
```

- [ ] **Step 9: Run it to verify it passes**

Run: `pnpm run test -- admin-change-password-schema`
Expected: PASS, 3 tests.

- [ ] **Step 10: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 11: Commit**

```bash
git add features/admin-auth/types features/admin-auth/schemas
git commit -m "feat(admin-auth): types and zod schemas for back-office auth"
```

---

## Task 3: `features/admin-auth` — requests and role mapping

**Files:**
- Create: `features/admin-auth/requests/admin-login.ts`
- Create: `features/admin-auth/requests/admin-me.ts`
- Create: `features/admin-auth/requests/admin-change-password.ts`
- Create: `features/admin-auth/lib/map-admin-role.ts`
- Test: `features/admin-auth/lib/map-admin-role.test.ts`

**Interfaces:**
- Consumes: `apiFetch<T>(path, options)` from `@/lib/api-client` (existing). `AdminLoginResponse`, `AdminSession`, `AdminRole` from `@/features/admin-auth/types/admin-auth` (Task 2). `AdminLoginInput` from `@/features/admin-auth/schemas/admin-login-schema` (Task 2). `AdminChangePasswordInput` from `@/features/admin-auth/schemas/admin-change-password-schema` (Task 2).
- Produces: `adminLoginRequest(payload: AdminLoginInput): Promise<AdminLoginResponse>`, `adminMeRequest(): Promise<AdminSession>`, `adminChangePasswordRequest(payload: AdminChangePasswordInput): Promise<{message: string}>` — all server-only (depend transitively on `next/headers` via `apiFetch`). `mapAdminRole(role: AdminRole): "Administrateur national" | "Chargée de communication" | "Modérateur"` from `@/features/admin-auth/lib/map-admin-role` — pure, no server dependency.

- [ ] **Step 1: Create `features/admin-auth/requests/admin-login.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { AdminLoginInput } from "@/features/admin-auth/schemas/admin-login-schema";
import type { AdminLoginResponse } from "@/features/admin-auth/types/admin-auth";

export function adminLoginRequest(payload: AdminLoginInput): Promise<AdminLoginResponse> {
  return apiFetch<AdminLoginResponse>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}
```

- [ ] **Step 2: Create `features/admin-auth/requests/admin-me.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { AdminSession } from "@/features/admin-auth/types/admin-auth";

export function adminMeRequest(): Promise<AdminSession> {
  return apiFetch<AdminSession>("/auth/admin/me");
}
```

- [ ] **Step 3: Create `features/admin-auth/requests/admin-change-password.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { AdminChangePasswordInput } from "@/features/admin-auth/schemas/admin-change-password-schema";

export function adminChangePasswordRequest(
  payload: AdminChangePasswordInput,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/admin/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
```

- [ ] **Step 4: Write the failing test for the role mapper**

```ts
// features/admin-auth/lib/map-admin-role.test.ts
import { describe, expect, it } from "vitest";
import { mapAdminRole } from "@/features/admin-auth/lib/map-admin-role";

describe("mapAdminRole", () => {
  it("maps ADMIN_NATIONAL to its display label", () => {
    expect(mapAdminRole("ADMIN_NATIONAL")).toBe("Administrateur national");
  });

  it("maps CHARGE_COMMUNICATION to its display label", () => {
    expect(mapAdminRole("CHARGE_COMMUNICATION")).toBe("Chargée de communication");
  });

  it("maps MODERATEUR to its display label", () => {
    expect(mapAdminRole("MODERATEUR")).toBe("Modérateur");
  });
});
```

- [ ] **Step 5: Run it to verify it fails**

Run: `pnpm run test -- map-admin-role`
Expected: FAIL — module does not exist yet.

- [ ] **Step 6: Create `features/admin-auth/lib/map-admin-role.ts`**

```ts
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type AdminRoleLabel = "Administrateur national" | "Chargée de communication" | "Modérateur";

const ADMIN_ROLE_LABELS: Record<AdminRole, AdminRoleLabel> = {
  ADMIN_NATIONAL: "Administrateur national",
  CHARGE_COMMUNICATION: "Chargée de communication",
  MODERATEUR: "Modérateur",
};

/**
 * `AdminRoleLabel` est structurellement identique au type `AdminRole` exporté
 * par `components/features/admin/admin-shell-context.tsx` — pas d'import
 * croisé feature/component, la compatibilité TypeScript est structurelle.
 */
export function mapAdminRole(role: AdminRole): AdminRoleLabel {
  return ADMIN_ROLE_LABELS[role];
}
```

- [ ] **Step 7: Run it to verify it passes**

Run: `pnpm run test -- map-admin-role`
Expected: PASS, 3 tests.

- [ ] **Step 8: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 9: Commit**

```bash
git add features/admin-auth/requests features/admin-auth/lib
git commit -m "feat(admin-auth): server requests and role label mapping"
```

---

## Task 4: `features/admin-auth` — client mutations

**Files:**
- Create: `features/admin-auth/mutations/use-admin-login.ts`
- Create: `features/admin-auth/mutations/use-admin-change-password.ts`
- Create: `features/admin-auth/mutations/use-admin-logout.ts`

**Interfaces:**
- Consumes: `postJson<T>(path, body)` from `@/lib/fetch-json` (existing, browser-safe). `AdminLoginInput` (Task 2), `AdminUser` (Task 2), `AdminChangePasswordInput` (Task 2).
- Produces: `useAdminLogin()` → `useMutation` whose `mutate({email, password})` resolves to `AdminUser` (includes `mustChangePassword`, `role`, etc., no tokens). `useAdminChangePassword()` → `mutate({oldPassword, password})` resolves to `{message: string}`. `useAdminLogout()` → `mutate()` (no variables) resolves to `{ok: true}`.

These are client (`"use client"` via the `mutations/` convention — TanStack Query hooks, no direct DOM/JSX) files calling the BFF routes built in Task 5. They can be written now; the routes don't need to exist yet for this task's typecheck to pass (the paths are just strings).

- [ ] **Step 1: Create `features/admin-auth/mutations/use-admin-login.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { AdminLoginInput } from "@/features/admin-auth/schemas/admin-login-schema";
import type { AdminUser } from "@/features/admin-auth/types/admin-auth";

export function useAdminLogin() {
  return useMutation({
    mutationFn: (input: AdminLoginInput) => postJson<AdminUser>("/api/auth/admin/login", input),
  });
}
```

- [ ] **Step 2: Create `features/admin-auth/mutations/use-admin-change-password.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { AdminChangePasswordInput } from "@/features/admin-auth/schemas/admin-change-password-schema";

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: (input: AdminChangePasswordInput) =>
      postJson<{ message: string }>("/api/auth/admin/change-password", input),
  });
}
```

- [ ] **Step 3: Create `features/admin-auth/mutations/use-admin-logout.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";

export function useAdminLogout() {
  return useMutation({
    mutationFn: () => postJson<{ ok: true }>("/api/auth/admin/logout", {}),
  });
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 5: Commit**

```bash
git add features/admin-auth/mutations
git commit -m "feat(admin-auth): TanStack Query mutations for login/change-password/logout"
```

---

## Task 5: BFF routes `app/api/auth/admin/*`

**Files:**
- Create: `app/api/auth/admin/login/route.ts`
- Create: `app/api/auth/admin/change-password/route.ts`
- Create: `app/api/auth/admin/logout/route.ts`

**Interfaces:**
- Consumes: `parseJsonBody<T>(request, schema)` from `@/lib/parse-json-body` (existing). `adminLoginSchema`, `adminChangePasswordSchema` (Task 2). `adminLoginRequest`, `adminChangePasswordRequest` (Task 3). `setAuthCookies`, `clearAuthCookies` from `@/lib/auth-cookies` (Task 1). `toErrorResponse` from `@/lib/to-error-response` (Task 1).
- Produces: `POST /api/auth/admin/login` (body `{email,password}` → 200 `AdminUser` JSON, sets cookies), `POST /api/auth/admin/change-password` (body `{oldPassword,password}` → 200 `{message}`), `POST /api/auth/admin/logout` (no body → 200 `{ok:true}`, clears cookies, no backend call).

- [ ] **Step 1: Create `app/api/auth/admin/login/route.ts`**

```ts
import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { adminLoginSchema } from "@/features/admin-auth/schemas/admin-login-schema";
import { adminLoginRequest } from "@/features/admin-auth/requests/admin-login";
import { setAuthCookies } from "@/lib/auth-cookies";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, adminLoginSchema);
  if (!parsed.success) return parsed.response;

  try {
    const auth = await adminLoginRequest(parsed.data);
    await setAuthCookies(auth);

    const { token: _token, refreshToken: _refreshToken, ...user } = auth;
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 2: Create `app/api/auth/admin/change-password/route.ts`**

```ts
import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { adminChangePasswordSchema } from "@/features/admin-auth/schemas/admin-change-password-schema";
import { adminChangePasswordRequest } from "@/features/admin-auth/requests/admin-change-password";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, adminChangePasswordSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await adminChangePasswordRequest(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 3: Create `app/api/auth/admin/logout/route.ts`**

```ts
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-cookies";

/** Pas d'endpoint /auth/admin/logout cote backend : l'auth est stateless, on efface juste les cookies. */
export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 5: Manual smoke test — real login against the local backend**

Ensure `onmec_backend` is running on `localhost:8081` and the dev server is running (`pnpm run dev`), then run:

```bash
curl -sD - -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"national@mec-ci.org","password":"MotDePasseSeed!2026"}'
```

Expected: `HTTP/1.1 200`, a `Set-Cookie: onmec_token=...` and `Set-Cookie: onmec_refresh_token=...` header, and a JSON body with `role`, `fullname`, `mustChangePassword` — **no** `token`/`refreshToken` fields.

- [ ] **Step 6: Commit**

```bash
git add app/api/auth/admin
git commit -m "feat(admin-auth): BFF routes for admin login/change-password/logout"
```

---

## Task 6: Edge session guard — `proxy.ts`

**Files:**
- Create: `proxy.ts` (project root, next to `next.config.ts`)

**Interfaces:**
- Consumes: `AUTH_TOKEN_COOKIE`, `AUTH_REFRESH_COOKIE`, `AUTH_COOKIE_OPTIONS` from `@/config/auth` (existing). `getApiBaseUrl` from `@/config/env` (existing).
- Produces: for any request under `/admin` or `/admin/:path*` except `/admin/connexion`: passes through if a valid session exists (refreshing transparently when only the refresh token remains), otherwise redirects to `/admin/connexion`.

This file cannot use `apiFetch` or anything from `next/headers` — middleware runs on a different runtime primitive (`NextRequest`/`NextResponse`, not the `cookies()` function). It makes a direct `fetch` call to the backend.

- [ ] **Step 1: Create `proxy.ts`**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/config/env";
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/config/auth";

const LOGIN_PATH = "/admin/connexion";

interface RefreshedTokens {
  token: string;
  refreshToken: string;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (token) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const refreshed = await refreshAdminTokens(refreshToken);
  if (!refreshed) {
    const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    response.cookies.delete(AUTH_TOKEN_COOKIE);
    response.cookies.delete(AUTH_REFRESH_COOKIE);
    return response;
  }

  request.cookies.set(AUTH_TOKEN_COOKIE, refreshed.token);
  request.cookies.set(AUTH_REFRESH_COOKIE, refreshed.refreshToken);

  const response = NextResponse.next({ request });
  response.cookies.set(AUTH_TOKEN_COOKIE, refreshed.token, AUTH_COOKIE_OPTIONS);
  response.cookies.set(AUTH_REFRESH_COOKIE, refreshed.refreshToken, AUTH_COOKIE_OPTIONS);
  return response;
}

async function refreshAdminTokens(refreshToken: string): Promise<RefreshedTokens | null> {
  const response = await fetch(`${getApiBaseUrl()}/auth/admin/refresh-token`, {
    method: "GET",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as RefreshedTokens;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 3: Manual smoke test — no session redirects to connexion**

With the dev server running, request an admin page with no cookies:

```bash
curl -sD - -o /dev/null http://localhost:3000/admin --max-time 8
```

Expected: `HTTP/1.1 307` (or `308`) with a `location: /admin/connexion` header. `/admin/connexion` itself must NOT redirect:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/connexion --max-time 8
```

Expected: `200`.

- [ ] **Step 4: Manual smoke test — session with only a refresh token gets refreshed**

Log in via a browser at `http://localhost:3000/admin/connexion` (once Task 8 wires the form — if run before Task 8, use the curl from Task 5 Step 5 and copy the `Set-Cookie` values into a browser via devtools). In the browser's devtools, delete the `onmec_token` cookie but keep `onmec_refresh_token`, then navigate to `/admin`.
Expected: the page loads (no bounce to `/admin/connexion`), and devtools shows `onmec_token` has reappeared with a new value.

- [ ] **Step 5: Commit**

```bash
git add proxy.ts
git commit -m "feat(admin-auth): edge session guard with transparent token refresh"
```

---

## Task 7: Session-aware admin shell — layout guard + `AdminShellContext`

**Files:**
- Modify: `components/features/admin/admin-shell-context.tsx`
- Modify: `app/admin/(shell)/layout.tsx`

**Interfaces:**
- Consumes: `adminMeRequest(): Promise<AdminSession>` (Task 3). `mapAdminRole(role): AdminRoleLabel` (Task 3). `ApiError` from `@/lib/api-error` (existing).
- Produces: `AdminShellProvider` now accepts optional `initialRole`, `fullname`, `email` props; `useAdminShell()` return value gains `fullname: string` and `email: string` alongside the existing `role`/`setRole`/`canSig`/`canEdito`/`canUsers`.

- [ ] **Step 1: Rewrite `components/features/admin/admin-shell-context.tsx`**

```tsx
"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AdminRole = "Administrateur national" | "Chargée de communication" | "Modérateur";

export const ADMIN_ROLES: AdminRole[] = ["Administrateur national", "Chargée de communication", "Modérateur"];

interface AdminShellState {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
  fullname: string;
  email: string;
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
}

const AdminShellContext = createContext<AdminShellState | null>(null);

interface AdminShellProviderProps {
  children: ReactNode;
  initialRole?: AdminRole;
  fullname?: string;
  email?: string;
}

export function AdminShellProvider({
  children,
  initialRole = "Administrateur national",
  fullname = "",
  email = "",
}: AdminShellProviderProps) {
  const [role, setRole] = useState<AdminRole>(initialRole);

  const value = useMemo<AdminShellState>(
    () => ({
      role,
      setRole,
      fullname,
      email,
      canSig: role !== "Chargée de communication",
      canEdito: role !== "Modérateur",
      canUsers: role === "Administrateur national",
    }),
    [role, fullname, email],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error("useAdminShell must be used within AdminShellProvider");
  return ctx;
}
```

- [ ] **Step 2: Rewrite `app/admin/(shell)/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShellProvider } from "@/components/features/admin/admin-shell-context";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { AdminHeader } from "@/components/features/admin/admin-header";
import { adminMeRequest } from "@/features/admin-auth/requests/admin-me";
import { mapAdminRole } from "@/features/admin-auth/lib/map-admin-role";
import { ApiError } from "@/lib/api-error";
import type { AdminSession } from "@/features/admin-auth/types/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (session.mustChangePassword) {
    redirect("/admin/changer-mot-de-passe");
  }

  return (
    <AdminShellProvider
      initialRole={mapAdminRole(session.role)}
      fullname={session.fullname}
      email={session.email}
    >
      <div className="flex min-h-screen bg-surface-page text-[#2b3646]">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 px-5 py-6 pb-16 md:px-8 md:py-8.5">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}

async function getAdminSession(): Promise<AdminSession> {
  try {
    return await adminMeRequest();
  } catch (error) {
    if (error instanceof ApiError) {
      redirect("/admin/connexion");
    }
    throw error;
  }
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean. `admin-header.tsx` and `admin-sidebar.tsx` still compile against the extended `AdminShellState` (they only read `role`/`setRole`, both still present).

- [ ] **Step 4: Manual smoke test — role reflects the logged-in account**

Log in as `communication@mec-ci.org` (curl from Task 5 Step 5, adapted, or the browser form once Task 8 lands) and load `/admin`. Expected: the role shown in the sidebar/header select is "Chargée de communication", not the previous hardcoded "Administrateur national" default.

- [ ] **Step 5: Commit**

```bash
git add components/features/admin/admin-shell-context.tsx "app/admin/(shell)/layout.tsx"
git commit -m "feat(admin-auth): guard the admin shell and seed it with the real session"
```

---

## Task 8: Wire `ConnexionView` to real login

**Files:**
- Modify: `components/features/admin-auth/connexion-view.tsx`

**Interfaces:**
- Consumes: `useAdminLogin()` (Task 4), returning a mutation whose `mutate({email, password}, {onSuccess: (user: AdminUser) => void})` follows TanStack Query's `UseMutationResult` shape. `ApiError` from `@/lib/api-error`.
- Produces: no change to `ConnexionViewProps` (`{ onGoInscription: () => void }` unchanged) — `AuthScreen` needs no changes.

- [ ] **Step 1: Rewrite `components/features/admin-auth/connexion-view.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAdminLogin } from "@/features/admin-auth/mutations/use-admin-login";
import { ApiError } from "@/lib/api-error";

interface ConnexionViewProps {
  onGoInscription: () => void;
}

export function ConnexionView({ onGoInscription }: ConnexionViewProps) {
  const router = useRouter();
  const login = useAdminLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (user) => {
          router.push(user.mustChangePassword ? "/admin/changer-mot-de-passe" : "/admin");
        },
      },
    );
  }

  const errorMessage = errorMessageFor(login.error);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5.5">
      <div>
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-600 uppercase">
          Espace d'administration
        </span>
        <h1 className="mt-3 mb-2 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Se connecter
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Le site public et l'application de signalement se pilotent depuis ici.
        </p>
      </div>
      {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
      <div className="flex flex-col gap-4">
        <Field label="Adresse e-mail" htmlFor="auth-mail">
          <Input
            id="auth-mail"
            type="email"
            placeholder="prenom.nom@mec-ci.org"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <div className="flex flex-col gap-2.5">
          <Field label="Mot de passe" htmlFor="auth-pass">
            <Input
              id="auth-pass"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          <a
            href="#oubli"
            className="self-start text-[0.8125rem] font-semibold text-blue-600 hover:text-orange-700"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <div className="mt-0.5 grid">
          <Button type="submit" variant="primary" size="lg" full disabled={login.isPending}>
            {login.isPending ? "Connexion..." : "Se connecter"}
          </Button>
        </div>
      </div>
      <p className="border-t border-border-subtle pt-5 text-[0.8125rem] leading-relaxed text-muted-foreground">
        Vous travaillez avec le MEC et n'avez pas de compte ?{" "}
        <button
          type="button"
          onClick={onGoInscription}
          className="font-semibold text-blue-600 hover:text-orange-700"
        >
          Créer un compte
        </button>{" "}
        — il sera actif après validation d'un administrateur.
      </p>
    </form>
  );
}

function errorMessageFor(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.status === 401) return "Identifiants invalides.";
    if (error.status === 429) return "Trop de tentatives. Réessayez plus tard.";
  }
  return "Une erreur est survenue. Réessayez.";
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 3: Manual smoke test — full login flow in the browser**

With `onmec_backend` and the dev server running, open `http://localhost:3000/admin/connexion`, submit `national@mec-ci.org` / `MotDePasseSeed!2026`. Expected: redirected to `/admin/changer-mot-de-passe` (this account has `mustChangePassword: true`). Try a wrong password: expected an inline "Identifiants invalides." alert, no navigation.

- [ ] **Step 4: Commit**

```bash
git add components/features/admin-auth/connexion-view.tsx
git commit -m "feat(admin-auth): wire the connexion form to POST /api/auth/admin/login"
```

---

## Task 9: Mandatory password change screen

**Files:**
- Create: `components/features/admin-auth/changer-mot-de-passe-view.tsx`
- Create: `app/admin/changer-mot-de-passe/page.tsx`

**Interfaces:**
- Consumes: `useAdminChangePassword()` (Task 4). `ApiError` from `@/lib/api-error`.
- Produces: a page at `/admin/changer-mot-de-passe`, outside the `(shell)` route group (so it is not itself subject to the `mustChangePassword` redirect in Task 7's layout), but still covered by `proxy.ts`'s "a valid session must exist" check from Task 6.

- [ ] **Step 1: Create `components/features/admin-auth/changer-mot-de-passe-view.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAdminChangePassword } from "@/features/admin-auth/mutations/use-admin-change-password";
import { ApiError } from "@/lib/api-error";

export function ChangerMotDePasseView() {
  const router = useRouter();
  const changePassword = useAdminChangePassword();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    changePassword.mutate(
      { oldPassword, password },
      { onSuccess: () => router.push("/admin") },
    );
  }

  const errorMessage = errorMessageFor(changePassword.error);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5.5">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-50 text-blue-600">
        <Lock size={22} />
      </span>
      <div>
        <h1 className="mb-2.5 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Changer votre mot de passe
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Votre mot de passe a été généré automatiquement. Choisissez-en un nouveau avant de
          continuer.
        </p>
      </div>
      {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
      <div className="flex flex-col gap-4">
        <Field label="Mot de passe actuel" htmlFor="cmp-old">
          <Input
            id="cmp-old"
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            required
          />
        </Field>
        <Field label="Nouveau mot de passe" htmlFor="cmp-new" hint="12 caractères minimum.">
          <Input
            id="cmp-new"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={12}
            maxLength={128}
            required
          />
        </Field>
        <div className="mt-0.5 grid">
          <Button type="submit" variant="primary" size="lg" full disabled={changePassword.isPending}>
            {changePassword.isPending ? "Enregistrement..." : "Valider"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function errorMessageFor(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError && error.status === 400) {
    return "Mot de passe actuel incorrect.";
  }
  return "Une erreur est survenue. Réessayez.";
}
```

- [ ] **Step 2: Create `app/admin/changer-mot-de-passe/page.tsx`**

```tsx
import { ChangerMotDePasseView } from "@/components/features/admin-auth/changer-mot-de-passe-view";

export default function ChangerMotDePassePage() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center overflow-y-auto bg-ink px-5 py-10">
      <div className="relative m-auto flex w-full max-w-103 flex-col items-center gap-5.5">
        <div className="w-full rounded-lg bg-white p-9 shadow-overlay">
          <img src="/assets/logo/mec-lockup.png" alt="MEC" className="mb-6.5 h-8 w-auto" />
          <ChangerMotDePasseView />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 4: Manual smoke test — full mandatory-change flow**

Continue from Task 8 Step 3 (redirected to `/admin/changer-mot-de-passe` after logging in as `national@mec-ci.org`). Submit the current password `MotDePasseSeed!2026` and a new password (12+ chars). Expected: redirected to `/admin`, dashboard renders (not bounced back to `/admin/changer-mot-de-passe` — confirms the "no token invalidation on change-password" assumption from the spec). **This is the first real confirmation of that assumption — if it fails, stop and re-open the spec's open question before continuing.**

- [ ] **Step 5: Commit**

```bash
git add components/features/admin-auth/changer-mot-de-passe-view.tsx "app/admin/changer-mot-de-passe/page.tsx"
git commit -m "feat(admin-auth): mandatory first-login password change screen"
```

---

## Task 10: Wire sidebar logout and real identity display

**Files:**
- Modify: `components/features/admin/admin-sidebar.tsx`

**Interfaces:**
- Consumes: `useAdminLogout()` (Task 4). `useAdminShell()` (Task 7, now exposing `fullname`/`email`). `useRouter` from `next/navigation`.

- [ ] **Step 1: Rewrite `components/features/admin/admin-sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Inbox, Flag, Newspaper, BookOpen, Megaphone, Smartphone, Landmark, Users, ExternalLink, LogOut, type LucideIcon } from "lucide-react";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useAdminLogout } from "@/features/admin-auth/mutations/use-admin-logout";
import { buildQueue } from "@/features/admin/lib/build-queue";
import { SIGNALEMENTS } from "@/features/admin/data/signalements";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requires: "canSig" | "canEdito" | "canUsers" | null;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "File de travail", icon: Inbox, requires: null },
  { href: "/admin/signalements", label: "Signalements", icon: Flag, requires: "canSig" },
  { href: "/admin/actualites", label: "Actualités et blog", icon: Newspaper, requires: "canEdito" },
  { href: "/admin/ressources", label: "Ressources", icon: BookOpen, requires: "canEdito" },
  { href: "/admin/campagnes", label: "Campagnes", icon: Megaphone, requires: "canEdito" },
  { href: "/admin/push", label: "Notifications app", icon: Smartphone, requires: "canEdito" },
  { href: "/admin/statistiques", label: "Statistiques", icon: Landmark, requires: null },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, requires: "canUsers" },
];

function initialsOf(fullname: string): string {
  const parts = fullname.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const shell = useAdminShell();
  const logout = useAdminLogout();
  const queue = buildQueue(shell);
  const cntOuverts = SIGNALEMENTS.filter((s) => s.statut === "validation" || s.statut === "encours").length;

  const visibleItems = NAV_ITEMS.filter((item) => item.requires === null || shell[item.requires]);

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/admin/connexion"),
    });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col self-start bg-blue-800 px-3.5 pt-5.5 pb-4 text-white">
      <Link href="/" className="mb-1.5 flex items-center gap-2.5 px-0.5">
        <img src="/assets/logo/mec-reversed.png" alt="MEC" className="h-8.5 w-auto flex-none" />
      </Link>
      <span className="mb-5.5 px-0.5 text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-400 uppercase">
        Administration
      </span>

      <nav className="flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          const badge = item.href === "/admin" ? queue.length : item.href === "/admin/signalements" ? cntOuverts : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/11 text-white before:absolute before:top-1.5 before:bottom-1.5 before:-left-3.5 before:w-[3px] before:content-[''] before:bg-orange-500"
                  : "text-white/74 hover:bg-white/7 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {badge !== null && badge > 0 ? (
                <span
                  className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-bold ${
                    item.href === "/admin" ? "bg-orange-500 text-white" : "bg-white/14 text-white"
                  }`}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link href="/" className="flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-white/60 hover:bg-white/7 hover:text-white">
          <ExternalLink size={18} />
          <span>Voir le site public</span>
        </Link>
        <div className="flex items-center gap-2.5 border-t border-white/14 px-2.5 py-3">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-orange-500 text-xs font-bold text-white">
            {initialsOf(shell.fullname)}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[0.8125rem] font-semibold text-white">{shell.fullname}</span>
            <span className="overflow-hidden text-[0.6875rem] text-ellipsis whitespace-nowrap text-white/55">{shell.role}</span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            disabled={logout.isPending}
            className="ml-auto flex h-7.5 w-7.5 flex-none items-center justify-center rounded-md text-white/55 hover:bg-white/9 hover:text-white disabled:opacity-50"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 3: Manual smoke test — logout actually clears the session**

Logged in from Task 9, click the logout button in the sidebar. Expected: redirected to `/admin/connexion`. Then request `/admin` directly:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin --max-time 8
```

Run this in the same browser session (or check devtools) — expected: no `onmec_token`/`onmec_refresh_token` cookies remain, and visiting `/admin` bounces back to `/admin/connexion`.

- [ ] **Step 4: Commit**

```bash
git add components/features/admin/admin-sidebar.tsx
git commit -m "feat(admin-auth): wire sidebar logout and show the real logged-in identity"
```

---

## Task 11: Update `docs/ARCHITECTURE.md`

**Files:**
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Replace the stale "no edge guard" bullet**

In the "Décisions actuelles" section, replace:

```
- **Pas de garde d'auth edge** (`middleware.ts`/`proxy.ts`, supporté par vinext) : le dashboard admin
  (`app/admin/(shell)/*`) existe désormais mais reste **non protégé** — ce chantier était
  explicitement UI pure (mock, pas de vrai flow d'auth, voir
  `docs/superpowers/specs/2026-08-23-dashboard-admin-design.md`). La garde d'auth edge est toujours à
  poser avant tout usage réel de ces routes.
```

with:

```
- **Garde d'auth edge posée** (`proxy.ts`, racine du projet) : `/admin/(shell)/*` et
  `/admin/changer-mot-de-passe` exigent une session back-office valide (JWT + refresh
  transparent via `POST /auth/admin/refresh-token`), sinon redirect vers `/admin/connexion`.
  Voir `docs/superpowers/specs/2026-08-25-auth-admin-design.md`.
```

- [ ] **Step 2: Update the RSC vs TanStack Query boundary example**

In the "Frontière fetch RSC vs TanStack Query" section, replace:

```
- **Mutations et données réactives côté client** (login, register, verify-email, futur
  quiz/commentaires/gamification) : TanStack Query via `features/<domaine>/mutations` (et futurs
  `queries`).
```

with:

```
- **Mutations et données réactives côté client** (login, register, verify-email, connexion et
  changement de mot de passe admin, futur quiz/commentaires/gamification) : TanStack Query via
  `features/<domaine>/mutations` (et futurs `queries`).
```

- [ ] **Step 3: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs(architecture): reflect the admin edge auth guard now in place"
```

---

## Final verification (after all tasks)

- [ ] Run `pnpm run typecheck && pnpm run lint && pnpm run test` once more from a clean state — all green.
- [ ] Run the `convention-drift-check` agent against the full diff (`git diff master`) before considering this plan done — required by `CLAUDE.md`.
- [ ] Full manual regression pass with the local `onmec_backend` running: log in as each of the 3 seeded roles, confirm role-derived nav items in the sidebar are unaffected (still driven by the demo `setRole` switcher — not a regression, just confirms Task 7 didn't remove it), confirm `/admin/connexion` is reachable when logged out, confirm a stale/garbage `onmec_token` cookie value also bounces to `/admin/connexion` (not just a missing cookie).
