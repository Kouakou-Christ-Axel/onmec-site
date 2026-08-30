"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex max-w-[1320px] flex-col items-start gap-4 py-16">
      <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
        Cette page n’a pas pu s’afficher
      </h1>
      <p className="text-[0.9375rem] text-muted-foreground">
        Une erreur est survenue, ou vous n’avez pas les droits nécessaires pour accéder à cette
        section.
      </p>
      <Button variant="primary" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
