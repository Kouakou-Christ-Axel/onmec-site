# Câblage du module Librairie (front uniquement)

## Contexte

`/ressources` (catalogue public) et `/admin/ressources` (back-office) sont aujourd'hui 100%
statiques/mock : `features/ressources/data/ressources.ts` (9 guides en dur) et
`features/admin/data/ressources.ts` (workflow soumission → validation → en ligne fictif). Le
backend `onmec_backend` expose un vrai module `Librairie` (`/api/v1/librairie/*`), documenté dans
`docs/superpowers/specs/2026-08-25-catalogue-ressources-mec-design.md` comme hors scope à l'époque
(« Contrat `onmec_backend` pour les ressources (reste 100% statique) »). Cette passe lève ce hors
scope : le catalogue public et l'admin sont branchés sur le vrai contrat.

**Frontière stricte de cette passe** : ce repo (`onmec-site`) ne touche qu'au frontend. Le backend
(`onmec_backend`, repo séparé) n'est lu que pour comprendre le contrat réel — jamais modifié depuis
cette session. Les deux ajustements backend nécessaires (voir § Dépendance backend) sont livrés
comme un prompt texte à exécuter dans une session Claude Code dédiée au repo `onmec_backend`, hors
du périmètre de ce spec et de son plan d'implémentation.

Décisions de scope validées avec l'utilisateur (AskUserQuestion) :

- **Périmètre** : catalogue public **et** admin dans la même passe (pas de découpage en deux
  specs). L'admin actuel simule un workflow de validation qui n'existe pas côté backend ; il est
  remplacé par un CRUD réel (upload/édition/suppression), sans workflow de validation.
- **Champs abandonnés** : le poids du fichier, le compteur de téléchargements et le tag d'accès
  « Public/Adhérents » sont retirés du catalogue — ils n'existent pas côté backend et ne seront pas
  ajoutés. Seul `pageCount` (nombre de pages) est ajouté côté backend, détecté automatiquement pour
  les PDF (pas de saisie manuelle).
- **Formats** : le backend n'accepte que le `.pdf` pour le fichier principal
  (`upload-validation.pipe.ts`, `allowedDocTypes = ['.pdf']`) — ça ne change pas. Le filtre
  « Format » (PDF/DOCX/PNG) disparaît du catalogue : une seule valeur possible rend le filtre inutile.
- **Téléchargement** : `download-dialog.tsx` (porte e-mail fictive, aucun envoi réel) est supprimé,
  remplacé par un lien de téléchargement direct vers `fileUrl`.
- **Catégorie** : `categorie` est une chaîne libre côté backend (pas un enum fermé comme l'actuel
  `Theme`). Le filtre catégorie du catalogue devient dynamique, alimenté par
  `GET /librairie/public/categories`, plus une liste `THEMES` figée.

## Dépendance backend (hors périmètre d'implémentation ici)

**Découverte en cours de conception** : le backend a déjà migré l'upload de la Librairie vers des
URL présignées Cloudflare R2, dans le repo `onmec_backend-r2-storage` (branche
`feat/r2-storage-migration`, spec `docs/superpowers/specs/2026-08-26-r2-storage-migration-design.md`
de ce repo). Le contrat de création n'est donc **plus** `multipart/form-data` avec le fichier en
pièce jointe — voir § Admin ci-dessous pour le nouveau flux. Ceci remplace toute hypothèse
précédente d'upload direct au backend.

Le prompt à transmettre à une session Claude Code ouverte sur `onmec_backend-r2-storage` (texte
fourni séparément, pas un fichier écrit par cette session) couvre uniquement les deux écarts encore
réels dans ce repo :

1. Ajouter `pageCount Int?` au modèle `Document` (migration Prisma), détecté au moment de la
   création du document (`LibrairieService.create`, après confirmation que `fichierKey` pointe vers
   un PDF) via une lib de parsing PDF appliquée à l'objet R2 déjà uploadé (téléchargement temporaire
   depuis `R2StorageService`, ou lecture par plage d'octets si la lib le permet), exposé dans
   `DocumentResponseDto` et `PublicDocumentResponseDto`.
2. Corriger l'autorisation de `LibrairieController` : `POST /librairie/upload-url` et
   `POST /librairie` n'ont qu'un `JwtAuthGuard` nu (n'importe quel membre authentifié, pas
   seulement le back-office) ; `GET /librairie`, `GET /librairie/:id`, `PATCH`, `DELETE` n'ont
   **aucun guard**, alors que le Swagger documente `security: JWT` dessus — à aligner sur le
   pattern `AdminGuard, AdminRolesGuard` + `@AdminRoles(...)` utilisé par
   `actualites.controller.ts`, sur ces 6 routes.

**Séquencement** : `pageCount` peut ne pas encore exister quand ce spec est implémenté. Le type
frontend le déclare `number | null` et son absence dans la réponse JSON (`undefined`) est traitée
comme `null` à la lecture (`doc.pageCount ?? null`), pour ne pas dépendre de l'ordre de déploiement.

## Modèle de données

Nouveau : `features/librairie/types/document.ts`, remplace
`features/ressources/types/ressource.ts` :

```ts
export type LibrairieDocument = {
  id: string;
  title: string;
  description: string | null;
  categorie: string | null;
  fileType: string; // ".pdf"
  fileUrl: string;
  coverImage: string | null;
  pageCount: number | null;
  uploadedAt: string; // ISO 8601
};

export type PublicLibrairieDocument = LibrairieDocument & { auteur: string };

export type AdminLibrairieDocument = LibrairieDocument & {
  uploadedBy: { id: string; fullname: string; email: string };
};
```

Disparaissent par rapport à `Ressource` : `slug` (le backend n'a que `id`, un UUID — pas de slug),
`theme` (enum fermé → `categorie`, chaîne libre), `format` (enum fermé → affichage brut de
`fileType`), `acces`, `weight`, `downloads`, `excerpt`/`body` (fusionnés en un seul champ
`description`, comme le backend).

`features/ressources/` (types, data, lib `sort-ressources`/`format-count`) est supprimé une fois
`features/librairie/` en place. `features/admin/data/ressources.ts` et
`components/features/admin/new-ressource-dialog.tsx` (mock admin) sont supprimés une fois le vrai
CRUD en place.

## Catalogue public (`app/(public)/ressources`)

**Requêtes** (`features/librairie/requests/`, server-only, `apiFetch`) :

- `list-librairie-public.ts` : `GET /librairie/public?title=&categorie=&page=&limit=` avec
  `{ auth: false }` (page publique, cacheable — même raison que `list-actualites.ts`).
- `get-librairie-public.ts` : `GET /librairie/public/{id}` avec `{ auth: false }`.
- `list-librairie-categories.ts` : `GET /librairie/public/categories` avec `{ auth: false }`.

**Routing** : `app/(public)/ressources/[slug]` → `app/(public)/ressources/[id]` (le backend n'expose
que des UUID, pas de slug). `loading.tsx` des deux routes suivent le renommage sans changement de
contenu.

**Composants** (`components/features/librairie/`, remplace `components/features/ressources/`) :

- `librairie-catalog.tsx` (ex `ressource-catalog.tsx`) : orchestrateur `"use client"`. État :
  `query`, `categorie`, `sort`, `page` (perd `format`/`acces`). Reçoit la liste de catégories en
  prop depuis la Server Component page (résultat de `list-librairie-categories`), ne la calcule
  plus depuis un tableau statique `THEMES`.
- `librairie-toolbar.tsx` (ex `ressource-toolbar.tsx`) : recherche + pastilles catégorie (généré
  depuis la prop catégories, plus depuis `THEMES` figé) + `<select>` tri. Perd les deux `<select>`
  format/accès.
- `librairie-table.tsx` (ex `ressource-table.tsx`) : colonnes couverture, titre + description,
  catégorie, pages (`pageCount ?? "—"`), aperçu. Perd Format/Accès/Téléchargements.
- `librairie-card.tsx` (ex `ressource-card.tsx`) : garde le badge catégorie, perd le badge format et
  le compteur de téléchargements dans le pied de carte (garde la date, ajoute les pages si
  `pageCount` non nul).
- `librairie-pagination.tsx` : inchangé dans son principe (composant présentationnel pur), juste
  reconnecté aux nouvelles props.
- `librairie-preview-overlay.tsx` : perd format/poids/accès de la ligne de métadonnées ; garde
  catégorie + pages (si non nul).
- `document-cover.tsx` (nouveau, petit composant) : rend `next/image` si `coverImage` est non nul,
  sinon replie sur `PhotoPlaceholder` — remplace les usages actuels de `PhotoPlaceholder` toujours
  affiché sans condition (aucune vraie image n'était branchée). Suit le même patron que le commit
  récent « passer les couvertures a next/image » sur les actualités.
- `document-download-link.tsx` (nouveau, remplace `download-dialog.tsx`) : lien/bouton simple
  `<a href={fileUrl}>Télécharger le guide →</a>`, pas de dialog, pas de collecte d'e-mail.

`features/librairie/lib/sort-documents.ts` (ex `sort-ressources.ts`) : modes `"recent"`
(`uploadedAt` desc, comparaison de dates ISO natives — plus besoin du parseur de date française
`parseFrenchDate`), `"az"` (`title`, `localeCompare` français), `"pages"` (`pageCount` desc, valeurs
`null` en dernier). Perd `"downloads"`.

`app/(public)/ressources/page.tsx` (Server Component) : appelle `listLibrairiePublic` et
`listLibrairieCategories` en parallèle, passe les résultats à `LibrairieCatalog`.

`components/features/librairie/document-header.tsx`/`document-body.tsx`/`related-documents.tsx`
(ex `ressource-header/body.tsx`, `related-ressources.tsx`) : mêmes ajustements de champs (catégorie
au lieu de thème, pages nullable, pas de poids/accès/téléchargements, lien de téléchargement direct
au lieu de `DownloadDialog`). Partage social (`SHARE_LINKS`) inchangé.

## Admin (`app/admin/(shell)/ressources`)

Remplace entièrement le mock soumission/validation par un CRUD réel, avec upload par URL présignée
R2 (le backend ne reçoit plus les octets du fichier).

### Flux d'upload (nouveau contrat R2)

1. Le client demande une URL présignée pour le fichier PDF :
   `POST /librairie/upload-url` avec `{ filename, contentType: "application/pdf", kind: "fichier" }`
   → réponse `{ key, uploadUrl, expiresIn, documentId }` (`documentId` = futur id Prisma du
   document, généré côté serveur).
2. Le client fait un `PUT` **direct** vers `uploadUrl` avec le fichier — ce PUT ne passe ni par
   `apiFetch` ni par `fetch-json.ts` : c'est un appel `fetch` brut vers une URL R2 tierce, en dehors
   du principe BFF habituel de ce projet. **Exception délibérée et documentée** : c'est le principe
   même d'un upload par URL présignée (voir `2026-08-26-r2-storage-migration-design.md` du backend)
   — le serveur onmec-site n'a jamais les octets non plus, il ne fait que relayer la demande de
   signature.
3. Si une couverture est fournie, même flux avec `kind: "cover"` et le `documentId` de l'étape 1
   (pour que fichier et couverture partagent le même dossier R2).
4. Finalisation : `POST /librairie` en JSON — `{ title, description, categorie, fichierKey, coverKey }`
   (plus de `multipart/form-data`).

**Édition** (`PATCH /librairie/{id}`) : reste texte seul (titre/description/catégorie) pour cette
passe — pas de re-upload de fichier/couverture à l'édition, pour ne pas dupliquer le flux présigné
dans un second contexte UI. Le DTO backend supporte techniquement `fichierKey`/`coverKey` en PATCH
(`PartialType(CreateDocumentDto)`) si ce besoin apparaît plus tard — non traité ici.

### Fichiers

- `features/librairie-admin/requests/` (server, `apiFetch` avec cookie) :
  `list-librairie-admin.ts` (`GET /librairie`), `get-librairie-admin.ts` (`GET /librairie/{id}`),
  `request-upload-url.ts` (`POST /librairie/upload-url`), `create-librairie-admin.ts`
  (`POST /librairie`, JSON), `update-librairie-admin.ts` (`PATCH /librairie/{id}`, JSON),
  `delete-librairie-admin.ts` (`DELETE /librairie/{id}`).
- `app/api/admin/librairie/upload-url/route.ts` (`POST`, proxy vers `request-upload-url`),
  `app/api/admin/librairie/route.ts` (`POST`), `app/api/admin/librairie/[id]/route.ts`
  (`PATCH`/`DELETE`) : route handlers proxy, identiques au patron
  `app/api/admin/actualites/[id]/route.ts`.
- `features/librairie-admin/lib/upload-to-r2.ts` : petite fonction browser-safe
  `putFileToUploadUrl(uploadUrl: string, file: File, contentType: string): Promise<void>` — le
  `fetch` brut direct vers R2 mentionné ci-dessus, isolé dans un seul fichier pour que l'exception
  au patron BFF soit localisée et documentée à un seul endroit.
- `features/librairie-admin/mutations/` (`"use client"`, TanStack Query) :
  `use-request-upload-url.ts` (`postJson` vers la route `upload-url`), `use-create-document.ts`
  (orchestre : upload-url fichier → PUT R2 → upload-url cover si présent → PUT R2 →
  `postJson` vers `/api/admin/librairie`), `use-update-document.ts` (`patchJson`),
  `use-delete-document.ts` (`deleteJson`).
- `components/features/librairie-admin/` : `document-list.tsx` (table admin, pagination),
  `upload-document-dialog.tsx` (remplace `new-ressource-dialog.tsx` — champs titre, description,
  catégorie en saisie libre avec suggestions issues de `list-librairie-categories`, fichier PDF
  obligatoire, couverture optionnelle ; état de progression multi-étapes pendant la mutation,
  message d'erreur distinguant à quelle étape l'échec survient — demande de signature, PUT R2,
  finalisation), `edit-document-dialog.tsx` (titre/description/catégorie seulement), suppression via
  le `ConfirmDialog` Radix déjà en place (commit « remplacer window.confirm par un ConfirmDialog
  Radix »).

`app/admin/(shell)/ressources/page.tsx` devient une Server Component qui charge la première page via
`listLibrairieAdmin` et rend un composant client orchestrateur (pagination/recherche côté client
identique au principe du catalogue public, requêtes admin en plus au lieu de statique).

## Vérification

- `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`.
- Vérification manuelle chrome-devtools (clair + sombre, desktop + mobile) : catalogue public
  (recherche, filtre catégorie, tri, pagination, aperçu, lien de téléchargement direct, fiche
  détail `/ressources/[id]`), admin (upload PDF réel + couverture, édition, suppression avec
  confirmation, liste paginée).
- **Dépendance externe pour le test d'upload** : `R2StorageService.isConfigured()` renvoie `503`
  tant que les credentials R2 (`R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/
  `R2_BUCKET_NAME`) ne sont pas renseignés côté backend. Si elles ne le sont pas encore en local, le
  flux d'upload admin ne peut être vérifié qu'une fois configurées — le signaler explicitement au
  lieu de contourner (mock, skip silencieux) si rencontré pendant l'implémentation.
- `convention-drift-check` sur le diff avant de committer.

## Hors scope explicite

- Toute modification du repo `onmec_backend` (livrée comme prompt séparé, exécutée ailleurs).
- Vrai rendu de fichier / feuilletage page par page dans l'aperçu (déjà hors scope du spec
  précédent, toujours vrai).
- Notion d'authentification ou de restriction réelle sur la lecture publique.
- Poids du fichier, compteur de téléchargements, tag d'accès Public/Adhérents (abandonnés).
- Workflow de validation/modération des documents (n'existe pas côté backend).
