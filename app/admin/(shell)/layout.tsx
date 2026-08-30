import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShellProvider } from "@/components/features/admin/admin-shell-context";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { AdminHeader } from "@/components/features/admin/admin-header";
import { adminMeRequest } from "@/features/admin-auth/requests/admin-me";
import { mapAdminRole } from "@/features/admin-auth/lib/map-admin-role";
import { ApiError } from "@/lib/api-error";
import type { AdminSession } from "@/features/admin-auth/types/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (session.mustChangePassword) {
    redirect("/admin/changer-mot-de-passe");
  }

  return (
    <AdminShellProvider
      id={session.id}
      initialRole={mapAdminRole(session.role)}
      fullname={session.fullname}
      email={session.email}
    >
      <div className="flex min-h-screen bg-surface-page text-text-body">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 px-5 py-6 pb-16 md:px-8 md:py-8.5">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}

async function getAdminSession(): Promise<AdminSession> {
  try {
    return await adminMeRequest();
  } catch (error) {
    if (error instanceof ApiError) {
      redirect("/admin/connexion");
    }
    throw error;
  }
}
