import type { ReactNode } from "react";
import Link from "next/link";

type BannerAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

function BannerButton({
  action,
  variant,
}: {
  action: BannerAction | ReactNode;
  variant: "invert" | "outline-invert";
}) {
  const className =
    variant === "invert"
      ? "inline-flex h-11 items-center rounded-sm bg-white px-6 text-base font-semibold text-fill-ink transition-colors hover:bg-n-100"
      : "inline-flex h-11 items-center rounded-sm border border-white/35 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10";

  // Pages qui ont besoin d'un comportement client (ex. window.location.reload()) passent leur
  // propre bouton (composant client dédié) plutôt qu'un onClick — garde ce bandeau rendable
  // depuis un Server Component tant que la page appelante n'a pas besoin d'interactivité.
  if (!action || typeof action !== "object" || !("label" in action)) {
    return <>{action}</>;
  }

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

/** Bandeau plein-largeur partagé par les pages système (404, 500, 403, maintenance). */
export function ErrorPageBanner({
  background,
  number,
  numberClassName,
  eyebrow,
  eyebrowClassName,
  title,
  description,
  primary,
  secondary,
}: {
  background: string;
  number: string;
  numberClassName: string;
  eyebrow: string;
  eyebrowClassName: string;
  title: ReactNode;
  description: string;
  primary: BannerAction | ReactNode;
  secondary: BannerAction | ReactNode;
}) {
  return (
    <section className={background}>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-6 px-5 py-14 sm:grid-cols-[auto_1fr] sm:gap-10 sm:px-8 sm:py-20 lg:px-16">
        <span className={`text-7xl leading-[0.8] font-semibold tracking-tight sm:text-8xl lg:text-9xl ${numberClassName}`}>
          {number}
        </span>
        <div className="flex flex-col gap-4">
          <span className={`text-xs font-semibold tracking-widest uppercase ${eyebrowClassName}`}>{eyebrow}</span>
          <h1 className="max-w-[24ch] text-4xl leading-none font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-[52ch] text-[1.0625rem] leading-relaxed text-white/88 text-pretty">
            {description}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <BannerButton action={primary} variant="invert" />
            <BannerButton action={secondary} variant="outline-invert" />
          </div>
        </div>
      </div>
    </section>
  );
}
