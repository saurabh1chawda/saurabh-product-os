import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowRight, CheckCircle2, Compass, FileText, GitBranch, Lightbulb } from "lucide-react";

import {
  DecisionQuestionGroup,
  DecisionSystemViewed,
  ReadingProgress,
  TrackedDecisionLink
} from "@/components/decision-system-interactions";
import { SiteHeader } from "@/components/site-header";

const pageTitle = "Customer Discovery";
const pageDescription =
  "A production-ready Decision System for validating customer problems, business outcomes, and AI suitability before choosing a solution path.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-systems/customer-discovery";

export const metadata: Metadata = {
  title: "Customer Discovery Decision System",
  description: pageDescription,
  alternates: {
    canonical: "/decision-systems/customer-discovery"
  },
  openGraph: {
    title: "Customer Discovery | Decision Operating System",
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
    title: "Customer Discovery | Decision Operating System",
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

const metadataItems = [
  { label: "Reading Time", value: "8 min" },
  { label: "Version", value: "v1.0" },
  { label: "Last Updated", value: "June 2026" }
];

const tocItems = [
  { href: "#executive-summary", label: "Executive Summary" },
  { href: "#decision-system", label: "The Decision System" },
  { href: "#decision-questions", label: "Decision Questions" },
  { href: "#common-mistakes", label: "Common Mistakes" },
  { href: "#framework-in-practice", label: "Framework in Practice" },
  { href: "#decision-checkpoint", label: "Decision Checkpoint" },
  { href: "#key-takeaways", label: "Key Takeaways" },
  { href: "#operating-principle", label: "Operating Principle" }
];

const decisionStages = [
  {
    title: "Customer Problem",
    description: "Name the real problem in the customer's language before naming a solution."
  },
  {
    title: "Current Behaviour",
    description: "Observe what users do today, including workarounds, delays, and repeated handoffs."
  },
  {
    title: "Root Cause",
    description: "Separate symptoms from the constraint that makes the problem persist."
  },
  {
    title: "Business Opportunity",
    description: "Connect the customer problem to revenue, risk, adoption, retention, or operating leverage."
  },
  {
    title: "AI Suitability",
    description: "Evaluate whether AI meaningfully improves judgment, automation, personalization, or speed."
  },
  {
    title: "Success Criteria",
    description: "Define what must change in customer behavior and business outcomes."
  },
  {
    title: "Decision",
    description: "Choose the smallest evidence-backed path: build, test, defer, or reject."
  }
];

const decisionQuestions = [
  {
    title: "Customer",
    questions: [
      "What behavior shows this problem is painful enough to change?",
      "Where do users lose time, confidence, money, or momentum today?",
      "What workaround has become part of the customer's current workflow?",
      "Which customer segment experiences this problem most intensely?"
    ]
  },
  {
    title: "Business",
    questions: [
      "Which business outcome improves if this problem is solved?",
      "What is the cost of leaving this problem unsolved for another quarter?",
      "Does the opportunity affect revenue, retention, risk, margin, or operational efficiency?",
      "What evidence would make leadership comfortable funding the next step?"
    ]
  },
  {
    title: "Product",
    questions: [
      "What is the smallest product decision that creates useful learning?",
      "Which existing workflow must the solution fit into?",
      "What should the product not do, even if technically possible?",
      "How will the team know whether behavior changed after launch?"
    ]
  },
  {
    title: "AI",
    questions: [
      "What part of the workflow requires prediction, generation, reasoning, or pattern recognition?",
      "Would a rules-based or workflow redesign solve the problem with less risk?",
      "What failure mode would damage user trust?",
      "How will the product explain, constrain, and measure AI-assisted decisions?"
    ]
  }
];

const mistakes = [
  {
    title: "Starting with the model",
    description: "Model choice is premature until the customer behavior, data quality, and success criteria are clear."
  },
  {
    title: "Confusing requests with needs",
    description: "A requested feature may be only the customer's best guess at a deeper workflow constraint."
  },
  {
    title: "Ignoring business outcomes",
    description: "Discovery becomes weak when it validates user interest without proving why the business should act."
  },
  {
    title: "Using AI unnecessarily",
    description: "AI adds cost and trust risk when the problem is better solved through clearer workflows or simpler automation."
  }
];

const examples = [
  {
    company: "JoVE",
    title: "Workflow adoption",
    description: "Discovery reframed adoption from a content volume problem into a workflow-fit problem.",
    href: "/stories/product-discovery-jove"
  },
  {
    company: "Comviva",
    title: "Payment reliability",
    description: "Reliability work started with customer trust, transaction failure patterns, and business risk.",
    href: "/stories/payments-reliability-comviva"
  }
];

const takeaways = [
  "Strong discovery starts with behavior, not stated preference.",
  "Business outcomes make customer problems worth prioritizing.",
  "AI suitability should be evaluated after the root cause is understood.",
  "The best decision system makes trade-offs visible before build work starts.",
  "Success criteria must describe measurable customer and business change."
];

const breadcrumbs = [
  { name: "Decision Operating System", item: "https://saurabh-product-os.vercel.app/product-operating-system" },
  { name: "Decision Systems", item: "https://saurabh-product-os.vercel.app/decision-systems" },
  { name: "Customer Discovery", item: pageUrl }
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

export default function CustomerDiscoveryDecisionSystemPage() {
  return (
    <>
      <ReadingProgress label="Customer Discovery reading progress" />
      <DecisionSystemViewed name="Customer Discovery" />
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd)
          }}
        />
        <section className="border-b border-line bg-panel" aria-labelledby="decision-system-title">
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Decision System 01</p>
              <h1 id="decision-system-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Start with the customer. Let evidence determine whether AI belongs in the solution.
              </p>
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

        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">On this page</p>
              <nav aria-label="Customer Discovery sections" className="mt-4 grid gap-2 text-sm text-muted">
                {tocItems.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <DocSection id="executive-summary" eyebrow="Executive Summary" title="AI product discovery starts before AI">
              <div className="rounded-md border border-line bg-panel p-5">
                <p className="text-lg leading-8 text-muted">
                  Successful AI products begin with understanding customer behavior, business outcomes, and measurable problems, not selecting a model. Customer Discovery protects teams from building impressive technology around weak demand. The system clarifies what users do today, why the current workflow fails, which outcome matters to the business, and whether AI is actually the right tool. Only after that evidence is visible should a team decide whether to prototype, automate, augment, or avoid AI entirely.
                </p>
              </div>
            </DocSection>

            <DocSection id="decision-system" eyebrow="The Decision System" title="A repeatable path from problem to decision" background="panel">
              <div className="grid gap-3">
                {decisionStages.map((stage, index) => (
                  <div key={stage.title}>
                    <article className="rounded-md border border-line bg-paper p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold leading-tight text-ink">{stage.title}</h3>
                          <p className="mt-2 leading-7 text-muted">{stage.description}</p>
                        </div>
                      </div>
                    </article>
                    {index < decisionStages.length - 1 ? (
                      <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                        <ArrowDown className="h-5 w-5" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-questions" eyebrow="Decision Questions" title="Prompts for evidence-backed discovery">
              <div className="grid gap-4">
                {decisionQuestions.map((group) => (
                  <DecisionQuestionGroup key={group.title} title={group.title} questions={group.questions} />
                ))}
              </div>
            </DocSection>

            <DocSection id="common-mistakes" eyebrow="Common Mistakes" title="Where discovery loses decision quality" background="panel">
              <div className="grid gap-4 sm:grid-cols-2">
                {mistakes.map((mistake) => (
                  <article key={mistake.title} className="rounded-md border border-line bg-paper p-5">
                    <AlertTriangle className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{mistake.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{mistake.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="framework-in-practice" eyebrow="Framework in Practice" title="Two implementation examples">
              <div className="grid gap-4 sm:grid-cols-2">
                {examples.map((example) => (
                  <article key={example.company} className="rounded-md border border-line bg-panel p-5">
                    <GitBranch className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">{example.company}</p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-ink">{example.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{example.description}</p>
                    <TrackedDecisionLink
                      href={example.href}
                      eventName="framework_example_clicked"
                      label={`${example.company}: ${example.title}`}
                      className="mt-5"
                    >
                      Open Decision Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </TrackedDecisionLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-checkpoint" eyebrow="Decision Checkpoint" title="The question before solution design" background="panel">
              <div className="rounded-md border border-accent bg-paper p-6">
                <Lightbulb className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-2xl font-semibold leading-snug text-ink">
                  If AI disappeared tomorrow, would this still be an important customer problem?
                </p>
              </div>
            </DocSection>

            <DocSection id="key-takeaways" eyebrow="Key Takeaways" title="What this system should reinforce">
              <div className="grid gap-3">
                {takeaways.map((takeaway) => (
                  <div key={takeaway} className="flex gap-3 rounded-md border border-line bg-panel p-5">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    <p className="leading-7 text-muted">{takeaway}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="operating-principle" eyebrow="Operating Principle" title="The principle behind the system" background="panel">
              <blockquote className="rounded-md border border-line bg-paper p-6">
                <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-3xl font-semibold leading-tight text-ink">
                  Start with the customer.
                  <br />
                  Let evidence determine whether AI belongs in the solution.
                </p>
              </blockquote>
            </DocSection>

            <section className="border-b border-line py-12 sm:py-14" aria-labelledby="continue-learning-title">
              <div className="rounded-md border border-line bg-panel p-6">
                <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue Learning</p>
                <h2 id="continue-learning-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  Validation & Experimentation
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  The next Decision System will define how to validate the smallest useful version of a product decision before scaling the solution.
                </p>
                <TrackedDecisionLink
                  href="/decision-systems/validation-experimentation"
                  eventName="next_module_clicked"
                  label="Validation & Experimentation"
                  variant="primary"
                  className="mt-6"
                >
                  Next Decision System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedDecisionLink>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

function DocSection({
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
    <section id={id} className={`scroll-mt-24 border-b border-line py-12 sm:py-14 ${background === "panel" ? "bg-panel -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
