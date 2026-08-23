import { Hourglass, Mail, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttenteViewProps {
  email: string;
  onGoConnexion: () => void;
}

export function AttenteView({ email, onGoConnexion }: AttenteViewProps) {
  return (
    <div className="flex flex-col gap-5.5">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-orange-50 text-orange-600">
        <Hourglass size={22} />
      </span>
      <div>
        <h1 className="mb-2.5 text-[1.625rem] leading-none font-semibold tracking-[-0.028em] text-ink">
          Compte en attente de validation
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Votre demande pour <strong className="font-semibold text-ink">{email}</strong> est
          enregistrée. Un administrateur national l’active depuis la page Utilisateurs, en général
          sous 48 heures ouvrées.
        </p>
      </div>
      <div className="flex flex-col gap-2.5 rounded-lg border border-border-subtle bg-n-50 p-4">
        <span className="flex items-center gap-2.5 text-[0.8125rem] text-[#2b3646]">
          <Mail size={16} /> Vous recevrez un e-mail dès l’activation
        </span>
        <span className="flex items-center gap-2.5 text-[0.8125rem] text-[#2b3646]">
          <LifeBuoy size={16} /> Demande urgente · informatique@mec-ci.org
        </span>
      </div>
      <div className="grid">
        <Button variant="secondary" size="lg" full onClick={onGoConnexion}>
          Retour à la connexion
        </Button>
      </div>
    </div>
  );
}
