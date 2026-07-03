import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, ExternalLink, Mail, Route, UserRound } from "lucide-react";

import { RecruiterJourneyTrackedLink, RecruiterJourneyViewed } from "@/components/recruiter-journey-interactions";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Contact | Saurabh Chawda",
  description:
    "Contact Saurabh Chawda for Senior or Lead Product Manager, AI Product Manager, and platform product opportunities.",
  alternates: {
    canonical: "/contact"
  },
  openGraph: {
    title: "Contact | Saurabh Chawda",
    description:
      "Reach Saurabh Chawda by email, LinkedIn, GitHub, Professional Profile, or Product OS.",
    url: "https://saurabh-product-os.vercel.app/contact",
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
    title: "Contact | Saurabh Chawda",
    description:
      "Reach Saurabh Chawda by email, LinkedIn, GitHub, Professional Profile, or Product OS.",
    images: ["/og-image.png"]
  }
};

const contactLinks = [
  {
    title: "Email",
    description: "Send a direct email for role conversations, interview coordination, or follow-up.",
    href: "mailto:saurabh1chawda@gmail.com",
    value: "saurabh1chawda@gmail.com",
    icon: <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "LinkedIn",
    description: "Connect or message me on LinkedIn.",
    href: "https://www.linkedin.com/in/chawdasaurabh/",
    value: "linkedin.com/in/chawdasaurabh",
    icon: <ExternalLink className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "GitHub",
    description: "Review the public implementation behind Product OS.",
    href: "https://github.com/saurabh1chawda",
    value: "github.com/saurabh1chawda",
    icon: <ExternalLink className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Product OS",
    description: "Open the Decision Operating System for a structured review of product judgment.",
    href: "/decision-operating-system",
    value: "Decision Operating System",
    icon: <Route className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Professional Profile",
    description: "Open the career profile for positioning, capabilities, metrics, and experience context.",
    href: "/profile",
    value: "Professional Profile",
    icon: <UserRound className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

export default function ContactPage() {
  return (
    <>
      <RecruiterJourneyViewed eventName="contact_page_viewed" pageName="Contact" />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="contact-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Contact</p>
              <h1 id="contact-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Contact
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                For Senior / Lead Product Manager, AI Product Manager, and platform product opportunities, LinkedIn or email is the best way to reach me.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <RecruiterJourneyTrackedLink
                  href="mailto:saurabh1chawda@gmail.com"
                  eventName="contact_link_clicked"
                  label="Email Saurabh"
                  variant="primary"
                >
                  Email Saurabh
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </RecruiterJourneyTrackedLink>
                <RecruiterJourneyTrackedLink
                  href="https://www.linkedin.com/in/chawdasaurabh/"
                  eventName="contact_link_clicked"
                  label="View LinkedIn"
                  variant="secondary"
                >
                  View LinkedIn
                </RecruiterJourneyTrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="contact-options-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Contact Options" id="contact-options-title" title="Fast ways to continue the conversation" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contactLinks.map((item) => (
                <article key={item.title} className="rounded-md border border-line bg-panel p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper">
                    {item.icon}
                  </div>
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                  <p className="mt-4 text-sm font-semibold text-ink">{item.value}</p>
                  <RecruiterJourneyTrackedLink href={item.href} eventName="contact_link_clicked" label={item.title} className="mt-5">
                    Open
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </RecruiterJourneyTrackedLink>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function SectionHeader({
  eyebrow,
  id,
  title
}: {
  eyebrow: string;
  id: string;
  title: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
