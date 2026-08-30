import type { ReactNode } from "react";

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
