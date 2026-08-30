"use client";

import * as Popover from "@radix-ui/react-popover";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Users, LogOut } from "lucide-react";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useAdminLogout } from "@/features/admin-auth/mutations/use-admin-logout";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { ThemeToggle } from "@/components/features/site/theme-toggle";
import { cn } from "@/components/ui/cn";

const THEME_TOGGLE_CLASSNAME =
  "flex size-9 flex-none items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-n-100 hover:text-ink";

function initialsOf(fullname: string): string {
  const parts = fullname.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function AdminHeader() {
  const shell = useAdminShell();
  const router = useRouter();
  const logout = useAdminLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace("/admin/connexion");
        router.refresh();
      },
    });
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border-subtle bg-surface-blur px-5 backdrop-blur-md md:px-8">
      <div className="w-[min(320px,34vw)]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-n-400"
          />
          <Input
            type="search"
            placeholder="Rechercher un signalement, un article…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle className={THEME_TOGGLE_CLASSNAME} />
        <IconButton icon={Bell} label="Notifications" variant="ghost" />
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-full py-1 pr-2.5 pl-1 text-inherit hover:bg-n-100"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-n-100 text-xs font-medium text-ink">
                {initialsOf(shell.fullname)}
              </span>
              <span className="flex min-w-0 flex-col text-left leading-tight">
                <span className="text-[0.8125rem] font-medium whitespace-nowrap text-ink">
                  {shell.fullname}
                </span>
                <span className="text-[0.6875rem] whitespace-nowrap text-muted-foreground">
                  {shell.role}
                </span>
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={6}
            className={cn(
              "z-100 w-56 rounded-md border border-border-strong bg-surface-card p-1 shadow-overlay",
              "data-[state=open]:animate-mec-pop data-[state=closed]:animate-mec-pop-out",
            )}
          >
            <div className="flex flex-col gap-0.5 px-2 py-1.5">
              <span className="truncate text-sm font-medium text-ink">{shell.fullname}</span>
              <span className="truncate text-xs text-muted-foreground">{shell.email}</span>
            </div>
            {shell.canUsers ? (
              <>
                <span className="my-1 block h-px bg-border-subtle" />
                <Popover.Close asChild>
                  <Link
                    href="/admin/utilisateurs"
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink hover:bg-n-100"
                  >
                    <Users size={16} />
                    <span>Administrateurs et droits</span>
                  </Link>
                </Popover.Close>
              </>
            ) : null}
            <span className="my-1 block h-px bg-border-subtle" />
            <Popover.Close asChild>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-verdict-false hover:bg-verdict-false-bg disabled:opacity-50"
              >
                <LogOut size={16} />
                <span>Se déconnecter</span>
              </button>
            </Popover.Close>
          </Popover.Content>
        </Popover.Root>
      </div>
    </header>
  );
}
