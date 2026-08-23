import type { ReactNode } from "react";
import { SiteHeader } from "@/components/features/site/site-header";
import { SiteFooter } from "@/components/features/site/site-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
