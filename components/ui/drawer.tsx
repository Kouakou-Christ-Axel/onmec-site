"use client";

import type { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@/components/ui/cn";
import { useFocusRestore, useOverlayContainer } from "@/components/ui/dialog";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
  /** Libellé pour les lecteurs d'écran quand le contenu ne porte pas de titre visible. */
  title?: string;
  className?: string;
  overlayClassName?: string;
}

/** Un tiroir EST un dialogue modal Radix, juste positionné à droite sur toute la hauteur. */
export function Drawer({
  open,
  onClose,
  children,
  widthClassName = "w-[min(560px,94vw)]",
  title,
  className,
  overlayClassName,
}: DrawerProps) {
  const container = useOverlayContainer();
  const { handleOpenAutoFocus, handleCloseAutoFocus } = useFocusRestore();

  return (
    <RadixDialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <RadixDialog.Portal container={container}>
        <RadixDialog.Overlay
          className={cn("fixed inset-0 z-80 flex justify-end bg-overlay-scrim", overlayClassName)}
        >
          <RadixDialog.Content
            asChild
            aria-describedby={undefined}
            onOpenAutoFocus={handleOpenAutoFocus}
            onCloseAutoFocus={handleCloseAutoFocus}
          >
            <aside
              className={cn(
                "relative flex h-full flex-col border-l border-border-strong bg-surface-page",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                "data-[state=open]:animate-mec-drawer data-[state=closed]:animate-mec-drawer-out",
                widthClassName,
                className,
              )}
            >
              {title ? <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title> : null}
              {children}
            </aside>
          </RadixDialog.Content>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
