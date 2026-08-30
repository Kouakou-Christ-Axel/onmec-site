import type { Metadata } from "next";
import type { ReactNode } from "react";

// noindex sur tout /admin/* (y compris /admin/connexion, seule page réellement exposée derrière
// le 307 de proxy.ts) — voir audit SEO §2.5 : une page de connexion indexée dilue le signal sans
// rien apporter, et rien n'empêchait techniquement son indexation jusqu'ici.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// data-mec-admin scope le thème sombre (app/globals.css) au dashboard admin — même mécanisme que
// data-mec-public côté site public (app/(public)/layout.tsx). Couvre (shell), connexion et
// changer-mot-de-passe, qui sont tous sous ce layout racine.
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mec-admin="" className="contents">
      {children}
      {/* Cible des portails Radix côté admin — voir components/ui/dialog.tsx (useOverlayContainer). */}
      <div id="mec-overlay-root" />
    </div>
  );
}
