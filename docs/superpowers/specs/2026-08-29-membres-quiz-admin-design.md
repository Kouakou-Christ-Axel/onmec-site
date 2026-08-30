# Sections admin Membres et Quiz

## Contexte

Un canvas Claude Design ("Dashboard MEC.dc.html", projet `2e2225ae-57a2-48a7-b4a4-1647a83b198a`) a
été importé et lu en entier. Il introduit deux sections absentes du dashboard admin actuel :

- **Membres** — annuaire des comptes citoyens (utilisateurs finaux de l'app mobile), avec
  gamification (points/niveaux), modération (suspendre/réactiver/anonymiser), et fiche détail par
  onglets (infos, signalements, quiz, commentaires, journal de points, notifications).
- **Quiz** — banque de quiz éducatifs : liste, catégories, éditeur (questions/choix), aperçu
  interactif, statistiques (tentatives, score moyen, distribution).

Le fix du bouton de thème admin (`data-mec-admin` posé sur `app/admin/layout.tsx`, scope CSS étendu
dans `app/globals.css`) est **déjà livré séparément**, hors périmètre de ce spec — voir le commit
correspondant. Les composants créés ici en héritent automatiquement (aucune action requise).

**Frontière** : ce repo (`onmec-site`) ne touche qu'au frontend. `onmec_backend` (repo séparé) n'est
lu que pour comprendre son contrat réel (spec OpenAPI complète fournie par l'utilisateur) — jamais
modifié depuis cette session. Les gaps identifiés (§ Dépendance backend) sont transmis comme prompt
texte à une session Claude Code dédiée à `onmec_backend`, hors périmètre de ce plan.

Décisions de scope validées avec l'utilisateur :

- **Périmètre** : uniquement Membres et Quiz (nouveaux). Aucun écran admin déjà implémenté
  (file de travail, signalements, actualités, ressources, campagnes, statistiques,
  utilisateurs/droits) n'est retouché dans ce spec.
- **Données** : vrai flow API (`types/schemas/requests/mutations`), pas de mock statique — à la
  différence de l'actuel `features/admin/` (exception documentée dans `docs/ARCHITECTURE.md`, qui ne
  s'applique pas ici).
- **Droits** : deux nouveaux flags `canMembres`/`canQuiz` sur `AdminShellState`, dérivés du rôle avec
  la même formule que l'existant (`role !== "..."`). Hypothèse de matrice (Admin + Modérateur pour
  Membres ; Admin + Communication pour Quiz), à ajuster si le premier retour utilisateur diffère.

## Dépendance backend (hors périmètre d'implémentation ici)

La quasi-totalité des endpoints nécessaires **existe déjà** dans `onmec_backend` (spec OpenAPI
vérifiée). Le contrat réel, endpoint par endpoint, est documenté avec le code qui l'appelle plus bas
(§ Membres, § Quiz). Cette section liste uniquement les **gaps réels** — rien à construire côté front
tant qu'ils ne sont pas livrés, les écrans/actions correspondants restent non câblés (bouton
désactivé + message, pas de mock qui fait semblant de marcher) :

| Gap                                                   | Endpoint actuel                                                                   | Besoin                                                                                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Stats en tête de la liste Membres                     | Aucun endpoint dédié                                                              | **Contournement front retenu, pas un vrai gap** : 4 appels `GET /users?statut=X&limit=1` en parallèle, lecture de `meta.total` |
| Onglet Commentaires du membre                         | `GET /commentaires` n'a qu'un filtre `cible`, pas d'auteur                        | Paramètre `auteurId` sur `GET /commentaires`                                                                                   |
| Onglet Points (journal)                               | `POST /gamification/points` journalise mais rien ne l'expose en lecture           | `GET /gamification/{userId}/journal` paginé                                                                                    |
| Onglet Notifications du membre                        | `/notification/*` scopés sur l'utilisateur authentifié, pas sur un `userId` cible | `GET /notification/admin/{userId}` (ou clarifier la fusion avec le futur module notifications)                                 |
| Notifier un membre                                    | Idem — device token, pas `userId`                                                 | `POST /notification/send-to-user` `{ userId, titre, texte }`                                                                   |
| Anonymiser un membre                                  | Aucun endpoint (seulement soft/hard delete)                                       | `POST /users/{id}/anonymiser`                                                                                                  |
| Export CSV                                            | Aucun endpoint                                                                    | `GET /users/export?...` (priorité basse — repli possible : export de la page courante en front, sans call dédié)               |
| Distribution des notes (histogramme quiz)             | Absent de `GET /quizz/{id}/statistics`                                            | Champ `distribution: [{ tranche, count }]` sur cet endpoint                                                                    |
| Liste paginée des tentatives d'un quiz                | `recentAttempts` limité à 10, schéma `array` non typé                             | `GET /quizz/{id}/tentatives?page=&limit=`, DTO typé avec le nom du membre                                                      |
| Détail d'une tentative (réponses par question)        | `QuizResultResponseDto` n'a que le score global                                   | `GET /quizz/{id}/tentatives/{tentativeId}` avec réponse du membre vs bonne réponse par question                                |
| Sémantique d'upsert questions sur `PATCH /quizz/{id}` | Documenté "remplace questions et choix", comportement exact non confirmé          | Confirmer : `id` existant → update, sans `id` → create, absent du payload → delete, en une transaction                         |
| ~~Onglet "Résultats" du dashboard Quiz (toutes tentatives, tous membres)~~ **Livré** | `GET /quizz/results?page=&limit=&quizId=`, admin only, `{ id, userId, userNom, quizId, quizTitre, score, completedAt }` | — |
| ~~Colonnes "Tentatives"/"Score moyen" par ligne sur la liste des quiz~~ **Livré** | `totalAttempts`/`averageScore` sur `QuizzResponseDto` (liste en `groupBy`, détail en `aggregate`) | — |
| ~~Nombre de quiz par catégorie sur l'écran Catégories~~ **Livré** | `quizCount` sur `CategorieQuizResponseDto` | — |
| ~~Réaffectation des quiz avant suppression d'une catégorie~~ **Livré** | `DELETE /quizz/categories/{id}?reassignTo={autreId}`, transactionnel | — |
| ~~`isCorrect` absent des choix sur `GET /quizz`/`GET /quizz/{id}`~~ **Livré, confirmé par le code et les tests backend (`quizz.service.spec.ts`)** | `attachIsCorrect` appelé dès que `isAdminActor(actor)` est vrai via `OptionalJwtAuthGuard` : `ChoiceResponseDto.isCorrect` présent pour un acteur admin | — |

**2026-08-29, passe alignement design** (`Dashboard MEC.dc.html`, écran Quiz) : les 5 lignes
ci-dessus (Résultats, Tentatives/Score moyen, quizCount, réaffectation catégorie, isCorrect)
identifiées lors de cette passe, transmises comme prompt à une session `onmec_backend` et livrées
le même jour — front mis à jour en conséquence (onglet Résultats, colonnes Tentatives/Score moyen,
compteur par catégorie, dialogue de suppression de catégorie avec réaffectation, action Dupliquer).
Tout le reste de l'écran Quiz (liste, catégories en onglet, éditeur, aperçu, statistiques de base)
est restylé pour suivre ce design.

**Séquencement** : les écrans/onglets qui dépendent d'un gap affichent un état "à venir" plutôt que
d'être développés contre un contrat imaginé. Tout le reste (liste, détail, suspendre/réactiver,
ajuster les points, onglets signalements/quiz du membre, CRUD quiz complet, catégories, stats de
base) est développable immédiatement contre les endpoints existants.

## Modèle de données

### Membres (`features/membres-admin/types/`)

```ts
// membre-admin.ts
export type MembreEtat = "ACTIF" | "SUSPENDU" | "BANNI";

export interface MembreAdmin {
  id: string;
  nom: string; // UserResponseDto.fullname
  email: string;
  telephone: string | null;
  dateInscription: string; // UserResponseDto.createdAt
  etat: MembreEtat; // UserResponseDto.statut
  emailVerifie: boolean; // UserResponseDto.emailVerified
}

export interface MembreListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

`points`/`niveau` ne sont **pas** dans `GET /users` (`UserResponseDto`) — ils viennent de
`GET /gamification/leaderboard` ou d'un appel `GET /gamification/me` par membre (coûteux en liste).
**Décision** : la liste Membres n'affiche pas points/niveau en colonne dans cette première passe
(le design le montre, mais aucun endpoint ne les expose en batch avec la liste) — affichés
uniquement dans la fiche détail (`GET /gamification/{userId}` n'existe pas non plus en lecture pour
un tiers ; à défaut, dérivés du leaderboard si le membre y figure, sinon `—`). **Gap à ajouter à la
liste ci-dessus si confirmé bloquant** : `GET /users` devrait idéalement inclure `points`/`niveau`
dans sa réponse, ou un endpoint `GET /gamification/{userId}` accessible à l'admin. À trancher à
l'implémentation selon ce que révèle un test manuel de la liste avant de coder l'affichage.

### Quiz (`features/quiz-admin/types/`)

```ts
// quiz-admin.ts
export type QuizDifficulte = "FACILE" | "MOYEN" | "DIFFICILE";

export interface QuizChoix {
  id?: string; // absent = nouveau choix
  texte: string;
  correct: boolean;
}

export interface QuizQuestion {
  id?: string; // absent = nouvelle question
  texte: string;
  choix: QuizChoix[]; // >= 2, exactement 1 correct
}

export interface QuizAdmin {
  id: string;
  titre: string;
  description: string | null;
  difficulte: QuizDifficulte | null;
  categorieId: string | null;
  categorie: { id: string; nom: string } | null;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizCategorie {
  id: string;
  nom: string;
  description: string | null;
}

export interface QuizStatistiques {
  totalQuestions: number;
  totalAttempts: number;
  averageScore: number;
}
```

## Navigation et droits

`components/features/admin/admin-shell-context.tsx` — ajouter à `AdminShellState` :

```ts
canMembres: boolean; // initialRole !== "Chargée de communication"
canQuiz: boolean; //    initialRole !== "Modérateur"
```

`features/admin/data/droits.ts` — deux lignes pour la table d'affichage `/admin/utilisateurs`
(module, administrateur, communication, moderation).

`components/features/admin/admin-sidebar.tsx` — deux `NavItem`, entre "Ressources" et "Campagnes" :

```ts
{ href: "/admin/membres", label: "Membres", icon: Users2, requires: "canMembres" },
{ href: "/admin/quiz", label: "Quiz", icon: GraduationCap, requires: "canQuiz" },
```

`NavItem["requires"]` étendu avec `"canMembres" | "canQuiz"`.

## Membres (`app/admin/(shell)/membres`)

### Liste (`features/membres-admin/requests/list-membres.ts`)

`GET /users?search=&statut=&page=&limit=` (query params : `search` texte libre, `statut` ∈
`ACTIF|SUSPENDU|BANNI`, `page`, `limit`). Réponse `{ data: UserResponseDto[], meta }` — mappée vers
`MembreAdmin[]` (le filtre "période" du design, sur la date d'inscription, est appliqué **côté
front** sur la page courante tant qu'aucun paramètre backend équivalent n'existe — limitation
documentée à l'écran si le nombre de membres dépasse une page).

Page (`app/admin/(shell)/membres/page.tsx`, Server Component) : lit les `searchParams`
(`q`, `etat`, `page`, `limit`), appelle `listMembres` via un route handler proxy
(`app/api/admin/membres/route.ts`), passe le résultat à `<MembresAdminClient>`.

### Fiche membre (drawer, pas de route séparée — cohérent avec `signalement-drawer.tsx`)

`GET /users/{id}/profile` pour l'onglet Infos. Onglets pilotés par un switcher **local**
(`role="tablist"/"tab"/"tabpanel"`, `aria-selected`/`aria-controls` posés à la main — pas de
`@radix-ui/react-tabs`, absent du repo et seul site d'usage prévu, sur le modèle du stepper de
`signalement-drawer.tsx`) :

- **Infos** : `GET /users/{id}/profile`.
- **Signalements** : `GET /signalement-citoyen?citoyenId={id}&page=&limit=`.
- **Quiz** : `GET /quizz/results/{userId}` (tableau non paginé — affiché tel quel).
- **Commentaires** : bloqué (gap backend `auteurId`) — état "à venir".
- **Points (journal)** : bloqué (gap backend journal) — état "à venir". La carte "points/niveau
  actuels" en haut de l'onglet reste affichable si `GET /gamification/{userId}` devient accessible
  (voir note § Modèle de données), sinon masquée.
- **Notifications** : bloqué (gap backend) — état "à venir".

### Actions

- **Ajuster les points** : `POST /gamification/points` — `{ userId, points: delta, raison }`.
  Modale avec champ delta (nombre signé) + raison obligatoire, aperçu "points/niveau après" calculé
  côté front à partir de la réponse `GamificationStateDto`.
- **Désactiver/réactiver** : `PATCH /users/{id}/statut` — `{ statut: "SUSPENDU"|"BANNI"|"ACTIF",
raison? }`. Le design distingue "désactiver" (suspendre) de "réactiver" (repasser `ACTIF`) ; le
  bannissement (`BANNI`) n'a pas d'équivalent explicite dans le design — **non exposé dans l'UI de
  cette passe**, seul `SUSPENDU`/`ACTIF` sont proposés (le statut `BANNI` existe côté backend mais
  reste hors scope UI).
- **Anonymiser** : bloqué (gap backend `POST /users/{id}/anonymiser`) — bouton visible mais
  désactivé avec tooltip explicatif, pas retiré (le design le montre, la fonctionnalité arrivera).
- **Notifier** : bloqué (gap backend) — même traitement que anonymiser.
- **Export CSV** : bloqué (gap backend, priorité basse) — bouton masqué dans cette première passe
  plutôt que désactivé (fonctionnalité secondaire, pas la peine d'occuper l'espace visuel tant que
  le backend n'a pas confirmé le calendrier).

### Fichiers

```
features/membres-admin/
  types/membre-admin.ts
  schemas/ajuster-points-schema.ts       # { delta: z.number().refine(n => n !== 0), raison: z.string().min(1) }
  schemas/changer-etat-schema.ts          # { statut: z.enum(["ACTIF","SUSPENDU"]), raison: z.string().optional() }
  requests/list-membres.ts                # GET /users
  requests/get-membre.ts                  # GET /users/{id}/profile
  requests/list-membre-signalements.ts    # GET /signalement-citoyen?citoyenId=
  requests/list-membre-quiz.ts            # GET /quizz/results/{userId}
  requests/ajuster-points-membre.ts       # POST /gamification/points
  requests/changer-etat-membre.ts         # PATCH /users/{id}/statut
  mutations/use-ajuster-points.ts
  mutations/use-changer-etat-membre.ts
  queries/use-membre-tab.ts               # useQuery générique paramétré par onglet, activé à l'ouverture du drawer

components/features/membres-admin/
  membres-admin-client.tsx        # liste + recherche + filtre état + pagination
  membre-row-actions.tsx          # menu actions par ligne
  membre-detail-drawer.tsx        # Drawer + switcher d'onglets local
  membre-tab-infos.tsx
  membre-tab-signalements.tsx
  membre-tab-quiz.tsx
  membre-tab-a-venir.tsx          # état générique pour Commentaires/Points/Notifications (gap backend)
  ajuster-points-dialog.tsx
  changer-etat-membre-dialog.tsx

app/admin/(shell)/membres/page.tsx
app/api/admin/membres/route.ts                       # GET liste
app/api/admin/membres/[id]/route.ts                    # GET détail
app/api/admin/membres/[id]/signalements/route.ts         # GET
app/api/admin/membres/[id]/quiz/route.ts                   # GET
app/api/admin/membres/[id]/points/route.ts                   # POST
app/api/admin/membres/[id]/etat/route.ts                       # PATCH
```

## Quiz (`app/admin/(shell)/quiz`)

Routes séparées (aligné sur `actualites-admin`, pas d'état client type SPA comme dans le canvas
d'origine) :

```
app/admin/(shell)/quiz/page.tsx                    # liste (RSC, searchParams : categorie, difficulte, tri, page)
app/admin/(shell)/quiz/categories/page.tsx           # gestion catégories
app/admin/(shell)/quiz/nouveau/page.tsx                # éditeur, création
app/admin/(shell)/quiz/[id]/modifier/page.tsx            # éditeur, édition
app/admin/(shell)/quiz/[id]/statistiques/page.tsx           # stats (tentatives paginées : gap backend,
                                                             # affichage limité à recentAttempts/10 en attendant)
```

### Liste

`GET /quizz?categorieId=&difficulte=&search=&page=&limit=`. 4 états explicites côté client
(chargement/squelettes, erreur+réessayer, vide+CTA, normal+pagination) — pattern déjà en place
côté `librairie-admin-client.tsx`/`actualites-admin-client.tsx` à répliquer, pas un nouveau pattern.

### Catégories

CRUD complet et déjà disponible : `GET/POST /quizz/categories`, `GET/PATCH/DELETE
/quizz/categories/{id}`. `DELETE` peut renvoyer 409 si des quiz référencent encore la catégorie — le
front affiche le message d'erreur backend tel quel (pas de pré-vérification côté front).

### Éditeur

`GET /quizz/{id}` pour charger (questions incluses), `POST /quizz` pour créer (titre + description

- catégorie + difficulté ; questions ajoutées ensuite via `PATCH`, cohérent avec le fait que
  `CreateQuizzDto` accepte déjà `questions` optionnellement — on peut aussi tout envoyer d'un coup à la
  création si plus simple à l'implémentation), `PATCH /quizz/{id}` pour sauvegarder (titre, description,
  catégorie, difficulté, `questions[]` complet — le backend "remplace questions et choix").

Validation front (Zod, avant tout appel réseau) : chaque question a exactement un choix
`correct: true`, au moins 2 choix, titre non vide.

Bandeau "des tentatives existent déjà" avant la confirmation de sauvegarde : appel parallèle à
`GET /quizz/{id}/statistics`, lecture de `totalAttempts` (pas un champ du détail du quiz lui-même).

Aperçu interactif (`quiz-preview-dialog.tsx`) : simulateur de passage 100% côté client
(`features/quiz-admin/lib/compute-quiz-score.ts`), aucun appel réseau — ne soumet jamais à
`POST /quizz/submit` (réservé à un vrai passage membre, pas à la prévisualisation admin).

### Statistiques

`GET /quizz/{id}/statistics` → `{ totalQuestions, totalAttempts, averageScore, recentAttempts }`.
Distribution par tranches et liste paginée complète des tentatives : bloqués (gaps backend) — la
page affiche les 3 cartes stats de base (tentatives, moyenne, questions) et `recentAttempts` brut
(limité à 10, sans détail par question) en attendant.

### Fichiers

```
features/quiz-admin/
  types/quiz-admin.ts
  schemas/quiz-form-schema.ts       # titre, description, categorieId, difficulte
  schemas/question-schema.ts        # texte, choix[] (>=2, exactement 1 correct)
  schemas/categorie-form-schema.ts
  requests/list-quiz.ts / get-quiz.ts / create-quiz.ts / update-quiz.ts / delete-quiz.ts
  requests/list-categories.ts / create-categorie.ts / update-categorie.ts / delete-categorie.ts
  requests/get-quiz-stats.ts
  mutations/use-create-quiz.ts / use-update-quiz.ts / use-delete-quiz.ts
  mutations/use-create-categorie.ts / use-update-categorie.ts / use-delete-categorie.ts
  queries/use-categories.ts         # sur le modèle de features/actualites-admin/queries/use-categories.ts
  lib/compute-quiz-score.ts         # logique du simulateur, testée (test co-localisé)

components/features/quiz-admin/
  quiz-admin-client.tsx
  quiz-categories-client.tsx
  quiz-editor-form.tsx
  quiz-question-editor.tsx
  quiz-preview-dialog.tsx
  quiz-save-confirm-dialog.tsx      # avertit si totalAttempts > 0
  quiz-delete-dialog.tsx
  quiz-categorie-dialog.tsx
  quiz-stats-cards.tsx

app/api/admin/quiz/route.ts                    # GET liste, POST créer
app/api/admin/quiz/[id]/route.ts                 # GET détail, PATCH, DELETE
app/api/admin/quiz/[id]/statistiques/route.ts       # GET
app/api/admin/quiz-categories/route.ts           # GET liste, POST créer
app/api/admin/quiz-categories/[id]/route.ts        # PATCH, DELETE
```

## Vérification

- `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`.
- Vérification manuelle : connexion admin, navigation Membres/Quiz visible selon `canMembres`/
  `canQuiz` (tester avec un rôle Modérateur → Quiz visible en lecture, actions d'édition masquées ;
  Chargée de communication → Membres masqué).
- Liste Membres : recherche, filtre état, pagination ; drawer fiche membre : onglets Infos/
  Signalements/Quiz fonctionnels, onglets "à venir" affichent leur état sans erreur.
- Ajuster les points (vérifier le delta appliqué côté backend réel), suspendre/réactiver un membre.
- Quiz : créer un quiz avec 2+ questions, aperçu interactif (bonnes/mauvaises réponses stylées),
  enregistrer, modifier, statistiques après un vrai passage côté mobile/API si possible, suppression
  avec confirmation. Catégories : créer/éditer/supprimer (y compris le cas 409).
- `convention-drift-check` sur le diff avant de committer.

## Hors scope explicite

- Toute modification du repo `onmec_backend` (transmise comme prompt séparé).
- Les gaps listés en § Dépendance backend restent non câblés tant qu'ils ne sont pas livrés.
- Bannissement (`statut: "BANNI"`) — non exposé dans l'UI Membres de cette passe.
- Écrans déjà implémentés (signalements, actualités, ressources, campagnes, statistiques,
  utilisateurs/droits) — non retouchés au-delà du fix thème déjà livré séparément.
- Suppression réversible/restauration d'un membre (`DELETE /users/{id}` + `POST
/users/restore/{id}`) — le design ne les montre pas dans les actions de la fiche/liste ; seul
  suspendre/réactiver est exposé.
