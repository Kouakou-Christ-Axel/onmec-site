import type { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { getSiteUrl } from "@/config/env";
import "./globals.css";
import "sonner/dist/styles.css";

const siteUrl = getSiteUrl();
const defaultDescription =
  "Le MEC forme les jeunes Ivoiriens à leurs droits, leurs devoirs et la vie citoyenne : campagnes de sensibilisation, clubs citoyens scolaires, ressources pédagogiques.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MEC — Mouvement pour l'Éducation à la Citoyenneté",
    template: "%s | MEC",
  },
  description: defaultDescription,
  openGraph: {
    // Pas de title/description ici : Next les résout depuis le title/description de chaque
    // page (title.template compris) quand ils sont absents du bloc openGraph racine. Les
    // coder en dur ici ferait porter le même titre/texte générique à /contact, /apropos, etc.
    // en partage social — exactement le problème que ce correctif règle par ailleurs.
    type: "website",
    locale: "fr_CI",
    siteName: "MEC — Mouvement pour l'Éducation à la Citoyenneté",
    url: siteUrl,
    images: [{ url: "/assets/logo/mec-lockup.png", width: 1200, height: 913 }],
  },
  twitter: {
    card: "summary_large_image",
  },
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
        {/* Polices auto-hébergées (public/fonts/, déclarées en @font-face dans globals.css).
            Preload des deux graisses utilisées au-dessus de la ligne de flottaison : Instrument
            Sans normal (texte courant) et Instrument Serif italic (emphases des hero H1). */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/instrument-sans-latin-400-700-normal.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/instrument-serif-latin-400-italic.woff2"
          crossOrigin="anonymous"
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
