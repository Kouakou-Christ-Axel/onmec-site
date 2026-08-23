import { SIGNALEMENTS } from "@/features/admin/data/signalements";

export type QueueTone = "orange" | "blue" | "neutral" | "outline";

export interface QueueItem {
  id: string;
  kind: "Signalement" | "Article" | "Ressource" | "Notification" | "Accès";
  tone: QueueTone;
  titre: string;
  meta: string;
  action: string;
  href: string;
}

interface QueuePermissions {
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
}

export function buildQueue({ canSig, canEdito, canUsers }: QueuePermissions): QueueItem[] {
  const items: QueueItem[] = [];

  if (canSig) {
    for (const s of SIGNALEMENTS) {
      if (s.statut !== "validation") continue;
      items.push({
        id: s.id,
        kind: "Signalement",
        tone: "orange",
        titre: s.sujet,
        meta: `${s.id} · ${s.categorie} · ${s.lieu} · ${s.delai}`,
        action: "Modérer",
        href: `/admin/signalements?open=${s.id}`,
      });
    }
  }

  if (canEdito) {
    items.push(
      {
        id: "art-bouake",
        kind: "Article",
        tone: "blue",
        titre: "Retour sur la caravane citoyenne de Bouaké",
        meta: "Brouillon de Nadia Koffi · en attente depuis 3 jours",
        action: "Relire",
        href: "/admin/actualites",
      },
      {
        id: "art-etatcivil",
        kind: "Article",
        tone: "blue",
        titre: "Ce que dit vraiment la loi sur l’état civil",
        meta: "En relecture · Yves N’Guessan · reçu le 18/08",
        action: "Relire",
        href: "/admin/actualites",
      },
      {
        id: "res-formation",
        kind: "Ressource",
        tone: "neutral",
        titre: "Module de formation — droits et devoirs",
        meta: "Soumis par Konan Yao · PDF, 18 pages",
        action: "Valider",
        href: "/admin/ressources",
      },
      {
        id: "push-angre",
        kind: "Notification",
        tone: "neutral",
        titre: "Annoncer la réparation du nid de poule d’Angré",
        meta: "2 340 installations · dernier envoi le 15/08",
        action: "Rédiger",
        href: "/admin/push",
      },
    );
  }

  if (canUsers) {
    items.push({
      id: "inv-campus",
      kind: "Accès",
      tone: "outline",
      titre: "2 invitations en attente de réponse",
      meta: "Coordination campus · envoyées le 14/08",
      action: "Voir",
      href: "/admin/utilisateurs",
    });
  }

  return items;
}
