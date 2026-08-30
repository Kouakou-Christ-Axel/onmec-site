"use client";

import { ChevronUp, ChevronDown, Trash2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/components/ui/cn";
import type { QuizQuestion } from "@/features/quiz-admin/types/quiz-admin";

interface QuizQuestionEditorProps {
  question: QuizQuestion;
  index: number;
  invalidMessage?: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (question: QuizQuestion) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuizQuestionEditor({
  question,
  index,
  invalidMessage,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: QuizQuestionEditorProps) {
  function updateChoix(choixIndex: number, texte: string) {
    const choix = question.choix.map((c, i) => (i === choixIndex ? { ...c, texte } : c));
    onChange({ ...question, choix });
  }

  function setCorrect(choixIndex: number) {
    const choix = question.choix.map((c, i) => ({ ...c, correct: i === choixIndex }));
    onChange({ ...question, choix });
  }

  function addChoix() {
    onChange({ ...question, choix: [...question.choix, { texte: "", correct: false }] });
  }

  function removeChoix(choixIndex: number) {
    onChange({ ...question, choix: question.choix.filter((_, i) => i !== choixIndex) });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-surface-card p-4",
        invalidMessage ? "border-verdict-false" : "border-border-subtle",
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="min-w-5 text-xs font-bold text-ink tabular-nums">{index + 1}</span>
        {invalidMessage ? (
          <span className="text-xs font-semibold text-verdict-false">{invalidMessage}</span>
        ) : null}
        <span className="ml-auto flex items-center gap-0.5">
          <IconButton
            icon={ChevronUp}
            label="Monter la question"
            size="sm"
            disabled={isFirst}
            onClick={onMoveUp}
          />
          <IconButton
            icon={ChevronDown}
            label="Descendre la question"
            size="sm"
            disabled={isLast}
            onClick={onMoveDown}
          />
          <IconButton icon={Trash2} label="Supprimer la question" size="sm" onClick={onRemove} />
        </span>
      </div>
      <Input
        value={question.texte}
        onChange={(e) => onChange({ ...question, texte: e.target.value })}
        placeholder="Énoncé de la question"
      />
      <div className="flex flex-col gap-1.75">
        {question.choix.map((choix, choixIndex) => (
          <div
            key={choixIndex}
            className={cn(
              "grid grid-cols-[24px_minmax(0,1fr)_32px] items-center gap-2.5 rounded-md border px-2.5 py-1.75",
              choix.correct ? "border-verdict-true" : "border-border-subtle",
            )}
          >
            <input
              type="radio"
              name={`correct-${index}`}
              checked={choix.correct}
              onChange={() => setCorrect(choixIndex)}
              aria-label="Bonne réponse"
              className="h-[18px] w-[18px] accent-orange-500"
            />
            <Input
              value={choix.texte}
              onChange={(e) => updateChoix(choixIndex, e.target.value)}
              placeholder="Texte du choix"
            />
            <IconButton
              icon={X}
              label="Supprimer le choix"
              size="sm"
              onClick={() => removeChoix(choixIndex)}
              disabled={question.choix.length <= 2}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addChoix}
          className="flex w-fit items-center gap-1.5 text-xs font-semibold text-orange-700 hover:underline"
        >
          <Plus size={14} />
          Ajouter un choix
        </button>
        <span className="text-xs text-muted-foreground">
          Le point désigne la bonne réponse — un seul choix correct par question.
        </span>
      </div>
    </div>
  );
}
