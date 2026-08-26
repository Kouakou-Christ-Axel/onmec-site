const COLUMNS = "grid-cols-[minmax(0,1fr)_120px_156px_116px_140px_150px]";
const ROWS = 6;

/**
 * Seule route du projet où un `loading.tsx` gagne sa place : la page attend réellement le réseau
 * (`await listActualitesAdmin()` vers api.mec-ci.org). Les pages publiques, elles, rendent des
 * constantes importées — un état de chargement n'y apparaîtrait jamais.
 *
 * La grille reprend celle de `actualites-admin-client.tsx` pour que le contenu ne saute pas
 * quand il se substitue au squelette.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement des actualités…</span>
      <div className="h-9 w-52 animate-pulse rounded-sm bg-n-100" />
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        <div
          className={`grid ${COLUMNS} gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5`}
          aria-hidden
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 animate-pulse rounded-xs bg-n-100" />
          ))}
        </div>
        {Array.from({ length: ROWS }).map((_, row) => (
          <div
            key={row}
            className={`grid ${COLUMNS} items-center gap-3.5 border-b border-border-subtle px-4 py-3 last:border-b-0`}
            aria-hidden
          >
            {Array.from({ length: 6 }).map((_, col) => (
              <div key={col} className="h-4 animate-pulse rounded-xs bg-n-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
