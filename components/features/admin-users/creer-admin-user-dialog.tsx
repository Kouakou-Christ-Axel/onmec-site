"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreerAdminUser } from "@/features/admin-users/mutations/use-creer-admin-user";
import { creerAdminUserSchema } from "@/features/admin-users/schemas/creer-admin-user-schema";
import { backendMessage } from "@/features/admin-users/lib/backend-error-message";
import { mapAdminRole } from "@/features/admin-auth/lib/map-admin-role";
import { MotDePasseTemporaireReveal } from "./mot-de-passe-temporaire-reveal";
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";
import type { CreatedAdminUser } from "@/features/admin-users/types/admin-user";

const ROLES = creerAdminUserSchema.shape.role.options;

interface CreerAdminUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreerAdminUserDialog({ open, onClose, onCreated }: CreerAdminUserDialogProps) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AdminRole>("MODERATEUR");
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedAdminUser | null>(null);
  const mutation = useCreerAdminUser();

  function reset() {
    setFullname("");
    setEmail("");
    setPhone("");
    setRole("MODERATEUR");
    setFormError(null);
    setCreated(null);
    mutation.reset();
  }

  function handleClose() {
    const hadCreated = created !== null;
    reset();
    onClose();
    if (hadCreated) onCreated();
  }

  function submit() {
    const parsed = creerAdminUserSchema.safeParse({
      fullname,
      email,
      phone: phone || undefined,
      role,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
      return;
    }
    setFormError(null);
    mutation.mutate(parsed.data, {
      onSuccess: (result) => setCreated(result),
    });
  }

  const pending = mutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            {created ? "Compte créé" : "Inviter un administrateur"}
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>

      {created ? (
        <MotDePasseTemporaireReveal
          password={created.password}
          description={`Ce mot de passe ne sera plus jamais affiché. Notez-le ou transmettez-le maintenant à ${created.fullname} (${created.email}) — aucun email n’est envoyé automatiquement.`}
        />
      ) : (
        <div className="flex flex-col gap-4.5 p-5.5">
          <Field label="Nom complet">
            <Input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              disabled={pending}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </Field>
          <Field label="Téléphone" hint="Facultatif">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={pending} />
          </Field>
          <Field label="Rôle">
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              disabled={pending}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {mapAdminRole(r)}
                </option>
              ))}
            </Select>
          </Field>
          {formError ? <p className="text-sm text-verdict-false">{formError}</p> : null}
          {mutation.isError ? (
            <p className="text-sm text-verdict-false">
              {backendMessage(
                mutation.error,
                "Échec de la création — vérifiez les informations et réessayez.",
              )}
            </p>
          ) : null}
        </div>
      )}

      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        {created ? (
          <Button variant="primary" onClick={handleClose}>
            J’ai noté le mot de passe, fermer
          </Button>
        ) : (
          <>
            <Button variant="primary" disabled={pending} onClick={submit}>
              {pending ? "…" : "Créer le compte"}
            </Button>
            <Button variant="ghost" onClick={handleClose} disabled={pending}>
              Annuler
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}
