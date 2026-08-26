"use client";

import { useState, type FormEvent } from "react";
import { PROFILS, STATUTS, DISPOS, INTERETS } from "@/features/rejoindre/data/options";
import {
  FormField,
  TextInput,
  SelectInput,
  TextareaInput,
  CheckboxItem,
  RadioCard,
  SubmitButton,
} from "@/components/features/site/form-controls";
import { FormSidebar } from "@/components/features/rejoindre/form-sidebar";
import { Confirmation } from "@/components/features/rejoindre/confirmation";

export function JoinForm() {
  const [profil, setProfil] = useState<(typeof PROFILS)[number]["value"]>(PROFILS[0].value);
  const [interets, setInterets] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [independance, setIndependance] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleInteret = (label: string, checked: boolean) => {
    setInterets((prev) => (checked ? [...prev, label] : prev.filter((i) => i !== label)));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aucun backend d'adhésion n'est confirmé côté onmec_backend pour l'instant :
    // le formulaire n'envoie rien, il passe simplement à l'état "envoyé".
    setSubmitted(true);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_300px] lg:gap-16">
          {submitted ? (
            <div className="lg:col-span-2">
              <Confirmation />
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-10 sm:gap-12">
                <fieldset>
                  <legend className="mb-5 flex w-full items-baseline gap-3.5 border-b-2 border-ink pb-3">
                    <span className="text-sm font-semibold tabular-nums text-orange-600">01</span>
                    <span className="text-2xl font-semibold tracking-tight text-ink">
                      Votre profil
                    </span>
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {PROFILS.map((p) => (
                      <RadioCard
                        key={p.value}
                        name="profil"
                        label={p.label}
                        desc={p.desc}
                        checked={profil === p.value}
                        onChange={() => setProfil(p.value)}
                      />
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-5 flex w-full items-baseline gap-3.5 border-b-2 border-ink pb-3">
                    <span className="text-sm font-semibold tabular-nums text-orange-600">02</span>
                    <span className="text-2xl font-semibold tracking-tight text-ink">
                      Vos coordonnées
                    </span>
                  </legend>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Nom et prénoms" required>
                      <TextInput name="nom" placeholder="Votre nom complet" required />
                    </FormField>
                    <FormField label="Téléphone" required hint="WhatsApp de préférence">
                      <TextInput name="telephone" placeholder="+225 00 00 00 00 00" required />
                    </FormField>
                    <FormField label="Adresse électronique">
                      <TextInput name="email" type="email" placeholder="vous@exemple.ci" />
                    </FormField>
                    <FormField label="Ville ou commune" required>
                      <TextInput name="ville" placeholder="Abidjan, Bouaké, Daloa…" required />
                    </FormField>
                    <FormField label="Statut">
                      <SelectInput name="statut" defaultValue="">
                        <option value="" disabled>
                          Choisir un statut
                        </option>
                        {STATUTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                    <FormField label="Établissement ou organisation" hint="Si vous en avez un">
                      <TextInput name="organisation" placeholder="Nom de l’établissement" />
                    </FormField>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-5 flex w-full items-baseline gap-3.5 border-b-2 border-ink pb-3">
                    <span className="text-sm font-semibold tabular-nums text-orange-600">03</span>
                    <span className="text-2xl font-semibold tracking-tight text-ink">
                      Votre engagement
                    </span>
                  </legend>
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="mb-3 text-sm font-semibold text-ink">
                        Ce qui vous intéresse
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {INTERETS.map((label) => (
                          <CheckboxItem
                            key={label}
                            label={label}
                            checked={interets.includes(label)}
                            onChange={(checked) => toggleInteret(label, checked)}
                          />
                        ))}
                      </div>
                    </div>
                    <FormField label="Disponibilité">
                      <SelectInput name="disponibilite" defaultValue="">
                        <option value="" disabled>
                          Choisir une disponibilité
                        </option>
                        {DISPOS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                    <FormField
                      label="Pourquoi souhaitez-vous nous rejoindre ?"
                      hint="Quatre lignes suffisent"
                    >
                      <TextareaInput
                        name="motivation"
                        rows={4}
                        placeholder="Dites-nous en quelques phrases ce que vous voulez faire avec le MEC."
                      />
                    </FormField>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-5 flex w-full items-baseline gap-3.5 border-b-2 border-ink pb-3">
                    <span className="text-sm font-semibold tabular-nums text-orange-600">04</span>
                    <span className="text-2xl font-semibold tracking-tight text-ink">
                      Validation
                    </span>
                  </legend>
                  <div className="flex flex-col gap-3.5">
                    <CheckboxItem
                      label="J’accepte d’être contacté par le MEC au sujet de mon engagement."
                      checked={consent}
                      onChange={setConsent}
                    />
                    <CheckboxItem
                      label="Je reconnais que le MEC est indépendant de tout parti politique."
                      checked={independance}
                      onChange={setIndependance}
                    />
                    <div className="mt-2.5 flex flex-wrap items-center gap-4">
                      <SubmitButton disabled={!consent || !independance}>
                        Envoyer ma demande
                      </SubmitButton>
                      <span className="text-sm text-text-muted">
                        Aucune cotisation — l’adhésion au MEC est gratuite.
                      </span>
                    </div>
                  </div>
                </fieldset>
              </form>
              <FormSidebar />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
