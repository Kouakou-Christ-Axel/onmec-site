"use client";

import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";
import { useOverlayContainer } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Rend le bouton de confirmation destructif (rouge) — actions de suppression. */
  destructive?: boolean;
  confirmPending?: boolean;
}

/**
 * Modale de confirmation (remplace `window.confirm`). Utilise `@radix-ui/react-alert-dialog`
 * plutôt que `ui/dialog.tsx` : Escape et clic extérieur ne ferment pas une alert dialog par défaut,
 * comportement attendu avant une action destructive.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive = false,
  confirmPending = false,
}: ConfirmDialogProps) {
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
              "relative flex w-full max-w-[min(420px,94vw)] flex-col gap-4 rounded-lg border border-border-strong bg-surface-page p-6 shadow-overlay",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "data-[state=open]:animate-mec-rise data-[state=closed]:animate-mec-sink",
            )}
          >
            <RadixAlertDialog.Title className="text-base font-semibold text-ink">
              {title}
            </RadixAlertDialog.Title>
            {description ? (
              <RadixAlertDialog.Description className="text-sm text-muted-foreground">
                {description}
              </RadixAlertDialog.Description>
            ) : null}
            <div className="flex justify-end gap-2.5 pt-2">
              <RadixAlertDialog.Cancel asChild>
                <Button variant="secondary">{cancelLabel}</Button>
              </RadixAlertDialog.Cancel>
              <RadixAlertDialog.Action asChild>
                <Button
                  variant="primary"
                  className={
                    destructive
                      ? "bg-verdict-false hover:bg-verdict-false/90 active:bg-verdict-false/80"
                      : undefined
                  }
                  disabled={confirmPending}
                  onClick={(event) => {
                    // L'Action de Radix ferme la modale immédiatement ; on empêche ça pour laisser
                    // le parent la fermer une fois la mutation résolue (cf. onSuccess de l'appelant).
                    event.preventDefault();
                    onConfirm();
                  }}
                >
                  {confirmPending ? "..." : confirmLabel}
                </Button>
              </RadixAlertDialog.Action>
            </div>
          </RadixAlertDialog.Content>
        </RadixAlertDialog.Overlay>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
