# Statistiques admin — branchement sur l'API réelle

## Contexte

`/admin/statistiques` est aujourd'hui 100 % mock
(`features/admin/data/statistiques.ts` : `PERIODES`, `MOIS`, `REGIONS`),
consommé directement par `app/admin/(shell)/statistiques/page.tsx`. Les
concepts affichés ("personnes sensibilisées", "campus et lycées couverts",
répartition par région) n'ont aucun équivalent dans le modèle de données
backend — ce sont des artefacts du mock initial, pas des métriques réelles.

Décision (brainstorming du 2026-08-30) : recentrer la page sur trois domaines
qui existent réellement côté backend — **signalements**, **membres**, **quiz**
— et abandonner les concepts sans données réelles (personnes sensibilisées,
campus, région, graphique mensuel).

## Dépendance backend

Aucun endpoint d'agrégats stats n'existe aujourd'hui côté `onmec_backend`.
Audit des endpoints déjà branchés dans onmec-site :

| Donnée | Disponible aujourd'hui ? | Comment |
|---|---|---|
| Total signalements / par statut / par catégorie | Oui, composable | `GET /signalement-citoyen?statut=&categorieId=&limit=1` (meta.total) par variante — plusieurs appels légers, pas de N+1 |
| Total membres, actifs/suspendus/bannis | Oui, composable | `GET /users?statut=&limit=1` (meta.total) par valeur de `statut` |
| Total quiz, tentatives, score moyen | Oui, composable | `GET /quizz` retourne déjà `totalAttempts`/`averageScore` par quiz dans la liste — sommable/moyennable côté front sans appel supplémentaire |
| Agrégat unique, un seul appel | **Non — gap** | Décision produit : demander un endpoint dédié plutôt que composer côté front (voir prompt backend ci-dessous), pour rester correct si le volume grossit |

Tant que l'endpoint n'existe pas, la page affiche un état "à venir" (même
pattern que les gaps déjà documentés dans
`docs/superpowers/specs/2026-08-29-signalements-admin-design.md`).

### Prompt à transmettre à `onmec_backend`

```
Nouvel endpoint agrégé pour le dashboard admin :

GET /admin/statistics (garde Admin, même niveau d'accès que /admins)

Réponse (AdminStatisticsDto) :
{
  signalements: {
    total: number;
    parStatut: Record<"NOUVEAU" | "EN_COURS" | "RESOLU" | "REJETE", number>;
    parCategorie: { categorieId: string; nom: string; total: number }[];
  };
  membres: {
    total: number;
    actifs: number;
    suspendus: number;
    bannis: number;
  };
  quiz: {
    totalQuiz: number;
    totalTentatives: number;
    scoreMoyenGlobal: number; // moyenne pondérée par le nombre de tentatives
  };
}

Contexte : la page /admin/statistiques du frontend a besoin de ces agrégats
en un seul appel plutôt que de les composer via plusieurs appels aux
endpoints de liste existants (/signalement-citoyen, /users, /quizz).
```

## Modèle de données (frontend)

```ts
// features/statistiques-admin/types/admin-statistics.ts
export type SignalementStatutApi = "NOUVEAU" | "EN_COURS" | "RESOLU" | "REJETE";

export interface AdminStatistics {
  signalements: {
    total: number;
    parStatut: Record<SignalementStatutApi, number>;
    parCategorie: { categorieId: string; nom: string; total: number }[];
  };
  membres: {
    total: number;
    actifs: number;
    suspendus: number;
    bannis: number;
  };
  quiz: {
    totalQuiz: number;
    totalTentatives: number;
    scoreMoyenGlobal: number;
  };
}
```

## Requêtes serveur

`features/statistiques-admin/requests/get-admin-statistics.ts` — server-only,
`apiFetch<AdminStatistics>("/admin/statistics")`. Suit exactement le patron de
`features/quiz-admin/requests/get-quiz-stats.ts`.

## Routes BFF / queries client

Aucune. La page n'a plus d'interactivité côté client (période/rapport
supprimés, cf. décision ci-dessous) : c'est un Server Component pur qui
appelle `getAdminStatistics()` directement, comme les autres pages
"authentifiées en lecture seule" du dashboard. Pas de route BFF ni de hook
`useQuery` tant qu'aucune interaction client n'est ajoutée.

## Composant / page

`app/admin/(shell)/statistiques/page.tsx` (Server Component) :
- Appelle `getAdminStatistics()` côté serveur. En cas d'`ApiError` (404/501,
  endpoint pas encore livré), passe `stats: null` au composant client.
- Affiche soit les cartes réelles (signalements total/résolus, membres
  actifs, quiz total + tentatives + score moyen, répartition par statut et
  par catégorie), soit un bandeau "Statistiques bientôt disponibles" si
  `stats` est `null`, plutôt que de crasher ou d'afficher un mock.
- Suppression complète du graphique mensuel, du tableau régional, du
  sélecteur de période et du bouton "Générer le rapport" — aucun de ces
  éléments n'a d'équivalent réel côté backend ; `features/admin/data/statistiques.ts`
  est supprimé (plus aucune référence).

## Vérification

- `pnpm run typecheck && pnpm run lint && pnpm run test`.
- Manuel : `/admin/statistiques` affiche l'état "à venir" (l'endpoint
  n'existe pas encore) sans erreur serveur ni page blanche.

## Hors scope explicite

- Filtre actif/inactif sur `GET /admins` (Utilisateurs et droits).
- Répartition géographique / par région.
- Série temporelle mensuelle (graphique).
- Implémentation de l'endpoint backend lui-même (hors du repo onmec-site).
