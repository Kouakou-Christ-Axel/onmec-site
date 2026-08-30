/**
 * Reflète des paramètres dans l'URL sans passer par le router Next/vinext. Une navigation
 * (`router.push`/`router.replace`) réexécuterait le Server Component de la page et réafficherait
 * le `loading.tsx` du segment pour une simple interaction de filtre/onglet/pagination côté client
 * — voir docs/ARCHITECTURE.md § Filtres et onglets client. `history.replaceState` garde l'URL
 * partageable sans ce coût.
 */
export function syncUrlParams(params: Record<string, string>) {
  const url = new URL(window.location.href);
  url.search = "";
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url);
}
