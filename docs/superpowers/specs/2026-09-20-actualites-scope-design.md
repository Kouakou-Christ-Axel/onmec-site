# Actualités — champ de diffusion (`scope`) en admin

## Contexte

Le backend (`onmec_backend`, voir sa spec jumelle
`docs/superpowers/specs/2026-09-20-actualites-scope-design.md`) ajoute un champ `scope`
(`WEB` défaut / `MOBILE` / `BOTH`) sur les actualités, et filtre désormais les listings publics par
plateforme (`platform=WEB` implicite si absent — donc **aucun changement requis côté listing
public**, `features/actualites/requests/list-actualites.ts` continue de fonctionner à l'identique).

Ce spec couvre uniquement l'admin : afficher et éditer ce champ, aux deux endroits demandés — la
colonne du tableau des actualités, et le popover de publication (le « dropdown d'informations
supplémentaires » qui rassemble aujourd'hui rubrique + date avant publication).

## Décisions

- Le type `StatutActualite` sert de patron direct : nouveau type `ScopeActualite = "WEB" | "MOBILE"
  | "BOTH"` dans `features/actualites-admin/types/actualite-admin.ts`, champ
  `scope: ScopeActualite` ajouté à `ActualiteAdmin`.
- **Tableau** (`actualites-admin-client.tsx`) : nouvelle colonne "Diffusion" entre Statut et
  Auteur, même patron que `STATUT_LABELS`/`STATUT_TONES` → `SCOPE_LABELS`/`SCOPE_TONES` avec
  `<Tag>`. La grille `grid-cols-[...]` gagne une piste supplémentaire.
- **Popover de publication** (`publish-popover.tsx`) : nouveau `<Field label="Diffusion">` avec un
  `<Select>` (Web uniquement / Mobile uniquement / Web et mobile), positionné après "Rubrique" et
  avant "Date de publication". Valeur par défaut : `existing?.scope ?? "WEB"`, cohérente avec le
  défaut backend.
- Le champ suit exactement le même chemin que `categorieId`/`date` aujourd'hui : ajouté à
  `ActualiteFormFields`/`actualiteFormSchema`/`buildActualiteFormData`, envoyé dans le
  `FormData` sous la clé `scope`. Pas de nouveau composant, pas de nouvelle mutation.
- Le champ étant optionnel côté backend (défaut `WEB` en base), il pourrait être omis côté front —
  mais on l'envoie toujours explicitement pour que la valeur affichée dans le popover soit celle
  effectivement persistée, plutôt que de dépendre d'un défaut serveur invisible à l'écran.

## Hors scope (explicite)

- Aucun filtre "Diffusion" sur la liste admin (`?scope=`) ce round — uniquement affichage et
  édition. Un filtre pourra être ajouté plus tard sur le même patron que les autres colonnes.
- Aucune UI mobile : ce repo ne sert que le site web et son back-office.
- Le mismatch existant FormData (front) / JSON (`CreateActualiteDto`, backend) sur les autres
  champs n'est pas traité ici — hors sujet, préexistant.

## Fichiers concernés

- `features/actualites-admin/types/actualite-admin.ts` — type `ScopeActualite`, champ sur
  `ActualiteAdmin`.
- `features/actualites-admin/schemas/actualite-form-schema.ts` — validation `scope`.
- `features/actualites-admin/lib/build-actualite-form-data.ts` (+ test associé) — champ transmis.
- `components/features/admin/actualites-admin-client.tsx` — colonne tableau.
- `components/features/admin/publish-popover.tsx` — `<Select>` Diffusion.

## Tests

- `build-actualite-form-data.test.ts` (existant) : étendre avec un cas `scope`.
- Vérification manuelle (`rtk pnpm run dev`, compte éditorial) : créer/éditer une actualité, choisir
  "Mobile uniquement" dans le popover, publier, vérifier la colonne "Diffusion" dans le tableau, et
  vérifier que l'actualité n'apparaît pas dans `/actualites` (site public) — confirmant le filtrage
  côté backend sans changement du listing public.
