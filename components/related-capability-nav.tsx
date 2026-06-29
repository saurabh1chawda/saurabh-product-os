import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import type { RelatedCapabilityLink } from "@/data/capability-links";

type RelatedCapabilityNavProps = {
  links: RelatedCapabilityLink[];
};

export function RelatedCapabilityNav({ links }: RelatedCapabilityNavProps) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="related-capability-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Related Capability</p>
          <h2 id="related-capability-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Customer Discovery bundle
          </h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {links.map((link) => (
            <article key={link.href} className="rounded-md border border-line bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{link.label}</p>
              <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{link.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{link.description}</p>
              <ButtonLink href={link.href} variant="inline" className="mt-5">
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
