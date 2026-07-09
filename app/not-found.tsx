import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="not-found-title">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Page Not Found</p>
            <h1 id="not-found-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              This path does not exist in Product OS.
            </h1>
            <p className="mt-6 text-xl leading-8 text-muted">
              Start with the Executive Brief for the fastest overview, or continue into the Product Leadership Briefs for role-fit evidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/executive"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink"
              >
                Read the Executive Brief
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              >
                Contact Saurabh
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
