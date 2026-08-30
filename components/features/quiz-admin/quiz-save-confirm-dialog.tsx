"use client";

import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useOverlayContainer } from "@/components/ui/dialog";

interface QuizSaveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
  changes: string[];
  totalAttempts: number;
}

export function QuizSaveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
  changes,
  totalAttempts,
}: QuizSaveConfirmDialogProps) {
  const container = useOverlayContainer();

  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal container={container}>
        <RadixAlertDialog.Overlay
          className={cn(
            "fixed inset-0 z-90 grid place-items-center overflow-y-auto bg-overlay-scrim p-6",
            "data-[state=open]:animate-mec-fade data-[state=closed]:animate-mec-fade-out",
          )}
        >
          <RadixAlertDialog.Content
            className={cn(
              "relative flex w-full max-w-[min(520px,94vw)] flex-col rounded-lg border border-border-strong bg-surface-page shadow-overlay",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "data-[state=open]:animate-mec-rise data-[state=closed]:animate-mec-sink",
            )}
          >
            <div className="rounded-t-lg border-b border-border-subtle bg-surface-card px-5.5 py-5">
              <RadixAlertDialog.Title className="text-xl font-semibold tracking-[-0.024em] text-ink">
                Enregistrer les modifications ?
              </RadixAlertDialog.Title>
            </div>
            <div className="flex flex-col gap-4.5 p-5.5">
              {changes.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {changes.map((change) => (
                    <li
                      key={change}
                      className="rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-body"
                    >
                      {change}
                    </li>
                  ))}
                </ul>
              ) : null}
              {totalAttempts > 0 ? (
                <Alert tone="warning" title="Des membres ont déjà répondu à ce quiz">
                  {totalAttempts} membre{totalAttempts > 1 ? "s ont" : " a"} déjà passé ce quiz.
                  Modifier les questions changera l’expérience pour les prochaines tentatives ; les
                  scores déjà obtenus sont conservés.
                </Alert>
              ) : null}
            </div>
            <div className="flex items-center gap-2.5 rounded-b-lg border-t border-border-subtle bg-surface-card px-5.5 py-4">
              <RadixAlertDialog.Action asChild>
                <Button
                  variant="primary"
                  disabled={pending}
                  onClick={(event) => {
                    event.preventDefault();
                    onConfirm();
                  }}
                >
                  {pending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </RadixAlertDialog.Action>
              <RadixAlertDialog.Cancel asChild>
                <Button variant="ghost">Revenir au brouillon</Button>
              </RadixAlertDialog.Cancel>
            </div>
          </RadixAlertDialog.Content>
        </RadixAlertDialog.Overlay>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
