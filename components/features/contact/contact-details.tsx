import { MapPin, Clock, Mail, Phone, type LucideIcon } from "lucide-react";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";

type DetailRow = {
  icon: LucideIcon;
  label?: string;
  value: string;
  href?: string;
};

/**
 * Adresse exacte du siège pas encore communiquée par l'équipe MEC (voir §4.1 de l'audit SEO) —
 * `null` plutôt qu'une valeur inventée. La ligne, et le plan d'accès qui en dépend, se masquent
 * tant que la donnée réelle est absente, et réapparaissent d'eux-mêmes dès qu'elle est renseignée
 * ici.
 */
const ADRESSE: string | null = null;
const TELEPHONE = "+225 05 64 36 55 53";

const ROWS: DetailRow[] = [
  ...(ADRESSE ? [{ icon: MapPin, value: ADRESSE }] : []),
  { icon: Clock, label: "Du lundi au vendredi", value: "8 h 30 – 17 h 00" },
  { icon: Mail, value: "contact@mec-ci.org", href: "mailto:contact@mec-ci.org" },
  { icon: Phone, value: TELEPHONE, href: `tel:${TELEPHONE.replace(/\s/g, "")}` },
];

export function ContactDetails() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-block border-b-2 border-ink pb-3 text-xs font-semibold tracking-widest text-ink uppercase">
          Le siège
        </span>
        <div className="mt-6 flex flex-col gap-5">
          {ROWS.map((row) => (
            <div key={row.value} className="flex items-start gap-3.5">
              <row.icon className="mt-0.5 h-5 w-5 flex-none text-orange-600" aria-hidden />
              <span className="flex flex-col gap-0.5">
                {row.label ? <span className="text-xs text-text-muted">{row.label}</span> : null}
                {row.href ? (
                  <a
                    href={row.href}
                    className="text-base font-medium text-ink transition-colors hover:text-orange-700"
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="text-base font-medium text-ink">{row.value}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {ADRESSE ? (
        <PhotoPlaceholder ratio="4/3" />
      ) : null}
    </div>
  );
}
