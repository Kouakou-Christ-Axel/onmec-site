import { ContactHero } from "@/components/features/contact/hero";
import { ContactFormSection } from "@/components/features/contact/contact-form-section";
import { ContactBySubject } from "@/components/features/contact/contact-by-subject";
import { ContactCta } from "@/components/features/contact/contact-cta";

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
