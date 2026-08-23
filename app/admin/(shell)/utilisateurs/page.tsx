import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { UTILISATEURS } from "@/features/admin/data/utilisateurs";
import { DROITS } from "@/features/admin/data/droits";

export default function UtilisateursPage() {
  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Accès
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Utilisateurs et droits
          </h1>
        </div>
        <Button variant="primary" icon={UserPlus}>
          Inviter un membre
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1fr)_210px_168px_120px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Membre</span>
            <span>Rôle</span>
            <span>Dernière connexion</span>
            <span>État</span>
          </div>
          {UTILISATEURS.map((u) => (
            <div
              key={u.email}
              className="grid grid-cols-[minmax(0,1fr)_210px_168px_120px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-ink">{u.nom}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </span>
              <span className="text-[#2b3646]">{u.role}</span>
              <span className="text-[0.8125rem] text-muted-foreground">{u.derniereConnexion}</span>
              <span>
                <Tag tone={u.etat === "Actif" ? "blue" : "neutral"}>{u.etat}</Tag>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        <div className="border-b border-border-subtle px-5 pt-4.5 pb-3.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Droits par rôle
          </span>
          <p className="mt-2 text-[0.8125rem] text-muted-foreground">
            Plein accès · Lecture seule · Aucun accès
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_150px_150px] gap-3 border-b border-border-subtle bg-n-50 px-5 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
              <span>Module</span>
              <span className="text-center">Admin national</span>
              <span className="text-center">Communication</span>
              <span className="text-center">Modération</span>
            </div>
            {DROITS.map((d) => (
              <div
                key={d.module}
                className="grid grid-cols-[minmax(0,1fr)_150px_150px_150px] items-center gap-3 border-b border-border-subtle px-5 py-2.5 text-sm last:border-b-0"
              >
                <span className="font-medium text-ink">{d.module}</span>
                <span className="text-center text-[#2b3646]">{d.administrateur}</span>
                <span className="text-center text-[#2b3646]">{d.communication}</span>
                <span className="text-center text-[#2b3646]">{d.moderation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
