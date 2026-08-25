import { Reveal } from "@/components/features/site/reveal";
import { ContactForm } from "@/components/features/contact/contact-form";
import { ContactDetails } from "@/components/features/contact/contact-details";

export function ContactFormSection() {
  return (
    <section className="pb-14 sm:pb-18 lg:pb-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={80}>
            <ContactDetails />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
