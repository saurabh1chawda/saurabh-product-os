import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Compass, FileText, GitBranch, Lightbulb, ShieldAlert, XCircle } from "lucide-react";

import { AiPrinciplesViewed, PrincipleCard, PrinciplesTrackedLink } from "@/components/ai-product-principles-interactions";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

const pageTitle = "AI Product Principles";
const pageDescription =
  "The product principles that guide how I evaluate, prioritize, validate, and build AI products that create measurable customer and business value.";
const pageUrl = "https://saurabh-product-os.vercel.app/ai-product-principles";

export const metadata: Metadata = {
  title: "AI Product Principles | Product Operating System",
  description: pageDescription,
  alternates: {
    canonical: "/ai-product-principles"
  },
  openGraph: {
    title: "AI Product Principles | Product Operating System",
    description: pageDescription,
    url: pageUrl,
    type: "article",
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
    title: "AI Product Principles | Product Operating System",
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

const metadataItems = [
  { label: "Reading Time", value: "6 min" },
  { label: "Type", value: "Executive Manifesto" },
  { label: "Focus", value: "AI Product Judgment" }
];

const principles = [
  {
    statement: "Customer value beats AI novelty.",
    whyItMatters: "AI deserves investment only when it improves a real customer workflow or business outcome.",
    commonMistake: "Prioritizing an AI feature because it feels innovative, visible, or competitive.",
    example: {
      title: "AI Prioritization",
      label: "The AI Prioritization Decision System makes customer value the first filter before model feasibility or novelty.",
      href: "/decision-systems/ai-prioritization"
    }
  },
  {
    statement: "Build evidence before confidence.",
    whyItMatters: "AI investment should increase only after the team has reduced the most expensive uncertainty.",
    commonMistake: "Treating stakeholder conviction as a substitute for customer behavior, validation, or measurable signal.",
    example: {
      title: "Validation & Experimentation",
      label: "The Validation & Experimentation Decision System shows how one experiment should answer one investment decision.",
      href: "/decision-systems/validation-experimentation"
    }
  },
  {
    statement: "The best AI disappears into the workflow.",
    whyItMatters: "Useful AI makes an important task easier without asking customers to adopt a separate behavior pattern.",
    commonMistake: "Shipping a new AI surface that interrupts the workflow instead of improving it.",
    example: {
      title: "JoVE Workflow",
      label: "The JoVE product discovery story reframed the opportunity around workflow adoption rather than richer content alone.",
      href: "/stories/product-discovery-jove"
    }
  },
  {
    statement: "Trust compounds faster than intelligence.",
    whyItMatters: "Customers return to products they can rely on, especially in high-stakes or repeated workflows.",
    commonMistake: "Optimizing capability while underinvesting in reliability, recovery, clarity, and user confidence.",
    example: {
      title: "Payments Reliability",
      label: "The Comviva payments story shows why reliability is a customer experience, not only an engineering metric.",
      href: "/stories/payments-reliability-comviva"
    }
  },
  {
    statement: "Optimize decisions, not demos.",
    whyItMatters: "A good AI product changes what a customer or team can decide, not just what they can watch in a prototype.",
    commonMistake: "Overvaluing polished demos before proving repeat usage, decision quality, or workflow value.",
    example: {
      title: "AI Prioritization",
      label: "The prioritization matrix separates impressive AI concepts from opportunities ready for responsible investment.",
      href: "/decision-systems/ai-prioritization"
    }
  },
  {
    statement: "Measure outcomes, not model accuracy alone.",
    whyItMatters: "Model quality matters, but business impact, customer behavior, trust, and cost determine whether the product works.",
    commonMistake: "Calling a feature successful because the model improved while customer or business outcomes stayed flat.",
    example: {
      title: "Validation & Experimentation",
      label: "The validation scorecard emphasizes behavior, success criteria, economics, and decision quality before scaling.",
      href: "/decision-systems/validation-experimentation"
    }
  },
  {
    statement: "Every AI feature needs an exit strategy.",
    whyItMatters: "Teams should know when to stop, park, narrow, or replace an AI capability before sunk cost takes over.",
    commonMistake: "Continuing AI work after weak evidence because the feature has executive visibility.",
    example: {
      title: "AI Prioritization",
      label: "The AI Prioritization Decision System includes stop criteria for weak data, trust concerns, and poor economics.",
      href: "/decision-systems/ai-prioritization"
    }
  },
  {
    statement: "Humans own decisions. AI accelerates them.",
    whyItMatters: "AI can support judgment, but accountability, override, and escalation need human ownership.",
    commonMistake: "Automating decisions without designing accountability, transparency, or human recovery paths.",
    example: {
      title: "Customer Discovery",
      label: "The Customer Discovery Decision System asks where AI belongs after customer behavior and failure modes are clear.",
      href: "/decision-systems/customer-discovery"
    }
  },
  {
    statement: "The simplest solution wins until AI clearly performs better.",
    whyItMatters: "A simpler workflow, rule, or platform improvement often delivers value with less risk and cost.",
    commonMistake: "Choosing AI because it is available instead of because it outperforms a simpler product decision.",
    example: {
      title: "Platform Modernization",
      label: "The Logix modernization story shows how focused platform choices can beat more expensive or complex alternatives.",
      href: "/stories/platform-modernization-logix"
    }
  },
  {
    statement: "If customers won't change their behavior, AI created no value.",
    whyItMatters: "The strongest proof of product value is changed customer behavior, not stated interest or feature curiosity.",
    commonMistake: "Mistaking initial usage, surveys, or executive excitement for durable adoption.",
    example: {
      title: "JoVE Workflow",
      label: "The JoVE story shows why adoption improved when the product matched how users already worked.",
      href: "/stories/product-discovery-jove"
    }
  }
];

const antiPatterns = [
  "Starting with the model instead of the customer problem.",
  "Treating AI as a roadmap theme instead of a product decision.",
  "Measuring model performance without measuring customer outcomes.",
  "Shipping demos that do not survive real workflows.",
  "Ignoring data readiness, operations, and trust.",
  "Automating decisions that still require human accountability.",
  "Building AI where a simpler workflow improvement would work better."
];

const practiceLinks = [
  {
    title: "Customer Discovery",
    label: "Start with customer behavior before deciding whether AI belongs.",
    href: "/decision-systems/customer-discovery"
  },
  {
    title: "Validation & Experimentation",
    label: "Build evidence before increasing product, engineering, data, or GTM investment.",
    href: "/decision-systems/validation-experimentation"
  },
  {
    title: "AI Prioritization",
    label: "Prioritize AI where customer value, business value, and execution readiness intersect.",
    href: "/decision-systems/ai-prioritization"
  },
  {
    title: "Payments Reliability",
    label: "Trust and reliability can matter more than adding new intelligent surfaces.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "Platform Modernization",
    label: "Simpler, stronger platform choices can outperform more complex AI-led options.",
    href: "/stories/platform-modernization-logix"
  },
  {
    title: "JoVE Workflow",
    label: "Workflow fit can create more value than richer content or feature volume.",
    href: "/stories/product-discovery-jove"
  }
];

const teamImplications = [
  "I help teams avoid AI theater and focus on measurable product value.",
  "I evaluate AI opportunities through customer behavior, not novelty.",
  "I make data readiness, trust, and operational cost visible before scaling.",
  "I prioritize workflows where AI can improve decisions or reduce friction.",
  "I know when to build, prototype, validate further, park, or reject AI ideas."
];

const continueLearning = [
  {
    title: "AI Prioritization",
    label: "Continue to AI Prioritization",
    href: "/decision-systems/ai-prioritization"
  },
  {
    title: "Product Operating System",
    label: "Explore Product Operating System",
    href: "/product-operating-system"
  },
  {
    title: "Validation & Experimentation",
    label: "Read Validation & Experimentation",
    href: "/decision-systems/validation-experimentation"
  }
];

const breadcrumbs = [
  { name: "Product Operating System", item: "https://saurabh-product-os.vercel.app/product-operating-system" },
  { name: "AI Product Principles", item: pageUrl }
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

export default function AiProductPrinciplesPage() {
  return (
    <>
      <AiPrinciplesViewed pageName="AI Product Principles" />
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd)
          }}
        />
        <section className="border-b border-line bg-panel" aria-labelledby="ai-principles-title">
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">AI Product Philosophy</p>
              <h1 id="ai-principles-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">{pageDescription}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/decision-systems/ai-prioritization" variant="primary">
                  Explore AI Prioritization
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/product-operating-system" variant="secondary">
                  Product Operating System
                </ButtonLink>
              </div>
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                {metadataItems.map((item) => (
                  <div key={item.label} className="rounded-md border border-line bg-paper p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{item.label}</dt>
                    <dd className="mt-2 text-lg font-semibold text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <TextSection id="executive-summary" eyebrow="Executive Summary" title="AI product management starts before the model">
          <p>
            AI product management is not about adding intelligence everywhere. It is about knowing where AI creates meaningful customer
            value, where it increases risk, and where simpler product decisions outperform model-based solutions.
          </p>
          <p>
            These principles summarize how I evaluate AI opportunities through customer behavior, business impact, trust, evidence,
            workflow fit, and execution readiness.
          </p>
        </TextSection>

        <section className="border-b border-line bg-panel" aria-labelledby="ten-principles-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Ten AI Product Principles" id="ten-principles-title" title="The short version" />
            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {principles.map((principle, index) => (
                <div key={principle.statement} className="flex gap-3 rounded-md border border-line bg-paper p-5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="leading-7 text-muted">{principle.statement}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="principle-cards-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Principle Cards" id="principle-cards-title" title="How each principle shows up in product work" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {principles.map((principle, index) => (
                <PrincipleCard
                  key={principle.statement}
                  commonMistake={principle.commonMistake}
                  example={principle.example}
                  index={index + 1}
                  statement={principle.statement}
                  whyItMatters={principle.whyItMatters}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="anti-patterns-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Common Anti-Patterns" id="anti-patterns-title" title="What these principles help prevent" />
            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {antiPatterns.map((antiPattern) => (
                <div key={antiPattern} className="flex gap-3 rounded-md border border-line bg-paper p-5">
                  <XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                  <p className="leading-7 text-muted">{antiPattern}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="principles-practice-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Principles in Practice" id="principles-practice-title" title="Where the philosophy becomes visible" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {practiceLinks.map((item) => (
                <article key={item.href} className="rounded-md border border-line bg-panel p-5">
                  <GitBranch className="h-6 w-6 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{item.label}</p>
                  <PrinciplesTrackedLink href={item.href} eventName="principle_example_clicked" label={item.title} className="mt-5">
                    Open example
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </PrinciplesTrackedLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="operating-philosophy-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <div className="max-w-3xl rounded-md border border-line bg-paper p-6">
              <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Operating Philosophy</p>
              <h2 id="operating-philosophy-title" className="mt-3 text-3xl font-semibold leading-tight text-ink">
                AI is not the product strategy. Customer value is.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted">
                AI becomes powerful when it improves decisions, reduces friction, strengthens trust, or makes an important workflow
                measurably better.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="teams-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="What This Means for Teams" id="teams-title" title="How the philosophy translates into execution" />
            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {teamImplications.map((item) => (
                <div key={item} className="flex gap-3 rounded-md border border-line bg-panel p-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                  <p className="leading-7 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TextSection id="how-evolved" eyebrow="How These Principles Evolved" title="Lessons across product contexts" background="panel">
          <p>
            These principles evolved from product work across platform modernization, enterprise SaaS, payments, growth products, AI
            platform strategy, customer discovery, and validation.
          </p>
          <p>
            The consistent lesson: strong AI product judgment starts before the model, with the customer problem, evidence quality,
            business outcome, and trust required to make the product useful.
          </p>
        </TextSection>

        <section className="border-b border-line" aria-labelledby="continue-learning-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Continue Learning" id="continue-learning-title" title="Explore the operating system behind the principles" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {continueLearning.map((item, index) => (
                <article key={item.href} className="rounded-md border border-line bg-panel p-5">
                  {index === 0 ? <Lightbulb className="h-6 w-6 text-accent" aria-hidden="true" /> : <FileText className="h-6 w-6 text-accent" aria-hidden="true" />}
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h3>
                  <PrinciplesTrackedLink
                    href={item.href}
                    eventName="continue_learning_clicked"
                    label={item.title}
                    variant={index === 0 ? "primary" : "inline"}
                    className="mt-5"
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </PrinciplesTrackedLink>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function TextSection({
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
    <section className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <ShieldAlert className="h-6 w-6 text-accent" aria-hidden="true" />
          <SectionHeader eyebrow={eyebrow} id={`${id}-title`} title={title} />
        </div>
        <div className="space-y-5 text-lg leading-8 text-muted">{children}</div>
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
  title: string;
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
