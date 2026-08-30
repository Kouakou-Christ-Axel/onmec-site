"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface MotDePasseTemporaireRevealProps {
  password: string;
  description: string;
}

/** Le backend ne renvoie ce mot de passe qu'une seule fois — jamais re-fetché ni stocké. */
export function MotDePasseTemporaireReveal({
  password,
  description,
}: MotDePasseTemporaireRevealProps) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    await navigator.clipboard.writeText(password);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4.5 p-5.5">
      <Alert tone="warning">{description}</Alert>
      <div className="flex items-center gap-2.5 rounded-md border border-border-subtle bg-n-50 px-3.5 py-2.5">
        <code className="flex-1 text-sm font-medium text-ink">{password}</code>
        <Button variant="ghost" size="sm" icon={copie ? Check : Copy} onClick={copier}>
          {copie ? "Copié" : "Copier"}
        </Button>
      </div>
    </div>
  );
}
