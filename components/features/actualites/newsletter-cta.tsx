"use client";

import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Reveal } from "@/components/features/site/reveal";
import { TextInput } from "@/components/features/site/form-controls";

export function NewsletterCta() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aucun endpoint de newsletter n'est confirmé côté onmec_backend pour l'instant :
    // le formulaire n'envoie rien, il passe simplement à l'état "envoyé".
    setSent(true);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="flex flex-col items-start gap-8 rounded-md border border-ink bg-surface-card p-7 shadow-stamp sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
          <div>
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Newsletter
            </span>
            <h2 className="mt-3.5 text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
              La lettre du MEC, chaque mois
            </h2>
            <p className="mt-3.5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-text-muted">
              Un courriel par mois avec nos comptes rendus d’activités, les prochaines campagnes et
              une ressource à télécharger.
            </p>
          </div>
          {sent ? (
            <p className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
              <MailCheck className="h-5 w-5 text-orange-600" aria-hidden /> Inscription confirmée,
              merci !
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"
            >
              <div className="w-full sm:w-[260px]">
                <TextInput
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="vous@exemple.ci"
                  aria-label="Adresse électronique"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 flex-none items-center justify-center rounded-sm bg-orange-500 px-6 text-base font-semibold whitespace-nowrap text-white transition-colors hover:bg-orange-600"
              >
                S’abonner
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
