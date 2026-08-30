import { Reveal } from "@/components/features/site/reveal";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";

export function PresidentWord() {
  return (
    <section className="border-y border-ink/10 bg-surface-card py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-16">
        <Reveal className="flex flex-col gap-5">
          <PhotoPlaceholder ratio="4/5" />
          <div className="border-t-2 border-ink pt-4">
            <div className="text-xl font-semibold tracking-tight text-ink">M. Mamadou Coné</div>
            <div className="mt-1 text-sm font-semibold text-orange-700">Président du MEC</div>
            <div className="mt-2.5 text-sm leading-relaxed text-text-muted">
              Ingénieur en communication et marketing
              <br />
              Diplômé de l’Institut de formation politique Amadou Gon Coulibaly
            </div>
          </div>
        </Reveal>
        <Reveal delay={80} className="flex flex-col gap-6">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Le mot du Président
          </span>
          <p className="text-quote max-w-[34ch] font-serif text-ink italic text-pretty">
            Une démocratie forte se construit par des citoyens éclairés, conscients de leurs droits
            et de leurs devoirs.
          </p>
          <div className="flex max-w-[60ch] flex-col gap-5 border-l-2 border-orange-500 pl-6 text-[1.0625rem] leading-relaxed text-text-body lg:pl-7">
            <p>Chers concitoyens, chers amis de la Côte d’Ivoire,</p>
            <p>
              C’est avec une immense fierté que je vous présente le Mouvement pour l’Éducation à la
              Citoyenneté. Notre nation est à un carrefour de son histoire, et plus que jamais,
              l’engagement de chaque citoyen est crucial. Le MEC est né d’une conviction profonde.
            </p>
            <p>
              Notre mission est de semer les graines d’une citoyenneté active et responsable, de
              l’école primaire aux plus hautes sphères de la société. Nous croyons en une Côte
              d’Ivoire solidaire, transparente et juste. Rejoignez-nous dans cette noble quête pour
              bâtir ensemble l’avenir de notre beau pays.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
