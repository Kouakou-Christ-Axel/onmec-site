import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

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
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body className="bg-n-50 font-sans text-[#2b3646] antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
