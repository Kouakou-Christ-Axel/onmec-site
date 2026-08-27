"use client";

import { useState } from "react";
import { Upload, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useDeleteDocument } from "@/features/librairie-admin/mutations/use-delete-document";
import { UploadDocumentDialog } from "@/components/features/librairie-admin/upload-document-dialog";
import { EditDocumentDialog } from "@/components/features/librairie-admin/edit-document-dialog";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

interface LibrairieAdminClientProps {
  initialDocuments: AdminLibrairieDocument[];
  categories: string[];
}

export function LibrairieAdminClient({ initialDocuments, categories }: LibrairieAdminClientProps) {
  const shell = useAdminShell();
  const [documents, setDocuments] = useState(initialDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState<AdminLibrairieDocument | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminLibrairieDocument | null>(null);

  const removeMutation = useDeleteDocument();

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    removeMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        setDocuments((prev) => prev.filter((item) => item.id !== pendingDelete.id));
        setPendingDelete(null);
      },
      onError: () => {
        toast.error("Une erreur est survenue. Réessayez.");
      },
    });
  }

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Site public
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Ressources pédagogiques
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </p>
        </div>
        {shell.canEdito ? (
          <Button variant="primary" icon={Upload} onClick={() => setShowUpload(true)}>
            Ajouter un document
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[minmax(0,1fr)_140px_100px_140px_120px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Titre</span>
            <span>Catégorie</span>
            <span>Pages</span>
            <span>Ajouté le</span>
            <span className="text-right">Actions</span>
          </div>
          {documents.map((document) => {
            const deletePending =
              removeMutation.isPending && removeMutation.variables === document.id;
            return (
              <div
                key={document.id}
                className="grid grid-cols-[minmax(0,1fr)_140px_100px_140px_120px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
              >
                <span className="flex items-center gap-2 font-medium text-ink">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {document.title}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground">
                  {document.categorie ?? "—"}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  {document.pageCount ?? "—"}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  {formatDate(document.uploadedAt)}
                </span>
                <span className="flex justify-end gap-1.5">
                  {shell.canEdito ? (
                    <>
                      <IconButton
                        icon={Pencil}
                        label="Modifier"
                        size="sm"
                        disabled={deletePending}
                        onClick={() => setEditing(document)}
                      />
                      <IconButton
                        icon={Trash2}
                        label="Supprimer"
                        size="sm"
                        disabled={deletePending}
                        onClick={() => setPendingDelete(document)}
                      />
                    </>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <UploadDocumentDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        categories={categories}
        onCreated={(document) => setDocuments((prev) => [document, ...prev])}
      />

      <EditDocumentDialog
        document={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onUpdated={(updated) => {
          setDocuments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Supprimer « ${pendingDelete?.title ?? ""} » ?`}
        description="Cette action est définitive."
        confirmLabel="Supprimer"
        destructive
        confirmPending={removeMutation.isPending}
      />
    </div>
  );
}
