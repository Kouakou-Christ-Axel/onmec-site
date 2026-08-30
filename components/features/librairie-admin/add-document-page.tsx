"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CoverImageField } from "@/components/features/admin/cover-image-field";
import { NewCategoryDialog } from "@/components/features/librairie-admin/new-category-dialog";
import { useCreateDocument } from "@/features/librairie-admin/mutations/use-create-document";
import { renderFirstPdfPageToFile } from "@/features/librairie-admin/lib/render-pdf-first-page";
import type { CreateDocumentStep } from "@/features/librairie-admin/lib/create-document-with-upload";

const STEP_LABELS: Record<CreateDocumentStep, string> = {
  "upload-fichier": "Envoi du document…",
  "upload-cover": "Envoi de la couverture…",
  finalisation: "Enregistrement…",
};

const COVER_ASPECT_RATIO = 3 / 4;

interface AddDocumentPageProps {
  categories: string[];
}

export function AddDocumentPage({ categories }: AddDocumentPageProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [manualCover, setManualCover] = useState<File | null>(null);
  const [autoCover, setAutoCover] = useState<File | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [step, setStep] = useState<CreateDocumentStep | null>(null);

  const autoCoverUrl = useMemo(
    () => (autoCover ? URL.createObjectURL(autoCover) : null),
    [autoCover],
  );
  useEffect(() => {
    return () => {
      if (autoCoverUrl) URL.revokeObjectURL(autoCoverUrl);
    };
  }, [autoCoverUrl]);

  const coverRenderToken = useRef(0);
  const createDocument = useCreateDocument();

  function handleClose() {
    router.push("/admin/ressources");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (
      selected &&
      (!selected.name.toLowerCase().endsWith(".pdf") || selected.type !== "application/pdf")
    ) {
      setFile(null);
      setFileError("Le fichier doit être un PDF valide.");
      event.target.value = "";
      return;
    }
    setFileError(null);
    setFile(selected);
    setManualCover(null);
    setAutoCover(null);
    if (!selected) return;

    const token = ++coverRenderToken.current;
    setCoverLoading(true);
    try {
      const cover = await renderFirstPdfPageToFile(selected);
      if (coverRenderToken.current === token) setAutoCover(cover);
    } catch {
      if (coverRenderToken.current === token) {
        toast.error("Impossible de générer l’aperçu du PDF.");
      }
    } finally {
      if (coverRenderToken.current === token) setCoverLoading(false);
    }
  }

  function submit() {
    if (!title.trim() || !file) return;
    const cover = manualCover ?? autoCover;
    createDocument.mutate(
      { title: title.trim(), description, categorie, file, cover, onStep: setStep },
      {
        onSuccess: () => {
          router.push("/admin/ressources");
          router.refresh();
        },
      },
    );
  }

  const pending = createDocument.isPending;

  return (
    <div className="fixed inset-0 z-95 flex flex-col bg-surface-page">
      <div className="flex h-16 flex-none items-center gap-3.5 border-b border-border-subtle bg-surface-blur px-4 backdrop-blur-md md:px-8">
        <IconButton icon={ArrowLeft} label="Retour aux ressources" onClick={handleClose} />
        <span className="text-[0.8125rem] font-semibold whitespace-nowrap text-ink">
          Nouveau document
        </span>
        <span className="ml-auto flex items-center gap-3">
          {pending && step ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {STEP_LABELS[step]}
            </span>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            disabled={!title.trim() || !file || pending}
            onClick={submit}
          >
            {pending ? "Envoi…" : "Créer le document"}
          </Button>
        </span>
      </div>

      <div className="relative flex-1 overflow-auto px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Site public
          </span>

          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="w-full flex-none sm:w-52">
              <Field
                label="Couverture"
                hint={
                  coverLoading
                    ? "Génération depuis la 1ère page…"
                    : "Depuis la 1ère page du PDF — remplaçable"
                }
              >
                <CoverImageField
                  file={manualCover}
                  onChange={setManualCover}
                  existingUrl={autoCoverUrl}
                  aspectRatio={COVER_ASPECT_RATIO}
                />
              </Field>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4.5">
              <Field label="Fichier PDF" hint="Obligatoire">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={pending}
                />
              </Field>
              {fileError ? <p className="text-sm text-verdict-false">{fileError}</p> : null}

              <Field label="Titre">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={pending}
                />
              </Field>
              <Field label="Description" hint="Facultatif">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={pending}
                />
              </Field>
              <Field label="Catégorie" hint="Facultatif">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={categorie}
                      onChange={(e) => setCategorie(e.target.value)}
                      disabled={pending}
                    >
                      <option value="">Aucune catégorie</option>
                      {[...categories, ...extraCategories].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <IconButton
                    icon={Plus}
                    label="Nouvelle catégorie"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setShowNewCategory(true)}
                  />
                </div>
              </Field>

              {createDocument.isError ? (
                <p className="text-sm text-verdict-false">
                  Échec{step ? ` pendant : ${STEP_LABELS[step]}` : ""} — réessayez.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <NewCategoryDialog
        open={showNewCategory}
        onClose={() => setShowNewCategory(false)}
        onAdd={(newCategorie) => {
          if (!categories.includes(newCategorie)) {
            setExtraCategories((prev) =>
              prev.includes(newCategorie) ? prev : [...prev, newCategorie],
            );
          }
          setCategorie(newCategorie);
        }}
      />
    </div>
  );
}
