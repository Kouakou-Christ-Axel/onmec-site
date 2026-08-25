import type { ReactNode } from "react";
import { SiteHeader } from "@/components/features/site/site-header";
import { SiteFooter } from "@/components/features/site/site-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    // data-mec-public scope le thème sombre (app/globals.css) au site public uniquement —
    // /admin réutilise les mêmes tokens de couleur mais n'a pas été conçu pour le mode sombre.
    <div data-mec-public="" className="min-h-screen bg-surface-page text-text-body">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
