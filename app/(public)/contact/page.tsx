import type { Metadata } from "next";
import { ContactHero } from "@/components/features/contact/hero";
import { ContactFormSection } from "@/components/features/contact/contact-form-section";
import { ContactBySubject } from "@/components/features/contact/contact-by-subject";
import { ContactCta } from "@/components/features/contact/contact-cta";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez le MEC à Abidjan, Côte d'Ivoire : question, invitation, demande de partenariat — réponse sous 3 jours ouvrés en moyenne, le jour même pour la presse.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactFormSection />
      <ContactBySubject />
      <ContactCta />
    </main>
  );
}
