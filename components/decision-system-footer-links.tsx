import { ArrowRight, Compass } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

const links = [
  {
    title: "Executive Brief",
    href: "/executive",
    description: "Start with the fastest overview of Product OS, evidence, and business impact."
  },
  {
    title: "Decision Operating System",
    href: "/decision-operating-system",
    description: "Return to the completed AI Product Operating System v1."
  },
  {
    title: "Recruiter Tour",
    href: "/recruiter-tour",
    description: "Follow the fastest guided path for hiring teams."
  },
  {
    title: "AI Product Principles",
    href: "/ai-product-principles",
    description: "Review the philosophy behind the decision systems."
  }
];

export function DecisionSystemFooterLinks() {
  return (
    <section className="border-b border-line py-12 sm:py-14" aria-labelledby="decision-system-footer-links-title">
      <div className="rounded-md border border-line bg-panel p-6">
        <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue from here</p>
        <h2 id="decision-system-footer-links-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
          Explore the complete AI Product Operating System
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <article key={link.title} className="rounded-md border border-line bg-paper p-4">
              <h3 className="font-semibold leading-6 text-ink">{link.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{link.description}</p>
              <ButtonLink href={link.href} className="mt-4 text-sm">
                Open
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
