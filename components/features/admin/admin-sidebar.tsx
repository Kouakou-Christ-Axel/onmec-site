"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flag,
  Newspaper,
  BookOpen,
  Users2,
  GraduationCap,
  Landmark,
  Users,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { SIGNALEMENTS } from "@/features/admin/data/signalements";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  requires: "canSig" | "canEdito" | "canUsers" | "canMembres" | "canQuiz" | null;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/signalements", label: "Signalements", icon: Flag, requires: "canSig" },
  { href: "/admin/actualites", label: "Actualités et blog", icon: Newspaper, requires: "canEdito" },
  { href: "/admin/ressources", label: "Ressources", icon: BookOpen, requires: "canEdito" },
  { href: "/admin/membres", label: "Membres", icon: Users2, requires: "canMembres" },
  { href: "/admin/quiz", label: "Quiz", icon: GraduationCap, requires: "canQuiz" },
  // Campagnes, Notifications app et File de travail masqués temporairement :
  // pas d'endpoint backend pour Campagnes/Push, et File de travail encore en
  // mock (routes/pages conservées, non retirées).
  { href: "/admin/statistiques", label: "Statistiques", icon: Landmark, requires: null },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, requires: "canUsers" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const shell = useAdminShell();
  const cntOuverts = SIGNALEMENTS.filter(
    (s) => s.statut === "validation" || s.statut === "encours",
  ).length;

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
          const badge = item.href === "/admin/signalements" ? cntOuverts : null;
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
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/14 px-1.5 text-[0.6875rem] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/"
          className="flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-white/60 hover:bg-white/7 hover:text-white"
        >
          <ExternalLink size={18} />
          <span>Voir le site public</span>
        </Link>
      </div>
    </aside>
  );
}
