import Link from "next/link";

const STEPS = [
  "Vous envoyez le formulaire.",
  "Nous vous rappelons sous 72 heures.",
  "Vous suivez la formation d’accueil, puis vous rejoignez une action.",
];

export function FormSidebar() {
  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-[150px]">
      <div className="rounded-md border border-ink/10 bg-surface-card p-6">
        <span className="text-[11px] font-semibold tracking-widest text-orange-700 uppercase">
          Ce qui se passe ensuite
        </span>
        <div className="mt-4 flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <div key={step} className="flex gap-3.5">
              <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-ink text-xs font-semibold text-surface-page">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-text-body">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md bg-blue-800 p-6 text-white">
        <div className="mb-2 text-[17px] font-semibold">Une question avant de vous engager ?</div>
        <p className="mb-4 text-sm leading-relaxed text-white/80">
          Écrivez-nous, nous répondons sous deux jours ouvrés.
        </p>
        <Link
          href="/contact"
          className="inline-flex h-10 items-center rounded-sm border border-white/35 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Nous écrire
        </Link>
      </div>
    </aside>
  );
}
