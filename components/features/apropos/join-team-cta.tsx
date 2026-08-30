import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

export function JoinTeamCta() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="flex flex-col items-start gap-8 rounded-md border border-ink bg-surface-card p-7 shadow-stamp sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
          <div>
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Rejoindre l’équipe
            </span>
            <h2 className="mt-3.5 text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
              Nous cherchons des encadreurs et des bénévoles
            </h2>
            <p className="mt-3.5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-text-muted">
              Vous êtes enseignant, étudiant ou jeune professionnel et vous voulez animer un club ou
              une campagne : le formulaire est ouvert toute l’année.
            </p>
          </div>
          <Link
            href="/rejoindre"
            className="inline-flex h-[54px] flex-none items-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold whitespace-nowrap text-white transition-colors hover:bg-orange-600"
          >
            Rejoindre le mouvement <span>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
