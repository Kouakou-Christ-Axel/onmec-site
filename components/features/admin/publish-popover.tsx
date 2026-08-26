"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useCategories } from "@/features/actualites-admin/queries/use-categories";
import { useCreateActualite } from "@/features/actualites-admin/mutations/use-create-actualite";
import { useUpdateActualite } from "@/features/actualites-admin/mutations/use-update-actualite";
import { usePublierActualite } from "@/features/actualites-admin/mutations/use-publier-actualite";
import { buildActualiteFormData } from "@/features/actualites-admin/lib/build-actualite-form-data";
import { actualiteFormSchema } from "@/features/actualites-admin/schemas/actualite-form-schema";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

interface PublishPopoverProps {
  existing: ActualiteAdmin | null;
  fields: { title: string; excerpt: string; content: string; date: string };
  image: File | null;
  onClose: () => void;
  onPublished: (actualite: ActualiteAdmin) => void;
}

export function PublishPopover({ existing, fields, image, onClose, onPublished }: PublishPopoverProps) {
  const categoriesQuery = useCategories();
  const createMutation = useCreateActualite();
  const updateMutation = useUpdateActualite();
  const publierMutation = usePublierActualite();

  const [categorieId, setCategorieId] = useState(existing?.categorie?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];
  const submitting = createMutation.isPending || updateMutation.isPending || publierMutation.isPending;

  async function handlePublish() {
    const parsed = actualiteFormSchema.safeParse({ ...fields, categorieId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
      return;
    }
    setError(null);
    try {
      const formData = buildActualiteFormData(fields, categorieId, image);
      const saved = existing
        ? await updateMutation.mutateAsync({ id: existing.id, formData })
        : await createMutation.mutateAsync(formData);
      const published = await publierMutation.mutateAsync(saved.id);
      onPublished(published);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    }
  }

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
        {error ? <Alert tone="danger">{error}</Alert> : null}
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          Les membres de l’app seront notifiés automatiquement à la publication.
        </p>
        <Button variant="primary" full disabled={submitting || !categorieId} onClick={handlePublish}>
          {submitting ? "Publication..." : "Publier l’article"}
        </Button>
        <span className="text-xs leading-relaxed text-muted-foreground">
          L’article part sur la page Actualités du site. Vous pourrez le dépublier à tout moment.
        </span>
      </div>
    </div>
  );
}
