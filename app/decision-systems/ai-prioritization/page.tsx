import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  Gauge,
  GitBranch,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  Target,
  XCircle
} from "lucide-react";

import {
  AiDecisionScorecard,
  AiPrioritizationMatrix,
  AiPrioritizationViewed,
  AiQuestionGroup,
  AiTrackedLink
} from "@/components/ai-prioritization-interactions";
import { ReadingProgress } from "@/components/decision-system-interactions";
import { DecisionSystemFooterLinks } from "@/components/decision-system-footer-links";
import { SiteHeader } from "@/components/site-header";

const pageTitle = "AI Prioritization";
const metadataTitle = "AI Prioritization Decision System | Product Operating System";
const pageDescription =
  "A product decision system for prioritizing AI opportunities by customer value, business impact, data readiness, model feasibility, trust, and execution readiness.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-systems/ai-prioritization";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/decision-systems/ai-prioritization"
  },
  openGraph: {
    title: metadataTitle,
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
    title: metadataTitle,
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

const metadataItems = [
  { label: "Reading Time", value: "10 min" },
  { label: "Version", value: "v1.0" },
  { label: "Last Updated", value: "June 2026" }
];

const tocItems = [
  { href: "#executive-summary", label: "Executive Summary" },
  { href: "#prioritization-framework", label: "AI Prioritization Framework" },
  { href: "#decision-trade-offs", label: "Decision Trade-offs" },
  { href: "#readiness-assessment", label: "Readiness Assessment" },
  { href: "#decision-questions", label: "Decision Questions" },
  { href: "#ai-isnt", label: "AI Isn't..." },
  { href: "#common-mistakes", label: "Common Mistakes" },
  { href: "#prioritization-biases", label: "Prioritization Biases" },
  { href: "#failure-modes", label: "Failure Modes" },
  { href: "#recovery-patterns", label: "Recovery Patterns" },
  { href: "#framework-in-practice", label: "Framework in Practice" },
  { href: "#prioritization-matrix", label: "Prioritization Matrix" },
  { href: "#decision-checkpoint", label: "Decision Checkpoint" },
  { href: "#decision-scorecard", label: "Decision Scorecard" },
  { href: "#stop-criteria", label: "Stop Criteria" },
  { href: "#decision-review", label: "Decision Review" },
  { href: "#key-takeaways", label: "Key Takeaways" },
  { href: "#operating-principle", label: "Operating Principle" },
  { href: "#how-i-know-this", label: "How I Know This" },
  { href: "#related-journals", label: "Related Decision Journals" },
  { href: "#continue-learning", label: "Continue Learning" }
];

const frameworkStages = [
  {
    title: "Customer Problem",
    description: "Start with the workflow, pain, frequency, and consequence before naming an AI solution."
  },
  {
    title: "AI Opportunity",
    description: "Identify where AI could improve judgment, automation, personalization, speed, or decision support."
  },
  {
    title: "Customer Value",
    description: "Test whether the capability makes an existing customer problem meaningfully easier."
  },
  {
    title: "Business Value",
    description: "Connect the opportunity to revenue, retention, margin, risk reduction, adoption, or operating leverage."
  },
  {
    title: "Execution Readiness",
    description: "Evaluate data quality, model feasibility, engineering complexity, operations, and time to value."
  },
  {
    title: "Trust & Risk",
    description: "Assess reliability, explainability, privacy, human override, and customer trust impact."
  },
  {
    title: "Prioritization Score",
    description: "Score the opportunity across dimensions before deciding whether to build, prototype, validate, park, or reject."
  }
];

const decisionOptions = [
  {
    title: "Build Now",
    description: "High customer value, strong business case, credible data readiness, manageable risk, and a clear path to value."
  },
  {
    title: "Prototype",
    description: "The opportunity looks valuable, but the team needs to prove model behavior, workflow fit, or trust."
  },
  {
    title: "Validate Further",
    description: "The problem may be real, but the evidence is not strong enough to increase AI investment."
  },
  {
    title: "Park",
    description: "The idea is feasible or interesting, but customer value, timing, or business priority is too weak."
  },
  {
    title: "Reject",
    description: "The opportunity has weak customer value, poor economics, high trust risk, or no clear advantage over simpler solutions."
  }
];

const tradeOffs = [
  {
    title: "Automation vs. augmentation",
    description: "Replace human work only when trust, quality, and accountability justify it. Otherwise, improve human judgment."
  },
  {
    title: "Speed vs. accuracy",
    description: "Faster output creates value only when customers can rely on the answer."
  },
  {
    title: "Personalization vs. privacy",
    description: "More relevance cannot create unacceptable data exposure or customer discomfort."
  },
  {
    title: "Innovation vs. reliability",
    description: "A new AI capability should not weaken the product promise customers already depend on."
  },
  {
    title: "General model vs. specialized workflow",
    description: "Broad capability is less useful than a focused improvement to an important customer workflow."
  },
  {
    title: "Short-term wins vs. platform investment",
    description: "Some AI value requires data, evaluation, and operating foundations before visible features."
  }
];

const readinessChecks = [
  "Do we have usable data?",
  "Can success be measured?",
  "Would customers trust this?",
  "Can humans override AI?",
  "Can operations support this?",
  "Does this improve an existing workflow?"
];

const decisionQuestions = [
  {
    title: "Customer",
    questions: [
      "What customer problem becomes meaningfully easier if this AI capability works?",
      "Is the pain frequent, costly, urgent, or tied to an existing workflow?",
      "Would customers change behavior, or only try the feature once?",
      "What simpler non-AI solution would also address the problem?"
    ]
  },
  {
    title: "Business",
    questions: [
      "Which business outcome improves if this works?",
      "Does the opportunity support revenue, retention, margin, risk reduction, or operating leverage?",
      "What investment level is justified by the size of the opportunity?",
      "What would make the economics unattractive even if the model works?"
    ]
  },
  {
    title: "Data",
    questions: [
      "Do we have the right data, permissions, quality, and freshness?",
      "Can the team label, evaluate, or audit outputs reliably?",
      "What data gaps would make the experience untrustworthy?",
      "Does the data advantage compound over time?"
    ]
  },
  {
    title: "Model",
    questions: [
      "What model behavior must be accurate enough for the customer context?",
      "What hallucination, ranking, or reasoning failure would break trust?",
      "Is a general model sufficient, or does the workflow need specialization?",
      "How will the team evaluate model quality before and after launch?"
    ]
  },
  {
    title: "Engineering",
    questions: [
      "Can the capability be built without destabilizing the core product?",
      "What latency, reliability, security, or integration constraints matter?",
      "What technical foundation must exist before scaling?",
      "How reversible is the architecture decision?"
    ]
  },
  {
    title: "Operations",
    questions: [
      "Who monitors output quality, failures, customer escalations, and edge cases?",
      "Can support, success, sales, and operations explain the capability?",
      "What human workflow is needed when AI is uncertain?",
      "What ongoing cost is created by keeping the system useful?"
    ]
  },
  {
    title: "Trust",
    questions: [
      "Would a wrong answer damage customer confidence or create business risk?",
      "Can customers understand, override, or challenge the output?",
      "What privacy, compliance, or safety constraints must be designed in?",
      "What trust signal would make rollout acceptable?"
    ]
  }
];

const aiIsnt = [
  "AI isn't a feature strategy.",
  "AI isn't a replacement for customer discovery.",
  "AI isn't valuable because it uses an LLM.",
  "AI isn't successful because it generates content.",
  "AI isn't useful if customers don't trust it."
];

const mistakes = [
  {
    title: "Building because competitors launched AI",
    description: "Competitor pressure is not a customer problem, a business case, or a readiness signal."
  },
  {
    title: "Ignoring data quality",
    description: "Weak or inaccessible data can turn a strong AI concept into a poor customer experience."
  },
  {
    title: "Ignoring operational cost",
    description: "AI products need monitoring, support, evaluation, escalation paths, and ongoing improvement."
  },
  {
    title: "Prioritizing demos over workflows",
    description: "A compelling demo can still fail if it does not fit the way customers already work."
  },
  {
    title: "Treating AI accuracy as the only KPI",
    description: "Accuracy matters, but trust, adoption, business impact, cost, and failure handling matter too."
  },
  {
    title: "Building before validation",
    description: "AI investment should increase after customer value and business value become clearer."
  }
];

const biases = [
  {
    title: "Competitor bias",
    description: "Assuming an AI idea matters because another company shipped something similar."
  },
  {
    title: "Demo bias",
    description: "Mistaking a polished prototype for a product customers will repeatedly use."
  },
  {
    title: "Executive bias",
    description: "Overweighting senior enthusiasm before customer behavior and readiness are visible."
  },
  {
    title: "Feasibility bias",
    description: "Prioritizing what is easy to build instead of what is worth solving."
  },
  {
    title: "Novelty bias",
    description: "Favoring new AI surfaces over less flashy workflow improvements with clearer value."
  }
];

const failureModes = [
  "No customer adoption because the capability does not improve a real workflow.",
  "Poor data quality creates inconsistent, irrelevant, or untrustworthy outputs.",
  "Hallucinations or unreliable answers damage customer confidence.",
  "Workflow disruption makes the product slower or harder to use.",
  "Expensive inference weakens the unit economics of the product.",
  "Weak business case makes the capability difficult to fund after launch.",
  "Loss of customer trust outweighs the benefit of the AI experience."
];

const recoveryPatterns = [
  {
    symptom: "Customers try the AI feature once but do not return.",
    likelyCause: "Novelty was prioritized over workflow value.",
    recoveryAction: "Reframe around the customer task and validate repeat usage.",
    expectedOutcome: "Better signal on whether AI improves real behavior."
  },
  {
    symptom: "Model quality looks acceptable in demos but fails in production contexts.",
    likelyCause: "Evaluation data did not represent real customer edge cases.",
    recoveryAction: "Build a stronger evaluation set and test against actual workflows before rollout.",
    expectedOutcome: "Higher confidence in reliability, trust, and launch readiness."
  },
  {
    symptom: "The business case weakens as usage grows.",
    likelyCause: "Inference, monitoring, and operations costs were underestimated.",
    recoveryAction: "Revisit the economics and explore narrower workflows, caching, routing, or non-AI alternatives.",
    expectedOutcome: "A more sustainable product path with clearer cost-to-value alignment."
  },
  {
    symptom: "Teams disagree on whether to continue.",
    likelyCause: "The prioritization criteria were not explicit before investment increased.",
    recoveryAction: "Score the opportunity across customer value, business value, readiness, and trust.",
    expectedOutcome: "A more objective build, prototype, validate, park, or reject decision."
  }
];

const examples = [
  {
    company: "Logix",
    title: "Platform Modernization",
    focus: "Choosing Elasticsearch over expensive vendor AI search because the customer value and cost profile were stronger.",
    outcome: "40% lower infrastructure cost.",
    href: "/stories/platform-modernization-logix"
  },
  {
    company: "JoVE",
    title: "Workflow Intelligence",
    focus: "Prioritizing workflow intelligence instead of generative content because adoption depended on how educators worked.",
    outcome: "Higher engagement.",
    href: "/stories/product-discovery-jove"
  },
  {
    company: "Comviva",
    title: "Payment Reliability",
    focus: "Improving payment reliability instead of adding AI features because trust and transaction success mattered more.",
    outcome: "Better customer experience and transaction success.",
    href: "/stories/payments-reliability-comviva"
  }
];

const matrixQuadrants = [
  {
    quadrant: "High Value / High Readiness",
    action: "Build Now",
    description: "The problem matters, the business case is clear, and the team can execute responsibly."
  },
  {
    quadrant: "High Value / Low Readiness",
    action: "Prototype or De-risk",
    description: "The opportunity is attractive, but data, model, operations, or trust readiness needs proof first."
  },
  {
    quadrant: "Low Value / High Readiness",
    action: "Park",
    description: "The team can build it, but easy execution does not make the problem important."
  },
  {
    quadrant: "Low Value / Low Readiness",
    action: "Reject",
    description: "The opportunity lacks enough customer value and readiness to justify product investment."
  }
];

const scorecardDimensions = [
  "Customer Pain",
  "Business Impact",
  "Strategic Alignment",
  "Data Readiness",
  "Model Feasibility",
  "Operational Complexity",
  "Trust & Risk",
  "Time to Value"
];

const recommendationBands = [
  { range: "34-40", title: "Build Now" },
  { range: "27-33", title: "Prototype" },
  { range: "19-26", title: "Validate Further" },
  { range: "12-18", title: "Park" },
  { range: "8-11", title: "Reject" }
];

const stopCriteria = [
  {
    title: "Poor customer value",
    description: "The AI capability does not make an important customer task easier, faster, safer, or more reliable."
  },
  {
    title: "Weak data",
    description: "The team cannot access, evaluate, maintain, or trust the data needed to support the experience."
  },
  {
    title: "High operational burden",
    description: "Monitoring, support, escalation, and improvement costs outweigh the benefit."
  },
  {
    title: "Trust concerns",
    description: "Failure modes would damage customer confidence more than successful usage would create value."
  },
  {
    title: "Poor economics",
    description: "The capability cannot support its inference, infrastructure, support, or GTM cost."
  }
];

const reviewQuestions = [
  "Why did we prioritize this?",
  "What assumptions changed?",
  "Would we make the same decision today?",
  "Did customer behavior justify the investment?",
  "Did readiness improve or reveal a new constraint?"
];

const takeaways = [
  "AI prioritization starts with customer value, not model novelty.",
  "Data readiness and trust determine whether an AI idea can scale.",
  "The best AI opportunities improve existing workflows.",
  "Not every AI idea deserves to be built.",
  "Strong AI product judgment means knowing when to build, prototype, validate, park, or reject."
];

const relatedJournals = [
  {
    title: "Platform Modernization",
    description: "A decision journal about improving infrastructure and delivery speed while protecting business continuity.",
    href: "/stories/platform-modernization-logix"
  },
  {
    title: "Payments Reliability",
    description: "A decision journal about prioritizing reliability and customer trust at transaction scale.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "JoVE Workflow",
    description: "A decision journal about discovering workflow value before building richer product surfaces.",
    href: "/stories/product-discovery-jove"
  }
];

const breadcrumbs = [
  { name: "Decision Operating System", item: "https://saurabh-product-os.vercel.app/product-operating-system" },
  { name: "Decision Systems", item: "https://saurabh-product-os.vercel.app/decision-systems" },
  { name: "AI Prioritization", item: pageUrl }
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

export default function AiPrioritizationDecisionSystemPage() {
  return (
    <>
      <ReadingProgress label="AI Prioritization reading progress" />
      <AiPrioritizationViewed name="AI Prioritization" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Decision System 03</p>
              <h1 id="decision-system-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Prioritize AI where customer value, business value, and execution readiness intersect.
              </p>
              <div className="mt-6 rounded-md border border-line bg-paper p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Core question</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-ink">Which AI opportunity should we build first, and why?</p>
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

        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">On this page</p>
              <nav aria-label="AI Prioritization sections" className="mt-4 grid gap-1 text-sm text-muted">
                {tocItems.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <DocSection id="executive-summary" eyebrow="Executive Summary" title="AI prioritization is product prioritization">
              <div className="rounded-md border border-line bg-panel p-5">
                <p className="text-lg leading-8 text-muted">
                  AI prioritization is not about choosing the most impressive capability. It is about identifying where AI meaningfully
                  improves a real customer workflow, produces measurable business value, and can be delivered responsibly with available
                  data, model feasibility, operational support, and trust controls. The best AI decision is sometimes to build. It is
                  sometimes to prototype, validate further, park, or reject.
                </p>
              </div>
            </DocSection>

            <DocSection id="prioritization-framework" eyebrow="AI Prioritization Framework" title="From customer problem to AI investment" background="panel">
              <div className="grid gap-3">
                {frameworkStages.map((stage, index) => (
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
                    {index < frameworkStages.length - 1 ? (
                      <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                        <ArrowDown className="h-5 w-5" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {decisionOptions.map((option) => (
                  <article key={option.title} className="rounded-md border border-line bg-paper p-5">
                    <Target className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{option.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{option.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-trade-offs" eyebrow="Decision Trade-offs" title="The choices AI prioritization makes explicit">
              <div className="grid gap-4 sm:grid-cols-2">
                {tradeOffs.map((tradeOff) => (
                  <article key={tradeOff.title} className="rounded-md border border-line bg-panel p-5">
                    <SlidersHorizontal className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{tradeOff.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{tradeOff.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="readiness-assessment" eyebrow="Readiness Assessment" title="A quick check before AI investment" background="panel">
              <div className="grid gap-3">
                {readinessChecks.map((check) => (
                  <div key={check} className="flex gap-3 rounded-md border border-line bg-paper p-5">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    <p className="leading-7 text-muted">{check}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-questions" eyebrow="Decision Questions" title="Prompts for responsible AI prioritization">
              <div className="grid gap-4">
                {decisionQuestions.map((group) => (
                  <AiQuestionGroup key={group.title} title={group.title} questions={group.questions} />
                ))}
              </div>
            </DocSection>

            <DocSection id="ai-isnt" eyebrow="AI Isn't..." title="Boundaries that keep the work honest" background="panel">
              <div className="grid gap-3">
                {aiIsnt.map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-line bg-paper p-5">
                    <XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    <p className="leading-7 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="common-mistakes" eyebrow="Common Mistakes" title="Where AI work loses product discipline">
              <div className="grid gap-4 sm:grid-cols-2">
                {mistakes.map((mistake) => (
                  <article key={mistake.title} className="rounded-md border border-line bg-panel p-5">
                    <AlertTriangle className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{mistake.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{mistake.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="prioritization-biases" eyebrow="Prioritization Biases" title="Biases that make weak AI ideas look stronger" background="panel">
              <div className="grid gap-4 sm:grid-cols-2">
                {biases.map((bias) => (
                  <article key={bias.title} className="rounded-md border border-line bg-paper p-5">
                    <Gauge className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{bias.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{bias.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="failure-modes" eyebrow="Failure Modes" title="How AI prioritization fails in practice">
              <div className="grid gap-3">
                {failureModes.map((failureMode) => (
                  <div key={failureMode} className="flex gap-3 rounded-md border border-line bg-panel p-5">
                    <ShieldAlert className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    <p className="leading-7 text-muted">{failureMode}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="recovery-patterns" eyebrow="Recovery Patterns" title="How to restore decision quality" background="panel">
              <div className="grid gap-4">
                {recoveryPatterns.map((pattern) => (
                  <article key={pattern.symptom} className="rounded-md border border-line bg-paper p-5">
                    <RotateCcw className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{pattern.symptom}</h3>
                    <dl className="mt-5 grid gap-4">
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Likely Cause</dt>
                        <dd className="mt-2 leading-7 text-muted">{pattern.likelyCause}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Recovery Action</dt>
                        <dd className="mt-2 leading-7 text-muted">{pattern.recoveryAction}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Expected Outcome</dt>
                        <dd className="mt-2 leading-7 text-muted">{pattern.expectedOutcome}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="framework-in-practice" eyebrow="Framework in Practice" title="Three implementation examples">
              <div className="grid gap-4">
                {examples.map((example) => (
                  <article key={example.company} className="rounded-md border border-line bg-panel p-5">
                    <GitBranch className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">{example.company}</p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-ink">{example.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{example.focus}</p>
                    <p className="mt-3 leading-7 text-ink">{example.outcome}</p>
                    <AiTrackedLink href={example.href} eventName="ai_example_clicked" label={`${example.company}: ${example.title}`} className="mt-5">
                      Open Decision Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </AiTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="prioritization-matrix" eyebrow="Prioritization Matrix" title="Value and readiness determine the path" background="panel">
              <AiPrioritizationMatrix quadrants={matrixQuadrants} />
            </DocSection>

            <DocSection id="decision-checkpoint" eyebrow="Decision Checkpoint" title="The question before AI buildout">
              <div className="rounded-md border border-accent bg-panel p-6">
                <Lightbulb className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-2xl font-semibold leading-snug text-ink">
                  If we build this AI capability, what customer problem becomes meaningfully easier?
                </p>
              </div>
            </DocSection>

            <DocSection id="decision-scorecard" eyebrow="Decision Scorecard" title="Score the opportunity before scaling" background="panel">
              <AiDecisionScorecard dimensions={scorecardDimensions} />
              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                {recommendationBands.map((band) => (
                  <div key={band.range} className="rounded-md border border-line bg-paper p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{band.range}</p>
                    <p className="mt-2 font-semibold text-ink">{band.title}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="stop-criteria" eyebrow="Stop Criteria" title="When not building is the stronger product decision">
              <div className="grid gap-4 sm:grid-cols-2">
                {stopCriteria.map((criterion) => (
                  <article key={criterion.title} className="rounded-md border border-line bg-panel p-5">
                    <h3 className="text-xl font-semibold leading-tight text-ink">{criterion.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{criterion.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-review" eyebrow="Decision Review" title="Revisit the prioritization after evidence changes" background="panel">
              <div className="rounded-md border border-line bg-paper p-5">
                <ClipboardCheck className="h-6 w-6 text-accent" aria-hidden="true" />
                <div className="mt-5 grid gap-3">
                  {reviewQuestions.map((question) => (
                    <div key={question} className="flex gap-3">
                      <HelpCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                      <p className="leading-7 text-muted">{question}</p>
                    </div>
                  ))}
                </div>
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
                  AI is not the priority.
                  <br />
                  Customer value is.
                </p>
              </blockquote>
            </DocSection>

            <DocSection id="how-i-know-this" eyebrow="How I Know This" title="Where the system comes from">
              <div className="rounded-md border border-line bg-panel p-5">
                <BarChart3 className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 leading-8 text-muted">
                  This framework is grounded in product work across platform modernization, enterprise SaaS, payments, growth products,
                  and AI platform strategy. In those environments, the strongest product decisions came from separating customer value
                  from novelty, validating readiness before scaling, and choosing reliability or workflow value when AI was not the
                  highest-leverage answer.
                </p>
              </div>
            </DocSection>

            <DocSection id="related-journals" eyebrow="Related Decision Journals" title="Where this framework shows up" background="panel">
              <div className="grid gap-4">
                {relatedJournals.map((journal) => (
                  <article key={journal.title} className="rounded-md border border-line bg-paper p-5">
                    <Gauge className="h-6 w-6 text-accent" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{journal.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{journal.description}</p>
                    <AiTrackedLink href={journal.href} eventName="ai_example_clicked" label={journal.title} className="mt-5">
                      Read Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </AiTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <DecisionSystemFooterLinks />

            <section id="continue-learning" className="scroll-mt-24 border-b border-line py-12 sm:py-14" aria-labelledby="continue-learning-title">
              <div className="rounded-md border border-line bg-panel p-6">
                <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue Learning</p>
                <h2 id="continue-learning-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  Build vs Buy AI
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  The next Decision System will clarify when teams should build AI capability internally, buy existing tools, or combine
                  both paths.
                </p>
                <AiTrackedLink
                  href="/decision-systems/build-vs-buy-ai"
                  eventName="ai_next_module_clicked"
                  label="Build vs Buy AI"
                  variant="primary"
                  className="mt-6"
                >
                  Next Decision System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  Build vs Buy AI
                </AiTrackedLink>
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
    <section
      id={id}
      className={`scroll-mt-24 border-b border-line py-12 sm:py-14 ${
        background === "panel" ? "bg-panel -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10" : ""
      }`}
      aria-labelledby={`${id}-title`}
    >
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
