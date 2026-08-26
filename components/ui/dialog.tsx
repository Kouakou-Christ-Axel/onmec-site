"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
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

/**
 * Rend le focus à l'élément qui l'avait avant l'ouverture.
 *
 * Radix ne restaure le focus tout seul que s'il connaît le déclencheur, c'est-à-dire via
 * `Dialog.Trigger`. Or la plupart de nos overlays sont pilotés depuis un parent (une ligne de
 * tableau, une sélection de fichier) et n'ont pas de trigger co-localisé : sans ce filet, le focus
 * retombe sur `<body>` à la fermeture. On capture donc la cible dans `onOpenAutoFocus`, seul moment
 * où l'élément extérieur a encore le focus.
 */
export function useFocusRestore(onOpenAutoFocus?: (event: Event) => void) {
  const previous = useRef<HTMLElement | null>(null);

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      previous.current = document.activeElement as HTMLElement | null;
      onOpenAutoFocus?.(event);
    },
    [onOpenAutoFocus],
  );

  const handleCloseAutoFocus = useCallback((event: Event) => {
    const target = previous.current;
    if (!target || !document.body.contains(target)) return;
    event.preventDefault();
    target.focus();
  }, []);

  return { handleOpenAutoFocus, handleCloseAutoFocus };
}

/**
 * Conserve la dernière valeur non nulle. Radix garde le contenu monté le temps de l'animation de
 * sortie : sans ça, un parent qui repasse à `null` en fermant n'aurait plus rien à rendre pendant
 * que l'overlay se referme.
 */
export function useLastNonNull<T>(value: T | null): T | null {
  // Ajustement d'état pendant le rendu — le patron documenté par React pour dériver d'une prop.
  const [shown, setShown] = useState<T | null>(value);
  if (value !== null && value !== shown) setShown(value);
  return value ?? shown;
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
  /** Redirige le focus initial (par défaut Radix focus le premier élément focusable du contenu). */
  onOpenAutoFocus?: (event: Event) => void;
  /**
   * Déclencheur, rendu dans `Dialog.Trigger asChild`. À privilégier sur un bouton externe :
   * c'est ce qui donne à Radix la référence vers laquelle rendre le focus à la fermeture. Sans
   * lui, un `onOpenAutoFocus` qui appelle `preventDefault()` fait perdre la restauration du focus.
   */
  trigger?: ReactNode;
  /** Appelé quand le déclencheur ouvre le dialogue. Requis dès qu'on fournit `trigger`. */
  onOpen?: () => void;
}

export function Dialog({
  open,
  onClose,
  children,
  wide = false,
  title,
  className,
  overlayClassName,
  onOpenAutoFocus,
  trigger,
  onOpen,
}: DialogProps) {
  const container = useOverlayContainer();
  const { handleOpenAutoFocus, handleCloseAutoFocus } = useFocusRestore(onOpenAutoFocus);

  return (
    <RadixDialog.Root open={open} onOpenChange={(next) => (next ? onOpen?.() : onClose())}>
      {trigger ? <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger> : null}
      <RadixDialog.Portal container={container}>
        <RadixDialog.Overlay
          className={cn(
            "fixed inset-0 z-90 grid place-items-center overflow-y-auto bg-overlay-scrim p-6",
            "data-[state=open]:animate-mec-fade data-[state=closed]:animate-mec-fade-out",
            overlayClassName,
          )}
        >
          <RadixDialog.Content
            aria-describedby={undefined}
            onOpenAutoFocus={handleOpenAutoFocus}
            onCloseAutoFocus={handleCloseAutoFocus}
            className={cn(
              "relative flex w-full flex-col rounded-lg border border-border-strong bg-surface-page shadow-overlay",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "data-[state=open]:animate-mec-rise data-[state=closed]:animate-mec-sink",
              wide ? "max-w-[min(760px,94vw)]" : "max-w-[min(520px,94vw)]",
              className,
            )}
          >
            {title ? <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title> : null}
            {children}
          </RadixDialog.Content>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
