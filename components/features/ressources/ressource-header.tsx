import Link from "next/link";
import { FileText, Link2, Share2 } from "lucide-react";
import type { Ressource } from "@/features/ressources/types/ressource";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { DownloadDialog } from "@/components/features/ressources/download-dialog";
import { formatCount } from "@/features/ressources/lib/format-count";

// Facebook/Twitter/Linkedin n'existent pas dans lucide-react@1.33.0 (icônes de marque retirées) :
// remplacées par Share2, différenciées par leur aria-label. Voir Écarts du plan.
const SHARE_LINKS = [
  { icon: Share2, label: "Partager sur Facebook" },
  { icon: Share2, label: "Partager sur Twitter" },
  { icon: Share2, label: "Partager sur LinkedIn" },
  { icon: Link2, label: "Copier le lien" },
];

const FICHE = (ressource: Ressource) => [
  { label: "Publié le", value: ressource.date },
  { label: "Pages", value: `${ressource.pages} p.` },
  { label: "Poids du fichier", value: ressource.weight },
  { label: "Téléchargements", value: formatCount(ressource.downloads) },
];

export function RessourceHeader({ ressource }: { ressource: Ressource }) {
  return (
    <>
      <section className="py-7 sm:py-11">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <Link href="/ressources" className="text-sm font-semibold text-text-muted">
            ← Toutes les ressources
          </Link>
        </div>
      </section>
      <section className="pb-14 sm:pb-18 lg:pb-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16">
            <div className="flex flex-col gap-4 lg:sticky lg:top-[100px] lg:self-start">
              <PhotoPlaceholder
                ratio="3/4"
                label="Couverture du guide à fournir"
                className="shadow-stamp"
              />
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <FileText className="h-4 w-4" aria-hidden />
                PDF · {ressource.weight} · {ressource.pages} pages
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
                  {ressource.theme}
                </span>
                <h1 className="text-4xl leading-[1.02] font-semibold tracking-tight text-ink text-pretty sm:text-5xl">
                  {ressource.title}
                </h1>
                <p className="max-w-[62ch] text-xl leading-snug text-text-muted text-pretty">
                  {ressource.excerpt}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-y border-ink/10 py-6 sm:grid-cols-4">
                {FICHE(ressource).map((item) => (
                  <div key={item.label}>
                    <div className="text-lg font-semibold tabular-nums text-ink">{item.value}</div>
                    <div className="mt-1 text-xs text-text-muted">{item.label}</div>
                  </div>
                ))}
              </div>

              <DownloadDialog ressource={ressource} />

              <div className="flex items-center gap-3 border-t border-ink/10 pt-6">
                <span className="text-sm font-semibold text-ink">Partager</span>
                <div className="flex items-center gap-2">
                  {SHARE_LINKS.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      title={label}
                      className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-text-muted"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      <span className="sr-only">{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
