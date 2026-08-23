"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { RUBRIQUES, MOMENTS_PUBLICATION } from "@/features/admin/data/articles";

interface PublishPopoverProps {
  onClose: () => void;
  onPublish: () => void;
  disabled: boolean;
}

export function PublishPopover({ onClose, onPublish, disabled }: PublishPopoverProps) {
  return (
    <div className="absolute inset-0 z-10">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-blue-900/28"
      />
      <div className="absolute top-18.5 right-4 flex w-[min(360px,92vw)] flex-col gap-4 rounded-[10px] border border-border-strong bg-surface-card p-5 shadow-overlay md:right-8">
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
          Publication
        </span>
        <Field label="Rubrique">
          <Select defaultValue={RUBRIQUES[0]}>
            {RUBRIQUES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mise en ligne">
          <Select defaultValue={MOMENTS_PUBLICATION[0]}>
            {MOMENTS_PUBLICATION.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Field>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-md border border-border-strong bg-white px-3 py-2.5 text-left text-[0.8125rem] font-semibold text-ink"
        >
          <Bell size={18} />
          <span>Notifier les 2 340 utilisateurs de l’app</span>
        </button>
        <Button variant="primary" full disabled={disabled} onClick={onPublish}>
          Publier l’article
        </Button>
        <span className="text-xs leading-relaxed text-muted-foreground">
          L’article part sur la page Actualités du site. Vous pourrez le dépublier à tout moment.
        </span>
      </div>
    </div>
  );
}
