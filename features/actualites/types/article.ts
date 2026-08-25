export type ArticleCategory = "Sensibilisation" | "Lancement" | "Partenariat" | "Institutionnel";

export type Article = {
  slug: string;
  title: string;
  category: ArticleCategory;
  date: string;
  readingTime: string;
  excerpt: string;
  /** Service ou personne signataire, affiché dans la ligne méta si présent. */
  service?: string;
};
