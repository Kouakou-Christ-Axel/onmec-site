import type { Ressource } from "@/features/ressources/types/ressource";

export function RessourceBody({ ressource }: { ressource: Ressource }) {
  return (
    <article className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-18 lg:px-16 lg:pb-24">
      <div className="max-w-[68ch]">
        <h2 className="mb-5 text-2xl leading-tight font-semibold tracking-tight text-ink">
          À propos de ce guide
        </h2>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-text-body">
          <p>{ressource.body}</p>
          <p className="text-base text-text-muted">
            Le guide est libre d’usage en classe et en club, photocopie comprise. Merci de conserver
            la mention du MEC en pied de page. Toute réédition ou traduction demande notre accord
            écrit.
          </p>
        </div>
      </div>
    </article>
  );
}
