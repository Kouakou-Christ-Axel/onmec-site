"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TextInput } from "@/components/features/site/form-controls";

export function NotFoundSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/ressources${params}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <div className="min-w-[260px] flex-1">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex. désinformation, vote, droits"
          aria-label="Chercher un guide ou une page"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-sm bg-orange-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
      >
        Chercher dans les ressources
      </button>
    </form>
  );
}
