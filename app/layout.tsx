import type { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";
import "sonner/dist/styles.css";

export const metadata: Metadata = {
  title: "MEC — Mouvement pour l'Éducation à la Citoyenneté",
  description:
    "Le MEC forme les jeunes Ivoiriens à leurs droits, leurs devoirs et la vie citoyenne : campagnes de sensibilisation, clubs citoyens scolaires, ressources pédagogiques.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-mec-mode/data-mec-theme sont posés par le script anti-flash ci-dessous avant
    // l'hydratation React, donc absents du HTML rendu serveur — divergence attendue.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap"
        />
        {/* Anti-flash thème : pose data-mec-mode/data-mec-theme sur <html> avant le premier
            paint, synchronisé avec components/features/site/theme-toggle.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('mec-theme');if(['auto','light','dark'].indexOf(m)<0)m='auto';var d=document.documentElement;d.setAttribute('data-mec-mode',m);var dark=m==='dark'||(m==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)d.setAttribute('data-mec-theme','dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-n-50 font-sans text-text-body antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
