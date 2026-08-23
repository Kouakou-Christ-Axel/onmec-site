"use client";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export function Dialog({ open, onClose, children, wide = false }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-blue-900/62 p-6">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        className={`relative flex w-full flex-col rounded-lg border border-border-strong bg-surface-page shadow-overlay ${wide ? "max-w-[min(760px,94vw)]" : "max-w-[min(520px,94vw)]"}`}
        style={{ animation: "mecRise 220ms cubic-bezier(.22,1,.36,1) both" }}
      >
        {children}
      </div>
    </div>
  );
}
