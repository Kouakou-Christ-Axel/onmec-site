export function LibrairiePagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-9 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="inline-flex h-9 items-center rounded-sm border border-ink/24 px-3 text-sm font-semibold text-ink transition-colors hover:bg-n-100 disabled:pointer-events-none disabled:opacity-40"
      >
        Précédent
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-sm text-sm font-semibold transition-colors ${
            n === page ? "bg-ink text-surface-page" : "text-ink hover:bg-n-100"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex h-9 items-center rounded-sm border border-ink/24 px-3 text-sm font-semibold text-ink transition-colors hover:bg-n-100 disabled:pointer-events-none disabled:opacity-40"
      >
        Suivant
      </button>
    </nav>
  );
}
