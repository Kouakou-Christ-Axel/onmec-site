import type { ReactNode } from "react";
import { AdminShellProvider } from "@/components/features/admin/admin-shell-context";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { AdminHeader } from "@/components/features/admin/admin-header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShellProvider>
      <div className="flex min-h-screen bg-surface-page text-[#2b3646]">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 px-5 py-6 pb-16 md:px-8 md:py-8.5">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
