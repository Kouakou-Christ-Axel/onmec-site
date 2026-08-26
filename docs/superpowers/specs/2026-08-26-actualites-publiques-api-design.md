# Actualités publiques — branchement API

## Problème

Le site public rend des constantes importées (`features/actualites/data/articles.ts`). La page de
détail est une maquette : `article-generic-body.tsx` affiche « Article complet à venir » et
`article-bilan-body.tsx` est du contenu écrit en dur pour le seul slug `bilan`. Le back-office
publie déjà de vraies actualités via `onmec_backend`.

## Ce que l'API donne réellement

Vérifié contre le backend local (`http://localhost:8081/api/v1`), pas seulement lu dans l'OpenAPI.

- `GET /actualites` — public, publiées uniquement. Enveloppe
  `{ data: Actualite[], meta: { total, page, limit, totalPages } }`. **Non documentée dans
  l'OpenAPI** (`responses.200` sans schéma) — confirmée par appel réel.
- `GET /actualites/slug/{slug}` — public, une actualité.
- `GET /categorie-actualite` — public, **tableau nu** (pas d'enveloppe), avec `actualitesCount`.

**Deux écarts entre l'OpenAPI et la réalité, constatés à l'appel :**

1. `imageUrl` est **absolu** (`http://localhost:8081/uploads/actualites/image_….png`), là où
   l'OpenAPI le documente relatif (`/uploads/actualites/pont-abidjan.jpg`). Aucun préfixage à
   écrire côté site. Conséquence : le domaine des images suit celui de l'API et change entre local
   et production — à déclarer si l'optimiseur d'images de vinext est utilisé.
2. La réponse porte des champs absents du DTO documenté : `authorId`, `categorieId`.

## Décisions

- **Les catégories deviennent dynamiques.** `ArticleCategory` est aujourd'hui une union fermée de
  quatre valeurs (`Sensibilisation | Lancement | Partenariat | Institutionnel`) doublée d'un
  `CATEGORY_TAG_CLASSES: Record<ArticleCategory, string>`. Aucune ne correspond aux catégories
  réelles, et le `Record` casse à la création d'une cinquième en back-office. Ce n'est pas un
  choix : le typage doit suivre l'API.
- **Filtrage et pagination côté serveur, portés par l'URL.** `/actualites?categorie=<slug>&page=2`
  lu depuis `searchParams` et transmis à l'API. `news-filter.tsx` passe de filtre en mémoire à
  liens de navigation. L'URL devient partageable et indexable, et on ne charge que 10 articles.
- **Le HTML de `content` est assaini avant rendu.** Il est produit par Tiptap (StarterKit + Image),
  stocké en base, et rendu sur un site public : le passer brut à `dangerouslySetInnerHTML` en fait
  un vecteur XSS dès qu'un compte éditorial est compromis. Assainissement par liste blanche, avec
  une bibliothèque vérifiée — on n'écrit pas un assainisseur HTML à la main.
- **Requêtes publiques en `auth: false`.** `apiFetch` attache le cookie par défaut, ce qui appelle
  `cookies()` et rend la page dynamique. Ces trois routes sont publiques : on coupe l'auth pour que
  les pages restent cacheables.
- **`readingTime` est calculé** depuis le nombre de mots de `content` — l'API ne le fournit pas.
- **`service` disparaît** : absent de l'API. `author.fullname` existe mais désigne autre chose
  (le compte back-office rédacteur, pas un service signataire).
- **Les vraies images remplacent `PhotoPlaceholder`**, avec repli sur le placeholder quand
  `imageUrl` est `null`.

## Périmètre

Liste, détail et catégories. `data/articles.ts`, `data/bilan-content.ts`,
`article-bilan-body.tsx` et `article-generic-body.tsx` disparaissent au profit d'un corps unique
rendant le HTML assaini.

Hors périmètre : tags (`GET /tag-actualite`), recherche (`?search=`), likes et commentaires — ces
deux derniers demandent un membre authentifié, que le site public ne gère pas encore.
