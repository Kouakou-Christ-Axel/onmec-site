# Dashboard admin MEC — design

Source : Claude Design, projet `2e2225ae-57a2-48a7-b4a4-1647a83b198a`, fichier `Dashboard MEC.dc.html`
(design system `mec-design-system-4502560a-084d-4620-b231-b0b869ca5bb6`).

## Contexte et périmètre

Première section authentifiée du site (`docs/ARCHITECTURE.md` prévoyait d'y revisiter deux décisions
« actuelles » : garde d'auth edge et `components/ui/`). Ce chantier est **UI pure** : les 8 écrans du
dashboard admin, les 4 états de l'écran de connexion, les overlays (tiroir signalement, éditeur
d'article, modale nouvelle ressource), avec données mockées en dur et état local React pour les
onglets/filtres/formulaires. Explicitement hors périmètre :

- Garde d'auth edge (middleware/proxy) et branchement au vrai flow `features/auth`.
- Tout appel `apiFetch`/TanStack Query vers `onmec_backend`.
- Persistance des actions (valider, publier, envoyer une notification...) — elles mettent à jour
  l'état local en mémoire (comme le fait le prototype Claude Design lui-même), rien de plus.

Ces branchements réels feront l'objet d'une tâche architecturale séparée.

## Routing et layout

```
app/admin/connexion/page.tsx        écran non authentifié (4 états)
app/admin/layout.tsx                coquille partagée : sidebar + header
app/admin/page.tsx                  File de travail (isFile)
app/admin/signalements/page.tsx     Signalements (isSig) + tiroir de détail
app/admin/actualites/page.tsx       Actualités et blog (isContenus) + éditeur plein écran
app/admin/ressources/page.tsx       Ressources pédagogiques (isRess) + modale nouvelle ressource
app/admin/campagnes/page.tsx        Campagnes et événements (isCampagnes)
app/admin/push/page.tsx             Notifications app (isPush)
app/admin/statistiques/page.tsx     Statistiques et rapports (isStats)
app/admin/utilisateurs/page.tsx     Utilisateurs et droits (isUsers)
```

Une route par item de nav (au lieu du switch `state.screen` à page unique du prototype original) —
plus idiomatique App Router, permet le deep-link. Les overlays (tiroir, éditeur, modale) restent des
superpositions en `useState` local à leur page, pas des routes, pour rester fidèles au comportement
du design (pas de navigation lors de leur ouverture/fermeture).

**`app/admin/layout.tsx`** (client component) rend `<AdminShellProvider>` autour de
`<AdminSidebar>` + `<AdminHeader>` + `{children}`. Le contexte (`components/features/admin/admin-shell-context.tsx`)
porte les contrôles de démo présents dans le design lui-même (sélecteur de rôle dans le header,
recherche, densité) :

- `role: 'Administrateur national' | 'Chargée de communication' | 'Modérateur'` (défaut : Administrateur national)
- `canSig = role !== 'Chargée de communication'`, `canEdito = role !== 'Modérateur'`, `canUsers = role === 'Administrateur national'`
- `sidebarCollapsed: boolean`, `dense: boolean`

`AdminSidebar` masque les liens de nav selon `canSig`/`canEdito`/`canUsers` et surligne l'item actif
via `usePathname()`. Si le rôle actif perd l'accès à la route courante (changement de rôle depuis le
header), rediriger vers `/admin`.

## Primitives `components/ui/`

Traduites depuis `core.css`/`forms.css`/`feedback.css` du design system — pas copiées telles
quelles (même règle que les pages publiques), mais réimplémentées en Tailwind/JSX. Tailles
calées sur les valeurs **effectivement utilisées** dans le dashboard (qui diffèrent parfois des
tokens `--control-h-*` par défaut du design system) :

- **`button.tsx`** — variants `primary | secondary | ghost | deep | invert | outline-invert`,
  tailles `sm(32px) | md(40px) | lg(48px)`, icône leading optionnelle (`lucide-react`).
- **`icon-button.tsx`** — variants `ghost | outline | primary | deep | invert`, tailles carrées
  `sm(32) | md(36) | lg(40)`, prop `label` obligatoire (accessibilité).
- **`tag.tsx`** — tons `neutral | orange | blue | solid | outline | invert`, tailles `sm(22px) | md(26px)`,
  variante cliquable/`active` pour les filtres de la page Signalements.
- **`field.tsx`** — wrapper `label` + `hint`/`error`, `htmlFor`.
- **`input.tsx`** — hauteur 36px (registre "shadcn" du design, plus discret que les boutons), types
  text/email/password/search.
- **`textarea.tsx`** — même registre, hauteur min 76/84px, resize vertical.
- **`select.tsx`** — select natif stylé + chevron `lucide-react` `ChevronDown` en position absolue.
- **`alert.tsx`** — tons `info | success | warning | danger`, `title` optionnel.
- **`stat.tsx`** — `value`/`label`/`meta`, séparateur optionnel (utilisé en grille sur Statistiques).
- **`drawer.tsx`** — panneau plein-hauteur ancré à droite + scrim, anime son entrée
  (`translateX` 260ms), utilisé par le tiroir de détail signalement.
- **`dialog.tsx`** — modale centrée + scrim, utilisée par « Nouvelle ressource ».

Pas de composant `Card` ni `Icon` génériques : les cartes restent du JSX bespoke par écran (trop
variées visuellement — dégradés, bordures pointillées, tampon `shadow-stamp`...), et les icônes
s'importent directement depuis `lucide-react` (déjà en dépendance) sans wrapper.

### Tokens à ajouter à `app/globals.css`

Le fichier existant ne couvre que les pages publiques. À ajouter dans `@theme` (Tailwind v4 a besoin
de `@theme` pour générer les utilitaires `bg-surface-page`, `text-muted-foreground`, `shadow-overlay`
etc. que les écrans consomment directement — les mettre dans `:root` ne produirait que des
`var(...)` sans classes utilitaires, ce qui n'est pas le besoin ici) :

```
--surface-page, --surface-card, --surface-sunken, --surface-deep, --surface-deep-soft
--text-body, --text-muted, --border-subtle, --border-strong
--verdict-true(-bg), --verdict-false(-bg), --verdict-misleading(-bg), --verdict-unchecked(-bg)
--shadow-overlay, --overlay-scrim
--radius-control (6px, utilisé par input/select/textarea, distinct de --radius-md/lg)
```

## Icônes (`lucide-react`)

Mapping direct nom-du-design → composant (identique en kebab→PascalCase) : `inbox`, `flag`,
`newspaper`, `book-open` → `BookOpen`, `megaphone`, `smartphone`, `landmark`, `users`,
`external-link` → `ExternalLink`, `log-out` → `LogOut`, `bell`, `search`, `pen-line` → `PenLine`,
`send`, `download`, `upload`, `hourglass`, `mail`, `life-buoy` → `LifeBuoy`, `lock`, `x`,
`arrow-left` → `ArrowLeft`, `check`, `eye`, `eye-off` → `EyeOff`, `file-plus` → `FilePlus`,
`shield-check` → `ShieldCheck`, `graduation-cap` → `GraduationCap`, `user-plus` → `UserPlus`,
`bold`, `italic`, `heading-2` → `Heading2`, `quote`, `list`, `image`, `minus`, `plus`.

## Données mock (`features/admin/data/*.ts`)

Traduites depuis les tableaux en dur du script du prototype (`sigs0`, `droits`) et les cartes
statiques des autres écrans :

- `signalements.ts` — 10 signalements (`SIG-2026-0139` à `0148`), statuts
  `validation | encours | resolu | rejete`, avec `updates[]` pour le suivi affiché dans le tiroir.
- `droits.ts` — matrice 8 modules × 3 rôles (`Plein accès | Lecture seule | Aucun accès`).
- `utilisateurs.ts` — 6 membres (actifs/invitations).
- `articles.ts` — brouillons + publiés (titre, statut, auteur, date, vues).
- `ressources.ts` — items en ligne + 1 en validation (titre, type, taille, téléchargements).
- `campagnes.ts` — 4 campagnes (statut, période, progression, responsable).
- `notifications-envoyees.ts` — historique des 3 derniers envois push (destinataires, taux d'ouverture).

Chaque fichier exporte un type + un tableau `const`, dans le style de
`features/actualites/data/articles.ts` déjà présent.

## Écrans — comportement attendu

1. **File de travail** (`/admin`) — 4 tuiles KPI filtrées par rôle (chacune un lien vers sa
   section), liste « à traiter » agrégée tous domaines confondus (triée par ancienneté, bouton
   d'action par ligne), encart app mobile (chiffres statiques), flux d'activité d'équipe (statique).
2. **Signalements** (`/admin/signalements`) — filtres par statut (Tag actifs) + catégorie (Select),
   tableau responsive (colonnes qui se masquent en dessous de 1400/1200px comme dans le design),
   clic sur une ligne → tiroir de détail avec stepper de statut (validation→en cours→résolu),
   bascule afficher/masquer dans l'app, changement de responsable, ajout d'une mise à jour visible
   côté citoyen (append en mémoire).
3. **Actualités et blog** (`/admin/actualites`) — tableau articles (brouillons en surbrillance),
   « Nouvel article » ouvre l'éditeur plein écran (titre/chapô/corps en `contentEditable`, barre de
   mise en forme, compteur de mots, panneau de publication en popover).
4. **Ressources** (`/admin/ressources`) — alerte si une ressource est en attente de validation,
   grille de cartes (en ligne / en validation / brouillon), « Ajouter une ressource » ouvre la
   modale (type + titre → brouillon créé en mémoire).
5. **Campagnes** (`/admin/campagnes`) — grille 2 colonnes de cartes avec barre de progression ;
   « Créer une campagne » est un bouton statique dans le design source (pas de modale spécifiée) →
   reste non câblé.
6. **Notifications app** (`/admin/push`) — formulaire (titre/message/destinataires/envoi) avec
   aperçu live façon notification mobile, tableau d'historique.
7. **Statistiques** (`/admin/statistiques`) — 4 `Stat`, graphique à barres CSS (mois de caravane en
   orange), tableau mini par région.
8. **Utilisateurs et droits** (`/admin/utilisateurs`) — tableau membres, matrice de droits en
   lecture seule ; « Inviter un membre » reste non câblé (même raison que Campagnes).

## Écran de connexion (`/admin/connexion`)

Un composant `components/features/admin-auth/auth-screen.tsx`, état local `step: 'connexion' |
'inscription' | 'attente' | 'expire'`. Les liens fantômes du bas de page (démo togglers dans le
design original) sont conservés à l'identique pour montrer les 4 états sans dépendre d'un vrai flow
d'auth — cohérent avec le périmètre « UI pure » de ce chantier.

## Auto-révision

- Pas de placeholder ni de TBD restant.
- Cohérence : le choix « route par section » diverge du prototype (state unique `screen`) mais est
  justifié explicitement ; les overlays restent fidèles au comportement original.
- Portée : un seul chantier (8 écrans + auth + primitives), pas de découpage en sous-projets — la
  taille reste gérable pour un plan d'implémentation unique avec exécution parallélisée par écran.
