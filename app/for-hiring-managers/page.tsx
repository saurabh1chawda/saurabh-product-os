import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  GitBranch,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";

import {
  HiringManagerSectionViewed,
  HiringManagerTrackedLink,
  HiringManagerViewed
} from "@/components/hiring-manager-interactions";
import { SiteHeader } from "@/components/site-header";

const metadataTitle = "For Hiring Managers | AI Product Operating System";
const pageDescription =
  "A five-minute executive briefing for hiring managers evaluating Saurabh Chawda's product philosophy, AI product judgment, execution approach, leadership style, and measurable business outcomes.";
const pageUrl = "https://saurabh-product-os.vercel.app/for-hiring-managers";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/for-hiring-managers"
  },
  openGraph: {
    title: metadataTitle,
    description: pageDescription,
    url: pageUrl,
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
    title: metadataTitle,
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

const metadataItems = [
  { label: "Reading Time", value: "5 min" },
  { label: "Audience", value: "Hiring Managers" },
  { label: "Purpose", value: "Interview Preparation" },
  { label: "Version", value: "v1.0" }
];

const thinkingCards = [
  "Customer problems before solutions.",
  "Build evidence before confidence.",
  "AI should improve workflows, not create novelty.",
  "Product trade-offs should be explicit.",
  "Product decisions should be measurable."
];

const workFlow = [
  {
    title: "Customer Discovery",
    description: "Clarify the real customer problem, current behavior, and root cause before choosing a solution."
  },
  {
    title: "Validation",
    description: "Test the riskiest assumption before increasing product, engineering, design, or GTM investment."
  },
  {
    title: "Prioritization",
    description: "Choose the highest-leverage problem based on customer value, business impact, and readiness."
  },
  {
    title: "Execution",
    description: "Translate strategy into sequenced delivery, explicit trade-offs, and cross-functional alignment."
  },
  {
    title: "Measurement",
    description: "Connect product decisions to customer behavior, business outcomes, quality, trust, and cost-to-value."
  },
  {
    title: "Iteration",
    description: "Use learning signals to improve the product system rather than defending the first plan."
  }
];

const metrics = [
  { value: "10x", label: "Revenue Growth" },
  { value: "10M+", label: "Monthly Transactions" },
  { value: "40%", label: "Platform Query Latency Reduction" },
  { value: "2x", label: "Release Velocity" },
  { value: "15+", label: "Enterprise Deployments" },
  { value: "94%", label: "Customer Satisfaction" }
];

const optimizeCards = [
  {
    title: "Customer Value",
    description: "Start from behavior change and customer outcomes, not internal preferences.",
    icon: <UsersRound className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Business Outcomes",
    description: "Make commercial impact, adoption, retention, and efficiency visible in product decisions.",
    icon: <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Technical Simplicity",
    description: "Prefer the simplest reliable architecture that solves the customer problem.",
    icon: <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "AI Trust",
    description: "Design AI experiences around trust, failure modes, human override, and measurable usefulness.",
    icon: <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Long-term Maintainability",
    description: "Avoid short-term wins that create operational drag, unclear ownership, or fragile systems.",
    icon: <ClipboardCheck className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const decisionSystems = [
  {
    title: "Customer Discovery",
    description: "How I decide whether a problem matters before choosing a solution path.",
    href: "/decision-systems/customer-discovery"
  },
  {
    title: "Validation & Experimentation",
    description: "How I reduce expensive uncertainty before scaling product investment.",
    href: "/decision-systems/validation-experimentation"
  },
  {
    title: "AI Prioritization",
    description: "How I decide which AI opportunities deserve attention first, and why.",
    href: "/decision-systems/ai-prioritization"
  }
];

const productStories = [
  {
    title: "Simplilearn",
    description: "Growth and monetization decisions that helped grow Job Guarantee revenue 10x.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "JoVE",
    description: "Discovery work that shifted focus from more content to better customer workflows.",
    href: "/stories/product-discovery-jove"
  },
  {
    title: "Logix",
    description: "Platform modernization sequenced around customer value, release velocity, and reliability.",
    href: "/stories/platform-modernization-logix"
  }
];

const leadershipCards = [
  {
    title: "Team alignment",
    description: "Create shared context around the problem, decision, trade-offs, and success criteria."
  },
  {
    title: "Decision-making",
    description: "Write decisions clearly, separate facts from assumptions, and make the cost of delay visible."
  },
  {
    title: "Product reviews",
    description: "Use reviews to improve judgment, not just check status. The goal is better product thinking."
  },
  {
    title: "Coaching mindset",
    description: "Help teams and PMs sharpen problem framing, evidence quality, and stakeholder communication."
  },
  {
    title: "Constructive disagreement",
    description: "Make disagreement useful by grounding it in customer evidence, business impact, and constraints."
  }
];

const workingTogether = [
  "High ownership",
  "Low ego",
  "Clear communication",
  "Data-informed decisions",
  "Customer obsession",
  "Bias toward action",
  "Continuous learning"
];

const sectionNames = [
  "Hero",
  "How I Think",
  "How I Work",
  "What I've Delivered",
  "What I Optimize For",
  "Why AI Product Management",
  "Representative Decision Systems",
  "Representative Product Stories",
  "Leadership Philosophy",
  "Working Together",
  "Final CTA"
];

const breadcrumbs = [
  { name: "Home", item: "https://saurabh-product-os.vercel.app" },
  { name: "For Hiring Managers", item: pageUrl }
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: breadcrumb.name,
    item: breadcrumb.item
  }))
};

export default function ForHiringManagersPage() {
  return (
    <>
      <HiringManagerViewed />
      {sectionNames.map((sectionName) => (
        <HiringManagerSectionViewed key={sectionName} sectionName={sectionName} />
      ))}
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd)
          }}
        />

        <section className="border-b border-line bg-panel" aria-labelledby="hiring-managers-title" data-hiring-manager-section="Hero">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm font-medium text-muted">
              {breadcrumbs.map((breadcrumb, index) => (
                <span key={breadcrumb.name} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  <span className={index === breadcrumbs.length - 1 ? "text-ink" : ""}>{breadcrumb.name}</span>
                </span>
              ))}
            </nav>
            <div className="mt-8 max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Hiring Manager Briefing</p>
              <h1 id="hiring-managers-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                For Hiring Managers
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Thank you for taking the time to review my profile. Product OS was created to make my product thinking, decision quality, and operating principles visible before we meet.
              </p>
              <dl className="mt-8 grid gap-3 sm:grid-cols-4">
                {metadataItems.map((item) => (
                  <MetaItem key={item.label} label={item.label} value={item.value} />
                ))}
              </dl>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <HiringManagerTrackedLink href="/decision-operating-system" eventName="hiring_manager_decision_system_clicked" label="Decision Operating System" variant="primary">
                  Decision Operating System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </HiringManagerTrackedLink>
                <HiringManagerTrackedLink href="/profile" eventName="contact_cta_clicked" label="Professional Profile" variant="secondary">
                  Professional Profile
                </HiringManagerTrackedLink>
              </div>
            </div>
          </div>
        </section>

        <BriefSection id="how-i-think" sectionName="How I Think" eyebrow="How I Think" title="The product judgment I bring into ambiguous work">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {thinkingCards.map((item) => (
              <article key={item} className="rounded-md border border-line bg-panel p-5">
                <Lightbulb className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-lg font-semibold leading-tight text-ink">{item}</h2>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="how-i-work" sectionName="How I Work" eyebrow="How I Work" title="A repeatable operating rhythm" background="panel">
          <div className="grid gap-3">
            {workFlow.map((stage, index) => (
              <div key={stage.title}>
                <article className="rounded-md border border-line bg-paper p-5">
                  <h2 className="text-xl font-semibold leading-tight text-ink">{stage.title}</h2>
                  <p className="mt-2 leading-7 text-muted">{stage.description}</p>
                </article>
                {index < workFlow.length - 1 ? (
                  <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="what-ive-delivered" sectionName="What I've Delivered" eyebrow="What I've Delivered" title="Outcomes from product decisions">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-md border border-line bg-panel p-5">
                <p className="text-4xl font-semibold leading-none text-ink">{metric.value}</p>
                <h2 className="mt-4 text-lg font-semibold leading-tight text-ink">{metric.label}</h2>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl leading-7 text-muted">
            These outcomes span AI, enterprise SaaS, platform modernization, growth products, and transaction-scale systems.
          </p>
        </BriefSection>

        <BriefSection id="what-i-optimize-for" sectionName="What I Optimize For" eyebrow="What I Optimize For" title="The constraints I keep visible" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {optimizeCards.map((item) => (
              <article key={item.title} className="rounded-md border border-line bg-paper p-5">
                {item.icon}
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="why-ai-product-management" sectionName="Why AI Product Management" eyebrow="Why AI Product Management" title="AI is valuable when it improves the product system">
          <div className="rounded-md border border-line bg-panel p-6">
            <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
            <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
              AI product management matters because AI changes what products can help customers decide, automate, understand, and complete. But AI is not inherently valuable. The value comes from improving workflows, decision quality, speed, trust, and measurable outcomes. My approach is to start with the customer problem, validate whether AI belongs in the solution, evaluate data and execution readiness, and measure whether the product creates better customer and business outcomes. I am most interested in AI products where intelligence disappears into the workflow and helps users do meaningful work with less friction, higher confidence, and better results.
            </p>
          </div>
        </BriefSection>

        <BriefSection id="representative-decision-systems" sectionName="Representative Decision Systems" eyebrow="Representative Decision Systems" title="How I make judgment inspectable" background="panel">
          <div className="grid gap-4 lg:grid-cols-3">
            {decisionSystems.map((system) => (
              <article key={system.title} className="rounded-md border border-line bg-paper p-5">
                <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{system.title}</h2>
                <p className="mt-3 leading-7 text-muted">{system.description}</p>
                <HiringManagerTrackedLink href={system.href} eventName="hiring_manager_decision_system_clicked" label={system.title} className="mt-5">
                  Open system
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </HiringManagerTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="representative-product-stories" sectionName="Representative Product Stories" eyebrow="Representative Product Stories" title="Where the thinking shows up in real work">
          <div className="grid gap-4 lg:grid-cols-3">
            {productStories.map((story) => (
              <article key={story.title} className="rounded-md border border-line bg-panel p-5">
                <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{story.title}</h2>
                <p className="mt-3 leading-7 text-muted">{story.description}</p>
                <HiringManagerTrackedLink href={story.href} eventName="hiring_manager_story_clicked" label={story.title} className="mt-5">
                  Review brief
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </HiringManagerTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="leadership-philosophy" sectionName="Leadership Philosophy" eyebrow="Leadership Philosophy" title="Practical habits I bring to teams" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {leadershipCards.map((item) => (
              <article key={item.title} className="rounded-md border border-line bg-paper p-5">
                <MessageSquare className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="working-together" sectionName="Working Together" eyebrow="Working Together" title="What you can expect from me">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workingTogether.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-line bg-panel p-4">
                <CheckCircle2 className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
                <p className="font-semibold text-ink">{item}</p>
              </div>
            ))}
          </div>
        </BriefSection>

        <section className="border-b border-line bg-panel" aria-labelledby="final-cta-title" data-hiring-manager-section="Final CTA">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <div className="rounded-md border border-line bg-paper p-6">
              <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Final CTA</p>
              <h2 id="final-cta-title" className="mt-3 text-3xl font-semibold leading-tight text-ink">
                Continue the hiring-manager review
              </h2>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-muted">
                Great products are built through thoughtful decisions, collaborative teams, and continuous learning. Thank you for taking the time to explore Product OS.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <HiringManagerTrackedLink href="/decision-operating-system" eventName="hiring_manager_decision_system_clicked" label="Decision Operating System" variant="primary">
                  Decision Operating System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </HiringManagerTrackedLink>
                <HiringManagerTrackedLink href="/profile" eventName="contact_cta_clicked" label="Professional Profile" variant="secondary">
                  Professional Profile
                </HiringManagerTrackedLink>
                <HiringManagerTrackedLink href="/contact" eventName="contact_cta_clicked" label="LinkedIn" variant="secondary">
                  LinkedIn
                </HiringManagerTrackedLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}

function BriefSection({
  background,
  children,
  eyebrow,
  id,
  sectionName,
  title
}: {
  background?: "panel";
  children: ReactNode;
  eyebrow: string;
  id: string;
  sectionName: string;
  title: string;
}) {
  return (
    <section
      id={id}
      className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`}
      aria-labelledby={`${id}-title`}
      data-hiring-manager-section={sectionName}
    >
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <SectionHeader eyebrow={eyebrow} id={`${id}-title`} title={title} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
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
