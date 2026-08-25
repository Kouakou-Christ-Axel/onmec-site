"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  label: string;
  variant?: "desktop" | "mobile";
  onClick?: () => void;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Lien de nav réutilisé en desktop (site-header) et mobile (mobile-nav), avec état actif détecté via l'URL courante. */
export function NavLink({ href, label, variant = "desktop", onClick }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname ?? "", href);

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`rounded-sm px-2 py-2.5 text-[15px] transition-colors ${
          active
            ? "bg-orange-50 font-semibold text-orange-700"
            : "font-medium text-ink hover:bg-n-100"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="flex items-center py-5 text-ink transition-colors hover:text-orange-700"
    >
      <span
        className={`border-b-2 pb-0.5 ${
          active ? "border-orange-500 font-semibold" : "border-transparent font-medium"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
