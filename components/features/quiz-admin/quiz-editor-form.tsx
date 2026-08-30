"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, PencilLine, Check } from "lucide-react";
import { getJson } from "@/lib/fetch-json";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/quiz-admin/queries/use-categories";
import { useCreateQuiz } from "@/features/quiz-admin/mutations/use-create-quiz";
import { useUpdateQuiz } from "@/features/quiz-admin/mutations/use-update-quiz";
import { quizFormSchema } from "@/features/quiz-admin/schemas/quiz-form-schema";
import { questionSchema } from "@/features/quiz-admin/schemas/question-schema";
import { QuizQuestionEditor } from "./quiz-question-editor";
import { QuizPreviewOverlay } from "./quiz-preview-dialog";
import { QuizSaveConfirmDialog } from "./quiz-save-confirm-dialog";
import type {
  QuizAdmin,
  QuizDifficulte,
  QuizQuestion,
} from "@/features/quiz-admin/types/quiz-admin";
import type { QuizStatsWithAttempts } from "@/features/quiz-admin/requests/get-quiz-stats";

const DIFFICULTE_LABEL: Record<QuizDifficulte, string> = {
  FACILE: "Facile",
  MOYEN: "Moyen",
  DIFFICILE: "Difficile",
};

function emptyQuestion(): QuizQuestion {
  return {
    texte: "",
    choix: [
      { texte: "", correct: false },
      { texte: "", correct: false },
    ],
  };
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface QuizEditorFormProps {
  quiz: QuizAdmin | null;
}

export function QuizEditorForm({ quiz }: QuizEditorFormProps) {
  const router = useRouter();
  const [titre, setTitre] = useState(quiz?.titre ?? "");
  const [description, setDescription] = useState(quiz?.description ?? "");
  const [categorieId, setCategorieId] = useState(quiz?.categorieId ?? "");
  const [difficulte, setDifficulte] = useState<QuizDifficulte | "">(quiz?.difficulte ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz?.questions ?? []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const categoriesQuery = useCategories();
  const statsQuery = useQuery({
    queryKey: ["quiz", quiz?.id, "stats"],
    queryFn: () => getJson<QuizStatsWithAttempts>(`/api/admin/quiz/${quiz?.id}/statistiques`),
    enabled: !!quiz,
  });

  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();

  const titreModifie = titre !== (quiz?.titre ?? "");
  const descriptionModifiee = description !== (quiz?.description ?? "");
  const categorieModifiee = categorieId !== (quiz?.categorieId ?? "");
  const difficulteModifiee = difficulte !== (quiz?.difficulte ?? "");
  const questionsModifiees = JSON.stringify(questions) !== JSON.stringify(quiz?.questions ?? []);
  const modifie =
    titreModifie || descriptionModifiee || categorieModifiee || difficulteModifiee ||
    questionsModifiees;

  const categorieNomChoisie = categoriesQuery.data?.find((c) => c.id === categorieId)?.nom;
  const changes = [
    titreModifie ? "Titre modifié" : null,
    descriptionModifiee ? "Description modifiée" : null,
    categorieModifiee
      ? `Catégorie ${categorieNomChoisie ? `→ ${categorieNomChoisie}` : "retirée"}`
      : null,
    difficulteModifiee
      ? `Difficulté ${difficulte ? `→ ${DIFFICULTE_LABEL[difficulte]}` : "retirée"}`
      : null,
    questionsModifiees ? `${questions.length} question${questions.length > 1 ? "s" : ""}` : null,
  ].filter((c): c is string => c !== null);

  function resetChanges() {
    setTitre(quiz?.titre ?? "");
    setDescription(quiz?.description ?? "");
    setCategorieId(quiz?.categorieId ?? "");
    setDifficulte(quiz?.difficulte ?? "");
    setQuestions(quiz?.questions ?? []);
  }

  function buildPayload() {
    return quizFormSchema.safeParse({
      titre,
      description: description || undefined,
      categorieId: categorieId || undefined,
      difficulte: difficulte || undefined,
      questions,
    });
  }

  function save() {
    const parsed = buildPayload();
    if (!parsed.success) return;
    const onSuccess = () => router.push("/admin/quiz");
    if (quiz) {
      updateMutation.mutate({ id: quiz.id, ...parsed.data }, { onSuccess });
    } else {
      createMutation.mutate(parsed.data, { onSuccess });
    }
    setConfirmOpen(false);
  }

  function handleSaveClick() {
    const parsed = buildPayload();
    if (!parsed.success) return;
    if (quiz && ((statsQuery.data?.totalAttempts ?? 0) > 0 || changes.length > 0)) {
      setConfirmOpen(true);
    } else {
      save();
    }
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const valid = buildPayload().success;

  return (
    <div className="flex max-w-[940px] flex-col gap-5.5">
      <div className="flex flex-wrap items-start justify-between gap-4.5">
        <h1 className="text-[1.625rem] leading-[1.12] font-semibold tracking-[-0.026em] text-ink">
          {quiz ? "Modifier le quiz" : "Nouveau quiz"}
        </h1>
        <span className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setPreviewOpen(true)}
            disabled={questions.length === 0}
          >
            Prévisualiser
          </Button>
          <Button variant="primary" disabled={!valid || pending} onClick={handleSaveClick}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3.5 rounded-lg border border-border-strong px-4 py-3">
        <span className="flex items-center gap-2">
          {modifie ? (
            <PencilLine className="h-4.5 w-4.5 text-orange-600" aria-hidden />
          ) : (
            <Check className="h-4.5 w-4.5 text-muted-foreground" aria-hidden />
          )}
          <span className="text-[0.8125rem] font-semibold text-ink">
            {modifie ? "Modifications non enregistrées" : "À jour"}
          </span>
        </span>
        {modifie ? (
          <Button variant="ghost" size="sm" className="ml-auto" onClick={resetChanges}>
            Annuler mes changements
          </Button>
        ) : null}
      </div>

      <div className="flex max-w-[940px] flex-col gap-4.5 rounded-lg border border-border-subtle bg-surface-card p-5.5">
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
          Métadonnées
        </span>
        <Field label="Titre">
          <Input value={titre} onChange={(e) => setTitre(e.target.value)} disabled={pending} />
        </Field>
        <Field label="Description" hint="Facultatif">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Catégorie">
            <Select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              disabled={pending || categoriesQuery.isLoading}
            >
              <option value="">Aucune</option>
              {(categoriesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Difficulté">
            <Select
              value={difficulte}
              onChange={(e) => setDifficulte(e.target.value as QuizDifficulte | "")}
              disabled={pending}
            >
              <option value="">Non définie</option>
              <option value="FACILE">Facile</option>
              <option value="MOYEN">Moyen</option>
              <option value="DIFFICILE">Difficile</option>
            </Select>
          </Field>
        </div>
      </div>

      <div className="flex max-w-[940px] flex-col gap-3.5 rounded-lg border border-dashed border-border-strong bg-n-50 p-5">
        <span className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Questions
          </span>
          <span className="text-[0.8125rem] text-muted-foreground">
            {questions.length} question{questions.length > 1 ? "s" : ""}
          </span>
        </span>

        {questions.length === 0 ? (
          <p className="m-0 rounded-lg border border-border-subtle bg-surface-card p-5.5 text-sm text-muted-foreground">
            Aucune question. Un quiz sans question est refusé à la soumission côté serveur.
          </p>
        ) : (
          questions.map((question, index) => {
            const result = questionSchema.safeParse(question);
            const invalidMessage = result.success
              ? undefined
              : result.error.issues[0]?.message;
            return (
              <QuizQuestionEditor
                key={index}
                question={question}
                index={index}
                invalidMessage={invalidMessage}
                isFirst={index === 0}
                isLast={index === questions.length - 1}
                onChange={(next) =>
                  setQuestions((prev) => prev.map((q, i) => (i === index ? next : q)))
                }
                onRemove={() => setQuestions((prev) => prev.filter((_, i) => i !== index))}
                onMoveUp={() => setQuestions((prev) => moveItem(prev, index, index - 1))}
                onMoveDown={() => setQuestions((prev) => moveItem(prev, index, index + 1))}
              />
            );
          })
        )}
        <Button variant="secondary" icon={Plus} full onClick={addQuestion}>
          Ajouter une question
        </Button>
      </div>

      {previewOpen ? (
        <QuizPreviewOverlay onClose={() => setPreviewOpen(false)} questions={questions} />
      ) : null}
      <QuizSaveConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={save}
        pending={pending}
        changes={changes}
        totalAttempts={statsQuery.data?.totalAttempts ?? 0}
      />
    </div>
  );
}
