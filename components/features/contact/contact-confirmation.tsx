import Link from "next/link";
import { MailCheck } from "lucide-react";

export function ContactConfirmation({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-8 text-center sm:py-12">
      <MailCheck className="mx-auto mb-6 h-10 w-10 text-orange-500" aria-hidden />
      <h2 className="mb-3 text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
        Message reçu
      </h2>
      <p className="mx-auto mb-7 max-w-[46ch] text-lg leading-relaxed text-text-muted">
        Nous vous répondons sous trois jours ouvrés à l’adresse indiquée. Une copie vient de vous
        être envoyée.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center rounded-sm border border-ink/24 px-6 text-base font-semibold text-ink transition-colors hover:bg-n-100"
        >
          Écrire un autre message
        </button>
        <Link
          href="/ressources"
          className="inline-flex h-11 items-center rounded-sm px-6 text-base font-semibold text-ink transition-colors hover:bg-n-100"
        >
          Parcourir les ressources
        </Link>
      </div>
    </div>
  );
}
