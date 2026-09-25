# Audit SEO local — onmec-site

**Date** : 25 septembre 2026
**Objectif** : visibilité institutionnelle en Côte d'Ivoire, pré-lancement (site pas encore indexé).
**Périmètre** : code de `onmec-site` uniquement — pas d'accès Search Console (normal, rien n'est en
ligne sur `mec-ci.org` pour l'instant).

---

## 1. Clôture de l'audit du 30 août 2026

La quasi-totalité du volet technique de [seo-audit-2026-08-30.md](seo-audit-2026-08-30.md) est
réglée. Vérifié dans le code, pas supposé :

| Constat (30 août) | État aujourd'hui |
|---|---|
| §2.1 Aucune métadonnée par page | ✅ `metadata`/`generateMetadata` sur les 9 pages publiques |
| §2.2 Ni `robots.ts` ni `sitemap.ts` | ✅ Les deux existent, sitemap inclut articles + documents |
| §2.3 Aucun canonical / `metadataBase` | ✅ `metadataBase` + `alternates.canonical` par page |
| §3.2 Aucune donnée structurée | ✅ JSON-LD `Organization` (accueil) + `NewsArticle` (articles) |
| §3.3 `alt=""` sur images de contenu | ✅ `alt={article.title}` en place |
| §3.4 `/ressources` : pagination hors URL | ✅ Filtres et pagination en `searchParams`, rendu serveur |
| §4.1 Texte de remplissage indexable | ✅ Blocs masqués tant que la donnée réelle est absente (`bureau-section.tsx`, `contact-details.tsx`) |
| §2.4 `/actions` orpheline | ⏳ Toujours non tranché — hors sitemap, hors nav, décision produit en attente |
| §3.6 Liens morts (mentions légales, confidentialité) | ❌ Toujours `href="#"` — `site-footer.tsx:72,75` |
| §4.2 Chiffres d'impact incohérents | ⏳ Non réconcilié, mais `/actions` (où sont les chiffres contradictoires) reste orphelin donc peu exposé |

Le socle technique n'est plus le sujet. Le SEO local bute sur autre chose.

---

## 2. Le vrai verrou : des données métier, pas du code

Trois manques bloquent tout le SEO local, et aucun ne se résout en éditant un fichier :

1. **Aucune adresse de siège.** `contact-details.tsx:17` la garde délibérément à `null` — bon réflexe
   (pas de fausse donnée indexée), mais tant qu'elle est absente : pas de fiche Google Business
   Profile possible, pas de `PostalAddress` complète, pas de présence sur le pack local Google Maps.
   **C'est le blocage n°1 du SEO local.**
2. **Aucune fiche Google Business Profile.** Le principal levier de SEO local (au-dessus du site web
   lui-même) n'existe pas encore et dépend du point 1.
3. **Aucun compte réseau social.** Zéro lien dans `site-footer.tsx` — vérifié, pas supposé. Pour une
   ONG jeunesse ivoirienne, c'est presque certainement un manque de donnée plutôt qu'un choix : sans
   `sameAs`, le panneau de connaissance Google reste pauvre.

**À fournir par le MEC avant d'aller plus loin sur le SEO local** :
- Adresse postale complète du siège (rue, commune, ville).
- Création d'une fiche Google Business Profile une fois l'adresse connue.
- Comptes Facebook/Instagram/LinkedIn/X actifs, s'ils existent — sinon les créer, c'est le canal de
  diffusion principal évoqué dans l'audit précédent (§3.1).

---

## 3. Corrigé dans cette passe (aucune donnée nouvelle requise)

Deux ajustements exploitant une info déjà publique (« Abidjan, Côte d'Ivoire », `site-footer.tsx:62`)
sans rien inventer :

- **`app/(public)/page.tsx`** — le JSON-LD passe d'`Organization` à `NGO` (sous-type plus précis) et
  gagne `address` (localité + pays seulement, pas de `streetAddress` fictif) et `areaServed`
  (Côte d'Ivoire). Ne pas utiliser `LocalBusiness` : le MEC n'a pas pignon sur rue accessible au
  public, `NGO` + `address` + `areaServed` est la forme correcte.
- **`app/(public)/contact/page.tsx`** — la `description` mentionne désormais « Abidjan, Côte
  d'Ivoire » explicitement, signal de pertinence géographique en plus du contenu déjà présent sur
  `/apropos`.

À vérifier après déploiement avec le [Rich Results Test](https://search.google.com/test/rich-results)
que le `PostalAddress` partiel (sans `streetAddress`) est bien accepté sans erreur.

---

## 4. Point de séquencement vérifié : la bascule de domaine

`app/robots.ts:20-29` bloque tout crawl (`Disallow: /`) tant que l'hôte de la requête diffère de
l'hôte canonique. `getSiteUrl()` (`config/env.ts:30-32`) retombe sur `https://mec-ci.org` par défaut
si `SITE_URL` n'est pas positionnée — donc le Worker déployé aujourd'hui traite déjà `mec-ci.org`
comme canonique. **Conséquence pratique** : le jour où le DNS de `mec-ci.org` pointe sur ce Worker, le
crawl s'ouvre automatiquement, sans redéploiement nécessaire. Point déjà bien conçu, à garder tel
quel — mentionné ici uniquement pour confirmer qu'il n'y a pas de piège de séquencement au moment de
la bascule.

---

## 5. Plan d'action

### Bloquant pour tout gain de SEO local réel

| # | Action | Qui |
|---|---|---|
| 1 | Fournir l'adresse postale complète du siège | MEC |
| 2 | Créer la fiche Google Business Profile | MEC, après (1) |
| 3 | Identifier/créer les comptes réseaux sociaux, les lier dans `site-footer.tsx` et en `sameAs` du JSON-LD | MEC + dev |

### Fait dans cette passe

| # | Action | Où |
|---|---|---|
| 4 | JSON-LD `NGO` + `address` + `areaServed` | `app/(public)/page.tsx` |
| 5 | Mention géographique dans la description `/contact` | `app/(public)/contact/page.tsx` |

### Reste, non bloquant

| # | Action | Où |
|---|---|---|
| 6 | Remplacer les liens morts « Mentions légales » / « Confidentialité » | `site-footer.tsx:72,75` |
| 7 | Trancher le sort de `/actions` (relier ou retirer) — ses chiffres contredisent la page d'accueil | `nav-links.ts:4`, `actions/hero.tsx` |
| 8 | Une fois (1)-(3) obtenus, ajouter `PostalAddress.streetAddress` et `sameAs` au JSON-LD | `app/(public)/page.tsx` |

---

## 6. Non couvert

- Recherche de mots-clés locaux (« [activité] + [ville] Côte d'Ivoire ») — hors périmètre technique,
  à faire une fois les localités d'intervention du MEC confirmées (aujourd'hui seule « Abidjan »
  apparaît ; `/actions`, masquée, évoque 34 campus sans les nommer).
- Mesure Core Web Vitals réelle et positionnement — inchangé depuis le 30 août, toujours dépendant de
  la mise en ligne.
