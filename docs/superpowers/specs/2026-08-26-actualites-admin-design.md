# Branchement backend — Actualités (admin)

## Contexte

Le dashboard admin (`app/admin/(shell)/actualites/page.tsx`, `components/features/admin/article-editor.tsx`,
`components/features/admin/publish-popover.tsx`) est une maquette qui tourne entièrement sur des
données statiques (`features/admin/data/articles.ts`). Le backend `onmec_backend` a un module
`actualites` réel et déjà mature (taxonomie catégories/tags dynamique, workflow de publication,
suppression réversible, likes/commentaires réellement branchés via le module `engagement`,
recherche/pagination/filtres). Le décalage n'est pas un backend obsolète à mettre à jour : c'est le
front qui n'est pas branché, et dont la maquette suppose des fonctionnalités que le backend n'offre
pas (workflow à 4 statuts avec programmation, comptage de vues).

Ce spec couvre le branchement du **CRUD admin des actualités** — création, édition, publication,
suppression. Le site public (`/actualites`, actuellement sur `features/actualites/data/articles.ts`)
est un sous-projet séparé, traité dans un round ultérieur.

Suite du travail d'authentification admin déjà livré (`docs/superpowers/specs/2026-08-25-auth-admin-design.md`,
`docs/superpowers/plans/2026-08-25-auth-admin.md`) — mêmes conventions BFF, même patron de fichiers.

## Objectifs

- Page liste (`/admin/actualites`) : vraies données, statuts réels, actions réelles (publier/dépublier/supprimer).
- Éditeur : création et édition réelles, avec upload d'image, catégorie, corps en Tiptap.
- Aucune régression sur l'auth admin déjà en place ; réutilisation stricte du patron BFF existant.

## Hors scope (décidé explicitement, à ne pas faire dans ce round)

- **Site public actualités** : reste sur données statiques pour l'instant, round séparé.
- **Tags** : le champ existe côté backend (`tags?: string[]` sur create/update) mais n'apparaît dans
  aucune maquette actuelle. On ne l'expose pas dans l'éditeur ce round.
- **Création de catégorie depuis l'éditeur** : l'éditeur _liste_ les catégories existantes
  (`GET /categorie-actualite`, accès public) mais ne permet pas d'en créer une nouvelle inline. Une
  catégorie doit déjà exister en base pour être sélectionnable. Pas de round dédié à un écran de
  gestion des catégories pour l'instant.
- **Restauration d'article archivé** (`POST /actualites/:id/restore`) : endpoint existant côté
  backend, mais pas d'action dans la liste ce round — la liste admin n'affiche que les statuts
  Brouillon/Publiée par défaut (voir section Liste).
- **Statuts "En relecture" / "Programmé" et programmation de publication** : le backend ne les
  supporte pas (`StatutActualite` = `BROUILLON | PUBLIEE | ARCHIVEE` uniquement, aucune notion de
  date de publication différée). L'UI admin est simplifiée à ce que le backend supporte réellement —
  décision actée en amont (pas une simplification cachée).
- **Colonne "vues"** : aucun comptage de vues n'existe côté backend. Retirée, remplacée par
  likes/commentaires (`likesCount`/`commentsCount`), qui existent réellement.
- **Bouton "Notifier les utilisateurs"** : la notification aux membres part déjà automatiquement à la
  première publication (`actualites.service.ts`, méthode `publier`). Le bouton devient une ligne
  informative, pas une action.

## Contrat backend (résumé, source de vérité = `onmec_backend/src/modules/actualites/`)

### Endpoints utilisés

| Méthode  | Route                                        | Rôle requis                                          | Usage                                                 |
| -------- | -------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| `GET`    | `/actualites/admin?page&limit&search&statut` | Éditorial (`ADMIN_NATIONAL`, `CHARGE_COMMUNICATION`) | Liste back-office, tous statuts                       |
| `POST`   | `/actualites` (multipart)                    | Éditorial                                            | Création — statut initial toujours BROUILLON          |
| `PATCH`  | `/actualites/:id` (multipart)                | Éditorial                                            | Édition (tous champs optionnels)                      |
| `PATCH`  | `/actualites/:id/publier`                    | Éditorial                                            | Publication                                           |
| `PATCH`  | `/actualites/:id/depublier`                  | Éditorial                                            | Dépublication (repasse en BROUILLON)                  |
| `DELETE` | `/actualites/:id`                            | Éditorial                                            | Suppression réversible (passe en ARCHIVEE)            |
| `GET`    | `/categorie-actualite`                       | Public                                               | Liste des catégories, pour le `<Select>` de l'éditeur |

Le rôle éditorial (`ADMIN_NATIONAL`, `CHARGE_COMMUNICATION` — tout sauf `MODERATEUR`) correspond
exactement à `canEdito` déjà calculé dans `admin-shell-context.tsx`. Le guard backend
(`AdminRolesGuard`) reste l'autorité réelle ; `canEdito` ne sert qu'à masquer l'UI côté front
(défense en profondeur déjà en place pour le reste du dashboard).

### `CreateActualiteDto` (multipart/form-data) — champs

- `date: Date` — **obligatoire**. Date éditoriale de l'actualité (distincte de `publishedAt`, posée
  automatiquement à la première publication). L'éditeur propose un input date, valeur par défaut :
  aujourd'hui.
- `title: string` — obligatoire, max 200.
- `excerpt: string` — obligatoire, max 500.
- `content: string` — obligatoire, HTML (sortie de Tiptap).
- `categorieId: string` (UUID) — **obligatoire**.
- `tags?: string[]` — hors scope, jamais envoyé ce round.
- `image?: file` — optionnel.

`UpdateActualiteDto` = tous les champs ci-dessus en optionnel (`PartialType`).

### `ActualiteResponseDto` (résumé des champs utilisés côté admin)

`id, slug, title, excerpt, content, date, imageUrl, statut, publishedAt, author{id,fullname,role},
categorie{id,nom,slug}, tags[], likesCount, commentsCount, likedByMe, createdAt, updatedAt,
deletedAt`.

### `CategorieActualiteResponseDto`

`id, nom, slug, description, actualitesCount`.

## Architecture

Même patron BFF que `features/admin-auth/*` :

```
features/actualites-admin/
  types/actualite-admin.ts        # Actualite, ActualiteAdminList, Categorie — types miroir des DTO backend
  schemas/actualite-form-schema.ts # Zod : validation du formulaire éditeur avant envoi
  requests/
    list-actualites-admin.ts       # apiFetch GET /actualites/admin — appelé depuis la page (Server Component)
    list-categories.ts             # apiFetch GET /categorie-actualite — appelé depuis la page
    create-actualite.ts            # apiFetch POST /actualites (multipart)
    update-actualite.ts            # apiFetch PATCH /actualites/:id (multipart)
    publier-actualite.ts           # apiFetch PATCH /actualites/:id/publier
    depublier-actualite.ts         # apiFetch PATCH /actualites/:id/depublier
    delete-actualite.ts            # apiFetch DELETE /actualites/:id
  mutations/
    use-create-actualite.ts
    use-update-actualite.ts
    use-publier-actualite.ts
    use-depublier-actualite.ts
    use-delete-actualite.ts

app/api/admin/actualites/
  route.ts                         # POST (créer) — proxy multipart
  [id]/route.ts                    # PATCH (éditer), DELETE (supprimer)
  [id]/publier/route.ts            # PATCH
  [id]/depublier/route.ts          # PATCH
```

**Lecture** (page liste) : `apiFetch()` directement côté serveur dans
`app/admin/(shell)/actualites/page.tsx` (converti en Server Component async), pour la liste et pour
les catégories — cohérent avec la convention CLAUDE.md (contenu authentifié rendu serveur, pas de
React Query pour du rendu initial).

**Écriture** (créer/éditer/publier/dépublier/supprimer) : mutations TanStack Query côté client, qui
appellent les route handlers `app/api/admin/actualites/*` (jamais le backend directement — le cookie
httpOnly est invisible au JS), qui eux-mêmes appellent `apiFetch()`.

### Correctif nécessaire : `lib/api-client.ts` et le multipart

`apiFetch` pose `Content-Type: application/json` dès qu'un `body` est présent et qu'aucun
`Content-Type` n'est déjà fourni (`lib/api-client.ts:26-28`). Pour un upload d'image, le corps est un
`FormData` : `fetch` doit poser lui-même le `Content-Type: multipart/form-data; boundary=...`, sinon
le backend ne peut pas parser la requête. Correctif ciblé : ne pas poser ce header par défaut quand
`init.body instanceof FormData`. C'est le seul changement dans le point d'entrée serveur partagé ;
aucun autre appelant existant n'envoie de `FormData`, donc pas de régression possible.

Les route handlers admin qui reçoivent un upload lisent le corps de la requête entrante avec
`await request.formData()` et repassent ce `FormData` tel quel en `body` à `apiFetch` (pas de
reconstruction champ par champ) — c'est un simple relais.

## Page liste (`app/admin/(shell)/actualites/page.tsx`)

- Server Component async. Appelle `listActualitesAdmin()` (statut non filtré = tous statuts sauf
  ARCHIVEE par défaut, donc Brouillon + Publiée seulement — pas de vue "corbeille" ce round).
- Colonnes : Titre, Statut (badge Brouillon=orange / Publiée=bleu, mêmes tons que `Tag` existant),
  Auteur (`author.fullname`, `—` si `null`), Date (`date`, formatée), et à la place de "Vues" :
  `❤ {likesCount} · 💬 {commentsCount}` ou équivalent textuel sobre.
- Actions par ligne (visibles seulement si `canEdito`) : "Publier"/"Dépublier" (selon `statut`),
  "Modifier" (ouvre l'éditeur pré-rempli), "Supprimer" (confirmation, puis `DELETE`).
- Bouton "Nouvel article" masqué si `!canEdito` (déjà le comportement pour les autres écrans du
  dashboard).
- Erreur de chargement : réutilise le patron déjà établi ailleurs dans le dashboard (pas de nouveau
  composant d'erreur).

## Éditeur (`components/features/admin/article-editor.tsx`)

Champs, dans l'ordre visuel actuel conservé :

1. **Titre** — input existant, inchangé.
2. **Chapô** — mappé sur `excerpt`, inchangé visuellement.
3. **Date** — nouveau champ, input `type="date"`, défaut = aujourd'hui.
4. **Corps** — remplace le `<textarea>` par Tiptap (`@tiptap/react` + `@tiptap/pm` +
   `@tiptap/starter-kit` + `@tiptap/core`, épinglés en version exacte `3.30.3`, cohérent avec la
   règle du projet « jamais `latest` »). Toolbar minimale : gras, italique, lien, liste à puces,
   liste numérotée, titre H2/H3 — pas plus, cohérent avec le ton sobre du reste de l'éditeur.
   `editor.getHTML()` alimente `content` à l'envoi.
5. **Image de couverture** — nouveau champ, `<input type="file" accept="image/*">` + aperçu miniature
   si un fichier est sélectionné. Optionnel.
6. **Catégorie** — déplacée dans le popover de publication existant (voir ci-dessous), pas dans le
   corps de l'éditeur — reprend l'emplacement du `<Select>` "Rubrique" déjà présent dans
   `publish-popover.tsx`, mais rempli depuis `GET /categorie-actualite` au lieu de la liste statique
   `RUBRIQUES`. Obligatoire : le bouton "Publier l'article" reste désactivé tant qu'aucune catégorie
   n'est sélectionnée (en plus de la condition déjà existante sur le titre).

Compteur de mots existant conservé, recalculé sur le texte brut de l'éditeur Tiptap
(`editor.getText()`).

## Popover de publication (`components/features/admin/publish-popover.tsx`)

- Champ "Rubrique" : `<Select>` rempli dynamiquement (`GET /categorie-actualite`), remplace
  `RUBRIQUES`.
- Champ "Mise en ligne" (`MOMENTS_PUBLICATION`) : **retiré**. Pas de programmation possible côté
  backend ; publication toujours immédiate.
- Bouton "Notifier les N utilisateurs" : **retiré**, remplacé par une ligne de texte informative
  (« Les membres de l'app seront notifiés automatiquement à la publication. »).
- Bouton "Publier l'article" : appelle la mutation de création (si nouvel article) ou d'édition
  (si article existant en BROUILLON) puis `publier`, dans cet ordre — création/édition d'abord (pour
  avoir un id), publication ensuite. Sur un article déjà publié qu'on modifie, pas de republication
  implicite : `PATCH /actualites/:id` seul suffit (rester en PUBLIEE).

## Gestion d'erreurs

Même patron que `connexion-view.tsx` / `changer-mot-de-passe-view.tsx` : erreur de validation
(catégorie manquante, titre vide) bloque l'action côté client avant l'appel réseau ; erreur backend
(401/403/422/500) affichée dans une bannière au-dessus du formulaire, `mutation.reset()` appelé au
prochain essai pour ne pas garder une erreur périmée affichée.

## Tests

- Tests unitaires existants (vitest) : pas de régression sur `lib/api-client.ts` (ajouter un cas
  `FormData` dans les tests de ce module s'ils existent, sinon un test ciblé sur le nouveau
  comportement).
- Vérification manuelle (navigateur, compte `national@mec-ci.org`) : créer un article avec image et
  catégorie réelle, le voir apparaître Brouillon dans la liste, le publier, le dépublier, le
  supprimer (soft-delete, disparaît de la liste par défaut), vérifier qu'un compte `MODERATEUR` ne
  voit ni le bouton "Nouvel article" ni les actions d'écriture.
