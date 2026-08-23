import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConnexionViewProps {
  onGoInscription: () => void;
}

export function ConnexionView({ onGoInscription }: ConnexionViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
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
      <div className="flex flex-col gap-4">
        <Field label="Adresse e-mail" htmlFor="auth-mail">
          <Input id="auth-mail" type="email" placeholder="prenom.nom@mec-ci.org" />
        </Field>
        <div className="flex flex-col gap-2.5">
          <Field label="Mot de passe" htmlFor="auth-pass">
            <Input id="auth-pass" type="password" placeholder="Votre mot de passe" />
          </Field>
          <a
            href="#oubli"
            className="self-start text-[0.8125rem] font-semibold text-blue-600 hover:text-orange-700"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <div className="mt-0.5 grid">
          <Button variant="primary" size="lg" full>
            Se connecter
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
    </div>
  );
}
