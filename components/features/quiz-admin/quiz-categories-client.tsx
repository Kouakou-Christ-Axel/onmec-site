"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useDeleteCategorie } from "@/features/quiz-admin/mutations/use-delete-categorie";
import { QuizCategorieDialog } from "./quiz-categorie-dialog";
import { QuizCategorieDeleteDialog } from "./quiz-categorie-delete-dialog";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";

interface QuizCategoriesClientProps {
  initialCategories: QuizCategorie[];
}

export function QuizCategoriesClient({ initialCategories }: QuizCategoriesClientProps) {
  const shell = useAdminShell();
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuizCategorie | null>(null);
  const [pendingDelete, setPendingDelete] = useState<QuizCategorie | null>(null);
  const removeMutation = useDeleteCategorie();

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(categorie: QuizCategorie) {
    setEditing(categorie);
    setDialogOpen(true);
  }

  function handleConfirmDelete(reassignTo?: string) {
    if (!pendingDelete) return;
    removeMutation.mutate(
      { id: pendingDelete.id, reassignTo },
      {
        onSuccess: () => {
          setCategories((prev) => {
            const withoutDeleted = prev.filter((c) => c.id !== pendingDelete.id);
            if (!reassignTo) return withoutDeleted;
            return withoutDeleted.map((c) =>
              c.id === reassignTo
                ? { ...c, quizCount: c.quizCount + pendingDelete.quizCount }
                : c,
            );
          });
          setPendingDelete(null);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Une erreur est survenue. Réessayez.";
          toast.error(message);
        },
      },
    );
  }

  return (
    <div className="flex max-w-[860px] flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[1.0625rem] font-semibold tracking-[-0.014em] text-ink">
          Catégories de quiz
        </span>
        {shell.canQuiz ? (
          <Button variant="secondary" size="sm" icon={Plus} onClick={openCreate}>
            Nouvelle catégorie
          </Button>
        ) : null}
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-border-subtle bg-surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          Aucune catégorie pour l’instant.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[200px_minmax(0,1fr)_84px_88px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
              <span>Nom</span>
              <span>Description</span>
              <span className="text-right">Quiz</span>
              <span className="text-right">Actions</span>
            </div>
            {categories.map((categorie) => (
              <div
                key={categorie.id}
                className="grid grid-cols-[200px_minmax(0,1fr)_84px_88px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
              >
                <span className="truncate font-medium text-ink">{categorie.nom}</span>
                <span className="truncate text-[0.8125rem] text-muted-foreground">
                  {categorie.description ?? "—"}
                </span>
                <span className="text-right tabular-nums text-text-body">
                  {categorie.quizCount}
                </span>
                <span className="flex items-center justify-end gap-1">
                  {shell.canQuiz ? (
                    <>
                      <IconButton
                        icon={Pencil}
                        label="Modifier la catégorie"
                        size="sm"
                        onClick={() => openEdit(categorie)}
                      />
                      <IconButton
                        icon={Trash2}
                        label="Supprimer la catégorie"
                        size="sm"
                        onClick={() => setPendingDelete(categorie)}
                      />
                    </>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <QuizCategorieDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        categorie={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={(saved) => {
          setCategories((prev) => {
            const exists = prev.some((c) => c.id === saved.id);
            return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
          });
        }}
      />

      <QuizCategorieDeleteDialog
        categorie={pendingDelete}
        categories={categories}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        pending={removeMutation.isPending}
      />
    </div>
  );
}
