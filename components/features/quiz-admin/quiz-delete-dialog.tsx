"use client";

import { ConfirmDialog } from "@/components/ui/alert-dialog";
import type { QuizAdmin } from "@/features/quiz-admin/types/quiz-admin";

interface QuizDeleteDialogProps {
  quiz: QuizAdmin | null;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}

export function QuizDeleteDialog({ quiz, onClose, onConfirm, pending }: QuizDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={quiz !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      onConfirm={onConfirm}
      title={`Supprimer « ${quiz?.titre ?? ""} » ?`}
      description="Cette action est définitive."
      confirmLabel="Supprimer définitivement"
      destructive
      confirmPending={pending}
    />
  );
}
