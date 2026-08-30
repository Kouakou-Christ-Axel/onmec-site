"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, BarChart3, Trash2, Copy, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { Tabs } from "@/components/ui/tabs";
import { LibrairiePagination } from "@/components/features/librairie/librairie-pagination";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useDeleteQuiz } from "@/features/quiz-admin/mutations/use-delete-quiz";
import { useCreateQuiz } from "@/features/quiz-admin/mutations/use-create-quiz";
import { useResults } from "@/features/quiz-admin/queries/use-results";
import { useQuizList } from "@/features/quiz-admin/queries/use-quiz-list";
import { syncUrlParams } from "@/lib/sync-url";
import { QuizDeleteDialog } from "./quiz-delete-dialog";
import { QuizCategoriesClient } from "./quiz-categories-client";
import type {
  QuizAdmin,
  QuizCategorie,
  QuizListResponse,
} from "@/features/quiz-admin/types/quiz-admin";

const DIFFICULTE_LABEL: Record<string, string> = {
  FACILE: "Facile",
  MOYEN: "Moyen",
  DIFFICILE: "Difficile",
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-verdict-true";
  if (score >= 40) return "text-orange-700";
  return "text-verdict-false";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

type QuizTab = "liste" | "categories" | "resultats";

interface QuizAdminClientProps {
  initialTab: QuizTab;
  initialData: QuizListResponse;
  initialCategories: QuizCategorie[];
}

export function QuizAdminClient({
  initialTab,
  initialData,
  initialCategories,
}: QuizAdminClientProps) {
  const shell = useAdminShell();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<QuizTab>(initialTab);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [difficulte, setDifficulte] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<QuizAdmin | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [resultsPage, setResultsPage] = useState(1);
  const removeMutation = useDeleteQuiz();
  const duplicateMutation = useCreateQuiz();
  const resultsQuery = useResults(resultsPage, tab === "resultats");
  const quizQuery = useQuizList({ search: debouncedSearch, categorieId, difficulte, page, initialData });

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    syncUrlParams({
      tab: tab === "liste" ? "" : tab,
      search: debouncedSearch,
      categorieId,
      difficulte,
      page: page > 1 ? String(page) : "",
    });
  }, [tab, debouncedSearch, categorieId, difficulte, page]);

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    removeMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        setPendingDelete(null);
        queryClient.invalidateQueries({ queryKey: ["quiz-list"] });
      },
      onError: () => toast.error("Une erreur est survenue. Réessayez."),
    });
  }

  function handleDuplicate(quiz: QuizAdmin) {
    setDuplicatingId(quiz.id);
    duplicateMutation.mutate(
      {
        titre: `${quiz.titre} (copie)`,
        description: quiz.description || undefined,
        categorieId: quiz.categorieId || undefined,
        difficulte: quiz.difficulte || undefined,
        questions: quiz.questions.map((q) => ({
          texte: q.texte,
          choix: q.choix.map((c) => ({ texte: c.texte, correct: c.correct })),
        })),
      },
      {
        onSuccess: () => {
          setDuplicatingId(null);
          queryClient.invalidateQueries({ queryKey: ["quiz-list"] });
        },
        onError: () => {
          setDuplicatingId(null);
          toast.error("Une erreur est survenue. Réessayez.");
        },
      },
    );
  }

  const data = quizQuery.data ?? initialData;

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Espace membre
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Quiz
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">{data.meta.total} quiz</p>
        </div>
        {shell.canQuiz && tab === "liste" ? (
          <Button variant="primary" icon={Plus} onClick={() => router.push("/admin/quiz/nouveau")}>
            Créer un quiz
          </Button>
        ) : null}
      </div>

      <Tabs
        items={[
          { value: "liste", label: "Liste" },
          { value: "categories", label: "Catégories" },
          { value: "resultats", label: "Résultats" },
        ]}
        value={tab}
        onChange={(next) => setTab(next as QuizTab)}
      />

      {tab === "categories" ? (
        <QuizCategoriesClient initialCategories={initialCategories} />
      ) : tab === "resultats" ? (
        <>
          {resultsQuery.isLoading ? (
            <p className="rounded-lg border border-border-subtle bg-surface-card px-4 py-8 text-center text-sm text-muted-foreground">
              Chargement…
            </p>
          ) : !resultsQuery.data || resultsQuery.data.data.length === 0 ? (
            <p className="rounded-lg border border-border-subtle bg-surface-card px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune tentative pour l’instant.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[190px_minmax(0,1fr)_80px_96px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
                  <span>Membre</span>
                  <span>Quiz</span>
                  <span className="text-right">Score</span>
                  <span className="text-right">Date</span>
                </div>
                {resultsQuery.data.data.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[190px_minmax(0,1fr)_80px_96px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="truncate font-medium text-ink">{r.userNom}</span>
                    <span className="truncate text-[0.8125rem] text-muted-foreground">
                      {r.quizTitre}
                    </span>
                    <span className={`text-right font-semibold tabular-nums ${scoreColor(r.score)}`}>
                      {Math.round(r.score)}%
                    </span>
                    <span className="text-right text-[0.8125rem] text-muted-foreground tabular-nums">
                      {formatDate(r.completedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {resultsQuery.data ? (
            <LibrairiePagination
              page={resultsQuery.data.meta.page}
              totalPages={resultsQuery.data.meta.totalPages}
              onChange={setResultsPage}
            />
          ) : null}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un titre, une description"
              className="w-full max-w-67"
            />
            <Select
              value={categorieId}
              onChange={(e) => {
                setCategorieId(e.target.value);
                setPage(1);
              }}
              className="w-52"
            >
              <option value="">Toutes catégories</option>
              {initialCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </Select>
            <Select
              value={difficulte}
              onChange={(e) => {
                setDifficulte(e.target.value);
                setPage(1);
              }}
              className="w-45"
            >
              <option value="">Toutes difficultés</option>
              <option value="FACILE">Facile</option>
              <option value="MOYEN">Moyen</option>
              <option value="DIFFICILE">Difficile</option>
            </Select>
          </div>

          {data.data.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border-subtle bg-surface-card px-5 py-12 text-center">
              <ListChecks className="h-8 w-8 text-blue-500" aria-hidden />
              <p className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                Aucun quiz pour l’instant
              </p>
              <p className="max-w-[52ch] text-sm text-muted-foreground">
                Un quiz se compose d’un titre, d’une catégorie et de questions à choix unique.
              </p>
              {shell.canQuiz ? (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => router.push("/admin/quiz/nouveau")}
                >
                  Créer le premier quiz
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[minmax(0,1fr)_152px_112px_88px_100px_104px_170px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
                  <span>Titre</span>
                  <span>Catégorie</span>
                  <span>Difficulté</span>
                  <span className="text-right">Questions</span>
                  <span className="text-right">Tentatives</span>
                  <span className="text-right">Score moyen</span>
                  <span className="text-right">Actions</span>
                </div>
                {data.data.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => router.push(`/admin/quiz/${quiz.id}/statistiques`)}
                    title="Voir les statistiques du quiz"
                    className="grid cursor-pointer grid-cols-[minmax(0,1fr)_152px_112px_88px_100px_104px_170px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0 hover:bg-n-50"
                  >
                    <span className="truncate font-medium text-ink">{quiz.titre}</span>
                    <span className="truncate text-[0.8125rem] text-muted-foreground">
                      {quiz.categorie?.nom ?? "—"}
                    </span>
                    <span>
                      {quiz.difficulte ? <Tag>{DIFFICULTE_LABEL[quiz.difficulte]}</Tag> : "—"}
                    </span>
                    <span className="text-right text-[0.8125rem] text-muted-foreground tabular-nums">
                      {quiz.questions.length}
                    </span>
                    <span className="text-right text-[0.8125rem] text-muted-foreground tabular-nums">
                      {quiz.totalAttempts}
                    </span>
                    <span
                      className={`text-right font-semibold tabular-nums ${quiz.totalAttempts > 0 ? scoreColor(quiz.averageScore) : "text-muted-foreground"}`}
                    >
                      {quiz.totalAttempts > 0 ? `${Math.round(quiz.averageScore)}%` : "—"}
                    </span>
                    <span
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {shell.canQuiz ? (
                        <>
                          <IconButton
                            icon={BarChart3}
                            label="Voir les statistiques"
                            size="sm"
                            onClick={() => router.push(`/admin/quiz/${quiz.id}/statistiques`)}
                          />
                          <IconButton
                            icon={Pencil}
                            label="Éditer le quiz"
                            size="sm"
                            onClick={() => router.push(`/admin/quiz/${quiz.id}/modifier`)}
                          />
                          <IconButton
                            icon={Copy}
                            label="Dupliquer le quiz"
                            size="sm"
                            disabled={duplicatingId === quiz.id}
                            onClick={() => handleDuplicate(quiz)}
                          />
                          <IconButton
                            icon={Trash2}
                            label="Supprimer le quiz"
                            size="sm"
                            onClick={() => setPendingDelete(quiz)}
                          />
                        </>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <LibrairiePagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      )}

      <QuizDeleteDialog
        quiz={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        pending={removeMutation.isPending}
      />
    </div>
  );
}
