"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <section className="border-b border-line bg-panel" aria-labelledby="error-title">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Something Went Wrong</p>
          <h1 id="error-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Product OS could not load this view.
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted">
            Retry the page, or return to the Executive Brief to continue the product leadership review.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink"
            >
              Try again
            </button>
            <Link
              href="/executive"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              Read the Executive Brief
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
