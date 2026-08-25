"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/features/site/data/nav-links";
import { NavLink } from "@/components/features/site/nav-link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="grid h-9 w-9 place-items-center rounded-sm text-ink"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-[72px] flex flex-col gap-1 border-b border-ink/10 bg-n-50 px-5 py-4 shadow-lg">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              variant="mobile"
              onClick={() => setOpen(false)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
