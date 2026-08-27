import Link from "next/link";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { DocumentCover } from "@/components/features/librairie/document-cover";

export function LibrairieCard({ document }: { document: PublicLibrairieDocument }) {
  return (
    <Link
      href={`/ressources/${document.id}`}
      className="group flex flex-col gap-4 rounded-sm transition-transform duration-150 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <div className="relative">
        <DocumentCover src={document.coverImage} alt={document.title} />
        {document.categorie ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wide text-surface-page uppercase">
            {document.categorie}
          </span>
        ) : null}
      </div>
      <h3 className="text-h3 leading-snug font-semibold text-ink transition-colors group-hover:text-orange-700">
        {document.title}
      </h3>
      {document.description ? (
        <p className="text-sm leading-relaxed text-text-muted">{document.description}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span>{new Date(document.uploadedAt).toLocaleDateString("fr-FR")}</span>
        {document.pageCount !== null ? (
          <>
            <span>·</span>
            <span>{document.pageCount} p.</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
