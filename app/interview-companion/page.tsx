import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileText,
  GitBranch,
  Lightbulb,
  MessageSquare,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";

import { InterviewCompanionViewed, InterviewTrackedLink } from "@/components/interview-companion-interactions";
import { SiteHeader } from "@/components/site-header";

const metadataTitle = "Interview Companion | AI Product Operating System";
const pageDescription =
  "A five-minute interview briefing summarizing Saurabh Chawda's product philosophy, decision systems, AI product thinking, representative product work, and operating principles.";
const pageUrl = "https://saurabh-product-os.vercel.app/interview-companion";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/interview-companion"
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
  { label: "Audience", value: "Interviewers" },
  { label: "Purpose", value: "Interview Preparation" },
  { label: "Version", value: "v1.0" },
  { label: "Updated", value: "July 2026" }
];

const learnCards = [
  {
    title: "How I discover customer problems.",
    description: "I start with behavior, pain, context, and business relevance before discussing solutions.",
    href: "/decision-systems/customer-discovery",
    icon: <UsersRound className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "How I validate opportunities.",
    description: "I use focused experiments to reduce the most expensive uncertainty before scaling investment.",
    href: "/decision-systems/validation-experimentation",
    icon: <ClipboardCheck className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "How I prioritize product investments.",
    description: "I compare leverage, customer value, business impact, readiness, and the cost of delay.",
    href: "/frameworks/product-prioritization",
    icon: <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "How I evaluate AI opportunities.",
    description: "I prioritize AI only when customer value, business value, and execution readiness intersect.",
    href: "/decision-systems/ai-prioritization",
    icon: <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "How I collaborate with engineering.",
    description: "I make trade-offs explicit, keep constraints visible, and align product value with technical sequencing.",
    href: "/stories/platform-modernization-logix",
    icon: <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "How I measure success.",
    description: "I connect outcomes to customer behavior, business value, trust, quality, and cost-to-value.",
    href: "/decision-systems/ai-success-metrics",
    icon: <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const decisionSystems = [
  {
    title: "Customer Discovery",
    description: "How I decide whether a problem is worth solving before choosing a product direction.",
    href: "/decision-systems/customer-discovery"
  },
  {
    title: "Validation & Experimentation",
    description: "How I use evidence to decide whether to build, iterate, pause, or stop.",
    href: "/decision-systems/validation-experimentation"
  },
  {
    title: "AI Prioritization",
    description: "How I evaluate AI opportunities without letting novelty outrank customer value.",
    href: "/decision-systems/ai-prioritization"
  }
];

const productStories = [
  {
    title: "Simplilearn",
    description: "Growth decisions that helped Job Guarantee revenue move from 1M to 10M.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "JoVE",
    description: "Discovery work that reframed the problem from more content to better workflows.",
    href: "/stories/product-discovery-jove"
  },
  {
    title: "Logix",
    description: "Platform modernization sequenced around customer value, reliability, and release velocity.",
    href: "/stories/platform-modernization-logix"
  }
];

const interviewQuestions = [
  {
    question: "How do you prioritize AI features?",
    resource: "AI Prioritization",
    href: "/decision-systems/ai-prioritization"
  },
  {
    question: "How do you validate customer problems?",
    resource: "Customer Discovery",
    href: "/decision-systems/customer-discovery"
  },
  {
    question: "Tell me about a difficult product decision.",
    resource: "Build vs Buy AI",
    href: "/decision-systems/build-vs-buy-ai"
  },
  {
    question: "How do you collaborate with engineering?",
    resource: "Platform Modernization Story",
    href: "/stories/platform-modernization-logix"
  },
  {
    question: "Describe a product failure.",
    resource: "Product Discovery Story",
    href: "/stories/product-discovery-jove"
  },
  {
    question: "How do you measure success?",
    resource: "AI Success Metrics",
    href: "/decision-systems/ai-success-metrics"
  }
];

const uncertaintyPrinciples = [
  "Evidence over assumptions.",
  "Explicit trade-offs.",
  "Customer behavior over opinions.",
  "Simplicity before complexity.",
  "Continuous learning."
];

const workingTogether = [
  {
    title: "Ownership",
    description: "I take responsibility for product clarity, decision quality, and follow-through."
  },
  {
    title: "Communication",
    description: "I prefer clear writing, visible assumptions, and crisp stakeholder updates."
  },
  {
    title: "Feedback",
    description: "I use feedback to improve the product, the process, and my own judgment."
  },
  {
    title: "Customer obsession",
    description: "I keep customer behavior and outcomes close to roadmap decisions."
  },
  {
    title: "Bias toward action",
    description: "I look for the smallest useful decision that creates learning and momentum."
  },
  {
    title: "Continuous learning",
    description: "I expect product decisions to improve as evidence changes."
  }
];

const resources = [
  {
    title: "Professional Profile",
    description: "Review professional scope, leadership, and measurable achievements.",
    href: "/profile",
    icon: <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Recruiter Tour",
    description: "A guided path through the highest-signal Product OS assets.",
    href: "/recruiter-tour",
    icon: <Route className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Decision Operating System",
    description: "The complete AI Product Operating System v1.",
    href: "/decision-operating-system",
    icon: <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Product Stories",
    description: "Representative product decisions with context, trade-offs, and outcomes.",
    href: "/stories/simplilearn-job-guarantee-growth",
    icon: <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "LinkedIn",
    description: "Use the contact center for current profile details.",
    href: "/contact",
    icon: <UsersRound className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "GitHub",
    description: "Explore the engineering implementation behind Product OS.",
    href: "https://github.com/saurabh1chawda/saurabh-product-os",
    icon: <ExternalLink className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const breadcrumbs = [
  { name: "Home", item: "https://saurabh-product-os.vercel.app" },
  { name: "Interview Companion", item: pageUrl }
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

export default function InterviewCompanionPage() {
  return (
    <>
      <InterviewCompanionViewed />
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd)
          }}
        />

        <section className="border-b border-line bg-panel" aria-labelledby="interview-companion-title">
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Interview Preparation</p>
              <h1 id="interview-companion-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Interview Companion
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Thank you for taking the time to meet with me. Rather than asking you to infer how I think from a profile alone, this page summarizes the principles, decision systems, and real product work that shape how I approach product management.
              </p>
              <dl className="mt-8 grid gap-3 sm:grid-cols-5">
                {metadataItems.map((item) => (
                  <MetaItem key={item.label} label={item.label} value={item.value} />
                ))}
              </dl>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <InterviewTrackedLink href="/decision-operating-system" eventName="interview_decision_system_clicked" label="Decision Operating System" variant="primary">
                  Decision Operating System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </InterviewTrackedLink>
                <InterviewTrackedLink href="/profile" eventName="interview_resource_clicked" label="Professional Profile" variant="secondary">
                  Professional Profile
                </InterviewTrackedLink>
              </div>
            </div>
          </div>
        </section>

        <BriefSection id="what-youll-learn" eyebrow="What You'll Learn About Me" title="The signals this page is designed to make visible">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learnCards.map((item) => (
              <article key={item.title} className="rounded-md border border-line bg-panel p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper">
                  {item.icon}
                </div>
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
                <InterviewTrackedLink href={item.href} eventName="interview_resource_clicked" label={item.title} className="mt-5">
                  Open resource
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </InterviewTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="decision-systems" eyebrow="Representative Decision Systems" title="Where my operating logic is documented" background="panel">
          <div className="grid gap-4 lg:grid-cols-3">
            {decisionSystems.map((system) => (
              <article key={system.title} className="rounded-md border border-line bg-paper p-5">
                <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{system.title}</h2>
                <p className="mt-3 leading-7 text-muted">{system.description}</p>
                <InterviewTrackedLink href={system.href} eventName="interview_decision_system_clicked" label={system.title} className="mt-5">
                  Open system
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </InterviewTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="product-stories" eyebrow="Representative Product Stories" title="Product decisions with context and outcomes">
          <div className="grid gap-4 lg:grid-cols-3">
            {productStories.map((story) => (
              <article key={story.title} className="rounded-md border border-line bg-panel p-5">
                <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{story.title}</h2>
                <p className="mt-3 leading-7 text-muted">{story.description}</p>
                <InterviewTrackedLink href={story.href} eventName="interview_story_clicked" label={story.title} className="mt-5">
                  Review brief
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </InterviewTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="questions" eyebrow="Questions You'll Probably Ask" title="Useful prompts for a deeper conversation" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interviewQuestions.map((item) => (
              <article key={item.question} className="rounded-md border border-line bg-paper p-5">
                <MessageSquare className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.question}</h2>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-accent">Relevant Product OS Resource</p>
                <p className="mt-2 leading-7 text-muted">{item.resource}</p>
                <InterviewTrackedLink href={item.href} eventName="interview_question_clicked" label={item.question} className="mt-5">
                  Open resource
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </InterviewTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="uncertainty" eyebrow="How I Think Under Uncertainty" title="Principles I use when the answer is not obvious">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {uncertaintyPrinciples.map((principle) => (
              <article key={principle} className="rounded-md border border-line bg-panel p-5">
                <Lightbulb className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-lg font-semibold leading-tight text-ink">{principle}</h2>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="working-together" eyebrow="Working Together" title="What collaboration with me should feel like" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workingTogether.map((item) => (
              <article key={item.title} className="rounded-md border border-line bg-paper p-5">
                <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="resources" eyebrow="Interview Resources" title="Fast links for interview preparation">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <article key={resource.title} className="rounded-md border border-line bg-panel p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper">
                  {resource.icon}
                </div>
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{resource.title}</h2>
                <p className="mt-3 leading-7 text-muted">{resource.description}</p>
                <InterviewTrackedLink href={resource.href} eventName="interview_resource_clicked" label={resource.title} className="mt-5">
                  Open
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </InterviewTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <section className="border-b border-line bg-panel" aria-labelledby="looking-forward-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <div className="rounded-md border border-line bg-paper p-6">
              <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Looking Forward</p>
              <h2 id="looking-forward-title" className="mt-3 text-3xl font-semibold leading-tight text-ink">
                Product OS is meant to make the interview more useful.
              </h2>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-muted">
                Thank you again for taking the time to meet with me. My hope is that Product OS gives us a stronger starting point: less time reconstructing background from a profile, and more time discussing product judgment, trade-offs, customer problems, AI opportunities, and how I can help your team build better products.
              </p>
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
  title
}: {
  background?: "panel";
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section id={id} className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`} aria-labelledby={`${id}-title`}>
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
