"use client";

import { useEffect } from "react";
import { Smartphone, BookOpen, Mail } from "lucide-react";
import { ErrorPageBanner } from "@/components/features/site/error-page-banner";
import { ErrorExploreLinks } from "@/components/features/site/error-explore-links";

const REASSURANCES = [
  { icon: Smartphone, text: "L’application de signalement reste ouverte : vos signalements arrivent normalement." },
  { icon: BookOpen, text: "Les guides déjà téléchargés restent lisibles hors connexion." },
  { icon: Mail, text: "Si l’erreur revient, écrivez à contact@mec-ci.org en indiquant l’heure." },
];

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <ErrorPageBanner
        background="bg-blue-800"
        number="500"
        numberClassName="text-orange-500"
        eyebrow="Erreur de notre côté"
        eyebrowClassName="text-orange-400"
        title={
          <>
            La page n’a pas pu <em className="font-serif font-normal italic">s’afficher</em>
          </>
        }
        description="L’erreur vient de nos serveurs, pas de vous. L’incident est enregistré et notre équipe technique en est informée."
        primary={{ label: "Réessayer", onClick: reset }}
        secondary={{ label: "Retour à l’accueil", href: "/" }}
      />
      <section className="pt-10 sm:pt-16">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <div className="flex max-w-[760px] flex-col gap-4">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Pendant ce temps
            </span>
            <h2 className="text-h3 font-semibold text-ink">Ce qui fonctionne quand même</h2>
            <div className="flex flex-col gap-3.5 border-t border-border-subtle pt-4">
              {REASSURANCES.map((item) => (
                <div key={item.text} className="flex items-start gap-3.5">
                  <item.icon className="mt-0.5 h-5 w-5 flex-none text-blue-500" aria-hidden />
                  <span className="text-base leading-relaxed text-text-body">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ErrorExploreLinks />
    </main>
  );
}
