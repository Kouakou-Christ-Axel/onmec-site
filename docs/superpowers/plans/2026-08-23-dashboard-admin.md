# Dashboard admin MEC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Porter les 8 écrans + l'écran de connexion (4 états) du prototype Claude Design
`Dashboard MEC.dc.html` en pages Next.js/React, en UI pure (données mockées, état local), sous
`/admin`.

**Architecture:** Une route App Router par section de nav (au lieu du state-switch à page unique du
prototype), une coquille partagée (`app/admin/layout.tsx`) portant sidebar/header/contexte de rôle,
un socle de primitives `components/ui/` traduites des CSS du design system, des données mockées
statiques dans `features/admin/data/`.

**Tech Stack:** Next.js App Router (vinext), React 19, TypeScript strict, Tailwind CSS v4,
`lucide-react`, vitest.

**Spec:** [docs/superpowers/specs/2026-08-23-dashboard-admin-design.md](../specs/2026-08-23-dashboard-admin-design.md)

## Global Constraints

- **UI pure** : aucun appel `apiFetch`/TanStack Query, aucune garde d'auth edge. Toutes les actions
  (valider, publier, changer de statut...) mettent à jour de l'état React local en mémoire.
- **Pas de composant `Card` ni `Icon` génériques** : cartes bespoke par écran, icônes importées
  directement depuis `lucide-react`.
- **Pas de test de rendu de composant** : aucun harnais `@testing-library/react` n'existe dans ce
  repo (seul `vitest` sur des fonctions pures, cf. `features/ressources/lib/format-count.ts`). La
  vérification des écrans se fait via `pnpm run dev` + navigateur (voir CLAUDE.md), pas via des
  tests de rendu. Le seul test vitest de ce plan porte sur `buildQueue()`, une fonction pure.
  Chaque tâche d'écran se termine par : `rtk pnpm run typecheck`, `rtk pnpm run lint`, puis
  vérification visuelle manuelle dans le navigateur.
- **Kebab-case partout**, fichiers ≤ 200 lignes (voir `docs/ARCHITECTURE.md`).
- **Rôles de démo** : `role` (`Administrateur national` par défaut) pilote `canSig` (`role !==
  'Chargée de communication'`), `canEdito` (`role !== 'Modérateur'`), `canUsers` (`role ===
  'Administrateur national'`) — logique identique au prototype.
- Une fois toutes les tâches terminées, lancer une revue `convention-drift-check` sur le diff complet
  avant de proposer le commit final (règle CLAUDE.md), en plus des commits par tâche.

---

### Task 1: Tokens design system + animation

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces (utilitaires Tailwind consommés par toutes les tâches suivantes) : `bg-surface-page`,
  `bg-surface-card`, `bg-surface-sunken`, `bg-surface-deep`, `bg-surface-deep-soft`,
  `border-border-subtle`, `border-border-strong`, `text-muted-foreground`, `bg-verdict-true-bg`,
  `text-verdict-true`, `bg-verdict-false-bg`, `text-verdict-false`, `bg-verdict-misleading-bg`,
  `text-verdict-misleading`, `shadow-overlay`, `rounded-control`. Keyframes `mecDrawer` (CSS global,
  pas un utilitaire).

- [ ] **Step 1: Ajouter les tokens manquants à `@theme`**

Dans `app/globals.css`, à l'intérieur du bloc `@theme` existant (après `--color-ink: #0e1b2e;`),
ajouter :

```css
  --color-surface-page: var(--color-n-50);
  --color-surface-card: var(--color-n-0);
  --color-surface-sunken: var(--color-n-100);
  --color-surface-deep: var(--color-blue-800);
  --color-surface-deep-soft: var(--color-blue-50);
  --color-border-subtle: rgb(14 27 46 / 0.1);
  --color-border-strong: rgb(14 27 46 / 0.24);
  --color-muted-foreground: #5e6878;
  --color-verdict-true: #157f52;
  --color-verdict-true-bg: #e7f5ee;
  --color-verdict-false: #c42b1c;
  --color-verdict-false-bg: #fcebe9;
  --color-verdict-misleading: #8a4100;
  --color-verdict-misleading-bg: #fff0de;
  --shadow-overlay: 0 24px 60px rgb(7 28 57 / 0.22);
  --radius-control: 6px;
```

- [ ] **Step 2: Ajouter l'animation d'entrée des overlays (tiroir/modale/éditeur)**

Toujours dans `app/globals.css`, après le bloc `:root { ... }` existant, ajouter :

```css
@keyframes mecDrawer {
  from {
    transform: translateX(28px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes mecRise {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

- [ ] **Step 3: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur (fichier CSS uniquement, ces commandes valident juste qu'on n'a rien cassé
ailleurs).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(admin): tokens et animations du design system dashboard"
```

---

### Task 2: Primitives boutons (`button.tsx`, `icon-button.tsx`)

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/icon-button.tsx`

**Interfaces:**
- Produces: `Button({ variant?, size?, icon?, full?, ...buttonProps })`,
  `IconButton({ icon, label, variant?, size?, ...buttonProps })`.

- [ ] **Step 1: Créer `components/ui/button.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "deep" | "invert" | "outline-invert";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
  secondary: "bg-transparent text-ink border border-ink/24 hover:bg-n-100 hover:border-ink",
  ghost: "bg-transparent text-ink hover:bg-n-100",
  deep: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
  invert: "bg-white text-ink hover:bg-n-100",
  "outline-invert": "bg-transparent text-white border border-white/24 hover:bg-white/12 hover:border-white",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-sm gap-2",
  md: "h-10 px-5 text-[0.9375rem] gap-2.5",
  lg: "h-12 px-7 text-base gap-2.5",
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 15, md: 16, lg: 18 };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  full?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  full = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm font-semibold tracking-[-0.005em] transition-colors disabled:pointer-events-none disabled:opacity-45 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={ICON_SIZE[size]} /> : null}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Créer `components/ui/icon-button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type IconButtonVariant = "ghost" | "outline" | "primary" | "deep" | "invert";
type IconButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: "bg-transparent text-ink hover:bg-n-100",
  outline: "bg-transparent text-ink border border-ink/24 hover:border-ink hover:bg-n-100",
  primary: "bg-orange-500 text-white hover:bg-orange-600",
  deep: "bg-blue-500 text-white hover:bg-blue-600",
  invert: "bg-transparent text-white border border-white/24 hover:bg-white/14",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-grid place-items-center rounded-sm transition-colors disabled:pointer-events-none disabled:opacity-45 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      <Icon size={size === "lg" ? 20 : 16} />
    </button>
  );
}
```

- [ ] **Step 3: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add components/ui/button.tsx components/ui/icon-button.tsx
git commit -m "feat(admin): primitives Button et IconButton"
```

---

### Task 3: Primitive `tag.tsx`

**Files:**
- Create: `components/ui/tag.tsx`

**Interfaces:**
- Produces: `Tag({ tone?, size?, active?, icon?, onClick?, children })`. `tone` ∈ `"neutral" |
  "orange" | "blue" | "solid" | "outline" | "invert"`.

- [ ] **Step 1: Créer `components/ui/tag.tsx`**

```tsx
import type { LucideIcon } from "lucide-react";

type TagTone = "neutral" | "orange" | "blue" | "solid" | "outline" | "invert";
type TagSize = "sm" | "md";

const TONE_CLASSES: Record<TagTone, string> = {
  neutral: "bg-n-100 text-[#2b3646]",
  orange: "bg-orange-100 text-orange-800",
  blue: "bg-blue-100 text-blue-700",
  solid: "bg-orange-500 text-white",
  outline: "bg-transparent text-[#2b3646] border border-ink/24",
  invert: "bg-white/16 text-white",
};

const SIZE_CLASSES: Record<TagSize, string> = {
  sm: "h-[22px] px-2.5 text-[0.6875rem]",
  md: "h-[26px] px-3 text-xs",
};

interface TagProps {
  tone?: TagTone;
  size?: TagSize;
  active?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Tag({
  tone = "neutral",
  size = "sm",
  active = false,
  icon: Icon,
  onClick,
  children,
  className = "",
}: TagProps) {
  const interactive = typeof onClick === "function";
  const Comp = interactive ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold tracking-[0.06em] uppercase ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${interactive ? "cursor-pointer transition-colors hover:border-ink" : ""} ${active ? "border-ink bg-ink text-white" : ""} ${className}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {children}
    </Comp>
  );
}
```

- [ ] **Step 2: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/ui/tag.tsx
git commit -m "feat(admin): primitive Tag"
```

---

### Task 4: Primitives formulaire (`field.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`)

**Files:**
- Create: `components/ui/field.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/textarea.tsx`
- Create: `components/ui/select.tsx`

**Interfaces:**
- Produces: `Field({ label, htmlFor?, hint?, error?, children })`, `Input(props)`,
  `Textarea(props)`, `Select(props)` — `Input`/`Textarea`/`Select` étendent les attributs HTML natifs
  respectifs.

- [ ] **Step 1: Créer `components/ui/field.tsx`**

```tsx
interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[0.8125rem] font-medium text-verdict-false">{error}</span>
      ) : hint ? (
        <span className="text-[0.8125rem] text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Créer `components/ui/input.tsx`**

```tsx
import type { InputHTMLAttributes } from "react";

type InputSize = "default" | "lg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize;
}

export function Input({ size = "default", className = "", ...props }: InputProps) {
  const sizeClasses = size === "lg" ? "h-11 px-4 text-base" : "h-9 px-3 text-sm";
  return (
    <input
      className={`w-full rounded-control border border-border-subtle bg-white font-sans text-ink shadow-[0_1px_2px_rgba(14,27,46,0.04)] outline-none transition-colors placeholder:text-n-400 hover:border-border-strong focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(21,86,181,0.24)] disabled:cursor-not-allowed disabled:bg-n-50 disabled:opacity-50 ${sizeClasses} ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Créer `components/ui/textarea.tsx`**

```tsx
import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", rows = 3, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={`min-h-[76px] w-full resize-y rounded-control border border-border-subtle bg-white px-3 py-2 font-sans text-sm text-ink shadow-[0_1px_2px_rgba(14,27,46,0.04)] outline-none transition-colors placeholder:text-n-400 hover:border-border-strong focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(21,86,181,0.24)] ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Créer `components/ui/select.tsx`**

```tsx
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative block">
      <select
        className={`h-9 w-full appearance-none rounded-control border border-border-subtle bg-white pr-9 pl-3 font-sans text-sm text-ink shadow-[0_1px_2px_rgba(14,27,46,0.04)] outline-none transition-colors hover:border-border-strong focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(21,86,181,0.24)] ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-n-400" />
    </div>
  );
}
```

- [ ] **Step 5: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add components/ui/field.tsx components/ui/input.tsx components/ui/textarea.tsx components/ui/select.tsx
git commit -m "feat(admin): primitives de formulaire (Field, Input, Textarea, Select)"
```

---

### Task 5: Primitives `alert.tsx`, `stat.tsx`, `drawer.tsx`, `dialog.tsx`

**Files:**
- Create: `components/ui/alert.tsx`
- Create: `components/ui/stat.tsx`
- Create: `components/ui/drawer.tsx`
- Create: `components/ui/dialog.tsx`

**Interfaces:**
- Consumes: `IconButton` (Task 2, utilisé nulle part ici en réalité — le bouton de fermeture est
  laissé au composant appelant, `Drawer`/`Dialog` ne rendent que le châssis).
- Produces: `Alert({ tone?, title?, children })`, `Stat({ value, label, meta?, rule? })`,
  `Drawer({ open, onClose, children, widthClassName? })`, `Dialog({ open, onClose, children,
  wide? })`.

- [ ] **Step 1: Créer `components/ui/alert.tsx`**

```tsx
type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<AlertTone, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-100",
  success: "bg-verdict-true-bg text-verdict-true border-verdict-true/20",
  warning: "bg-orange-50 text-orange-800 border-orange-200",
  danger: "bg-verdict-false-bg text-verdict-false border-verdict-false/20",
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
}

export function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div className={`flex gap-4 rounded-md border p-5 text-sm leading-relaxed ${TONE_CLASSES[tone]}`}>
      <div className="flex flex-col gap-1">
        {title ? <p className="text-base font-semibold">{title}</p> : null}
        <p>{children}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Créer `components/ui/stat.tsx`**

```tsx
interface StatProps {
  value: string;
  label: string;
  meta?: string;
  rule?: boolean;
}

export function Stat({ value, label, meta, rule = false }: StatProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 ${rule ? "border-l border-border-subtle pl-6 first:border-l-0 first:pl-0" : ""}`}
    >
      <span className="text-[clamp(2rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
        {value}
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
    </div>
  );
}
```

- [ ] **Step 3: Créer `components/ui/drawer.tsx`**

```tsx
"use client";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
}

export function Drawer({ open, onClose, children, widthClassName = "w-[min(560px,94vw)]" }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-80 flex justify-end bg-blue-900/62">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 cursor-default" />
      <aside
        className={`relative flex h-full flex-col border-l border-border-strong bg-surface-page ${widthClassName}`}
        style={{ animation: "mecDrawer 260ms cubic-bezier(.22,1,.36,1) both" }}
      >
        {children}
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Créer `components/ui/dialog.tsx`**

```tsx
"use client";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export function Dialog({ open, onClose, children, wide = false }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-blue-900/62 p-6">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        className={`relative flex w-full flex-col rounded-lg border border-border-strong bg-surface-page shadow-overlay ${wide ? "max-w-[min(760px,94vw)]" : "max-w-[min(520px,94vw)]"}`}
        style={{ animation: "mecRise 220ms cubic-bezier(.22,1,.36,1) both" }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur. Note : `z-80`/`z-90` nécessitent Tailwind v4 (échelle `z-*` arbitraire déjà
supportée nativement) — si le linter/typecheck ne dit rien, c'est bon signe, sinon remplacer par
`z-[80]`/`z-[90]`.

- [ ] **Step 6: Commit**

```bash
git add components/ui/alert.tsx components/ui/stat.tsx components/ui/drawer.tsx components/ui/dialog.tsx
git commit -m "feat(admin): primitives Alert, Stat, Drawer, Dialog"
```

---

### Task 6: Données mockées (`features/admin/data/*.ts`)

**Files:**
- Create: `features/admin/data/signalements.ts`
- Create: `features/admin/data/droits.ts`
- Create: `features/admin/data/utilisateurs.ts`
- Create: `features/admin/data/articles.ts`
- Create: `features/admin/data/ressources.ts`
- Create: `features/admin/data/campagnes.ts`
- Create: `features/admin/data/notifications-envoyees.ts`

**Interfaces:**
- Produces : `Signalement`, `SignalementStatut`, `SignalementUpdate`, `SIGNALEMENTS`,
  `CATEGORIES_SIGNALEMENT`, `RESPONSABLES` ; `DroitModule`, `DROITS` ; `Utilisateur`,
  `UTILISATEURS` ; `Article`, `ARTICLES` ; `Ressource`, `RESSOURCES` ; `Campagne`, `CAMPAGNES` ;
  `NotificationEnvoyee`, `NOTIFICATIONS_ENVOYEES`.

- [ ] **Step 1: Créer `features/admin/data/signalements.ts`**

```ts
export type SignalementStatut = "validation" | "encours" | "resolu" | "rejete";

export interface SignalementUpdate {
  date: string;
  auteur: string;
  texte: string;
}

export interface Signalement {
  id: string;
  sujet: string;
  categorie: string;
  lieu: string;
  recu: string;
  delai: string;
  auteur: string;
  statut: SignalementStatut;
  publie: boolean;
  responsable: string;
  contenu: string;
  updates: SignalementUpdate[];
}

export const SIGNALEMENTS: Signalement[] = [
  {
    id: "SIG-2026-0148",
    sujet: "Nid de poule dangereux sur le boulevard",
    categorie: "Voirie et routes",
    lieu: "Cocody, boulevard Latrille",
    recu: "21/08/2026",
    delai: "il y a 2 h",
    auteur: "Citoyen #1042",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu:
      "Trou d’environ un mètre de large sur la voie de droite, à hauteur de la pharmacie. Deux motos y sont tombées cette semaine selon le signalant.",
    updates: [],
  },
  {
    id: "SIG-2026-0147",
    sujet: "Lampadaires éteints depuis deux semaines",
    categorie: "Éclairage public",
    lieu: "Yopougon, quartier Niangon",
    recu: "21/08/2026",
    delai: "il y a 5 h",
    auteur: "Citoyen #0987",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu:
      "Toute la rue principale est dans le noir à partir de 19 h. Les commerçants ferment plus tôt.",
    updates: [],
  },
  {
    id: "SIG-2026-0146",
    sujet: "Dépôt d’ordures devant l’école primaire",
    categorie: "Insalubrité et déchets",
    lieu: "Bouaké, Air France",
    recu: "20/08/2026",
    delai: "hier",
    auteur: "Enseignant — club MEC",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu: "Dépôt sauvage installé sur le trottoir de l’entrée des élèves. Odeurs signalées par les parents.",
    updates: [],
  },
  {
    id: "SIG-2026-0145",
    sujet: "Canalisation bouchée, eau stagnante",
    categorie: "Eau et assainissement",
    lieu: "Daloa, Tazibouo",
    recu: "20/08/2026",
    delai: "hier",
    auteur: "Citoyen #0954",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu:
      "Eau stagnante depuis les pluies du 15/08, moustiques signalés par plusieurs familles du quartier.",
    updates: [],
  },
  {
    id: "SIG-2026-0144",
    sujet: "Passage piéton effacé devant le lycée",
    categorie: "Sécurité routière",
    lieu: "Abidjan, Marcory",
    recu: "19/08/2026",
    delai: "19/08",
    auteur: "Citoyen #0931",
    statut: "encours",
    publie: true,
    responsable: "Konan Yao",
    contenu: "Marquage au sol totalement effacé à la sortie des classes, sur une voie à double sens.",
    updates: [
      {
        date: "20/08/2026",
        auteur: "Konan Yao",
        texte: "Signalement transmis à la mairie de Marcory. Dossier enregistré sous la référence M-2026-311.",
      },
    ],
  },
  {
    id: "SIG-2026-0143",
    sujet: "Toit de salle de classe percé",
    categorie: "Infrastructure scolaire",
    lieu: "Yamoussoukro, Kokrenou",
    recu: "19/08/2026",
    delai: "19/08",
    auteur: "Encadreur — club scolaire",
    statut: "encours",
    publie: true,
    responsable: "Aminata Traoré",
    contenu: "Deux tôles arrachées au-dessus de la classe de 4e. La salle est inutilisable les jours de pluie.",
    updates: [
      {
        date: "20/08/2026",
        auteur: "Aminata Traoré",
        texte: "Visite effectuée avec le proviseur. Devis de réparation demandé à la direction régionale.",
      },
    ],
  },
  {
    id: "SIG-2026-0142",
    sujet: "Bouche d’égout ouverte sur le trottoir",
    categorie: "Voirie et routes",
    lieu: "Abidjan, Adjamé",
    recu: "18/08/2026",
    delai: "18/08",
    auteur: "Citoyen #0902",
    statut: "encours",
    publie: true,
    responsable: "Salif Ouattara",
    contenu: "Plaque manquante sur un trottoir très fréquenté, à côté d’un arrêt de gbaka.",
    updates: [
      { date: "18/08/2026", auteur: "Salif Ouattara", texte: "Zone balisée par les riverains, photo transmise au district d’Abidjan." },
      { date: "20/08/2026", auteur: "Salif Ouattara", texte: "Intervention annoncée pour la semaine du 25/08." },
    ],
  },
  {
    id: "SIG-2026-0141",
    sujet: "Fuite d’eau sur la conduite principale",
    categorie: "Eau et assainissement",
    lieu: "San-Pédro, Bardot",
    recu: "15/08/2026",
    delai: "15/08",
    auteur: "Citoyen #0888",
    statut: "resolu",
    publie: true,
    responsable: "Aminata Traoré",
    contenu: "Fuite continue depuis trois jours à l’angle de la rue du marché, chaussée inondée.",
    updates: [
      { date: "16/08/2026", auteur: "Aminata Traoré", texte: "Signalement transmis au service des eaux, référence SODECI 8842." },
      { date: "19/08/2026", auteur: "Aminata Traoré", texte: "Réparation effectuée le 19/08. Signalement clôturé après vérification sur place." },
    ],
  },
  {
    id: "SIG-2026-0140",
    sujet: "Nid de poule à l’entrée du marché",
    categorie: "Voirie et routes",
    lieu: "Cocody, Angré 7e tranche",
    recu: "12/08/2026",
    delai: "12/08",
    auteur: "Citoyen #0861",
    statut: "resolu",
    publie: true,
    responsable: "Konan Yao",
    contenu: "Affaissement de la chaussée gênant les livraisons du matin.",
    updates: [
      { date: "13/08/2026", auteur: "Konan Yao", texte: "Transmis à la mairie de Cocody avec les photos du signalant." },
      { date: "18/08/2026", auteur: "Konan Yao", texte: "Rebouchage réalisé le 17/08. Le citoyen a confirmé la réparation." },
    ],
  },
  {
    id: "SIG-2026-0139",
    sujet: "Affichage politique sur un mur d’école",
    categorie: "Autre",
    lieu: "Bouaké, Belleville",
    recu: "10/08/2026",
    delai: "10/08",
    auteur: "Citoyen #0844",
    statut: "rejete",
    publie: false,
    responsable: "Salif Ouattara",
    contenu: "Affiches collées sur le mur de l’école primaire publique.",
    updates: [
      {
        date: "11/08/2026",
        auteur: "Salif Ouattara",
        texte: "Hors périmètre du dispositif : signalement redirigé vers la commission électorale locale.",
      },
    ],
  },
];

export const CATEGORIES_SIGNALEMENT = [
  "Voirie et routes",
  "Éclairage public",
  "Insalubrité et déchets",
  "Eau et assainissement",
  "Sécurité routière",
  "Infrastructure scolaire",
  "Autre",
] as const;

export const RESPONSABLES = ["Aminata Traoré", "Konan Yao", "Salif Ouattara", "Mariam Bakayoko"] as const;
```

- [ ] **Step 2: Créer `features/admin/data/droits.ts`**

```ts
export interface DroitModule {
  module: string;
  administrateur: string;
  communication: string;
  moderation: string;
}

export const DROITS: DroitModule[] = [
  { module: "Actualités et blog", administrateur: "Plein accès", communication: "Plein accès", moderation: "Lecture seule" },
  { module: "Ressources pédagogiques", administrateur: "Plein accès", communication: "Plein accès", moderation: "Lecture seule" },
  { module: "Signalements de l’app", administrateur: "Plein accès", communication: "Aucun accès", moderation: "Plein accès" },
  { module: "Modération et suivi", administrateur: "Plein accès", communication: "Lecture seule", moderation: "Plein accès" },
  { module: "Campagnes et événements", administrateur: "Plein accès", communication: "Plein accès", moderation: "Lecture seule" },
  { module: "Notifications de l’app", administrateur: "Plein accès", communication: "Plein accès", moderation: "Aucun accès" },
  { module: "Statistiques et rapports", administrateur: "Plein accès", communication: "Lecture seule", moderation: "Lecture seule" },
  { module: "Utilisateurs et droits", administrateur: "Plein accès", communication: "Aucun accès", moderation: "Aucun accès" },
];
```

- [ ] **Step 3: Créer `features/admin/data/utilisateurs.ts`**

```ts
export interface Utilisateur {
  nom: string;
  email: string;
  role: string;
  derniereConnexion: string;
  etat: "Actif" | "Invitation";
}

export const UTILISATEURS: Utilisateur[] = [
  { nom: "Aminata Traoré", email: "a.traore@mec-ci.org", role: "Administratrice nationale", derniereConnexion: "Aujourd’hui, 07 h 40", etat: "Actif" },
  { nom: "Nadia Koffi", email: "n.koffi@mec-ci.org", role: "Chargée de communication", derniereConnexion: "Hier, 18 h 05", etat: "Actif" },
  { nom: "Konan Yao", email: "k.yao@mec-ci.org", role: "Modérateur — vérification", derniereConnexion: "Aujourd’hui, 08 h 12", etat: "Actif" },
  { nom: "Salif Ouattara", email: "s.ouattara@mec-ci.org", role: "Modérateur — vérification", derniereConnexion: "19/08, 09 h 05", etat: "Actif" },
  { nom: "Mariam Bakayoko", email: "m.bakayoko@mec-ci.org", role: "Coordination campus — lecture", derniereConnexion: "12/08, 16 h 22", etat: "Invitation" },
  { nom: "Yves N’Guessan", email: "y.nguessan@mec-ci.org", role: "Rédacteur", derniereConnexion: "—", etat: "Invitation" },
];
```

- [ ] **Step 4: Créer `features/admin/data/articles.ts`**

```ts
export interface Article {
  titre: string;
  statut: "Brouillon" | "En relecture" | "Programmé" | "Publié";
  tone: "orange" | "blue" | "neutral";
  auteur: string;
  date: string;
  vues: string;
}

export const ARTICLES: Article[] = [
  { titre: "Trois idées fausses sur le vote des étudiants", statut: "Publié", tone: "blue", auteur: "Aminata Traoré", date: "18/08/2026", vues: "1 240" },
  { titre: "Retour sur la caravane citoyenne de Bouaké", statut: "Brouillon", tone: "orange", auteur: "Nadia Koffi", date: "—", vues: "—" },
  { titre: "Ce que dit vraiment la loi sur l’état civil", statut: "En relecture", tone: "orange", auteur: "Yves N’Guessan", date: "—", vues: "—" },
  { titre: "Ouverture des candidatures ambassadeurs campus", statut: "Programmé", tone: "neutral", auteur: "Nadia Koffi", date: "25/08/2026", vues: "—" },
  { titre: "Bilan des clubs scolaires 2025-2026", statut: "Publié", tone: "blue", auteur: "Aminata Traoré", date: "02/08/2026", vues: "860" },
];
```

- [ ] **Step 5: Créer `features/admin/data/ressources.ts`**

```ts
export interface Ressource {
  titre: string;
  meta: string;
  telechargements: number | null;
  statut: "en-ligne" | "en-validation";
}

export const RESSOURCES: Ressource[] = [
  { titre: "Guide du jeune citoyen", meta: "PDF · 34 pages · mis en ligne le 12/06/2026", telechargements: 412, statut: "en-ligne" },
  { titre: "Fiche : reconnaître une fake news", meta: "PDF · 2 pages · mis en ligne le 03/07/2026", telechargements: 690, statut: "en-ligne" },
  { titre: "Kit d’animation club scolaire", meta: "ZIP · 6 fichiers · mis en ligne le 21/07/2026", telechargements: 118, statut: "en-ligne" },
  { titre: "Affiche — Signaler une information", meta: "PNG · A3 · mis en ligne le 30/07/2026", telechargements: 74, statut: "en-ligne" },
  { titre: "Module de formation — droits et devoirs", meta: "PDF · 18 pages · soumis par Konan Yao", telechargements: null, statut: "en-validation" },
];

export const TYPES_RESSOURCE = ["Fiche PDF", "Guide", "Affiche", "Kit d’animation"] as const;
```

- [ ] **Step 6: Créer `features/admin/data/campagnes.ts`**

```ts
export interface Campagne {
  titre: string;
  statut: "En cours" | "En préparation" | "Clôturée";
  tone: "orange" | "neutral" | "outline";
  periode: string;
  resume: string;
  progression: number;
  progressionCouleur: "orange" | "blue" | "neutre";
  note: string;
}

export const CAMPAGNES: Campagne[] = [
  {
    titre: "Caravane citoyenne — Bouaké",
    statut: "En cours",
    tone: "orange",
    periode: "Avril → septembre 2026",
    resume: "4 étapes réalisées sur 6 · 1 240 personnes rencontrées",
    progression: 66,
    progressionCouleur: "orange",
    note: "Prochaine étape : Sakassou, 29/08 · Responsable : Salif Ouattara",
  },
  {
    titre: "#VérifieAvantDePartager",
    statut: "En cours",
    tone: "orange",
    periode: "Août 2026, 3 semaines restantes",
    resume: "Campagne en ligne · 9 publications sur 14 diffusées",
    progression: 64,
    progressionCouleur: "orange",
    note: "Relais : 12 clubs scolaires · Responsable : Nadia Koffi",
  },
  {
    titre: "Clubs scolaires 2026-2027",
    statut: "En préparation",
    tone: "neutral",
    periode: "Rentrée, octobre 2026",
    resume: "12 lycées engagés · 5 conventions à signer",
    progression: 28,
    progressionCouleur: "blue",
    note: "Ouverture des inscriptions le 15/09 · Responsable : Mariam Bakayoko",
  },
  {
    titre: "Concours d’éloquence citoyenne",
    statut: "Clôturée",
    tone: "outline",
    periode: "Juin 2026",
    resume: "84 candidats · 6 finalistes · bilan à publier",
    progression: 100,
    progressionCouleur: "neutre",
    note: "Rapport bailleur attendu le 05/09 · Responsable : Aminata Traoré",
  },
];
```

- [ ] **Step 7: Créer `features/admin/data/notifications-envoyees.ts`**

```ts
export interface NotificationEnvoyee {
  titre: string;
  destinataires: string;
  date: string;
  recuePar: string;
  ouverture: string;
  ouvertureForte: boolean;
}

export const NOTIFICATIONS_ENVOYEES: NotificationEnvoyee[] = [
  { titre: "Passage piéton de Marcory : dossier transmis à la mairie", destinataires: "Tous les utilisateurs", date: "20/08/2026", recuePar: "2 140", ouverture: "38 %", ouvertureForte: true },
  { titre: "Caravane à Bouaké : rendez-vous samedi", destinataires: "Bénévoles vérifiés", date: "15/08/2026", recuePar: "2 090", ouverture: "44 %", ouvertureForte: true },
  { titre: "Guide du jeune citoyen disponible", destinataires: "Tous les utilisateurs", date: "06/08/2026", recuePar: "1 980", ouverture: "31 %", ouvertureForte: false },
];

export const CIBLES_NOTIFICATION = [
  "Tous les utilisateurs (2 340)",
  "Bénévoles vérifiés (214)",
  "Ambassadeurs campus (46)",
  "Utilisateurs d’Abidjan (1 380)",
] as const;

export const MOMENTS_ENVOI = ["Immédiat", "Demain 08 h 30", "Lundi 26/08, 07 h 00"] as const;
```

- [ ] **Step 8: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 9: Commit**

```bash
git add features/admin/data
git commit -m "feat(admin): donnees mockees du dashboard"
```

---

### Task 7: `buildQueue()` — fonction pure + test vitest

**Files:**
- Create: `features/admin/lib/build-queue.ts`
- Test: `features/admin/lib/build-queue.test.ts`

**Interfaces:**
- Consumes: `SIGNALEMENTS` (Task 6, `features/admin/data/signalements.ts`).
- Produces: `QueueItem` (type), `buildQueue({ canSig, canEdito, canUsers }): QueueItem[]` — consommé
  par Task 11 (File de travail) et Task 12 (`AdminSidebar`, pour le badge de compteur).

- [ ] **Step 1: Écrire le test qui échoue**

Créer `features/admin/lib/build-queue.test.ts` :

```ts
import { describe, expect, it } from "vitest";
import { buildQueue } from "./build-queue";

describe("buildQueue", () => {
  it("inclut les signalements en validation quand canSig est vrai", () => {
    const items = buildQueue({ canSig: true, canEdito: false, canUsers: false });
    expect(items.filter((i) => i.kind === "Signalement")).toHaveLength(4);
    expect(items.every((i) => i.kind === "Signalement")).toBe(true);
  });

  it("exclut les signalements quand canSig est faux", () => {
    const items = buildQueue({ canSig: false, canEdito: true, canUsers: false });
    expect(items.some((i) => i.kind === "Signalement")).toBe(false);
  });

  it("ajoute les items éditoriaux uniquement si canEdito", () => {
    const withEdito = buildQueue({ canSig: false, canEdito: true, canUsers: false });
    const withoutEdito = buildQueue({ canSig: false, canEdito: false, canUsers: false });
    expect(withEdito.some((i) => i.kind === "Article")).toBe(true);
    expect(withoutEdito.some((i) => i.kind === "Article")).toBe(false);
  });

  it("ajoute l'item accès uniquement si canUsers", () => {
    const items = buildQueue({ canSig: false, canEdito: false, canUsers: true });
    expect(items.some((i) => i.kind === "Accès")).toBe(true);
  });

  it("retourne un tableau vide sans aucune permission", () => {
    expect(buildQueue({ canSig: false, canEdito: false, canUsers: false })).toEqual([]);
  });
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `rtk pnpm run test -- build-queue`
Expected: FAIL — `Cannot find module './build-queue'`.

- [ ] **Step 3: Implémenter `features/admin/lib/build-queue.ts`**

```ts
import { SIGNALEMENTS } from "@/features/admin/data/signalements";

export type QueueTone = "orange" | "blue" | "neutral" | "outline";

export interface QueueItem {
  id: string;
  kind: "Signalement" | "Article" | "Ressource" | "Notification" | "Accès";
  tone: QueueTone;
  titre: string;
  meta: string;
  action: string;
  href: string;
}

interface QueuePermissions {
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
}

export function buildQueue({ canSig, canEdito, canUsers }: QueuePermissions): QueueItem[] {
  const items: QueueItem[] = [];

  if (canSig) {
    for (const s of SIGNALEMENTS) {
      if (s.statut !== "validation") continue;
      items.push({
        id: s.id,
        kind: "Signalement",
        tone: "orange",
        titre: s.sujet,
        meta: `${s.id} · ${s.categorie} · ${s.lieu} · ${s.delai}`,
        action: "Modérer",
        href: `/admin/signalements?open=${s.id}`,
      });
    }
  }

  if (canEdito) {
    items.push(
      {
        id: "art-bouake",
        kind: "Article",
        tone: "blue",
        titre: "Retour sur la caravane citoyenne de Bouaké",
        meta: "Brouillon de Nadia Koffi · en attente depuis 3 jours",
        action: "Relire",
        href: "/admin/actualites",
      },
      {
        id: "art-etatcivil",
        kind: "Article",
        tone: "blue",
        titre: "Ce que dit vraiment la loi sur l’état civil",
        meta: "En relecture · Yves N’Guessan · reçu le 18/08",
        action: "Relire",
        href: "/admin/actualites",
      },
      {
        id: "res-formation",
        kind: "Ressource",
        tone: "neutral",
        titre: "Module de formation — droits et devoirs",
        meta: "Soumis par Konan Yao · PDF, 18 pages",
        action: "Valider",
        href: "/admin/ressources",
      },
      {
        id: "push-angre",
        kind: "Notification",
        tone: "neutral",
        titre: "Annoncer la réparation du nid de poule d’Angré",
        meta: "2 340 installations · dernier envoi le 15/08",
        action: "Rédiger",
        href: "/admin/push",
      },
    );
  }

  if (canUsers) {
    items.push({
      id: "inv-campus",
      kind: "Accès",
      tone: "outline",
      titre: "2 invitations en attente de réponse",
      meta: "Coordination campus · envoyées le 14/08",
      action: "Voir",
      href: "/admin/utilisateurs",
    });
  }

  return items;
}
```

- [ ] **Step 4: Lancer le test et vérifier qu'il passe**

Run: `rtk pnpm run test -- build-queue`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add features/admin/lib/build-queue.ts features/admin/lib/build-queue.test.ts
git commit -m "feat(admin): buildQueue avec couverture de test"
```

---

### Task 8: Contexte de rôle (`admin-shell-context.tsx`)

**Files:**
- Create: `components/features/admin/admin-shell-context.tsx`

**Interfaces:**
- Produces: `AdminRole` (type), `AdminShellProvider({ children })`, `useAdminShell(): { role,
  setRole, canSig, canEdito, canUsers }` — consommé par Task 9 (sidebar/header) et Task 10 (layout).

- [ ] **Step 1: Créer `components/features/admin/admin-shell-context.tsx`**

```tsx
"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AdminRole = "Administrateur national" | "Chargée de communication" | "Modérateur";

export const ADMIN_ROLES: AdminRole[] = ["Administrateur national", "Chargée de communication", "Modérateur"];

interface AdminShellState {
  role: AdminRole;
  setRole: (role: AdminRole) => void;
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
}

const AdminShellContext = createContext<AdminShellState | null>(null);

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>("Administrateur national");

  const value = useMemo<AdminShellState>(
    () => ({
      role,
      setRole,
      canSig: role !== "Chargée de communication",
      canEdito: role !== "Modérateur",
      canUsers: role === "Administrateur national",
    }),
    [role],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error("useAdminShell must be used within AdminShellProvider");
  return ctx;
}
```

- [ ] **Step 2: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/features/admin/admin-shell-context.tsx
git commit -m "feat(admin): contexte de role du shell admin"
```

---

### Task 9: `AdminSidebar` et `AdminHeader`

**Files:**
- Create: `components/features/admin/admin-sidebar.tsx`
- Create: `components/features/admin/admin-header.tsx`

**Interfaces:**
- Consumes: `useAdminShell` (Task 8), `buildQueue` (Task 7), `SIGNALEMENTS` (Task 6), `Select`
  (Task 4), `IconButton` (Task 2).
- Produces: `AdminSidebar()`, `AdminHeader()` — consommés par Task 10 (`app/admin/layout.tsx`).

- [ ] **Step 1: Créer `components/features/admin/admin-sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Flag, Newspaper, BookOpen, Megaphone, Smartphone, Landmark, Users, ExternalLink, LogOut, type LucideIcon } from "lucide-react";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { buildQueue } from "@/features/admin/lib/build-queue";
import { SIGNALEMENTS } from "@/features/admin/data/signalements";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requires: "canSig" | "canEdito" | "canUsers" | null;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "File de travail", icon: Inbox, requires: null },
  { href: "/admin/signalements", label: "Signalements", icon: Flag, requires: "canSig" },
  { href: "/admin/actualites", label: "Actualités et blog", icon: Newspaper, requires: "canEdito" },
  { href: "/admin/ressources", label: "Ressources", icon: BookOpen, requires: "canEdito" },
  { href: "/admin/campagnes", label: "Campagnes", icon: Megaphone, requires: "canEdito" },
  { href: "/admin/push", label: "Notifications app", icon: Smartphone, requires: "canEdito" },
  { href: "/admin/statistiques", label: "Statistiques", icon: Landmark, requires: null },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, requires: "canUsers" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const shell = useAdminShell();
  const queue = buildQueue(shell);
  const cntOuverts = SIGNALEMENTS.filter((s) => s.statut === "validation" || s.statut === "encours").length;

  const visibleItems = NAV_ITEMS.filter((item) => item.requires === null || shell[item.requires]);

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col self-start bg-blue-800 px-3.5 pt-5.5 pb-4 text-white">
      <Link href="/" className="mb-1.5 flex items-center gap-2.5 px-0.5">
        <img src="/assets/logo/mec-reversed.png" alt="MEC" className="h-8.5 w-auto flex-none" />
      </Link>
      <span className="mb-5.5 px-0.5 text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-400 uppercase">
        Administration
      </span>

      <nav className="flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          const badge = item.href === "/admin" ? queue.length : item.href === "/admin/signalements" ? cntOuverts : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/11 text-white before:absolute before:top-1.5 before:bottom-1.5 before:-left-3.5 before:w-[3px] before:content-[''] before:bg-orange-500"
                  : "text-white/74 hover:bg-white/7 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {badge !== null && badge > 0 ? (
                <span
                  className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-bold ${
                    item.href === "/admin" ? "bg-orange-500 text-white" : "bg-white/14 text-white"
                  }`}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link href="/" className="flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-white/60 hover:bg-white/7 hover:text-white">
          <ExternalLink size={18} />
          <span>Voir le site public</span>
        </Link>
        <div className="flex items-center gap-2.5 border-t border-white/14 px-2.5 py-3">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-orange-500 text-xs font-bold text-white">
            AT
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[0.8125rem] font-semibold text-white">Aminata Traoré</span>
            <span className="overflow-hidden text-[0.6875rem] text-ellipsis whitespace-nowrap text-white/55">{shell.role}</span>
          </span>
          <Link
            href="/admin/connexion"
            title="Se déconnecter"
            className="ml-auto flex h-7.5 w-7.5 flex-none items-center justify-center rounded-md text-white/55 hover:bg-white/9 hover:text-white"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Créer `components/features/admin/admin-header.tsx`**

```tsx
"use client";

import { Search, Bell } from "lucide-react";
import { useAdminShell, ADMIN_ROLES } from "@/components/features/admin/admin-shell-context";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconButton } from "@/components/ui/icon-button";

export function AdminHeader() {
  const { role, setRole } = useAdminShell();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border-subtle bg-[#faf8f5]/90 px-5 backdrop-blur-md md:px-8">
      <div className="w-[min(320px,34vw)]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-n-400" />
          <Input type="search" placeholder="Rechercher un signalement, un article…" className="pl-9" />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="w-[210px]">
          <Select aria-label="Rôle de démonstration" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            {ADMIN_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <IconButton icon={Bell} label="Notifications" variant="ghost" />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Vérifier**

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add components/features/admin/admin-sidebar.tsx components/features/admin/admin-header.tsx
git commit -m "feat(admin): sidebar et header du shell admin"
```

---

### Task 10: `app/admin/layout.tsx`

**Files:**
- Create: `app/admin/layout.tsx`

**Interfaces:**
- Consumes: `AdminShellProvider` (Task 8), `AdminSidebar`, `AdminHeader` (Task 9).

- [ ] **Step 1: Créer `app/admin/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { AdminShellProvider } from "@/components/features/admin/admin-shell-context";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { AdminHeader } from "@/components/features/admin/admin-header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShellProvider>
      <div className="flex min-h-screen bg-surface-page text-[#2b3646]">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 px-5 py-6 pb-16 md:px-8 md:py-8.5">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
```

- [ ] **Step 2: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin` dans le navigateur. À ce stade la page se contente du contenu
par défaut de `app/admin/page.tsx` s'il n'existe pas encore (404 attendu, normal — ce fichier arrive
en Task 11). Vérifier au minimum que la sidebar bleu foncé et le header s'affichent sans erreur
console sur n'importe quelle sous-route déjà créée.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat(admin): layout partage sidebar + header"
```

---

### Task 11: Écran File de travail (`app/admin/page.tsx`)

**Files:**
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `useAdminShell` (Task 8), `buildQueue` (Task 7), `Button` (Task 2), `Tag` (Task 3).

- [ ] **Step 1: Créer `app/admin/page.tsx`**

```tsx
"use client";

import Link from "next/link";
import { PenLine, Send } from "lucide-react";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { buildQueue } from "@/features/admin/lib/build-queue";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";

const ACTIVITE = [
  { texte: "a marqué résolu le nid de poule d’Angré (SIG-2026-0140)", auteur: "Konan Yao", quand: "Hier, 17 h 12" },
  { texte: "a programmé « Ouverture des candidatures ambassadeurs »", auteur: "Nadia Koffi", quand: "Hier, 14 h 40" },
  { texte: "a ajouté 3 étapes à la caravane de Bouaké", auteur: "Salif Ouattara", quand: "19/08, 09 h 05" },
  { texte: "a invité 2 coordinateurs campus", auteur: "Aminata Traoré", quand: "14/08, 11 h 30" },
];

export default function FileDeTravailPage() {
  const shell = useAdminShell();
  const queue = buildQueue(shell);

  return (
    <div className="flex max-w-[1320px] flex-col gap-6.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Tableau de bord</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Ce qui attend une action
          </h1>
          <p className="max-w-[62ch] text-[0.9375rem] text-muted-foreground">
            {queue.length} éléments en attente · site public et application de signalement
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/admin/actualites"
            className="inline-flex h-10 items-center justify-center gap-2.5 rounded-sm border border-ink/24 px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink hover:bg-n-100"
          >
            <PenLine size={16} />
            Nouvel article
          </Link>
          <Link
            href="/admin/push"
            className="inline-flex h-10 items-center justify-center gap-2.5 rounded-sm bg-orange-500 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <Send size={16} />
            Envoyer une notification
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {shell.canSig ? (
          <Link
            href="/admin/signalements"
            className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-[#2b3646] transition-all hover:-translate-y-0.5 hover:border-orange-500"
          >
            <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
              {queue.filter((q) => q.kind === "Signalement").length}
            </span>
            <span className="text-sm font-semibold text-ink">signalements à modérer</span>
            <span className="text-xs text-muted-foreground">En validation dans l’app</span>
          </Link>
        ) : null}
        {shell.canEdito ? (
          <>
            <Link
              href="/admin/actualites"
              className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-[#2b3646] transition-all hover:-translate-y-0.5 hover:border-orange-500"
            >
              <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">2</span>
              <span className="text-sm font-semibold text-ink">brouillons à relire</span>
              <span className="text-xs text-muted-foreground">Actualités et blog</span>
            </Link>
            <Link
              href="/admin/ressources"
              className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-[#2b3646] transition-all hover:-translate-y-0.5 hover:border-orange-500"
            >
              <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">1</span>
              <span className="text-sm font-semibold text-ink">ressource à valider</span>
              <span className="text-xs text-muted-foreground">Soumise par un encadreur</span>
            </Link>
          </>
        ) : null}
        {shell.canUsers ? (
          <Link
            href="/admin/utilisateurs"
            className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-[#2b3646] transition-all hover:-translate-y-0.5 hover:border-orange-500"
          >
            <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">2</span>
            <span className="text-sm font-semibold text-ink">invitations en attente</span>
            <span className="text-xs text-muted-foreground">Coordination campus</span>
          </Link>
        ) : null}
      </div>

      <div className="grid items-start gap-5.5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
          <div className="flex items-center justify-between gap-3.5 border-b border-border-subtle px-4.5 py-3.5">
            <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">À traiter</span>
            <span className="text-xs text-muted-foreground">Trié par ancienneté</span>
          </div>
          {queue.length === 0 ? (
            <p className="px-4.5 py-6 text-sm text-muted-foreground">Rien en attente pour ce rôle.</p>
          ) : (
            queue.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-border-subtle px-4.5 py-3.5 last:border-b-0">
                <span className="w-26 flex-none">
                  <Tag tone={item.tone}>{item.kind}</Tag>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[0.9375rem] leading-tight font-semibold text-ink">{item.titre}</span>
                  <span className="text-xs text-muted-foreground">{item.meta}</span>
                </span>
                <Link
                  href={item.href}
                  className="inline-flex h-8 flex-none items-center justify-center rounded-sm border border-ink/24 px-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-n-100"
                >
                  {item.action}
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-4.5">
          <div className="rounded-lg bg-blue-800 p-5 text-white">
            <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-400 uppercase">
              Application de signalement
            </span>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <span className="flex flex-col gap-0.5">
                <span className="text-2xl font-semibold tracking-[-0.03em]">2 340</span>
                <span className="text-xs text-white/60">installations</span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-2xl font-semibold tracking-[-0.03em]">1 180</span>
                <span className="text-xs text-white/60">actifs sur 30 jours</span>
              </span>
            </div>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-white/72">
              Dernière notification le 15/08 · 44 % d’ouverture
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-card p-4.5">
            <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
              Activité de l’équipe
            </span>
            <div className="mt-4 flex flex-col gap-3.5">
              {ACTIVITE.map((a, i) => (
                <span key={i} className="flex flex-col gap-0.5">
                  <span className="text-[0.8125rem] leading-snug text-[#2b3646]">
                    <strong className="text-ink">{a.auteur}</strong> {a.texte}
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground">{a.quand}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Note : les actions d'en-tête sont des `<Link>` stylés directement (mêmes classes que les variants de
`Button`), pas des `<Button>` — `Button` (Task 2) reste un vrai `<button>` sans polymorphisme
`asChild`, ce qui suffit pour tous les autres écrans (YAGNI).

- [ ] **Step 2: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin`. Vérifier : les 4 tuiles KPI (ou moins selon le rôle par défaut
Administrateur national → les 4 s'affichent), la liste "À traiter" avec ses boutons d'action, la
carte bleu foncé "Application de signalement", le flux d'activité. Changer le rôle dans le header
(Chargée de communication / Modérateur) et vérifier que les tuiles et la liste se filtrent.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): ecran File de travail"
```

---

### Task 12: Écran Signalements + tiroir de détail

**Files:**
- Create: `app/admin/signalements/page.tsx`
- Create: `components/features/admin/signalement-drawer.tsx`

**Interfaces:**
- Consumes: `SIGNALEMENTS`, `CATEGORIES_SIGNALEMENT`, `RESPONSABLES`, `Signalement`,
  `SignalementStatut` (Task 6), `Tag`, `Select`, `Button`, `Field`, `Textarea`, `Drawer`,
  `IconButton` (Tasks 2-5).

- [ ] **Step 1: Créer `components/features/admin/signalement-drawer.tsx`**

```tsx
"use client";

import { useState } from "react";
import { X, Send, Check } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RESPONSABLES, type Signalement, type SignalementStatut } from "@/features/admin/data/signalements";

const STATUT_META: Record<SignalementStatut, { label: string; tone: "orange" | "blue" | "neutral" | "outline" }> = {
  validation: { label: "En validation", tone: "orange" },
  encours: { label: "En cours", tone: "blue" },
  resolu: { label: "Résolu", tone: "neutral" },
  rejete: { label: "Rejeté", tone: "outline" },
};

const ETAPES: { statut: SignalementStatut; label: string }[] = [
  { statut: "validation", label: "En validation" },
  { statut: "encours", label: "En cours" },
  { statut: "resolu", label: "Résolu" },
];

function updatesLabel(count: number): string {
  if (count === 0) return "aucune mise à jour";
  if (count === 1) return "1 mise à jour";
  return `${count} mises à jour`;
}

interface SignalementDrawerProps {
  signalement: Signalement | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<Signalement>) => void;
}

export function SignalementDrawer({ signalement, onClose, onChange }: SignalementDrawerProps) {
  const [maj, setMaj] = useState("");

  if (!signalement) return null;

  const order: SignalementStatut[] = ["validation", "encours", "resolu"];
  const currentIndex = order.indexOf(signalement.statut);

  const addUpdate = () => {
    if (!maj.trim()) return;
    onChange(signalement.id, {
      updates: [
        ...signalement.updates,
        { date: new Date().toLocaleDateString("fr-FR"), auteur: "Vous", texte: maj.trim() },
      ],
    });
    setMaj("");
  };

  return (
    <Drawer open={Boolean(signalement)} onClose={onClose}>
      <div className="flex items-center justify-between gap-3.5 border-b border-border-subtle bg-surface-card px-5.5 py-4.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Signalement citoyen
          </span>
          <span className="flex items-center gap-2.5">
            <span className="text-base font-semibold text-ink tabular-nums">{signalement.id}</span>
            <Tag tone={STATUT_META[signalement.statut].tone}>{STATUT_META[signalement.statut].label}</Tag>
          </span>
        </span>
        <IconButton icon={X} label="Fermer" onClick={onClose} />
      </div>

      <div className="flex flex-1 flex-col gap-5.5 overflow-auto p-5.5">
        <div className="grid grid-cols-3 gap-2">
          {ETAPES.map((etape, i) => (
            <span key={etape.statut} className="flex flex-col gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full border-2 ${
                  i < currentIndex ? "border-verdict-true bg-verdict-true" : i === currentIndex ? "border-orange-500 bg-orange-500" : "border-n-300 bg-transparent"
                }`}
              />
              <span className={`text-xs ${i === currentIndex ? "font-semibold text-ink" : "text-muted-foreground"}`}>
                {etape.label}
              </span>
            </span>
          ))}
        </div>

        <h2 className="text-[1.375rem] leading-tight font-semibold tracking-[-0.026em] text-ink">
          {signalement.sujet}
        </h2>

        <div className="grid grid-cols-2 gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4 text-[0.8125rem]">
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-semibold text-ink">{signalement.categorie}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Reçu le</span>
            <span className="font-semibold text-ink">{signalement.recu}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Localisation</span>
            <span className="font-semibold text-ink">{signalement.lieu}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Signalé par</span>
            <span className="font-semibold text-ink">{signalement.auteur}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Visible dans l’app</span>
            <span className="font-semibold text-ink">{signalement.publie ? "Publié" : "Masqué"}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Responsable</span>
            <span className="font-semibold text-ink">{signalement.responsable || "—"}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Description du citoyen
          </span>
          <p className="text-[0.9375rem] leading-relaxed text-[#2b3646]">{signalement.contenu}</p>
        </div>

        <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">Modération</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange(signalement.id, { publie: true })}
              className={`h-9.5 rounded-md border text-sm font-semibold text-blue-700 ${signalement.publie ? "border-ink bg-white shadow-[5px_5px_0_var(--color-blue-500)]" : "border-border-strong bg-white"}`}
            >
              Afficher dans l’app
            </button>
            <button
              type="button"
              onClick={() => onChange(signalement.id, { publie: false })}
              className={`h-9.5 rounded-md border text-sm font-semibold text-[#2b3646] ${!signalement.publie ? "border-ink bg-white shadow-[5px_5px_0_var(--color-blue-500)]" : "border-border-strong bg-white"}`}
            >
              Masquer
            </button>
          </div>
          <span className="text-xs leading-relaxed text-muted-foreground">
            Un signalement masqué reste traité en interne, mais n’apparaît pas dans la carte publique de l’app.
          </span>
          <span className="h-px bg-border-subtle" />
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Statut du traitement
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ETAPES.map((etape) => (
              <button
                key={etape.statut}
                type="button"
                onClick={() => onChange(signalement.id, { statut: etape.statut })}
                className={`h-9.5 rounded-md border text-[0.8125rem] font-semibold text-ink ${signalement.statut === etape.statut ? "border-ink bg-white shadow-[5px_5px_0_var(--color-blue-500)]" : "border-border-strong bg-white"}`}
              >
                {etape.label}
              </button>
            ))}
          </div>
          <Field label="Responsable du suivi">
            <Select
              value={signalement.responsable}
              onChange={(e) => onChange(signalement.id, { responsable: e.target.value })}
            >
              <option value="">Choisir un responsable</option>
              {RESPONSABLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            {updatesLabel(signalement.updates.length)}
          </span>
          {signalement.updates.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {signalement.updates.map((u, i) => (
                <span key={i} className="flex flex-col gap-0.5 border-l-2 border-orange-500 pl-3.5">
                  <span className="text-[0.6875rem] text-muted-foreground">
                    {u.date} · {u.auteur}
                  </span>
                  <span className="text-sm leading-relaxed text-[#2b3646]">{u.texte}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[0.8125rem] text-muted-foreground">
              Aucune mise à jour. Le citoyen ne voit encore que son signalement.
            </span>
          )}
          <Field label="Ajouter une mise à jour" hint="Visible par le citoyen dans l’app, avec la date et votre nom">
            <Textarea
              rows={3}
              value={maj}
              onChange={(e) => setMaj(e.target.value)}
              placeholder="Ex. Signalement transmis à la mairie de Cocody, intervention annoncée pour le 28/08."
            />
          </Field>
          <span>
            <Button variant="deep" size="sm" icon={Send} disabled={!maj.trim()} onClick={addUpdate}>
              Publier la mise à jour
            </Button>
          </span>
        </div>
      </div>

      <div className="flex flex-none flex-wrap items-center gap-2.5 border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" icon={Check} onClick={onClose}>
          Enregistrer et fermer
        </Button>
        <Button variant="ghost" onClick={() => onChange(signalement.id, { statut: "rejete" })}>
          Rejeter le signalement
        </Button>
        <span className="flex-[1_0_100%] text-xs text-muted-foreground">
          Les mises à jour et le statut sont visibles par le citoyen dans l’app.
        </span>
      </div>
    </Drawer>
  );
}
```

- [ ] **Step 2: Créer `app/admin/signalements/page.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Select } from "@/components/ui/select";
import { SignalementDrawer } from "@/components/features/admin/signalement-drawer";
import { SIGNALEMENTS, CATEGORIES_SIGNALEMENT, type Signalement, type SignalementStatut } from "@/features/admin/data/signalements";

const STATUT_META: Record<SignalementStatut, { label: string; tone: "orange" | "blue" | "neutral" | "outline" }> = {
  validation: { label: "En validation", tone: "orange" },
  encours: { label: "En cours", tone: "blue" },
  resolu: { label: "Résolu", tone: "neutral" },
  rejete: { label: "Rejeté", tone: "outline" },
};

type Filtre = "tous" | SignalementStatut;

export default function SignalementsPage() {
  const searchParams = useSearchParams();
  const [signalements, setSignalements] = useState<Signalement[]>(SIGNALEMENTS);
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [categorie, setCategorie] = useState("Toutes les catégories");
  const [openId, setOpenId] = useState<string | null>(searchParams.get("open"));

  const openSignalement = signalements.find((s) => s.id === openId) ?? null;

  const count = (statut: SignalementStatut) => signalements.filter((s) => s.statut === statut).length;

  const rows = useMemo(
    () =>
      signalements.filter(
        (s) => (filtre === "tous" || s.statut === filtre) && (categorie === "Toutes les catégories" || s.categorie === categorie),
      ),
    [signalements, filtre, categorie],
  );

  const patch = (id: string, p: Partial<Signalement>) => {
    setSignalements((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
  };

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Application mobile</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">Signalements</h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            En validation → En cours → Résolu · vous décidez de ce qui est visible dans l’app · 34 signalements
            clôturés les mois précédents
          </p>
        </div>
        <Button variant="secondary" icon={Download}>
          Exporter le mois
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Tag tone="outline" size="md" active={filtre === "tous"} onClick={() => setFiltre("tous")}>
          Tous
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "validation"} onClick={() => setFiltre("validation")}>
          En validation · {count("validation")}
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "encours"} onClick={() => setFiltre("encours")}>
          En cours · {count("encours")}
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "resolu"} onClick={() => setFiltre("resolu")}>
          Résolu · {count("resolu")}
        </Tag>
        <Tag tone="outline" size="md" active={filtre === "rejete"} onClick={() => setFiltre("rejete")}>
          Rejeté · {count("rejete")}
        </Tag>
        <span className="ml-auto w-57.5">
          <Select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            <option>Toutes les catégories</option>
            {CATEGORIES_SIGNALEMENT.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[116px_minmax(200px,1fr)_158px_84px_124px_112px_96px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>N° de suivi</span>
            <span>Signalement</span>
            <span>Catégorie</span>
            <span>Reçu</span>
            <span>Responsable</span>
            <span>Statut</span>
            <span>App</span>
          </div>
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="grid w-full grid-cols-[116px_minmax(200px,1fr)_158px_84px_124px_112px_96px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-left text-sm last:border-b-0 hover:bg-n-50"
            >
              <span className="text-[0.8125rem] font-semibold text-muted-foreground tabular-nums">{r.id}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-ink">{r.sujet}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {r.lieu} · {r.updates.length === 0 ? "aucune mise à jour" : r.updates.length === 1 ? "1 mise à jour" : `${r.updates.length} mises à jour`}
                </span>
              </span>
              <span className="truncate text-[0.8125rem] text-muted-foreground">{r.categorie}</span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">{r.recu.slice(0, 5)}</span>
              <span className="text-[0.8125rem] text-[#2b3646]">{r.responsable || "—"}</span>
              <span>
                <Tag tone={STATUT_META[r.statut].tone}>{STATUT_META[r.statut].label}</Tag>
              </span>
              <span>
                <Tag tone={r.publie ? "blue" : "neutral"} icon={r.publie ? Eye : EyeOff}>
                  {r.publie ? "Publié" : "Masqué"}
                </Tag>
              </span>
            </button>
          ))}
        </div>
      </div>

      <SignalementDrawer signalement={openSignalement} onClose={() => setOpenId(null)} onChange={patch} />
    </div>
  );
}
```

- [ ] **Step 3: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/signalements`. Vérifier : filtres par statut (compteurs
corrects), filtre catégorie, clic sur une ligne ouvre le tiroir, boutons Afficher/Masquer et statut
mettent à jour l'aperçu, ajout d'une mise à jour l'affiche dans la liste. Naviguer depuis
`/admin?` via un item "Signalement" de la file de travail et vérifier que `?open=SIG-...` ouvre
directement le bon tiroir.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add app/admin/signalements/page.tsx components/features/admin/signalement-drawer.tsx
git commit -m "feat(admin): ecran Signalements avec tiroir de detail"
```

---

### Task 13: Écran Actualités et blog + éditeur plein écran

**Files:**
- Create: `app/admin/actualites/page.tsx`
- Create: `components/features/admin/article-editor.tsx`
- Create: `components/features/admin/publish-popover.tsx`

**Interfaces:**
- Consumes: `ARTICLES` (Task 6), `Button`, `Tag`, `IconButton`, `Field`, `Select` (Tasks 2-5).
- Produces: `ArticleEditor({ onClose })`, `PublishPopover({ onClose, onPublish, disabled })`.

- [ ] **Step 1: Créer `components/features/admin/publish-popover.tsx`**

```tsx
"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

const RUBRIQUES = ["Terrain", "Éducation civique", "Vie du mouvement", "Communiqué"];
const MOMENTS_PUBLICATION = ["Publier maintenant", "Demain 08 h 00", "Vendredi 08 h 00"];

interface PublishPopoverProps {
  onClose: () => void;
  onPublish: () => void;
  disabled: boolean;
}

export function PublishPopover({ onClose, onPublish, disabled }: PublishPopoverProps) {
  return (
    <div className="absolute inset-0 z-10">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-blue-900/28" />
      <div className="absolute top-18.5 right-4 flex w-[min(360px,92vw)] flex-col gap-4 rounded-[10px] border border-border-strong bg-surface-card p-5 shadow-overlay md:right-8">
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
          Publication
        </span>
        <Field label="Rubrique">
          <Select defaultValue={RUBRIQUES[0]}>
            {RUBRIQUES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mise en ligne">
          <Select defaultValue={MOMENTS_PUBLICATION[0]}>
            {MOMENTS_PUBLICATION.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-md border border-border-strong bg-white px-3 py-2.5 text-left text-[0.8125rem] font-semibold text-ink"
        >
          <Bell size={18} />
          <span>Notifier les 2 340 utilisateurs de l’app</span>
        </button>
        <Button variant="primary" full disabled={disabled} onClick={onPublish}>
          Publier l’article
        </Button>
        <span className="text-xs leading-relaxed text-muted-foreground">
          L’article part sur la page Actualités du site. Vous pourrez le dépublier à tout moment.
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Créer `components/features/admin/article-editor.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { PublishPopover } from "@/components/features/admin/publish-popover";

interface ArticleEditorProps {
  onClose: () => void;
  onPublished: () => void;
}

export function ArticleEditor({ onClose, onPublished }: ArticleEditorProps) {
  const [titre, setTitre] = useState("");
  const [chapo, setChapo] = useState("");
  const [corps, setCorps] = useState("");
  const [showPublish, setShowPublish] = useState(false);

  const motCount = corps.trim() ? corps.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-95 flex flex-col bg-surface-page">
      <div className="flex h-16 flex-none items-center gap-3.5 border-b border-border-subtle bg-[#faf8f5]/94 px-4 backdrop-blur-md md:px-8">
        <IconButton icon={ArrowLeft} label="Retour aux actualités" onClick={onClose} />
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="text-[0.8125rem] font-semibold whitespace-nowrap text-ink">Rédaction</span>
          <span className="text-xs whitespace-nowrap text-muted-foreground">· Brouillon enregistré automatiquement</span>
        </span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">{motCount} mots</span>
          <Button variant="ghost" size="sm">
            Aperçu
          </Button>
          <Button variant="primary" size="sm" disabled={!titre.trim()} onClick={() => setShowPublish(true)}>
            Publier
          </Button>
        </span>
      </div>

      <div className="relative flex-1 overflow-auto px-6 py-14 pb-30">
        <div className="mx-auto flex max-w-180 flex-col gap-3.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-700 uppercase">Terrain</span>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre"
            aria-label="Titre de l’article"
            className="border-0 bg-transparent p-0 font-sans text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.032em] text-ink outline-none placeholder:text-n-300"
          />
          <input
            value={chapo}
            onChange={(e) => setChapo(e.target.value)}
            placeholder="Chapô — une à deux phrases, 30 mots maximum"
            aria-label="Chapô"
            className="border-0 bg-transparent p-0 font-serif text-[clamp(1.125rem,2vw,1.5rem)] leading-snug text-muted-foreground italic outline-none placeholder:text-n-300"
          />
          <textarea
            value={corps}
            onChange={(e) => setCorps(e.target.value)}
            placeholder="Racontez ce que le MEC a fait : des faits, des dates, des chiffres situés. Trois phrases par paragraphe au maximum."
            aria-label="Corps de l’article"
            className="min-h-[44vh] resize-none border-0 bg-transparent p-0 font-sans text-lg leading-relaxed text-[#2b3646] outline-none placeholder:text-n-300"
          />
        </div>

        {showPublish ? (
          <PublishPopover
            onClose={() => setShowPublish(false)}
            disabled={!titre.trim()}
            onPublish={() => {
              setShowPublish(false);
              onPublished();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Créer `app/admin/actualites/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { ArticleEditor } from "@/components/features/admin/article-editor";
import { ARTICLES } from "@/features/admin/data/articles";

export default function ActualitesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [publiedFlash, setPubliedFlash] = useState(false);

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Site public</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Actualités et blog
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            Brouillon → En relecture → Programmé → Publié · rédaction par l’équipe communication
          </p>
        </div>
        <Button variant="primary" icon={PenLine} onClick={() => setShowEditor(true)}>
          Nouvel article
        </Button>
      </div>

      {publiedFlash ? (
        <p className="rounded-md border border-verdict-true/20 bg-verdict-true-bg px-4 py-3 text-sm text-verdict-true">
          Article publié sur le site.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1fr)_130px_156px_116px_92px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Titre</span>
            <span>Statut</span>
            <span>Auteur</span>
            <span>Date</span>
            <span className="text-right">Vues</span>
          </div>
          {ARTICLES.map((a) => (
            <div
              key={a.titre}
              className="grid grid-cols-[minmax(0,1fr)_130px_156px_116px_92px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="font-medium text-ink">{a.titre}</span>
              <span>
                <Tag tone={a.tone}>{a.statut}</Tag>
              </span>
              <span className="text-[0.8125rem] text-muted-foreground">{a.auteur}</span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">{a.date}</span>
              <span className="text-right text-[#2b3646] tabular-nums">{a.vues}</span>
            </div>
          ))}
        </div>
      </div>

      {showEditor ? (
        <ArticleEditor
          onClose={() => setShowEditor(false)}
          onPublished={() => {
            setShowEditor(false);
            setPubliedFlash(true);
          }}
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/actualites`. Vérifier : tableau des articles, "Nouvel article"
ouvre l'éditeur plein écran, saisie titre/chapô/corps, bouton Publier désactivé sans titre, ouvre le
popover de publication, publier ferme l'éditeur et affiche le bandeau de confirmation.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add app/admin/actualites/page.tsx components/features/admin/article-editor.tsx components/features/admin/publish-popover.tsx
git commit -m "feat(admin): ecran Actualites et blog avec editeur plein ecran"
```

---

### Task 14: Écran Ressources + modale nouvelle ressource

**Files:**
- Create: `app/admin/ressources/page.tsx`
- Create: `components/features/admin/new-ressource-dialog.tsx`

**Interfaces:**
- Consumes: `RESSOURCES`, `TYPES_RESSOURCE` (Task 6), `Alert`, `Button`, `Tag`, `Dialog`, `Field`,
  `Input`, `Select`, `IconButton` (Tasks 2-5).

- [ ] **Step 1: Créer `components/features/admin/new-ressource-dialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TYPES_RESSOURCE } from "@/features/admin/data/ressources";

interface NewRessourceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (titre: string, type: string) => void;
}

export function NewRessourceDialog({ open, onClose, onCreate }: NewRessourceDialogProps) {
  const [type, setType] = useState<string>(TYPES_RESSOURCE[0]);
  const [titre, setTitre] = useState("");

  const submit = () => {
    if (!titre.trim()) return;
    onCreate(titre.trim(), type);
    setTitre("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <span className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Site public
          </span>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">Nouvelle ressource</span>
        </span>
        <IconButton icon={X} label="Fermer" onClick={onClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <Field label="Type de ressource">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES_RESSOURCE.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Titre de la ressource" hint="Phrase capitalisée, 2 à 10 mots. Le fichier se téléverse à l’étape suivante.">
          <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Ce que dit la loi sur le vote des étudiants" />
        </Field>
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!titre.trim()} onClick={submit}>
          Créer le brouillon
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">Rien n’est publié à cette étape</span>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Créer `app/admin/ressources/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Upload, FilePlus, BookOpen, ShieldCheck, Users, Flag, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Alert } from "@/components/ui/alert";
import { NewRessourceDialog } from "@/components/features/admin/new-ressource-dialog";
import { RESSOURCES } from "@/features/admin/data/ressources";

const ICONS = [BookOpen, ShieldCheck, Users, Flag, GraduationCap];

export default function RessourcesPage() {
  const [showNew, setShowNew] = useState(false);
  const [brouillons, setBrouillons] = useState<string[]>([]);

  const enValidation = RESSOURCES.find((r) => r.statut === "en-validation");

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Site public</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Ressources pédagogiques
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            Soumission → Validation → En ligne · déposées par les encadreurs et les clubs
          </p>
        </div>
        <Button variant="primary" icon={Upload} onClick={() => setShowNew(true)}>
          Ajouter une ressource
        </Button>
      </div>

      {enValidation ? (
        <Alert tone="warning" title="Une ressource attend votre validation">
          « {enValidation.titre} », soumis le 19/08/2026 · {enValidation.meta}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brouillons.map((titre) => (
          <div key={titre} className="flex flex-col gap-3 rounded-lg border border-dashed border-ink/24 bg-orange-50 p-4.5">
            <FilePlus size={32} />
            <span className="text-base leading-tight font-semibold text-ink">{titre}</span>
            <span className="text-xs text-muted-foreground">Brouillon créé à l’instant · fichier à téléverser</span>
            <span className="mt-auto">
              <Button variant="secondary" size="sm">
                Compléter la fiche
              </Button>
            </span>
          </div>
        ))}

        {RESSOURCES.filter((r) => r.statut === "en-ligne").map((r, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={r.titre}
              className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-card p-4.5 transition-all hover:-translate-y-0.5 hover:border-orange-500"
            >
              <Icon size={32} />
              <span className="text-base leading-tight font-semibold text-ink">{r.titre}</span>
              <span className="text-xs text-muted-foreground">{r.meta}</span>
              <span className="mt-auto flex items-center justify-between gap-2.5">
                <Tag tone="blue">En ligne</Tag>
                <span className="text-[0.8125rem] text-[#2b3646] tabular-nums">{r.telechargements} téléchargements</span>
              </span>
            </div>
          );
        })}

        {enValidation ? (
          <div className="flex flex-col gap-3 rounded-lg border border-ink bg-surface-card p-4.5 shadow-[5px_5px_0_var(--color-blue-500)]">
            <GraduationCap size={32} />
            <span className="text-base leading-tight font-semibold text-ink">{enValidation.titre}</span>
            <span className="text-xs text-muted-foreground">{enValidation.meta}</span>
            <span className="mt-auto flex gap-2">
              <Button variant="primary" size="sm">
                Valider
              </Button>
              <Button variant="ghost" size="sm">
                Demander une correction
              </Button>
            </span>
          </div>
        ) : null}
      </div>

      <NewRessourceDialog
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={(titre) => {
          setBrouillons((prev) => [...prev, titre]);
          setShowNew(false);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/ressources`. Vérifier : alerte de validation, grille de cartes,
"Ajouter une ressource" ouvre la modale, créer un brouillon l'ajoute en tête de grille.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add app/admin/ressources/page.tsx components/features/admin/new-ressource-dialog.tsx
git commit -m "feat(admin): ecran Ressources avec modale nouvelle ressource"
```

---

### Task 15: Écran Campagnes

**Files:**
- Create: `app/admin/campagnes/page.tsx`

**Interfaces:**
- Consumes: `CAMPAGNES` (Task 6), `Button`, `Tag` (Task 2-3).

- [ ] **Step 1: Créer `app/admin/campagnes/page.tsx`**

```tsx
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { CAMPAGNES } from "@/features/admin/data/campagnes";

const BARRE_COULEUR: Record<string, string> = {
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  neutre: "bg-n-300",
};

export default function CampagnesPage() {
  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Terrain</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Campagnes et événements
          </h1>
        </div>
        <Button variant="primary" icon={Plus}>
          Créer une campagne
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CAMPAGNES.map((c) => (
          <div key={c.titre} className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-5.5">
            <span className="flex items-center justify-between gap-3">
              <Tag tone={c.tone}>{c.statut}</Tag>
              <span className="text-xs text-muted-foreground">{c.periode}</span>
            </span>
            <span className="text-lg leading-tight font-semibold text-ink">{c.titre}</span>
            <span className="text-sm leading-relaxed text-muted-foreground">{c.resume}</span>
            <span className="block h-1.5 overflow-hidden rounded-full bg-n-100">
              <span
                className={`block h-full ${BARRE_COULEUR[c.progressionCouleur]}`}
                style={{ width: `${c.progression}%` }}
              />
            </span>
            <span className="flex items-center gap-3.5 text-xs text-muted-foreground">{c.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/campagnes`. Vérifier la grille 2 colonnes et les barres de
progression colorées.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add app/admin/campagnes/page.tsx
git commit -m "feat(admin): ecran Campagnes"
```

---

### Task 16: Écran Notifications app

**Files:**
- Create: `app/admin/push/page.tsx`

**Interfaces:**
- Consumes: `NOTIFICATIONS_ENVOYEES`, `CIBLES_NOTIFICATION`, `MOMENTS_ENVOI` (Task 6), `Field`,
  `Input`, `Textarea`, `Select`, `Button` (Tasks 2-4).

- [ ] **Step 1: Créer `app/admin/push/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS_ENVOYEES, CIBLES_NOTIFICATION, MOMENTS_ENVOI } from "@/features/admin/data/notifications-envoyees";

export default function PushPage() {
  const [titre, setTitre] = useState("Nid de poule d’Angré : la chaussée est réparée");
  const [texte, setTexte] = useState("Signalé le 12/08 par un citoyen, rebouché le 17/08. Merci d’avoir signalé.");
  const [cible, setCible] = useState<string>(CIBLES_NOTIFICATION[0]);

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Application mobile</span>
        <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">Notifications</h1>
        <p className="max-w-[62ch] text-[0.9375rem] text-muted-foreground">
          Un envoi par semaine au maximum. Chaque notification renvoie vers un signalement suivi ou une action
          datée.
        </p>
      </div>

      <div className="grid items-start gap-5.5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4.5 rounded-lg border border-border-subtle bg-surface-card p-6">
          <Field label="Titre" hint="60 caractères maximum, verbe à l’infinitif ou fait daté">
            <Input value={titre} onChange={(e) => setTitre(e.target.value)} />
          </Field>
          <Field label="Message">
            <Textarea rows={3} value={texte} onChange={(e) => setTexte(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Destinataires">
              <Select value={cible} onChange={(e) => setCible(e.target.value)}>
                {CIBLES_NOTIFICATION.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Envoi">
              <Select defaultValue={MOMENTS_ENVOI[0]}>
                {MOMENTS_ENVOI.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex items-center gap-2.5 border-t border-border-subtle pt-1">
            <Button variant="primary" icon={Send}>
              Programmer l’envoi
            </Button>
            <Button variant="ghost">Enregistrer le brouillon</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Aperçu sur l’appareil
          </span>
          <div className="rounded-[14px] bg-ink px-4 pt-5 pb-6.5">
            <span className="mb-3.5 block text-center text-[0.6875rem] text-white/45">
              Vendredi 21 août · 08 h 30
            </span>
            <div className="flex gap-2.5 rounded-[10px] bg-white/94 p-3">
              <img src="/assets/logo/mec-mark.png" alt="" className="h-7.5 w-7.5 flex-none object-contain" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[0.8125rem] leading-tight font-bold text-ink">{titre}</span>
                <span className="text-xs leading-snug text-[#2b3646]">{texte}</span>
              </span>
            </div>
            <span className="mt-3 block text-center text-[0.6875rem] text-white/50">
              MEC — Signalement citoyen · {cible}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1fr)_148px_116px_128px_104px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Notification envoyée</span>
            <span>Destinataires</span>
            <span>Date</span>
            <span>Reçue par</span>
            <span className="text-right">Ouverture</span>
          </div>
          {NOTIFICATIONS_ENVOYEES.map((n) => (
            <div
              key={n.titre}
              className="grid grid-cols-[minmax(0,1fr)_148px_116px_128px_104px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="font-medium text-ink">{n.titre}</span>
              <span className="text-[0.8125rem] text-muted-foreground">{n.destinataires}</span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">{n.date}</span>
              <span className="tabular-nums">{n.recuePar}</span>
              <span className={`text-right font-semibold tabular-nums ${n.ouvertureForte ? "text-verdict-true" : "text-[#2b3646]"}`}>
                {n.ouverture}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/push`. Vérifier : la saisie titre/message met à jour l'aperçu
mobile en direct, le tableau d'historique s'affiche.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add app/admin/push/page.tsx
git commit -m "feat(admin): ecran Notifications app"
```

---

### Task 17: Écran Statistiques

**Files:**
- Create: `app/admin/statistiques/page.tsx`

**Interfaces:**
- Consumes: `Stat`, `Select`, `Button` (Tasks 2, 4, 5).

- [ ] **Step 1: Créer `app/admin/statistiques/page.tsx`**

```tsx
import { Download } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PERIODES = ["Janvier → août 2026", "2e trimestre 2026", "Année scolaire 2025-2026"];

const MOIS = [
  { label: "Jan", hauteur: 38, orange: false },
  { label: "Fév", hauteur: 46, orange: false },
  { label: "Mar", hauteur: 58, orange: false },
  { label: "Avr", hauteur: 74, orange: true },
  { label: "Mai", hauteur: 62, orange: false },
  { label: "Juin", hauteur: 88, orange: true },
  { label: "Juil", hauteur: 34, orange: false },
  { label: "Août", hauteur: 52, orange: false },
];

const REGIONS = [
  { region: "Abidjan", seances: 18, personnes: "1 460", signalements: 26 },
  { region: "Gbêkê (Bouaké)", seances: 11, personnes: "840", signalements: 9 },
  { region: "Haut-Sassandra (Daloa)", seances: 6, personnes: "470", signalements: 5 },
  { region: "Yamoussoukro", seances: 4, personnes: "280", signalements: 3 },
  { region: "San-Pédro", seances: 2, personnes: "130", signalements: 1 },
];

export default function StatistiquesPage() {
  return (
    <div className="flex max-w-[1320px] flex-col gap-6.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Redevabilité</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Statistiques et rapports
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-47.5">
            <Select defaultValue={PERIODES[0]}>
              {PERIODES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </span>
          <Button variant="deep" icon={Download}>
            Générer le rapport
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-subtle bg-surface-card p-6.5 lg:grid-cols-4">
        <Stat value="3 180" label="personnes sensibilisées" meta="Janvier → août 2026" />
        <Stat value="44" label="signalements reçus" meta="Depuis le lancement de l’app, mars 2026" rule />
        <Stat value="26" label="signalements résolus" meta="Janvier → août 2026" rule />
        <Stat value="12" label="campus et lycées couverts" meta="Année scolaire 2025-2026" rule />
      </div>

      <div className="grid items-start gap-5.5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-lg border border-border-subtle bg-surface-card p-6">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Personnes sensibilisées par mois
          </span>
          <div className="mt-6 grid h-47.5 grid-cols-8 items-end gap-3.5">
            {MOIS.map((m) => (
              <span key={m.label} className="flex h-full flex-col items-center justify-end gap-2">
                <span
                  className={`w-full rounded-t-sm ${m.orange ? "bg-orange-500" : "bg-blue-500"}`}
                  style={{ height: `${m.hauteur}%` }}
                />
                <span className="text-[0.6875rem] text-muted-foreground">{m.label}</span>
              </span>
            ))}
          </div>
          <p className="mt-4.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
            En orange : mois de caravane. Juillet est le creux des vacances scolaires.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
          <div className="grid grid-cols-[minmax(0,1fr)_92px_96px_88px] gap-3 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Région</span>
            <span className="text-right">Séances</span>
            <span className="text-right">Personnes</span>
            <span className="text-right">Signal.</span>
          </div>
          {REGIONS.map((r) => (
            <div
              key={r.region}
              className="grid grid-cols-[minmax(0,1fr)_92px_96px_88px] gap-3 border-b border-border-subtle px-4 py-3 text-sm tabular-nums last:border-b-0"
            >
              <span className="font-medium text-ink">{r.region}</span>
              <span className="text-right">{r.seances}</span>
              <span className="text-right">{r.personnes}</span>
              <span className="text-right">{r.signalements}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/statistiques`. Vérifier les 4 `Stat`, le graphique à barres
(avril/juin en orange), le tableau par région.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add app/admin/statistiques/page.tsx
git commit -m "feat(admin): ecran Statistiques"
```

---

### Task 18: Écran Utilisateurs et droits

**Files:**
- Create: `app/admin/utilisateurs/page.tsx`

**Interfaces:**
- Consumes: `UTILISATEURS`, `DROITS` (Task 6), `Tag`, `Button` (Tasks 2-3).

- [ ] **Step 1: Créer `app/admin/utilisateurs/page.tsx`**

```tsx
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { UTILISATEURS } from "@/features/admin/data/utilisateurs";
import { DROITS } from "@/features/admin/data/droits";

export default function UtilisateursPage() {
  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Accès</span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Utilisateurs et droits
          </h1>
        </div>
        <Button variant="primary" icon={UserPlus}>
          Inviter un membre
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1fr)_210px_168px_120px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Membre</span>
            <span>Rôle</span>
            <span>Dernière connexion</span>
            <span>État</span>
          </div>
          {UTILISATEURS.map((u) => (
            <div
              key={u.email}
              className="grid grid-cols-[minmax(0,1fr)_210px_168px_120px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-ink">{u.nom}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </span>
              <span className="text-[#2b3646]">{u.role}</span>
              <span className="text-[0.8125rem] text-muted-foreground">{u.derniereConnexion}</span>
              <span>
                <Tag tone={u.etat === "Actif" ? "blue" : "neutral"}>{u.etat}</Tag>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        <div className="border-b border-border-subtle px-5 pt-4.5 pb-3.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Droits par rôle
          </span>
          <p className="mt-2 text-[0.8125rem] text-muted-foreground">Plein accès · Lecture seule · Aucun accès</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_150px_150px] gap-3 border-b border-border-subtle bg-n-50 px-5 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
              <span>Module</span>
              <span className="text-center">Admin national</span>
              <span className="text-center">Communication</span>
              <span className="text-center">Modération</span>
            </div>
            {DROITS.map((d) => (
              <div
                key={d.module}
                className="grid grid-cols-[minmax(0,1fr)_150px_150px_150px] items-center gap-3 border-b border-border-subtle px-5 py-2.5 text-sm last:border-b-0"
              >
                <span className="font-medium text-ink">{d.module}</span>
                <span className="text-center text-[#2b3646]">{d.administrateur}</span>
                <span className="text-center text-[#2b3646]">{d.communication}</span>
                <span className="text-center text-[#2b3646]">{d.moderation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/utilisateurs`. Vérifier le tableau des membres et la matrice de
droits.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add app/admin/utilisateurs/page.tsx
git commit -m "feat(admin): ecran Utilisateurs et droits"
```

---

### Task 19: Écran de connexion (4 états)

**Files:**
- Create: `components/features/admin-auth/auth-screen.tsx`
- Create: `components/features/admin-auth/connexion-view.tsx`
- Create: `components/features/admin-auth/inscription-view.tsx`
- Create: `components/features/admin-auth/attente-view.tsx`
- Create: `components/features/admin-auth/expire-view.tsx`
- Create: `app/admin/connexion/page.tsx`

**Interfaces:**
- Consumes: `Field`, `Input`, `Select`, `Button`, `Alert` (Tasks 2-5).
- Produces: `AuthScreen()`, `AuthStep = "connexion" | "inscription" | "attente" | "expire"`.

- [ ] **Step 1: Créer `components/features/admin-auth/connexion-view.tsx`**

```tsx
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConnexionViewProps {
  onGoInscription: () => void;
}

export function ConnexionView({ onGoInscription }: ConnexionViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <div>
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-600 uppercase">
          Espace d’administration
        </span>
        <h1 className="mt-3 mb-2 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Se connecter
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Le site public et l’application de signalement se pilotent depuis ici.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Field label="Adresse e-mail" htmlFor="auth-mail">
          <Input id="auth-mail" type="email" placeholder="prenom.nom@mec-ci.org" />
        </Field>
        <div className="flex flex-col gap-2.5">
          <Field label="Mot de passe" htmlFor="auth-pass">
            <Input id="auth-pass" type="password" placeholder="Votre mot de passe" />
          </Field>
          <a href="#oubli" className="self-start text-[0.8125rem] font-semibold text-blue-600 hover:text-orange-700">
            Mot de passe oublié ?
          </a>
        </div>
        <div className="mt-0.5 grid">
          <Button variant="primary" size="lg" full>
            Se connecter
          </Button>
        </div>
      </div>
      <p className="border-t border-border-subtle pt-5 text-[0.8125rem] leading-relaxed text-muted-foreground">
        Vous travaillez avec le MEC et n’avez pas de compte ?{" "}
        <button type="button" onClick={onGoInscription} className="font-semibold text-blue-600 hover:text-orange-700">
          Créer un compte
        </button>{" "}
        — il sera actif après validation d’un administrateur.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Créer `components/features/admin-auth/inscription-view.tsx`**

```tsx
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ROLES_DEMANDE = ["Chargé·e de communication", "Modérateur", "Coordination campus"];

interface InscriptionViewProps {
  onGoConnexion: () => void;
  onSubmit: () => void;
}

export function InscriptionView({ onGoConnexion, onSubmit }: InscriptionViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <div>
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-600 uppercase">
          Demande d’accès
        </span>
        <h1 className="mt-3 mb-2 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Créer un compte
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Un administrateur national valide votre compte avant la première connexion.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Field label="Nom et prénoms" htmlFor="ins-nom">
          <Input id="ins-nom" placeholder="Nadia Koffi" />
        </Field>
        <Field label="Adresse e-mail professionnelle" htmlFor="ins-mail">
          <Input id="ins-mail" type="email" placeholder="prenom.nom@mec-ci.org" />
        </Field>
        <Field label="Rôle demandé" htmlFor="ins-role" hint="Le rôle définit les modules auxquels vous accédez.">
          <Select id="ins-role" defaultValue={ROLES_DEMANDE[0]}>
            {ROLES_DEMANDE.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mot de passe" htmlFor="ins-pass" hint="12 caractères minimum.">
          <Input id="ins-pass" type="password" placeholder="Choisissez un mot de passe" />
        </Field>
        <div className="mt-0.5 grid">
          <Button variant="primary" size="lg" full onClick={onSubmit}>
            Créer mon compte
          </Button>
        </div>
      </div>
      <p className="border-t border-border-subtle pt-5 text-[0.8125rem] text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <button type="button" onClick={onGoConnexion} className="font-semibold text-blue-600 hover:text-orange-700">
          Se connecter
        </button>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Créer `components/features/admin-auth/attente-view.tsx`**

```tsx
import { Hourglass, Mail, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttenteViewProps {
  email: string;
  onGoConnexion: () => void;
}

export function AttenteView({ email, onGoConnexion }: AttenteViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-orange-50 text-orange-600">
        <Hourglass size={22} />
      </span>
      <div>
        <h1 className="mb-2.5 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Compte en attente de validation
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Votre demande pour <strong className="font-semibold text-ink">{email}</strong> est enregistrée. Un
          administrateur national l’active depuis la page Utilisateurs, en général sous 48 heures ouvrées.
        </p>
      </div>
      <div className="flex flex-col gap-2.5 rounded-lg border border-border-subtle bg-n-50 p-4">
        <span className="flex items-center gap-2.5 text-[0.8125rem] text-[#2b3646]">
          <Mail size={16} /> Vous recevrez un e-mail dès l’activation
        </span>
        <span className="flex items-center gap-2.5 text-[0.8125rem] text-[#2b3646]">
          <LifeBuoy size={16} /> Demande urgente · informatique@mec-ci.org
        </span>
      </div>
      <div className="grid">
        <Button variant="secondary" size="lg" full onClick={onGoConnexion}>
          Retour à la connexion
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Créer `components/features/admin-auth/expire-view.tsx`**

```tsx
import { Lock } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExpireViewProps {
  email: string;
  onGoConnexion: () => void;
}

export function ExpireView({ email, onGoConnexion }: ExpireViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-50 text-blue-600">
        <Lock size={22} />
      </span>
      <div>
        <h1 className="mb-2.5 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Session expirée
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Vous avez été déconnecté après 30 minutes sans activité. Vos brouillons et vos signalements en cours ont
          été conservés.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Field label="Mot de passe" htmlFor="exp-pass" hint={`Reconnecté en tant que ${email}`}>
          <Input id="exp-pass" type="password" placeholder="Votre mot de passe" />
        </Field>
        <div className="grid">
          <Button variant="primary" size="lg" full>
            Reprendre ma session
          </Button>
        </div>
      </div>
      <button type="button" onClick={onGoConnexion} className="self-start text-[0.8125rem] font-semibold text-blue-600 hover:text-orange-700">
        Se connecter avec un autre compte
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Créer `components/features/admin-auth/auth-screen.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ConnexionView } from "@/components/features/admin-auth/connexion-view";
import { InscriptionView } from "@/components/features/admin-auth/inscription-view";
import { AttenteView } from "@/components/features/admin-auth/attente-view";
import { ExpireView } from "@/components/features/admin-auth/expire-view";

type AuthStep = "connexion" | "inscription" | "attente" | "expire";

const DEMO_EMAIL = "aminata.traore@mec-ci.org";

export function AuthScreen() {
  const [step, setStep] = useState<AuthStep>("connexion");

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center overflow-y-auto bg-ink px-5 py-10">
      <div className="relative m-auto flex w-full max-w-103 flex-col items-center gap-5.5">
        <div className="w-full rounded-lg bg-white p-9 shadow-overlay">
          <img src="/assets/logo/mec-lockup.png" alt="MEC" className="mb-6.5 h-8 w-auto" />
          {step === "connexion" ? <ConnexionView onGoInscription={() => setStep("inscription")} /> : null}
          {step === "inscription" ? (
            <InscriptionView onGoConnexion={() => setStep("connexion")} onSubmit={() => setStep("attente")} />
          ) : null}
          {step === "attente" ? <AttenteView email={DEMO_EMAIL} onGoConnexion={() => setStep("connexion")} /> : null}
          {step === "expire" ? <ExpireView email={DEMO_EMAIL} onGoConnexion={() => setStep("connexion")} /> : null}
        </div>

        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-xs text-white/40">
            mec-ci.org/admin · accès réservé à l’équipe du MEC, non référencé depuis le site public
          </span>
          <span className="flex flex-wrap items-center justify-center gap-4">
            <button type="button" onClick={() => setStep("connexion")} className={`text-xs ${step === "connexion" ? "text-white" : "text-white/42"} hover:text-orange-400`}>
              Connexion
            </button>
            <button type="button" onClick={() => setStep("inscription")} className={`text-xs ${step === "inscription" ? "text-white" : "text-white/42"} hover:text-orange-400`}>
              Inscription
            </button>
            <button type="button" onClick={() => setStep("attente")} className={`text-xs ${step === "attente" ? "text-white" : "text-white/42"} hover:text-orange-400`}>
              En attente
            </button>
            <button type="button" onClick={() => setStep("expire")} className={`text-xs ${step === "expire" ? "text-white" : "text-white/42"} hover:text-orange-400`}>
              Session expirée
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Créer `app/admin/connexion/page.tsx`**

```tsx
import { AuthScreen } from "@/components/features/admin-auth/auth-screen";

export default function ConnexionPage() {
  return <AuthScreen />;
}
```

- [ ] **Step 7: Vérifier visuellement**

Run: `rtk pnpm run dev`
Ouvrir `http://localhost:3000/admin/connexion`. Vérifier les 4 états via les liens fantômes du bas
de page, le passage connexion → inscription, et inscription → "Créer mon compte" → attente.

Run: `rtk pnpm run typecheck && rtk pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 8: Commit**

```bash
git add app/admin/connexion components/features/admin-auth
git commit -m "feat(admin): ecran de connexion (4 etats)"
```

---

### Task 20: Revue de convention et vérification finale

**Files:**
- Aucun fichier nouveau — revue transversale du diff complet de ce chantier.

- [ ] **Step 1: Lancer la suite complète**

Run: `rtk pnpm run typecheck && rtk pnpm run lint && rtk pnpm run test && rtk pnpm run build`
Expected: tout passe (les 5 tests de `build-queue.test.ts`, aucune erreur typecheck/lint, build
Cloudflare Worker réussi). Le build est important ici en particulier pour `app/admin/signalements/page.tsx`,
qui utilise `useSearchParams()` — si le build signale qu'un `Suspense` est requis autour de cet appel,
envelopper le contenu de la page dans `<Suspense fallback={null}>...</Suspense>` (import depuis
`react`).

- [ ] **Step 2: Revue de convention**

Lancer l'agent `convention-drift-check` sur le diff complet (`git diff master...HEAD` ou équivalent)
pour vérifier la cohérence avec `docs/ARCHITECTURE.md` et `CLAUDE.md` (kebab-case, taille de
fichiers ≤ 200 lignes, layering `components/ui/` vs `components/features/`). Corriger les écarts
signalés.

- [ ] **Step 3: Parcours manuel complet**

Run: `rtk pnpm run dev`
Parcourir dans le navigateur, dans l'ordre : `/admin/connexion` (4 états), `/admin` (les 4 rôles via
le sélecteur du header), `/admin/signalements` (filtres + tiroir), `/admin/actualites` (éditeur),
`/admin/ressources` (modale), `/admin/campagnes`, `/admin/push`, `/admin/statistiques`,
`/admin/utilisateurs`. Confirmer l'absence d'erreur console et la cohérence visuelle avec le design
Claude Design source.

- [ ] **Step 4: Commit final si des ajustements ont été faits**

```bash
git add -A
git commit -m "fix(admin): ajustements suite a la revue de convention"
```
