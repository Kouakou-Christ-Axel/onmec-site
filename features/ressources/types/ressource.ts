export type Theme =
  "Droits et devoirs" | "Vote et élections" | "Désinformation" | "Institutions" | "Vie de club";

export type Format = "PDF" | "DOCX" | "PNG";

export type Acces = "Public" | "Adhérents";

export type Ressource = {
  slug: string;
  title: string;
  theme: Theme;
  format: Format;
  acces: Acces;
  pages: number;
  weight: string;
  date: string;
  downloads: number;
  excerpt: string;
  body: string;
};
