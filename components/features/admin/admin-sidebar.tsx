"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Flag, Newspaper, BookOpen, Megaphone, Smartphone, Landmark, Users, ExternalLink, LogOut, type LucideIcon } from "lucide-react";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { buildQueue } from "@/features/admin/lib/build-queue";
import { SIGNALEMENTS } from "@/features/admin/data/signalements";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requires: "canSig" | "canEdito" | "canUsers" | null;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "File de travail", icon: Inbox, requires: null },
  { href: "/admin/signalements", label: "Signalements", icon: Flag, requires: "canSig" },
  { href: "/admin/actualites", label: "Actualités et blog", icon: Newspaper, requires: "canEdito" },
  { href: "/admin/ressources", label: "Ressources", icon: BookOpen, requires: "canEdito" },
  { href: "/admin/campagnes", label: "Campagnes", icon: Megaphone, requires: "canEdito" },
  { href: "/admin/push", label: "Notifications app", icon: Smartphone, requires: "canEdito" },
  { href: "/admin/statistiques", label: "Statistiques", icon: Landmark, requires: null },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, requires: "canUsers" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const shell = useAdminShell();
  const queue = buildQueue(shell);
  const cntOuverts = SIGNALEMENTS.filter((s) => s.statut === "validation" || s.statut === "encours").length;

  const visibleItems = NAV_ITEMS.filter((item) => item.requires === null || shell[item.requires]);

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col self-start bg-blue-800 px-3.5 pt-5.5 pb-4 text-white">
      <Link href="/" className="mb-1.5 flex items-center gap-2.5 px-0.5">
        <img src="/assets/logo/mec-reversed.png" alt="MEC" className="h-8.5 w-auto flex-none" />
      </Link>
      <span className="mb-5.5 px-0.5 text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-400 uppercase">
        Administration
      </span>

      <nav className="flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          const badge = item.href === "/admin" ? queue.length : item.href === "/admin/signalements" ? cntOuverts : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/11 text-white before:absolute before:top-1.5 before:bottom-1.5 before:-left-3.5 before:w-[3px] before:content-[''] before:bg-orange-500"
                  : "text-white/74 hover:bg-white/7 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {badge !== null && badge > 0 ? (
                <span
                  className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-bold ${
                    item.href === "/admin" ? "bg-orange-500 text-white" : "bg-white/14 text-white"
                  }`}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link href="/" className="flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-white/60 hover:bg-white/7 hover:text-white">
          <ExternalLink size={18} />
          <span>Voir le site public</span>
        </Link>
        <div className="flex items-center gap-2.5 border-t border-white/14 px-2.5 py-3">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-orange-500 text-xs font-bold text-white">
            AT
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[0.8125rem] font-semibold text-white">Aminata Traoré</span>
            <span className="overflow-hidden text-[0.6875rem] text-ellipsis whitespace-nowrap text-white/55">{shell.role}</span>
          </span>
          <Link
            href="/admin/connexion"
            title="Se déconnecter"
            className="ml-auto flex h-7.5 w-7.5 flex-none items-center justify-center rounded-md text-white/55 hover:bg-white/9 hover:text-white"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
