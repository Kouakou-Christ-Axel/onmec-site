import { QueryClient } from "@tanstack/react-query";

/**
 * Factory, jamais une instance module-scope : un QueryClient partage entre
 * requetes sur le Worker ferait fuiter de l'etat entre utilisateurs.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 60_000,
      },
    },
  });
}
