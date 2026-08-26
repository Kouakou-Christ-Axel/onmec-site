import type { ReactNode } from "react";

/**
 * `template.tsx` remonte à chaque navigation, contrairement à `layout.tsx` qui persiste : c'est
 * ce qui fait rejouer l'animation d'entrée à chaque changement de page. Choisi plutôt que l'API
 * View Transitions, que vinext ne prend pas en charge, et plutôt qu'un `loading.tsx`, qui ne
 * s'afficherait jamais — les pages publiques rendent des données statiques, sans attente réseau.
 *
 * Le garde-fou `prefers-reduced-motion` de globals.css neutralise déjà cette animation.
 */
export default function PublicTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-mec-page">{children}</div>;
}
