"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAdminChangePassword } from "@/features/admin-auth/mutations/use-admin-change-password";
import { ApiError } from "@/lib/api-error";

export function ChangerMotDePasseView() {
  const router = useRouter();
  const changePassword = useAdminChangePassword();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    changePassword.mutate({ oldPassword, password }, { onSuccess: () => router.push("/admin") });
  }

  const errorMessage = errorMessageFor(changePassword.error);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5.5">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-50 text-blue-600">
        <Lock size={22} />
      </span>
      <div>
        <h1 className="mb-2.5 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Changer votre mot de passe
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Votre mot de passe a été généré automatiquement. Choisissez-en un nouveau avant de
          continuer.
        </p>
      </div>
      {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
      <div className="flex flex-col gap-4">
        <Field label="Mot de passe actuel" htmlFor="cmp-old">
          <Input
            id="cmp-old"
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            required
          />
        </Field>
        <Field label="Nouveau mot de passe" htmlFor="cmp-new" hint="12 caractères minimum.">
          <Input
            id="cmp-new"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={12}
            maxLength={128}
            required
          />
        </Field>
        <div className="mt-0.5 grid">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            full
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? "Enregistrement..." : "Valider"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function errorMessageFor(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError && error.status === 400) {
    return "Mot de passe actuel incorrect.";
  }
  return "Une erreur est survenue. Réessayez.";
}
