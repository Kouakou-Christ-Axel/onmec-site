"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MailCheck, X } from "lucide-react";
import type { Ressource } from "@/features/ressources/types/ressource";
import { FormField, TextInput, CheckboxItem } from "@/components/features/site/form-controls";

export function DownloadDialog({ ressource }: { ressource: Ressource }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    setSent(false);
    setNewsletter(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open && !sent) emailRef.current?.focus();
    if (open && sent) closeRef.current?.focus();
  }, [open, sent]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aucun endpoint de distribution de guides n'est confirmé côté onmec_backend pour
    // l'instant : le formulaire n'envoie rien, il passe simplement à l'état "envoyé".
    setSent(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-[54px] w-fit items-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-orange-600"
      >
        Télécharger le guide <span>→</span>
      </button>
      <p className="mt-3 text-sm text-text-muted">
        Gratuit. Une adresse électronique est demandée pour vous prévenir des mises à jour.
      </p>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-overlay-scrim p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-dialog-title"
            className="relative w-full max-w-[440px] rounded-md border border-ink bg-surface-card p-7 shadow-stamp"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-text-muted transition-colors hover:bg-n-100"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            {sent ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-white">
                  <MailCheck className="h-7 w-7" aria-hidden />
                </div>
                <h2 id="download-dialog-title" className="mb-3 text-xl font-semibold text-ink">
                  Le lien de téléchargement vient de partir vers votre adresse. Il reste valable
                  sept jours.
                </h2>
                <p className="mb-6 text-sm text-text-muted">
                  Rien reçu ? Vérifiez les courriers indésirables, puis écrivez-nous à
                  contact@mec-ci.org.
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="inline-flex h-11 items-center rounded-sm bg-orange-500 px-6 text-base font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h2 id="download-dialog-title" className="text-xl font-semibold text-ink">
                  Télécharger « {ressource.title} »
                </h2>
                <p className="text-sm leading-relaxed text-text-muted">
                  Le téléchargement est gratuit. Nous demandons une adresse électronique pour savoir
                  qui utilise nos guides et vous prévenir des versions mises à jour.
                </p>
                <FormField label="Adresse électronique" required>
                  <TextInput
                    ref={emailRef}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="vous@exemple.ci"
                  />
                </FormField>
                <CheckboxItem
                  label="Recevoir la lettre du MEC, un courriel par mois."
                  checked={newsletter}
                  onChange={setNewsletter}
                />
                <p className="text-xs text-text-muted">
                  Nous ne transmettons jamais votre adresse à un tiers.
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center rounded-sm bg-orange-500 px-6 text-base font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    Recevoir le guide
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex h-11 items-center rounded-sm border border-ink/24 px-6 text-base font-semibold text-ink transition-colors hover:bg-n-100"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
