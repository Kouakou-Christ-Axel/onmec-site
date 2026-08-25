import type { LucideIcon } from "lucide-react";

export type Programme = {
  icon: LucideIcon;
  title: string;
  desc: string;
  result: string;
  facts: string[];
};

export type ChronoItem = {
  date: string;
  meta: string;
  title: string;
  desc: string;
};

export type ChronoAnnee = {
  year: string;
  items: ChronoItem[];
};
