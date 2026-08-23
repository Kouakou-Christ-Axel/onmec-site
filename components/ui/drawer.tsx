"use client";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
}

export function Drawer({ open, onClose, children, widthClassName = "w-[min(560px,94vw)]" }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-80 flex justify-end bg-blue-900/62">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 cursor-default" />
      <aside
        className={`relative flex h-full flex-col border-l border-border-strong bg-surface-page ${widthClassName}`}
        style={{ animation: "mecDrawer 260ms cubic-bezier(.22,1,.36,1) both" }}
      >
        {children}
      </aside>
    </div>
  );
}
