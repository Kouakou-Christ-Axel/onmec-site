import { BILAN_SECTIONS, BILAN_SUMMARY } from "@/features/actualites/data/bilan-content";
import { Download } from "lucide-react";

export function ArticleBilanBody() {
  return (
    <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[200px_minmax(0,68ch)_1fr] xl:gap-8">
        <aside className="hidden flex-col gap-3 lg:sticky lg:top-[150px] lg:flex lg:self-start">
          <span className="text-[11px] font-semibold tracking-widest text-text-muted uppercase">
            Au sommaire
          </span>
          {BILAN_SUMMARY.map((label, i) => (
            <span
              key={label}
              className={`border-l-2 pl-2.5 text-sm ${i === 0 ? "border-orange-500 text-ink" : "border-ink/10 text-text-muted"}`}
            >
              {label}
            </span>
          ))}
        </aside>

        <div className="text-lg leading-relaxed text-text-body">
          {BILAN_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="mt-11 mb-5 text-3xl leading-tight tracking-tight text-ink first:mt-0">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mb-6">
                  {p}
                </p>
              ))}
              {"figures" in section && section.figures ? (
                <div className="my-9 border-l-2 border-orange-500 bg-surface-card p-7">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {section.figures.map((figure) => (
                      <div key={figure.label}>
                        <div className="text-3xl leading-none font-semibold tracking-tight text-n-300">
                          {figure.value}
                        </div>
                        <div className="mt-2 text-sm text-ink">{figure.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-[13px] text-text-muted">{section.figuresNote}</div>
                </div>
              ) : null}
              {"quote" in section && section.quote ? (
                <div className="my-9 border border-ink bg-surface-card p-8 shadow-stamp">
                  <p className="font-serif text-2xl leading-snug text-ink italic">
                    {section.quote.text}
                  </p>
                  <div className="mt-4 text-sm text-text-muted">{section.quote.attribution}</div>
                </div>
              ) : null}
            </section>
          ))}

          <div className="my-10 flex flex-wrap items-center justify-between gap-6 rounded-md border border-ink/10 p-7">
            <div>
              <div className="text-lg font-semibold text-ink">Rapport semestriel 2026</div>
              <div className="mt-1 text-sm text-text-muted">PDF · document à fournir</div>
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2.5 rounded-sm border border-ink/24 px-5 text-[15px] font-semibold text-ink"
            >
              <Download className="h-4 w-4" aria-hidden /> Télécharger le rapport
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-ink/10 pt-7">
            {["Institutionnel", "Bilan", "Clubs citoyens"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-n-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-text-body uppercase"
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto text-sm text-text-muted">
              Partager · WhatsApp · Facebook · Copier le lien
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
