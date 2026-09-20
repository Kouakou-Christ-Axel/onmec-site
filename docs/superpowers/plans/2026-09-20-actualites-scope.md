# Diffusion des actualités (`scope`) en admin — Implementation Plan

**Goal:** Afficher et éditer le champ `scope` (Web / Mobile / Web et mobile, défaut Web) dans le
tableau admin des actualités et dans le popover de publication.

**Design:** `docs/superpowers/specs/2026-09-20-actualites-scope-design.md`

**Tech Stack:** Next.js (vinext) App Router, React 19, TypeScript, Zod, TanStack Query

---

## Fichiers créés / modifiés

| Action   | Fichier |
| -------- | ------- |
| Modifier | `features/actualites-admin/types/actualite-admin.ts` |
| Modifier | `features/actualites-admin/schemas/actualite-form-schema.ts` |
| Modifier | `features/actualites-admin/lib/build-actualite-form-data.ts` |
| Modifier | `features/actualites-admin/lib/build-actualite-form-data.test.ts` |
| Créer    | `features/actualites-admin/lib/actualite-labels.ts` |
| Modifier | `components/features/admin/actualites-admin-client.tsx` |
| Modifier | `components/features/admin/publish-popover.tsx` |

---

### Task 1: Type et schéma

- [ ] **Step 1:** `actualite-admin.ts` — ajouter `export type ScopeActualite = "WEB" | "MOBILE" |
      "BOTH";` et `scope: ScopeActualite` sur `ActualiteAdmin`.
- [ ] **Step 2:** `actualite-form-schema.ts` — ajouter
      `scope: z.enum(["WEB", "MOBILE", "BOTH"])` au schéma.

### Task 2: Transmission du champ

- [ ] **Step 1:** `build-actualite-form-data.ts` — ajouter `scope: ScopeActualite` (import du type)
      à `ActualiteFormFields`, `formData.set("scope", fields.scope)` dans `buildActualiteFormData`.
- [ ] **Step 2:** `build-actualite-form-data.test.ts` — étendre le(s) cas existant(s) avec `scope`.

### Task 3: Colonne "Diffusion" dans le tableau

- [ ] **Step 1:** `features/actualites-admin/lib/actualite-labels.ts` (nouveau) — extraire
      `STATUT_LABELS`/`STATUT_TONES` (déplacés depuis `actualites-admin-client.tsx`, pour rester
      sous 200 lignes) et ajouter `SCOPE_LABELS: Record<ScopeActualite, string>` (`WEB: "Web"`,
      `MOBILE: "Mobile"`, `BOTH: "Web et mobile"`) et `SCOPE_TONES: Record<ScopeActualite, "blue" |
      "outline" | "neutral">` (tons déjà supportés par `<Tag>`, distincts de ceux du statut).
- [ ] **Step 2:** Ajouter une piste à la grille (`grid-cols-[minmax(0,1fr)_120px_140px_156px_116px_140px_150px]`
      ou équivalent — recalculer les largeurs pour rester lisible sur `min-w-[860px]`) et l'en-tête
      "Diffusion" entre "Statut" et "Auteur".
- [ ] **Step 3:** Ajouter `<Tag tone={SCOPE_TONES[actualite.scope]}>{SCOPE_LABELS[actualite.scope]}</Tag>`
      dans chaque ligne, à la même position.

### Task 4: Select "Diffusion" dans le popover de publication

- [ ] **Step 1:** `publish-popover.tsx` — état `const [scope, setScope] = useState<ScopeActualite>(existing?.scope ?? "WEB")`.
- [ ] **Step 2:** `<Field label="Diffusion">` avec un `<Select>` à trois options (Web uniquement /
      Mobile uniquement / Web et mobile), positionné après le `<Field label="Rubrique">` existant.
- [ ] **Step 3:** Passer `scope` dans l'appel à `actualiteFormSchema.safeParse({ ...fields, date,
      categorieId, scope })` et à `buildActualiteFormData(parsed.data, categorieId, image)` (le
      champ `scope` fait déjà partie de `parsed.data` une fois ajouté au schéma).

### Task 5: Vérification

- [ ] **Step 1:** `rtk pnpm run typecheck`
- [ ] **Step 2:** `rtk pnpm run lint`
- [ ] **Step 3:** `rtk pnpm run test`
- [ ] **Step 4:** `rtk pnpm run dev` — créer/éditer une actualité, choisir "Mobile uniquement",
      publier, vérifier la colonne "Diffusion" dans le tableau.
- [ ] **Step 5:** `convention-drift-check` sur le diff avant commit.
