"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAdminLogin } from "@/features/admin-auth/mutations/use-admin-login";
import { ApiError } from "@/lib/api-error";

interface ConnexionViewProps {
  onGoInscription: () => void;
}

export function ConnexionView({ onGoInscription }: ConnexionViewProps) {
  const router = useRouter();
  const login = useAdminLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (user) => {
          router.push(user.mustChangePassword ? "/admin/changer-mot-de-passe" : "/admin");
        },
      },
    );
  }

  const errorMessage = errorMessageFor(login.error);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5.5">
      <div>
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-600 uppercase">
          Espace d’administration
        </span>
        <h1 className="mt-3 mb-2 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Se connecter
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Le site public et l’application de signalement se pilotent depuis ici.
        </p>
      </div>
      {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
      <div className="flex flex-col gap-4">
        <Field label="Adresse e-mail" htmlFor="auth-mail">
          <Input
            id="auth-mail"
            type="email"
            placeholder="prenom.nom@mec-ci.org"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <div className="flex flex-col gap-2.5">
          <Field label="Mot de passe" htmlFor="auth-pass">
            <Input
              id="auth-pass"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          <a
            href="#oubli"
            className="self-start text-[0.8125rem] font-semibold text-blue-600 hover:text-orange-700"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <div className="mt-0.5 grid">
          <Button type="submit" variant="primary" size="lg" full disabled={login.isPending}>
            {login.isPending ? "Connexion..." : "Se connecter"}
          </Button>
        </div>
      </div>
      <p className="border-t border-border-subtle pt-5 text-[0.8125rem] leading-relaxed text-muted-foreground">
        Vous travaillez avec le MEC et n’avez pas de compte ?{" "}
        <button
          type="button"
          onClick={onGoInscription}
          className="font-semibold text-blue-600 hover:text-orange-700"
        >
          Créer un compte
        </button>{" "}
        — il sera actif après validation d’un administrateur.
      </p>
    </form>
  );
}

function errorMessageFor(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.status === 401) return "Identifiants invalides.";
    if (error.status === 429) return "Trop de tentatives. Réessayez plus tard.";
  }
  return "Une erreur est survenue. Réessayez.";
}
