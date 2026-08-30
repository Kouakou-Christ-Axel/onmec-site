export type SignalementStatutApi = "NOUVEAU" | "EN_COURS" | "RESOLU" | "REJETE";

export interface AdminStatistics {
  signalements: {
    total: number;
    parStatut: Record<SignalementStatutApi, number>;
    parCategorie: { categorieId: string; nom: string; total: number }[];
  };
  membres: {
    total: number;
    actifs: number;
    suspendus: number;
    bannis: number;
  };
  quiz: {
    totalQuiz: number;
    totalTentatives: number;
    scoreMoyenGlobal: number;
  };
}
