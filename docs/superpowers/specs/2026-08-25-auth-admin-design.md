# Auth back-office (admin) — design

Date : 2026-08-25
Statut : validé en chat, à valider par relecture du fichier

## Contexte

onmec-site a déjà un scaffolding BFF générique pour l'auth (`features/auth/*`,
`app/api/auth/*`) ciblant `/api/v1/auth/*` — les endpoints **membre** du backend
(inscription citoyenne + OTP email). Le seul écran de connexion réellement présent dans
le front (`/admin/connexion`, via `AuthScreen`) est en revanche un **mockup statique non
branché**, et correspond conceptuellement au back-office (staff MEC), pas aux membres.

Le backend (`onmec_backend`, `http://localhost:8081`, doc `/api/docs`) expose en réalité
**deux systèmes d'auth distincts** :

- `/api/v1/auth/*` — membres (citoyens), inscription publique + vérification email par
  OTP, `POST /auth/login` exige un email vérifié.
- `/api/v1/auth/admin/*` — back-office. **Pas d'auto-inscription** : les comptes sont
  créés par un administrateur national via `POST /admins` (mot de passe généré serveur,
  à changer à la première connexion via `mustChangePassword`).

Cette tâche branche uniquement le second système (back-office), le seul qui a un écran
réel dans le front aujourd'hui. L'auth membre (déjà scaffoldée mais sans page qui la
consomme) n'est pas touchée.

## Contrat backend vérifié en live (2026-08-25, comptes seedés)

Le Swagger ne type pas explicitement les réponses de succès de `/auth/admin/*` (pas de
`$ref`, description texte seulement) — vérifié en interrogeant le backend local avec les
3 comptes seedés (national / communication / modération).

**`POST /auth/admin/login`** — `AdminLoginDto { email, password }` → 200 :

```json
{
  "id": "10000000-0000-0000-0000-000000000001",
  "email": "national@mec-ci.org",
  "fullname": "Administrateur national",
  "phone": "+2250101010101",
  "avatar": null,
  "type": "admin",
  "role": "ADMIN_NATIONAL",
  "capabilities": ["actualite:read", "actualite:write", "..."],
  "permissions": { "modules": { "ALL": ["create", "read", "update", "delete"] } },
  "token": "<JWT, exp 15 min>",
  "refreshToken": "<JWT, exp 7 jours>",
  "mustChangePassword": true
}
```

- `role` ∈ `ADMIN_NATIONAL | CHARGE_COMMUNICATION | MODERATEUR`.
- `capabilities` **varie réellement par rôle** (vérifié : national a `admin:manage`,
  modération ne l'a pas, etc.) — c'est la donnée de permission fiable.
- `permissions.modules.ALL` est **identique sur les 3 rôles testés** → probablement un
  placeholder côté backend (candidat pour la mise à jour backend évoquée par
  l'utilisateur). On ne construit rien dessus.
- Erreur 401 : `{"message":"Identifiants invalides","error":"Unauthorized","statusCode":401}`
  — même forme que `parseJsonBody` assume déjà pour le membre.

**`GET /auth/admin/me`** (Bearer = access token) → 200, **sous-ensemble** de login :

```json
{
  "id": "...",
  "type": "admin",
  "role": "ADMIN_NATIONAL",
  "email": "...",
  "fullname": "...",
  "phone": "...",
  "avatar": null,
  "isActive": true,
  "mustChangePassword": true
}
```

Incohérence backend connue et assumée : **pas de `capabilities`/`permissions` sur
`/me`**. Sans impact ici — `AdminShellContext` (dashboard admin, déjà spécifié dans
`2026-08-23-dashboard-admin-design.md`) ne dérive que de `role`.

**`GET|POST /auth/admin/refresh-token`** (Bearer = **refresh** token, pas l'access
token — vérifié : l'access token y renvoie 401 `"Authentification requise"`) → 200
`{token, refreshToken}`, même forme que `AuthTokens` déjà défini pour le membre.

**Pas de `/auth/admin/logout`** côté backend (seul le membre en a un). Le logout
back-office est donc **entièrement client** : effacer les cookies, aucun appel réseau.

**`POST /auth/admin/change-password`** — `ChangePasswordDto {oldPassword, password}`
(pas de `confirmPassword`, contrairement à `UpdateUserPasswordDto` côté membre) → 200,
corps non vérifié en live (mutation destructive sur un compte seedé partagé, écartée
avec l'utilisateur). **Hypothèse retenue, justifiée** : l'auth est explicitement
stateless (le JWT n'encode ni hash ni version de mot de passe ; la description de
`/auth/logout` le dit noir sur blanc : _"l'authentification étant sans état..."_) → un
changement de mot de passe n'invalide vraisemblablement pas les tokens déjà émis. Le
flow ne repose donc pas de nouveaux cookies après `change-password`, il se contente de
re-fetcher `/me` (qui doit renvoyer `mustChangePassword: false`) avant de rediriger vers
le dashboard. **À vérifier manuellement une fois par un humain** avant de considérer ce
point acquis.

## Décisions d'architecture

### Garde d'auth : edge (`proxy.ts`), pas seulement dans le layout

`docs/ARCHITECTURE.md` annonce déjà ce chantier (_"la garde d'auth edge est toujours à
poser"_). Vérifié en conditions réelles le 2026-08-25 (redémarrage du dev server local,
`proxy.ts` avec `response.cookies.set(...)` sur un matcher de test, `Set-Cookie` observé
dans la réponse `curl`) : **vinext 1.0.0-beta.8 pose bien les cookies depuis
`proxy.ts`**. Le design edge n'est donc pas spéculatif.

- **`proxy.ts`** (racine du projet). `matcher: "/admin/:path*"` — à vérifier à
  l'implémentation que ce pattern couvre bien `/admin` lui-même (zéro segment) et pas
  seulement ses sous-routes ; sinon utiliser `["/admin", "/admin/:path*"]`.
  - `pathname === "/admin/connexion"` → `NextResponse.next()`, aucune vérification.
  - Sinon : lit les cookies token/refresh sur `request.cookies` (primitives
    middleware — **pas** `apiFetch`/`next/headers`, indisponibles à ce niveau ; appel
    HTTP direct au backend).
    - Token présent → passe.
    - Token absent, refresh présent → `POST /auth/admin/refresh-token` (Bearer =
      refresh). Succès : pose les nouveaux tokens sur `request.cookies` **et**
      `response.cookies` (le premier pour que le rendu du layout dans la même requête
      voie déjà le nouveau token, le second pour le navigateur), puis passe. Échec :
      efface les cookies, redirect `/admin/connexion`.
    - Aucun des deux présent → redirect `/admin/connexion`.
  - Cette règle s'applique uniformément à `/admin/(shell)/*` **et**
    `/admin/changer-mot-de-passe` : les deux exigent juste _une session valide_, pas de
    logique `mustChangePassword` à ce niveau (elle est spécifique au dashboard, traitée
    plus bas).

- **`app/admin/(shell)/layout.tsx`** devient un composant serveur async. Appelle
  `GET /auth/admin/me` (via `features/admin-auth/requests/admin-me.ts`, `apiFetch`
  classique — légal ici, c'est un Server Component, pas le middleware).
  - `mustChangePassword === true` → `redirect("/admin/changer-mot-de-passe")`.
  - Échec de `/me` (cookie corrompu malgré la garde edge — cas défensif résiduel) →
    `redirect("/admin/connexion")`.
  - Sinon → rend `children`, avec `role`/`fullname`/`email` réels passés en état
    initial à `AdminShellProvider` (le sélecteur de démo existant dans
    `admin-shell-context.tsx` n'est **pas** retiré, cf. périmètre validé plus bas).

- **`app/admin/changer-mot-de-passe/page.tsx`** (nouvelle page, **hors** du groupe
  `(shell)`, sœur de `connexion/`) : aucune garde propre à écrire, `proxy.ts` garantit
  déjà un token valide à ce niveau.

### Cookies partagés entre membre et admin

`onmec_token`/`onmec_refresh_token` (déjà définis dans `config/auth.ts`) sont
**réutilisés tels quels** pour l'admin — un JWT porte son propre claim `type`
("admin"), donc `lib/api-client.ts` reste générique (`Authorization: Bearer` attaché
sans distinction d'acteur), aucune modification nécessaire là. Implication à noter pour
plus tard : une seule identité authentifiable par navigateur à la fois — non
problématique aujourd'hui (aucune page de connexion membre n'existe), à revisiter
explicitement le jour où l'auth membre est branchée sur une vraie page.

`AUTH_COOKIE_OPTIONS` n'a pas de `maxAge` (cookies de session, perdus à la fermeture du
navigateur) alors que le refresh token backend vit 7 jours — **décision assumée, pas un
oubli** : pas de "rester connecté" pour le back-office dans cette tâche.

### Refactor : déplacement de `auth-cookies.ts`

`features/auth/lib/auth-cookies.ts` (écriture des cookies : `setAuthCookies`,
`clearAuthCookies`, `getRefreshToken`) est aujourd'hui rangé sous le domaine membre,
mais membre et admin doivent le partager. Plutôt que de faire importer
`features/admin-auth` depuis le dossier `lib/` d'un autre domaine (viole la règle de
layering de `docs/ARCHITECTURE.md`), il est déplacé vers **`lib/auth-cookies.ts`**
(agnostique du domaine, à sa vraie place). Les call sites membres existants
(`app/api/auth/{login,register,verify-email,refresh-token}/route.ts`) sont mis à jour
pour importer le nouveau chemin — aucun changement de comportement.

## Nouveau domaine `features/admin-auth/`

Nommage aligné sur `components/features/admin-auth/` déjà existant (pas
`features/auth-admin`). Miroir structurel de `features/auth/` :

- `types/admin-auth.ts` — `AdminRole`, `AdminLoginResponse` (forme vérifiée ci-dessus),
  `AdminSession` (sous-ensemble renvoyé par `/me`).
- `schemas/admin-login-schema.ts` — `{ email: z.email().max(254), password:
z.string().min(1) }`. Bornes reprises de l'OpenAPI (`LoginUserDto.email.maxLength:
254`), **pas** recopiées de `features/auth/schemas/login-schema.ts` (`max(100)`,
  incohérent avec le backend réel).
- `schemas/admin-change-password-schema.ts` — `{ oldPassword: z.string().min(1),
password: z.string().min(12).max(128) }` (bornes `ChangePasswordDto`, pas de
  `confirmPassword` — le DTO backend n'en a pas).
- `requests/admin-login.ts` — `POST /auth/admin/login`, `auth: false`.
- `requests/admin-me.ts` — `GET /auth/admin/me`, `auth: true` (défaut).
- `requests/admin-change-password.ts` — `POST /auth/admin/change-password`, `auth:
true`.
  (Pas de `requests/admin-refresh-token.ts` : le refresh ne vit que dans `proxy.ts`,
  aucun retry-on-401 côté client n'est demandé dans cette tâche.)
- `lib/map-admin-role.ts` — mapping pur `ADMIN_NATIONAL → "Administrateur national"`,
  `CHARGE_COMMUNICATION → "Chargée de communication"`, `MODERATEUR → "Modérateur"`
  (labels déjà utilisés par `AdminShellContext`/`ADMIN_ROLES`).
- `mutations/use-admin-login.ts`, `use-admin-change-password.ts`,
  `use-admin-logout.ts` — TanStack Query, via `postJson` vers les routes BFF
  ci-dessous.

Routes BFF miroir, `app/api/auth/admin/{login,change-password,logout}/route.ts` :

- `login` : `parseJsonBody(adminLoginSchema)` → `adminLoginRequest` → `setAuthCookies`
  (déplacé) avec `{token, refreshToken}` → renvoie le reste du payload (id, email,
  fullname, role, mustChangePassword, etc., **sans** les tokens) au client, pour que
  `useAdminLogin` puisse décider où rediriger (`mustChangePassword` ? changer-mot-de-
  passe : dashboard).
- `change-password` : `parseJsonBody(adminChangePasswordSchema)` →
  `adminChangePasswordRequest` (auth via le cookie déjà posé) → pas de réécriture de
  cookies (cf. hypothèse stateless ci-dessus) → renvoie `{message}`.
- `logout` : aucun appel backend → `clearAuthCookies()` → 204.

## UI

- **`connexion-view.tsx`** : devient un formulaire contrôlé (state email/password),
  `onSubmit` → `useAdminLogin().mutate(...)`. Erreur 401/429 affichée inline (probable
  `Alert` de `components/ui/`, déjà présent). Succès → redirect côté client selon
  `mustChangePassword`.
- **Nouvelle vue `changer-mot-de-passe-view.tsx`** + `app/admin/changer-mot-de-
passe/page.tsx` : formulaire `oldPassword`/`password` (pas de confirmation, le DTO
  n'en a pas), `useAdminChangePassword`, succès → redirect `/admin`.
- **`admin-sidebar.tsx`** : le `<Link href="/admin/connexion">` de déconnexion (ligne
  88-94 actuelle) devient un bouton `onClick` → `useAdminLogout().mutate()` puis
  redirect `/admin/connexion` (un `Link` seul n'efface pas les cookies, cf. bug identifié
  en amont). "Aminata Traoré" (nom en dur) et le rôle affiché viennent désormais de la
  session réelle transmise par le layout, via une extension légère de
  `AdminShellState`/`AdminShellProvider` (ajout `fullname`/`email` aux côtés de `role`
  déjà présent — pas de nouveau contexte).

## Hors scope (validé en chat)

- `InscriptionView`/`AttenteView` du mockup `AuthScreen` : **laissés tels quels**, non
  branchés — aucun endpoint back-office réel ne correspond à un flow d'auto-inscription
  avec validation admin.
- `ExpireView` : reste un mockup sur `DEMO_EMAIL`, n'est **pas** la cible réelle d'un
  401/session expirée (pas de flow de reconnexion "session expirée" dédié dans cette
  tâche — un 401/session invalide redirige simplement vers `/admin/connexion`).
- Auth membre (`features/auth/*` existant, `/auth/login|register|verify-email`) : non
  touchée, reste en l'état (scaffoldée mais sans page qui la consomme).
- Permissions granulaires basées sur `capabilities` : `AdminShellContext` continue de
  dériver uniquement de `role`, comme déjà spécifié dans
  `2026-08-23-dashboard-admin-design.md`. Pas de nouveau modèle de permission introduit
  ici.
- "Rester connecté" / cookies persistants au-delà de la session navigateur.

## Tests

- Login réussi (3 rôles seedés) → cookies posés, redirect correct selon
  `mustChangePassword`.
- Login échoué (401) → message d'erreur affiché, pas de cookie posé.
- Accès direct à une URL `/admin/*` sans cookie → redirect `/admin/connexion` (via
  `proxy.ts`).
- Accès avec access token expiré mais refresh valide → refresh transparent, page
  rendue sans repasser par l'écran de connexion.
- Accès avec refresh également invalide/expiré → cookies effacés, redirect
  `/admin/connexion`.
- `mustChangePassword: true` → redirect systématique vers `/admin/changer-mot-de-
passe` tant que non résolu, y compris en visitant directement une autre URL `/admin/*`.
- Changement de mot de passe réussi → redirect `/admin`, plus de redirect vers
  changer-mot-de-passe (donc `/me` renvoie bien `mustChangePassword: false` après
  coup — **point à vérifier manuellement en premier**, cf. hypothèse stateless).
- Logout → cookies effacés, accès `/admin/*` ensuite redirige vers connexion.
- `pnpm run typecheck` / `pnpm run lint` propres, `convention-drift-check` sur le diff
  avant commit (imposé par `CLAUDE.md`).

## Mise à jour de la documentation existante

`docs/ARCHITECTURE.md` ligne _"Pas de garde d'auth edge... dashboard non protégé"_ dans
la section « Décisions actuelles » devient fausse dès que cette tâche atterrit — à
corriger dans le cadre de cette tâche, pas après.
