"use client";

import { useState, type ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@/components/ui/cn";

/**
 * Radix portalise vers `document.body` par défaut. Or le thème sombre est scopé à
 * `html[data-mec-theme="dark"] [data-mec-public]` (app/globals.css) et redéfinit les tokens sur cet
 * ancêtre : un overlay portalisé sur `body` en sortirait et résoudrait les valeurs claires.
 * Le site public rend donc un `#mec-overlay-root` à l'intérieur du marqueur — voir
 * app/(public)/layout.tsx. Côté /admin le conteneur est absent, on retombe sur `body`, ce qui est
 * correct : `dark:` y est inerte par construction.
 */
export function useOverlayContainer(): HTMLElement | undefined {
  // Initialiseur paresseux : la lecture ne se fait qu'au premier rendu client, où le conteneur est
  // déjà présent dans le HTML rendu par le serveur. Pas de setState en effet, donc pas de rendu
  // en cascade. Côté serveur on renvoie undefined et Radix retombe sur son défaut.
  const [container] = useState<HTMLElement | undefined>(() =>
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("mec-overlay-root") ?? undefined),
  );
  return container;
}

/** À poser sur le titre visible déjà présent dans le contenu : `<DialogTitle asChild><h2 …>`. */
export const DialogTitle = RadixDialog.Title;

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  /** Libellé pour les lecteurs d'écran quand le contenu ne porte pas de titre visible. */
  title?: string;
  className?: string;
  overlayClassName?: string;
}

export function Dialog({
  open,
  onClose,
  children,
  wide = false,
  title,
  className,
  overlayClassName,
}: DialogProps) {
  const container = useOverlayContainer();

  return (
    <RadixDialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <RadixDialog.Portal container={container}>
        <RadixDialog.Overlay
          className={cn(
            "fixed inset-0 z-90 grid place-items-center overflow-y-auto bg-blue-900/62 p-6",
            "data-[state=open]:animate-mec-fade data-[state=closed]:animate-mec-fade-out",
            overlayClassName,
          )}
        >
          <RadixDialog.Content
            aria-describedby={undefined}
            className={cn(
              "relative flex w-full flex-col rounded-lg border border-border-strong bg-surface-page shadow-overlay",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "data-[state=open]:animate-mec-rise data-[state=closed]:animate-mec-sink",
              wide ? "max-w-[min(760px,94vw)]" : "max-w-[min(520px,94vw)]",
              className,
            )}
          >
            {title ? (
              <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title>
            ) : null}
            {children}
          </RadixDialog.Content>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
