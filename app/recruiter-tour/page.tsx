import type { Metadata } from "next";

import { RecruiterTour } from "@/components/recruiter-tour";
import { SiteHeader } from "@/components/site-header";

const pageDescription =
  "A guided five-minute tour for recruiters and hiring managers to understand Saurabh Chawda's Decision Operating System, product judgment and flagship product decisions.";

export const metadata: Metadata = {
  title: "5-Minute Recruiter Guided Tour",
  description: pageDescription,
  alternates: {
    canonical: "/recruiter-tour"
  },
  openGraph: {
    title: "5-Minute Recruiter Guided Tour | Decision Operating System",
    description: pageDescription,
    url: "https://saurabh-product-os.vercel.app/recruiter-tour",
    type: "website",
    siteName: "Product Operating System",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Saurabh Chawda Product Operating System"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "5-Minute Recruiter Guided Tour | Decision Operating System",
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

export default function RecruiterTourPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="recruiter-tour-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">5-Minute Recruiter Guided Tour</p>
              <h1 id="recruiter-tour-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Understand how I think before you review my resume.
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                A short guided path through my product philosophy, Decision Systems, Decision Journals and career impact.
              </p>
            </div>
          </div>
        </section>
        <RecruiterTour />
      </main>
    </>
  );
}
