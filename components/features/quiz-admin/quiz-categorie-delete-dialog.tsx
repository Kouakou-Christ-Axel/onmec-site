"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";

interface QuizCategorieDeleteDialogProps {
  categorie: QuizCategorie | null;
  categories: QuizCategorie[];
  onClose: () => void;
  onConfirm: (reassignTo?: string) => void;
  pending: boolean;
}

export function QuizCategorieDeleteDialog({
  categorie,
  categories,
  onClose,
  onConfirm,
  pending,
}: QuizCategorieDeleteDialogProps) {
  const [reassignTo, setReassignTo] = useState("");
  const hasQuiz = (categorie?.quizCount ?? 0) > 0;
  const autres = categories.filter((c) => c.id !== categorie?.id);

  function handleClose() {
    setReassignTo("");
    onClose();
  }

  return (
    <Dialog open={categorie !== null} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            Supprimer « {categorie?.nom ?? ""} » ?
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        {hasQuiz ? (
          <>
            <span className="flex items-start gap-3 text-sm text-text-body">
              <AlertTriangle className="mt-0.5 h-4.5 w-4.5 flex-none text-verdict-false" aria-hidden />
              {categorie?.quizCount} quiz{(categorie?.quizCount ?? 0) > 1 ? " sont" : " est"}{" "}
              encore rattaché{(categorie?.quizCount ?? 0) > 1 ? "s" : ""} à cette catégorie.
              Choisissez où les déplacer avant suppression.
            </span>
            <Field label="Réaffecter les quiz à">
              <Select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                <option value="">Sélectionner une catégorie</option>
                {autres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : (
          <p className="text-sm text-text-body">
            Aucun quiz n’y est rattaché : la suppression est sans effet de bord.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button
          variant="primary"
          disabled={pending || (hasQuiz && !reassignTo)}
          onClick={() => onConfirm(reassignTo || undefined)}
        >
          {pending ? "…" : hasQuiz ? "Réaffecter puis supprimer" : "Supprimer définitivement"}
        </Button>
        <Button variant="ghost" onClick={handleClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
