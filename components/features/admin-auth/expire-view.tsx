import { Lock } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExpireViewProps {
  email: string;
  onGoConnexion: () => void;
}

export function ExpireView({ email, onGoConnexion }: ExpireViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-50 text-blue-600">
        <Lock size={22} />
      </span>
      <div>
        <h1 className="mb-2.5 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Session expirée
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Vous avez été déconnecté après 30 minutes sans activité. Vos brouillons et vos
          signalements en cours ont été conservés.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Field label="Mot de passe" htmlFor="exp-pass" hint={`Reconnecté en tant que ${email}`}>
          <Input id="exp-pass" type="password" placeholder="Votre mot de passe" />
        </Field>
        <div className="grid">
          <Button variant="primary" size="lg" full>
            Reprendre ma session
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={onGoConnexion}
        className="self-start text-[0.8125rem] font-semibold text-blue-600 hover:text-orange-700"
      >
        Se connecter avec un autre compte
      </button>
    </div>
  );
}
