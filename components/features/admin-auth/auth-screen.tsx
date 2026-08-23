"use client";

import { useState } from "react";
import { ConnexionView } from "@/components/features/admin-auth/connexion-view";
import { InscriptionView } from "@/components/features/admin-auth/inscription-view";
import { AttenteView } from "@/components/features/admin-auth/attente-view";
import { ExpireView } from "@/components/features/admin-auth/expire-view";

type AuthStep = "connexion" | "inscription" | "attente" | "expire";

const DEMO_EMAIL = "aminata.traore@mec-ci.org";

export function AuthScreen() {
  const [step, setStep] = useState<AuthStep>("connexion");

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center overflow-y-auto bg-ink px-5 py-10">
      <div className="relative m-auto flex w-full max-w-103 flex-col items-center gap-5.5">
        <div className="w-full rounded-lg bg-white p-9 shadow-overlay">
          <img src="/assets/logo/mec-lockup.png" alt="MEC" className="mb-6.5 h-8 w-auto" />
          {step === "connexion" ? (
            <ConnexionView onGoInscription={() => setStep("inscription")} />
          ) : null}
          {step === "inscription" ? (
            <InscriptionView
              onGoConnexion={() => setStep("connexion")}
              onSubmit={() => setStep("attente")}
            />
          ) : null}
          {step === "attente" ? (
            <AttenteView email={DEMO_EMAIL} onGoConnexion={() => setStep("connexion")} />
          ) : null}
          {step === "expire" ? (
            <ExpireView email={DEMO_EMAIL} onGoConnexion={() => setStep("connexion")} />
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-xs text-white/40">
            mec-ci.org/admin · accès réservé à l’équipe du MEC, non référencé depuis le site public
          </span>
          <span className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setStep("connexion")}
              className={`text-xs ${step === "connexion" ? "text-white" : "text-white/42"} hover:text-orange-400`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setStep("inscription")}
              className={`text-xs ${step === "inscription" ? "text-white" : "text-white/42"} hover:text-orange-400`}
            >
              Inscription
            </button>
            <button
              type="button"
              onClick={() => setStep("attente")}
              className={`text-xs ${step === "attente" ? "text-white" : "text-white/42"} hover:text-orange-400`}
            >
              En attente
            </button>
            <button
              type="button"
              onClick={() => setStep("expire")}
              className={`text-xs ${step === "expire" ? "text-white" : "text-white/42"} hover:text-orange-400`}
            >
              Session expirée
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
