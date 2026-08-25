import Link from "next/link";
import { NAV_LINKS } from "@/features/site/data/nav-links";
import { NavLink } from "@/components/features/site/nav-link";
import { MobileNav } from "@/components/features/site/mobile-nav";
import { ThemeToggle } from "@/components/features/site/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center border-b border-ink/10 bg-surface-blur backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-[1280px] items-center gap-6 px-5 sm:px-8 lg:gap-4 lg:px-16 xl:gap-9">
        <Link href="/" className="flex flex-none items-center">
          <img
            src="/assets/logo/mec-lockup.png"
            alt="MEC — Mouvement pour l'Éducation à la Citoyenneté"
            className="h-9 w-auto dark:hidden lg:h-11"
          />
          <img
            src="/assets/logo/mec-reversed.png"
            alt="MEC — Mouvement pour l'Éducation à la Citoyenneté"
            className="hidden h-9 w-auto dark:block lg:h-11"
          />
        </Link>
        <nav className="ml-auto hidden items-center gap-3 text-sm lg:flex xl:gap-6">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
          <ThemeToggle />
          <Link
            href="/rejoindre"
            className="inline-flex h-9 items-center rounded-sm bg-orange-500 px-3 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-orange-600"
          >
            Rejoindre le mouvement
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
