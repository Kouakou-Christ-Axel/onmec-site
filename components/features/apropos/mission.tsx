import { Reveal } from "@/components/features/site/reveal";

export function Mission() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-7 px-5 sm:px-8 lg:grid-cols-[180px_1fr] lg:gap-20 lg:px-16">
        <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
          Mission
        </span>
        <Reveal className="flex max-w-[66ch] flex-col gap-5">
          <p className="text-2xl leading-snug tracking-tight text-ink text-pretty">
            Instruire pour impacter : donner à chaque jeune Ivoirien les connaissances civiques qui
            lui permettent de comprendre ses droits, d’assumer ses devoirs et de participer à la vie
            publique.
          </p>
          <p className="text-[1.0625rem] leading-relaxed text-text-muted">
            Nous travaillons avec les établissements, les autorités éducatives et les associations
            de jeunesse. Nos activités sont conçues pour être reprises et animées localement, sans
            nous.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
