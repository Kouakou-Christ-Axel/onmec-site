"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS_ENVOYEES, CIBLES_NOTIFICATION, MOMENTS_ENVOI } from "@/features/admin/data/notifications-envoyees";

export default function PushPage() {
  const [titre, setTitre] = useState("Nid de poule d’Angré : la chaussée est réparée");
  const [texte, setTexte] = useState("Signalé le 12/08 par un citoyen, rebouché le 17/08. Merci d’avoir signalé.");
  const [cible, setCible] = useState<string>(CIBLES_NOTIFICATION[0]);

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">Application mobile</span>
        <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">Notifications</h1>
        <p className="max-w-[62ch] text-[0.9375rem] text-muted-foreground">
          Un envoi par semaine au maximum. Chaque notification renvoie vers un signalement suivi ou une action
          datée.
        </p>
      </div>

      <div className="grid items-start gap-5.5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4.5 rounded-lg border border-border-subtle bg-surface-card p-6">
          <Field label="Titre" hint="60 caractères maximum, verbe à l’infinitif ou fait daté">
            <Input value={titre} onChange={(e) => setTitre(e.target.value)} />
          </Field>
          <Field label="Message">
            <Textarea rows={3} value={texte} onChange={(e) => setTexte(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Destinataires">
              <Select value={cible} onChange={(e) => setCible(e.target.value)}>
                {CIBLES_NOTIFICATION.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Envoi">
              <Select defaultValue={MOMENTS_ENVOI[0]}>
                {MOMENTS_ENVOI.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex items-center gap-2.5 border-t border-border-subtle pt-1">
            <Button variant="primary" icon={Send}>
              Programmer l’envoi
            </Button>
            <Button variant="ghost">Enregistrer le brouillon</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Aperçu sur l’appareil
          </span>
          <div className="rounded-[14px] bg-ink px-4 pt-5 pb-6.5">
            <span className="mb-3.5 block text-center text-[0.6875rem] text-white/45">
              Vendredi 21 août · 08 h 30
            </span>
            <div className="flex gap-2.5 rounded-[10px] bg-white/94 p-3">
              <img src="/assets/logo/mec-mark-square.png" alt="" className="h-7.5 w-7.5 flex-none object-contain" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[0.8125rem] leading-tight font-bold text-ink">{titre}</span>
                <span className="text-xs leading-snug text-[#2b3646]">{texte}</span>
              </span>
            </div>
            <span className="mt-3 block text-center text-[0.6875rem] text-white/50">
              MEC — Signalement citoyen · {cible}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1fr)_148px_116px_128px_104px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Notification envoyée</span>
            <span>Destinataires</span>
            <span>Date</span>
            <span>Reçue par</span>
            <span className="text-right">Ouverture</span>
          </div>
          {NOTIFICATIONS_ENVOYEES.map((n) => (
            <div
              key={n.titre}
              className="grid grid-cols-[minmax(0,1fr)_148px_116px_128px_104px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="font-medium text-ink">{n.titre}</span>
              <span className="text-[0.8125rem] text-muted-foreground">{n.destinataires}</span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">{n.date}</span>
              <span className="tabular-nums">{n.recuePar}</span>
              <span className={`text-right font-semibold tabular-nums ${n.ouvertureForte ? "text-verdict-true" : "text-[#2b3646]"}`}>
                {n.ouverture}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
