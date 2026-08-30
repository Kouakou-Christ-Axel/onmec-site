"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/components/ui/cn";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useCategories } from "@/features/actualites-admin/queries/use-categories";
import { useCreateActualite } from "@/features/actualites-admin/mutations/use-create-actualite";
import { useUpdateActualite } from "@/features/actualites-admin/mutations/use-update-actualite";
import { usePublierActualite } from "@/features/actualites-admin/mutations/use-publier-actualite";
import { buildActualiteFormData } from "@/features/actualites-admin/lib/build-actualite-form-data";
import { actualiteFormSchema } from "@/features/actualites-admin/schemas/actualite-form-schema";
import { MAX_IMAGE_LABEL } from "@/lib/image-limits";
import { ApiError } from "@/lib/api-error";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface PublishPopoverProps {
  existing: ActualiteAdmin | null;
  savedId: string | null;
  onSavedIdChange: (id: string) => void;
  fields: { title: string; excerpt: string; content: string };
  image: File | null;
  onClose: () => void;
  onPublished: (actualite: ActualiteAdmin) => void;
}

export function PublishPopover({
  existing,
  savedId,
  onSavedIdChange,
  fields,
  image,
  onClose,
  onPublished,
}: PublishPopoverProps) {
  const categoriesQuery = useCategories();
  const createMutation = useCreateActualite();
  const updateMutation = useUpdateActualite();
  const publierMutation = usePublierActualite();

  const [categorieId, setCategorieId] = useState(existing?.categorie?.id ?? "");
  const [date, setDate] = useState(existing?.date.slice(0, 10) ?? todayIso());
  const [error, setError] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];
  const submitting =
    createMutation.isPending || updateMutation.isPending || publierMutation.isPending;

  async function handlePublish() {
    const parsed = actualiteFormSchema.safeParse({ ...fields, date, categorieId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
      return;
    }
    setError(null);
    try {
      const formData = buildActualiteFormData(parsed.data, categorieId, image);
      let id = savedId;
      if (id) {
        await updateMutation.mutateAsync({ id, formData });
      } else {
        const created = await createMutation.mutateAsync(formData);
        id = created.id;
        onSavedIdChange(id);
      }
      const published = await publierMutation.mutateAsync(id);
      onPublished(published);
    } catch (err) {
      if (err instanceof ApiError && err.status === 413) {
        setError(`Image de couverture trop lourde (maximum ${MAX_IMAGE_LABEL}).`);
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }
    }
  }

  return (
    // z-100 : Radix recopie le z-index calculé du Content sur son wrapper positionné
    // (react-popper). L'éditeur parent est en z-95 — en dessous, le popover passerait derrière.
    <Popover.Content
      side="bottom"
      align="end"
      sideOffset={8}
      collisionPadding={16}
      onEscapeKeyDown={onClose}
      onPointerDownOutside={onClose}
      style={{ transformOrigin: "var(--radix-popover-content-transform-origin)" }}
      className={cn(
        "z-100 flex w-[min(360px,92vw)] flex-col gap-4 rounded-[10px] border border-border-strong bg-surface-card p-5 shadow-overlay",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "data-[state=open]:animate-mec-pop data-[state=closed]:animate-mec-pop-out",
      )}
    >
      <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        Publication
      </span>
      {error || categoriesQuery.isError ? (
        <Alert tone="danger">{error ?? "Impossible de charger les catégories. Réessayez."}</Alert>
      ) : null}
      <Field label="Rubrique">
        <Select
          value={categorieId}
          onChange={(event) => setCategorieId(event.target.value)}
          disabled={categoriesQuery.isLoading}
        >
          <option value="">Sélectionner...</option>
          {categories.map((categorie) => (
            <option key={categorie.id} value={categorie.id}>
              {categorie.nom}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Date de publication">
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </Field>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Les membres de l’app seront notifiés automatiquement à la publication.
      </p>
      <Button variant="primary" full disabled={submitting || !categorieId} onClick={handlePublish}>
        {submitting ? "Publication..." : "Publier l’article"}
      </Button>
      <span className="text-xs leading-relaxed text-muted-foreground">
        L’article part sur la page Actualités du site. Vous pourrez le dépublier à tout moment.
      </span>
    </Popover.Content>
  );
}
