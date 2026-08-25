import Link from "next/link";
import { Check } from "lucide-react";

export function Confirmation() {
  return (
    <div className="py-8 text-center sm:py-12">
      <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-white">
        <Check className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="mb-3 text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
        Votre demande est enregistrée
      </h2>
      <p className="mx-auto mb-7 max-w-[46ch] text-lg leading-relaxed text-text-muted">
        Nous vous rappelons sous 72 heures pour la formation d’accueil. Aucune cotisation ne vous
        sera demandée.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/actualites"
          className="inline-flex h-11 items-center rounded-sm bg-orange-500 px-6 text-base font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Lire nos actualités
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-sm border border-ink/24 px-6 text-base font-semibold text-ink transition-colors hover:bg-n-100"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
