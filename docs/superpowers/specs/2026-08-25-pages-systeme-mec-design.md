# Pages système (404 / 500 / 403 / Maintenance) — site vitrine MEC

## Contexte

La maquette Claude Design (`Site MEC.dc.html`) contient 5 écrans "pages système" absents du
plan/spec initial : `is404`, `is500`, `is403`, `isMaintenance`, et un bloc `isErreur` ("Où aller
maintenant") décrit comme réutilisable. Le bandeau "Pages système" du footer de la maquette
(liens `#404`/`#500`/`#403`/Maintenance) est un outil de navigation interne à l'éditeur Claude
Design — même statut que le bandeau "Pistes de conception" déjà exclu du site livré par la spec du
23/08 — **ces liens ne sont pas portés dans le vrai footer**.

## Mécanisme retenu (vinext supporte les conventions Next.js 15)

Vérifié dans `node_modules/vinext` (`dist/routing/app-route-graph.js`,
`dist/shims/navigation-errors.js`) : vinext reconnaît les fichiers spéciaux `not-found.tsx`,
`error.tsx`, `forbidden.tsx`, `unauthorized.tsx` par segment, et exporte `notFound()`, `forbidden()`,
`unauthorized()` depuis `next/navigation` (déjà utilisé pour `notFound()` dans les pages `[slug]`).
Correspondance retenue avec les écrans de la maquette :

| Écran maquette | Mécanisme | Fichier |
| --- | --- | --- |
| `is404` | `notFound()` / route inconnue (auto) | `app/(public)/not-found.tsx` (existe, à réécrire) |
| `is500` | Erreur runtime dans un segment | `app/(public)/error.tsx` (nouveau, Client Component `{error, reset}`) |
| `is403` | Appel explicite à `forbidden()` | `app/(public)/forbidden.tsx` (nouveau) |
| `isMaintenance` | Aucune convention Next.js — pas d'infra de bascule (middleware) demandée | `app/(public)/maintenance/page.tsx` (nouveau, route réelle) |
| `isErreur` | Bloc de secours réutilisable | `components/features/site/error-explore-links.tsx`, monté en pied de 404/500/403 |

`forbidden.tsx` n'est déclenché par aucune logique d'accès réelle aujourd'hui (le site public n'a
pas d'auth) — c'est de l'infrastructure prête pour le jour où un espace membre existera. Vérification
faite en appelant `forbidden()` depuis une page de test temporaire, retirée après capture.

## Décisions de scope / écarts assumés

- **Bouton "Me connecter" (403)** : pointe vers `Espace membre MEC.dc.html` dans la maquette — cette
  maquette n'a pas été lue, aucun espace membre n'existe dans ce projet. Pointé vers `/rejoindre`
  comme les deux CTA de la carte "Vous ne l'êtes pas encore", avec un commentaire de code marquant
  la destination à corriger une fois l'espace membre livré.
- **Pas de middleware de bascule "mode maintenance"** : la page `/maintenance` existe et reprend le
  contenu de la maquette, mais rien ne redirige automatiquement le trafic dessus (nécessiterait un
  flag d'environnement + middleware, non demandé). Bouton "Réessayer maintenant" fait un rechargement
  client (`window.location.reload()`), pas une nouvelle tentative serveur.
- **`isErreur` monté sur 404/500/403, pas sur Maintenance** : la maquette ne montre `isErreur` comme
  sous-bloc d'aucun des quatre écrans (c'est un état de démo séparé), mais sa copie ("Vous cherchiez
  autre chose ?") et sa fonction (grille de 4 raccourcis de navigation) correspondent exactement à ce
  qu'on attend en pied des pages d'erreur/accès refusé. Maintenance a déjà son propre bloc de
  réassurance ("Pendant la maintenance") et n'a pas besoin d'un second bloc de navigation générique.
- **Boutons "invert"/"outline-invert" du design system** : traduits avec le patron déjà établi dans
  `action-cta.tsx`/`contact-cta.tsx` (`bg-white text-fill-ink` / `border-white/35 text-white
  hover:bg-white/10`), pas de nouveau composant `Button` générique créé.
- **Icônes** (`smartphone`, `book-open`, `mail`, `flag`, `users`, `calendar-days`, `megaphone`,
  `newspaper`) : `lucide-react`, déjà la convention du projet.
- **Recherche 404** : champ + bouton "Chercher dans les ressources" — pas de vraie recherche
  disponible (aucun endpoint, aucun index de ressources interrogeable côté client autre que la liste
  statique). Implémenté comme formulaire client qui redirige vers `/ressources?q=<terme>` ; la page
  `/ressources` actuelle n'a pas de filtre pré-rempli par query string — hors scope de cette tâche
  d'ajouter ce filtrage (noté, pas bloquant : le champ fonctionne, il redirige juste sans
  pré-filtrer).

## Composant partagé

`components/features/site/error-page-banner.tsx` : bandeau plein-largeur (fond coloré, gros
nombre, eyebrow, titre avec segment italique, description, 1-2 CTA) — factorise la structure
identique aux 4 écrans (404/500/403/Maintenance), évite ~30 lignes dupliquées ×4.
