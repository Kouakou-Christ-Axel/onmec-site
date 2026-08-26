import { Megaphone, GraduationCap, BookOpen } from "lucide-react";
import { Reveal } from "@/components/features/site/reveal";

const PROGRAMS = [
  {
    icon: Megaphone,
    iconClass: "text-blue-500",
    title: "Campagnes de sensibilisation",
    desc: "Caravanes citoyennes dans les quartiers, les marchés et les campus. Droits, devoirs, participation.",
    meta: "1 000+ citoyens touchés",
    highlight: false,
  },
  {
    icon: GraduationCap,
    iconClass: "text-orange-600",
    title: "Clubs citoyens scolaires",
    desc: "Nous formons les encadreurs, les élèves animent. Un club par établissement, une activité par mois.",
    meta: "Nombre de clubs à préciser",
    highlight: true,
  },
  {
    icon: BookOpen,
    iconClass: "text-blue-500",
    title: "Ressources pédagogiques",
    desc: "Guides, fiches d’activité et affiches à utiliser en classe, en club ou en famille. Téléchargement libre.",
    meta: "Catalogue à constituer",
    highlight: false,
  },
];

export function ActionsGrid() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-11 flex max-w-[920px] flex-col gap-4">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Nos actions
          </span>
          <h2 className="text-h1 font-semibold text-ink">
            Instruire, former, <span className="font-serif font-normal italic">accompagner</span>
          </h2>
          <p className="max-w-[60ch] text-lg leading-relaxed text-text-muted text-pretty">
            Trois façons d’agir, sur le terrain et dans les établissements scolaires.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PROGRAMS.map((program, i) => (
            <Reveal key={program.title} delay={i * 80}>
              <div
                className={`flex h-full flex-col gap-4 rounded-md border bg-surface-card p-7 transition duration-150 ease-out hover:-translate-y-1 ${
                  program.highlight
                    ? "border-ink shadow-stamp"
                    : "border-ink/10 hover:border-orange-500 hover:shadow-stamp-sm"
                }`}
              >
                <program.icon className={`h-9 w-9 ${program.iconClass}`} aria-hidden />
                <h3 className="text-h3 font-semibold text-ink">{program.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{program.desc}</p>
                <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-4 text-[13px] text-text-muted">
                  <span>{program.meta}</span>
                  <span className="text-orange-500">→</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
