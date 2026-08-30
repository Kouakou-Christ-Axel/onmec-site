"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { computeQuizScore } from "@/features/quiz-admin/lib/compute-quiz-score";
import type { QuizQuestion } from "@/features/quiz-admin/types/quiz-admin";

interface QuizPreviewOverlayProps {
  onClose: () => void;
  questions: QuizQuestion[];
}

/**
 * Plein écran opaque, même échelle que l'éditeur d'article (z-95) : simule le rendu mobile de
 * l'application Citoyen+ pour que l'admin prévisualise le quiz avant publication. Pas d'appel
 * réseau — la notation reprend le simulateur client `compute-quiz-score.ts`.
 */
export function QuizPreviewOverlay({ onClose, questions }: QuizPreviewOverlayProps) {
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [termine, setTermine] = useState(false);

  function reset() {
    setStep(0);
    setReponses({});
    setTermine(false);
  }

  const question = questions[step];
  const choixId = question ? reponses[question.id ?? String(step)] : undefined;
  const repondu = choixId !== undefined;

  function choisir(id: string) {
    if (!question) return;
    setReponses((prev) => ({ ...prev, [question.id ?? String(step)]: id }));
  }

  function suivant() {
    if (step + 1 < questions.length) setStep(step + 1);
    else setTermine(true);
  }

  const resultat = termine ? computeQuizScore(questions, reponses) : null;

  return (
    <div className="fixed inset-0 z-95 flex flex-col items-center gap-4.5 overflow-y-auto bg-blue-800 p-5.5">
      <div className="flex w-full max-w-[900px] flex-wrap items-center justify-between gap-3.5">
        <span className="flex flex-col gap-0.75">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-400 uppercase">
            Aperçu membre
          </span>
          <span className="text-base font-semibold text-white">Citoyen+</span>
        </span>
        <span className="flex items-center gap-2.5">
          {termine ? (
            <Button variant="outline-invert" size="sm" onClick={reset}>
              Recommencer
            </Button>
          ) : null}
          <Button variant="invert" size="sm" onClick={onClose}>
            Fermer l’aperçu
          </Button>
        </span>
      </div>

      <div className="flex w-full max-w-83 flex-col overflow-hidden rounded-3xl bg-white shadow-overlay">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4.5 py-3">
          <span className="text-[0.8125rem] font-semibold text-ink">Citoyen+</span>
          <IconButton icon={X} label="Fermer" size="sm" onClick={onClose} />
        </div>
        <div className="flex min-h-105 flex-col gap-4 p-4.5">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ajoutez au moins une question.</p>
          ) : termine && resultat ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
              <span className="text-3xl font-semibold text-ink">
                {resultat.score} / {resultat.total}
              </span>
              <span className="text-sm text-muted-foreground">Score en cours</span>
            </div>
          ) : question ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold tracking-[0.1em] text-orange-500 uppercase">
                  Question {step + 1} sur {questions.length}
                </span>
                <span className="block h-1.25 overflow-hidden rounded-full bg-ink/8">
                  <span
                    className="block h-full bg-orange-500 transition-all"
                    style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  />
                </span>
              </div>
              <p className="text-[1.1875rem] leading-[1.3] font-semibold tracking-[-0.02em] text-ink">
                {question.texte}
              </p>
              <div className="flex flex-col gap-2.25">
                {question.choix.map((choix) => {
                  const isSelected = choixId === choix.id;
                  const showState = repondu;
                  return (
                    <button
                      key={choix.id}
                      type="button"
                      disabled={repondu}
                      onClick={() => choix.id && choisir(choix.id)}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                        !showState && "border-border-subtle hover:border-border-strong",
                        showState && choix.correct && "border-verdict-true bg-verdict-true-bg",
                        showState &&
                          !choix.correct &&
                          isSelected &&
                          "border-verdict-false bg-verdict-false-bg",
                        showState &&
                          !choix.correct &&
                          !isSelected &&
                          "border-border-subtle opacity-60",
                      )}
                    >
                      {choix.texte}
                    </button>
                  );
                })}
              </div>
              {repondu ? (
                <div className="mt-auto flex flex-col gap-2.5 pt-1">
                  {step + 1 === questions.length ? (
                    <span className="text-[13px] font-semibold text-verdict-true">
                      Dernière question — la soumission enverrait POST /quizz/submit
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={suivant}
                    className="w-full rounded-[10px] bg-orange-500 py-3.25 text-[15px] font-semibold text-white"
                  >
                    {step + 1 < questions.length ? "Question suivante" : "Voir le score"}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
