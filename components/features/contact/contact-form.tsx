"use client";

import { useState, type FormEvent } from "react";
import { OBJETS_CONTACT } from "@/features/contact/data/content";
import {
  FormField,
  TextInput,
  SelectInput,
  TextareaInput,
  CheckboxItem,
} from "@/components/features/site/form-controls";
import { ContactConfirmation } from "@/components/features/contact/contact-confirmation";

export function ContactForm() {
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aucune route /api/contact n'est créée : aucun endpoint backend n'est confirmé côté
    // onmec_backend pour l'instant. Le formulaire n'envoie rien, il passe simplement à
    // l'état "envoyé" — même règle que join-form.tsx et download-dialog.tsx.
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setConsent(false);
  };

  return (
    <div className="rounded-md border border-ink/10 bg-surface-card p-7 sm:p-10">
      {submitted ? (
        <ContactConfirmation onReset={reset} />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Formulaire de contact
            </h2>
            <p className="mt-1.5 text-sm text-text-muted">
              Les champs marqués d’une étoile sont obligatoires.
            </p>
          </div>

          <FormField label="Objet de votre message" required>
            <SelectInput name="objet" defaultValue="" required>
              <option value="" disabled>
                Choisir un objet
              </option>
              {OBJETS_CONTACT.map((objet) => (
                <option key={objet} value={objet}>
                  {objet}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Nom et prénoms" required>
              <TextInput name="nom" placeholder="Votre nom" required />
            </FormField>
            <FormField label="Organisation" hint="Établissement, média, association">
              <TextInput name="organisation" placeholder="Si vous en avez une" />
            </FormField>
            <FormField label="Adresse électronique" required>
              <TextInput
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.ci"
                required
              />
            </FormField>
            <FormField label="Téléphone" hint="WhatsApp de préférence">
              <TextInput name="telephone" placeholder="+225" />
            </FormField>
          </div>

          <FormField
            label="Votre message"
            required
            hint="Cinq lignes suffisent. Précisez une date si votre demande en dépend."
          >
            <TextareaInput
              name="message"
              rows={6}
              placeholder="Dites-nous ce dont vous avez besoin"
              required
            />
          </FormField>

          <CheckboxItem
            label="J’accepte que le MEC conserve mes coordonnées pour traiter cette demande."
            checked={consent}
            onChange={setConsent}
          />

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={!consent}
              className="inline-flex h-[54px] w-fit items-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Envoyer le message <span>→</span>
            </button>
            <span className="text-sm text-text-muted">
              Vos coordonnées ne servent qu’à cette réponse. Aucun envoi commercial.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
