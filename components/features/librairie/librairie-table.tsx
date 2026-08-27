import Link from "next/link";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { DocumentCover } from "@/components/features/librairie/document-cover";

export function LibrairieTable({
  documents,
  onPreview,
}: {
  documents: PublicLibrairieDocument[];
  onPreview: (id: string) => void;
}) {
  return (
    <table className="hidden w-full border-collapse text-sm lg:mt-9 lg:table">
      <thead>
        <tr className="border-b border-ink/10 text-left text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          <th className="w-20 py-3 pr-4 font-semibold">Couverture</th>
          <th className="py-3 pr-4 font-semibold">Titre</th>
          <th className="py-3 pr-4 font-semibold">Catégorie</th>
          <th className="py-3 pr-4 font-semibold">Pages</th>
          <th className="py-3 pr-4 font-semibold">
            <span className="sr-only">Aperçu</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id} className="border-b border-ink/10 align-middle">
            <td className="py-3 pr-4">
              <DocumentCover
                src={document.coverImage}
                alt={document.title}
                className="w-14"
                compact
              />
            </td>
            <td className="py-3 pr-4">
              <Link
                href={`/ressources/${document.id}`}
                className="font-semibold text-ink transition-colors hover:text-orange-700"
              >
                {document.title}
              </Link>
              {document.description ? (
                <p className="mt-1 line-clamp-1 text-xs text-text-muted">{document.description}</p>
              ) : null}
            </td>
            <td className="py-3 pr-4 text-xs font-semibold tracking-wide text-blue-600 uppercase">
              {document.categorie ?? "—"}
            </td>
            <td className="py-3 pr-4 text-text-muted">
              {document.pageCount !== null ? `${document.pageCount} p.` : "—"}
            </td>
            <td className="py-3 pr-4 text-right">
              <button
                type="button"
                onClick={() => onPreview(document.id)}
                className="inline-flex h-8 items-center rounded-sm border border-ink/24 px-3 text-xs font-semibold text-ink transition-colors hover:bg-n-100"
              >
                Aperçu
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
