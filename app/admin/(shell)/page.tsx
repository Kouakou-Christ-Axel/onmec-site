"use client";

import Link from "next/link";
import { PenLine, Send } from "lucide-react";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { buildQueue } from "@/features/admin/lib/build-queue";
import { Tag } from "@/components/ui/tag";

const ACTIVITE = [
  {
    texte: "a marqué résolu le nid de poule d’Angré (SIG-2026-0140)",
    auteur: "Konan Yao",
    quand: "Hier, 17 h 12",
  },
  {
    texte: "a programmé « Ouverture des candidatures ambassadeurs »",
    auteur: "Nadia Koffi",
    quand: "Hier, 14 h 40",
  },
  {
    texte: "a ajouté 3 étapes à la caravane de Bouaké",
    auteur: "Salif Ouattara",
    quand: "19/08, 09 h 05",
  },
  { texte: "a invité 2 coordinateurs campus", auteur: "Aminata Traoré", quand: "14/08, 11 h 30" },
];

export default function FileDeTravailPage() {
  const shell = useAdminShell();
  const queue = buildQueue(shell);

  return (
    <div className="flex max-w-[1320px] flex-col gap-6.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Tableau de bord
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Ce qui attend une action
          </h1>
          <p className="max-w-[62ch] text-[0.9375rem] text-muted-foreground">
            {queue.length} éléments en attente · site public et application de signalement
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/admin/actualites"
            className="inline-flex h-10 items-center justify-center gap-2.5 rounded-sm border border-ink/24 px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink hover:bg-n-100"
          >
            <PenLine size={16} />
            Nouvel article
          </Link>
          <Link
            href="/admin/push"
            className="inline-flex h-10 items-center justify-center gap-2.5 rounded-sm bg-orange-500 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <Send size={16} />
            Envoyer une notification
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {shell.canSig ? (
          <Link
            href="/admin/signalements"
            className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-text-body transition-all hover:-translate-y-0.5 hover:border-orange-500"
          >
            <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
              {queue.filter((q) => q.kind === "Signalement").length}
            </span>
            <span className="text-sm font-semibold text-ink">signalements à modérer</span>
            <span className="text-xs text-muted-foreground">En validation dans l’app</span>
          </Link>
        ) : null}
        {shell.canEdito ? (
          <>
            <Link
              href="/admin/actualites"
              className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-text-body transition-all hover:-translate-y-0.5 hover:border-orange-500"
            >
              <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
                2
              </span>
              <span className="text-sm font-semibold text-ink">brouillons à relire</span>
              <span className="text-xs text-muted-foreground">Actualités et blog</span>
            </Link>
            <Link
              href="/admin/ressources"
              className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-text-body transition-all hover:-translate-y-0.5 hover:border-orange-500"
            >
              <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
                1
              </span>
              <span className="text-sm font-semibold text-ink">ressource à valider</span>
              <span className="text-xs text-muted-foreground">Soumise par un encadreur</span>
            </Link>
          </>
        ) : null}
        {shell.canUsers ? (
          <Link
            href="/admin/utilisateurs"
            className="flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-card p-4.5 pb-4 text-text-body transition-all hover:-translate-y-0.5 hover:border-orange-500"
          >
            <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
              2
            </span>
            <span className="text-sm font-semibold text-ink">invitations en attente</span>
            <span className="text-xs text-muted-foreground">Coordination campus</span>
          </Link>
        ) : null}
      </div>

      <div className="grid items-start gap-5.5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
          <div className="flex items-center justify-between gap-3.5 border-b border-border-subtle px-4.5 py-3.5">
            <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
              À traiter
            </span>
            <span className="text-xs text-muted-foreground">Trié par ancienneté</span>
          </div>
          {queue.length === 0 ? (
            <p className="px-4.5 py-6 text-sm text-muted-foreground">
              Rien en attente pour ce rôle.
            </p>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-border-subtle px-4.5 py-3.5 last:border-b-0"
              >
                <span className="w-26 flex-none">
                  <Tag tone={item.tone}>{item.kind}</Tag>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[0.9375rem] leading-tight font-semibold text-ink">
                    {item.titre}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.meta}</span>
                </span>
                <Link
                  href={item.href}
                  className="inline-flex h-8 flex-none items-center justify-center rounded-sm border border-ink/24 px-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-n-100"
                >
                  {item.action}
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-4.5">
          <div className="rounded-lg bg-blue-800 p-5 text-white">
            <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-400 uppercase">
              Application de signalement
            </span>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <span className="flex flex-col gap-0.5">
                <span className="text-2xl font-semibold tracking-[-0.03em]">2 340</span>
                <span className="text-xs text-white/60">installations</span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-2xl font-semibold tracking-[-0.03em]">1 180</span>
                <span className="text-xs text-white/60">actifs sur 30 jours</span>
              </span>
            </div>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-white/72">
              Dernière notification le 15/08 · 44 % d’ouverture
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-card p-4.5">
            <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
              Activité de l’équipe
            </span>
            <div className="mt-4 flex flex-col gap-3.5">
              {ACTIVITE.map((a, i) => (
                <span key={i} className="flex flex-col gap-0.5">
                  <span className="text-[0.8125rem] leading-snug text-text-body">
                    <strong className="text-ink">{a.auteur}</strong> {a.texte}
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground">{a.quand}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
