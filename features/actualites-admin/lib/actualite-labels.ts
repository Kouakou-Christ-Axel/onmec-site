import type {
  ScopeActualite,
  StatutActualite,
} from "@/features/actualites-admin/types/actualite-admin";

export const STATUT_LABELS: Record<StatutActualite, string> = {
  BROUILLON: "Brouillon",
  PUBLIEE: "Publiée",
  ARCHIVEE: "Archivée",
};

export const STATUT_TONES: Record<StatutActualite, "orange" | "blue" | "neutral"> = {
  BROUILLON: "orange",
  PUBLIEE: "blue",
  ARCHIVEE: "neutral",
};

export const SCOPE_LABELS: Record<ScopeActualite, string> = {
  WEB: "Web",
  MOBILE: "Mobile",
  BOTH: "Web et mobile",
};

export const SCOPE_TONES: Record<ScopeActualite, "blue" | "outline" | "neutral"> = {
  WEB: "blue",
  MOBILE: "outline",
  BOTH: "neutral",
};
