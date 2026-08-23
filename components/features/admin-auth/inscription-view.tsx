import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ROLES_DEMANDE = ["Chargé·e de communication", "Modérateur", "Coordination campus"];

interface InscriptionViewProps {
  onGoConnexion: () => void;
  onSubmit: () => void;
}

export function InscriptionView({ onGoConnexion, onSubmit }: InscriptionViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <div>
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-600 uppercase">
          Demande d’accès
        </span>
        <h1 className="mt-3 mb-2 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Créer un compte
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Un administrateur national valide votre compte avant la première connexion.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Field label="Nom et prénoms" htmlFor="ins-nom">
          <Input id="ins-nom" placeholder="Nadia Koffi" />
        </Field>
        <Field label="Adresse e-mail professionnelle" htmlFor="ins-mail">
          <Input id="ins-mail" type="email" placeholder="prenom.nom@mec-ci.org" />
        </Field>
        <Field
          label="Rôle demandé"
          htmlFor="ins-role"
          hint="Le rôle définit les modules auxquels vous accédez."
        >
          <Select id="ins-role" defaultValue={ROLES_DEMANDE[0]}>
            {ROLES_DEMANDE.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mot de passe" htmlFor="ins-pass" hint="12 caractères minimum.">
          <Input id="ins-pass" type="password" placeholder="Choisissez un mot de passe" />
        </Field>
        <div className="mt-0.5 grid">
          <Button variant="primary" size="lg" full onClick={onSubmit}>
            Créer mon compte
          </Button>
        </div>
      </div>
      <p className="border-t border-border-subtle pt-5 text-[0.8125rem] text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <button
          type="button"
          onClick={onGoConnexion}
          className="font-semibold text-blue-600 hover:text-orange-700"
        >
          Se connecter
        </button>
      </p>
    </div>
  );
}
