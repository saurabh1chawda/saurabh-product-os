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

import { ReadingProgress } from "@/components/decision-system-interactions";
import { SiteHeader } from "@/components/site-header";
import {
  ConfidenceMeter,
  DecisionQualityScore,
  DecisionReviewStarted,
  DecisionScorecard,
  StopCriteriaGrid,
  ValidationQuestionGroup,
  ValidationSystemViewed,
  ValidationTrackedLink
} from "@/components/validation-decision-system-interactions";

const pageTitle = "Validation & Experimentation";
const metadataTitle = "Validation & Experimentation Decision System | Product Operating System";
const pageDescription =
  "A product decision system for validating opportunities, testing assumptions, and reducing uncertainty before scaling AI, platform, SaaS, and growth products.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-systems/validation-experimentation";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/decision-systems/validation-experimentation"
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
  { href: "#decision-system", label: "The Decision System" },
  { href: "#decision-trade-offs", label: "Decision Trade-offs" },
  { href: "#evidence-hierarchy", label: "Evidence Hierarchy" },
  { href: "#decision-questions", label: "Decision Questions" },
  { href: "#validation-isnt", label: "Validation Isn't..." },
  { href: "#common-mistakes", label: "Common Mistakes" },
  { href: "#failure-modes", label: "Failure Modes" },
  { href: "#recovery-patterns", label: "Recovery Patterns" },
  { href: "#framework-in-practice", label: "Framework in Practice" },
  { href: "#decision-checkpoint", label: "Decision Checkpoint" },
  { href: "#confidence-meter", label: "Confidence Meter" },
  { href: "#decision-scorecard", label: "Decision Scorecard" },
  { href: "#decision-quality-score", label: "Decision Quality Score" },
  { href: "#stop-criteria", label: "Stop Criteria" },
  { href: "#decision-review", label: "Decision Review" },
  { href: "#key-takeaways", label: "Key Takeaways" },
  { href: "#operating-principle", label: "Operating Principle" },
  { href: "#how-i-know-this", label: "How I Know This" },
  { href: "#related-journals", label: "Related Decision Journals" },
  { href: "#continue-learning", label: "Continue Learning" }
];

const decisionStages = [
  {
    title: "Problem Hypothesis",
    description: "State the customer or business problem clearly enough that the team can test whether it is worth solving."
  },
  {
    title: "Riskiest Assumption",
    description: "Find the assumption that would make the opportunity fail if it proved false."
  },
  {
    title: "Validation Method",
    description: "Choose the lightest method that can create credible evidence for the decision."
  },
  {
    title: "Success Criteria",
    description: "Define what evidence will trigger build, iterate, pause, or stop before the test begins."
  },
  {
    title: "Experiment",
    description: "Run the smallest structured test that produces decision-quality learning."
  },
  {
    title: "Evidence",
    description: "Separate behavior, intent, and opinion so the team understands the strength of the signal."
  },
  {
    title: "Decision",
    description: "Convert evidence into an explicit product choice: build, iterate, pause, or stop."
  }
];

const decisionOptions = [
  {
    title: "Build",
    description: "Evidence is strong enough to justify deeper product, engineering, design, data, or GTM investment."
  },
  {
    title: "Iterate",
    description: "The signal is promising, but the solution, segment, pricing, or workflow still needs sharper learning."
  },
  {
    title: "Pause",
    description: "The problem may matter, but timing, readiness, data, technical dependency, or GTM confidence is not yet strong enough."
  },
  {
    title: "Stop",
    description: "The evidence is weak enough that continuing would create more cost than learning."
  }
];

const tradeOffs = [
  {
    title: "Speed vs. confidence",
    description: "A faster test is useful when the decision is reversible. Higher-cost decisions deserve stronger evidence."
  },
  {
    title: "Learning depth vs. validation cost",
    description: "The method should be proportional to the investment at risk, not the ambition of the idea."
  },
  {
    title: "Customer signal vs. internal conviction",
    description: "Strong stakeholder belief matters, but customer behavior should change the roadmap."
  },
  {
    title: "Short-term traction vs. durable adoption",
    description: "Early engagement is only useful if it indicates repeat behavior, workflow fit, or business value."
  }
];

const evidenceLevels = [
  {
    level: "1",
    title: "Observed customer behavior",
    description: "Users repeatedly complete, pay for, return to, or depend on the workflow."
  },
  {
    level: "2",
    title: "Committed intent",
    description: "Customers commit budget, time, data, migration effort, or operational change."
  },
  {
    level: "3",
    title: "Workflow evidence",
    description: "The solution fits existing behavior and reduces meaningful friction."
  },
  {
    level: "4",
    title: "Commercial signal",
    description: "Sales, renewal, expansion, margin, or pipeline quality improves for the right segment."
  },
  {
    level: "5",
    title: "Interview or survey signal",
    description: "Users describe pain clearly, but behavior still needs validation."
  },
  {
    level: "6",
    title: "Internal opinion",
    description: "Useful for framing, but too weak to justify scaling without stronger evidence."
  }
];

const decisionQuestions = [
  {
    title: "Customer",
    questions: [
      "What behavior proves this is a real problem rather than a requested feature?",
      "Which customer segment feels the pain most frequently or intensely?",
      "What workaround does the customer use today?",
      "What would the customer stop doing if this product decision worked?"
    ]
  },
  {
    title: "Business",
    questions: [
      "Which revenue, retention, margin, risk, or adoption outcome changes if this succeeds?",
      "What is the cost of scaling before we know the answer?",
      "What evidence would make leadership fund the next level of investment?",
      "What negative signal would make the business case weak?"
    ]
  },
  {
    title: "Product",
    questions: [
      "What is the single decision this experiment must answer?",
      "What is the smallest product surface that can create decision-quality learning?",
      "What user behavior will prove the product is becoming useful?",
      "What will we do if results are mixed?"
    ]
  },
  {
    title: "Technical",
    questions: [
      "What technical assumption creates the most delivery, reliability, data, or scalability risk?",
      "Can the team validate the assumption without building the full system?",
      "What operational failure would damage customer trust?",
      "What architecture choice becomes harder to reverse after scale?"
    ]
  },
  {
    title: "GTM",
    questions: [
      "Which segment, channel, message, or pricing assumption is most uncertain?",
      "What signal proves the market understands the value?",
      "What must sales, customer success, or support believe before rollout?",
      "What would make acquisition more expensive than the opportunity can support?"
    ]
  }
];

const validationIsnt = [
  "Validation isn't shipping a smaller version of the feature.",
  "Validation isn't asking users if they like an idea.",
  "Validation isn't collecting data after the roadmap decision is already made.",
  "Validation isn't chasing statistical certainty for every product call.",
  "Validation isn't delaying execution until all uncertainty disappears."
];

const mistakes = [
  {
    title: "Treating experiments as feature launches",
    description: "The team optimizes delivery polish instead of learning whether the opportunity deserves more investment."
  },
  {
    title: "Measuring activity instead of learning",
    description: "Clicks, views, or signups can look encouraging while the real behavior remains unchanged."
  },
  {
    title: "Running tests without decision criteria",
    description: "Without pre-defined thresholds, every result becomes debatable after the fact."
  },
  {
    title: "Scaling before evidence",
    description: "Teams increase engineering, design, data, or GTM spend before the riskiest assumption is resolved."
  },
  {
    title: "Ignoring negative signals",
    description: "Weak evidence is still evidence. It should reduce confidence, reshape the plan, or stop the work."
  }
];

const failureModes = [
  "The experiment proves nothing because it tested too many assumptions at once.",
  "The wrong metric wins because easy activity metrics replaced customer behavior.",
  "The test succeeds but the business case fails because value, cost, or segment quality was not validated.",
  "The team keeps building despite weak evidence because stopping feels like losing momentum.",
  "Leadership wants certainty instead of learning, so the experiment is judged like a forecast."
];

const recoveryPatterns = [
  {
    symptom: "The experiment produced ambiguous results.",
    likelyCause: "The team did not isolate the riskiest assumption.",
    recoveryAction: "Rewrite the hypothesis around one decision and rerun a smaller test.",
    expectedOutcome: "Cleaner evidence and fewer post-test interpretation debates."
  },
  {
    symptom: "Engagement looked strong but conversion did not improve.",
    likelyCause: "The metric captured interest, not commitment.",
    recoveryAction: "Move to a behavior-based metric such as repeat usage, payment intent, or workflow completion.",
    expectedOutcome: "A clearer read on whether the opportunity creates customer and business value."
  },
  {
    symptom: "Stakeholders want to continue despite weak evidence.",
    likelyCause: "The stop condition was not agreed before the test.",
    recoveryAction: "Return to decision criteria and explicitly choose iterate, pause, or stop.",
    expectedOutcome: "Lower sunk-cost bias and stronger product governance."
  },
  {
    symptom: "The experiment succeeded but delivery risk remains high.",
    likelyCause: "The test validated demand but not technical feasibility.",
    recoveryAction: "Run a focused technical spike or operational simulation before scaling.",
    expectedOutcome: "Higher confidence in both desirability and feasibility."
  }
];

const examples = [
  {
    company: "Simplilearn",
    title: "Job Guarantee Growth",
    focus: "Validated pricing, funnel conversion, learner motivation, and referral loops before scaling.",
    outcome: "10x revenue growth, 62% traffic-to-lead improvement, and 40% lead-to-customer improvement.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    company: "JoVE",
    title: "Workflow Adoption",
    focus: "Validated that workflow integration and syllabus mapping mattered more than richer video features.",
    outcome: "Higher engagement, stronger institutional adoption, and improved renewal confidence.",
    href: "/stories/product-discovery-jove"
  },
  {
    company: "Logix",
    title: "Platform Modernization",
    focus: "Validated incremental modernization and phased delivery before full-scale migration.",
    outcome: "40% query latency reduction, 2x release velocity, and zero unplanned downtime.",
    href: "/stories/platform-modernization-logix"
  }
];

const confidenceLevels = [
  {
    level: "Opinion",
    action: "Discuss, frame, and explore.",
    description: "The team has a belief, but not enough evidence to change investment level."
  },
  {
    level: "Signal",
    action: "Prototype or test.",
    description: "There is a useful customer, business, or technical signal, but the decision still needs validation."
  },
  {
    level: "Evidence",
    action: "Invest with constraints.",
    description: "The experiment changed what the team knows and supports a clearer product decision."
  },
  {
    level: "Decision-ready",
    action: "Build, iterate, pause, or stop.",
    description: "The evidence is strong enough to commit to a product path and explain the trade-off."
  }
];

const scorecardItems = [
  "Have we identified the riskiest assumption?",
  "Does the experiment answer one decision?",
  "Are success criteria defined before launch?",
  "Are we measuring customer behavior, not just activity?",
  "Do we know what action we will take for success, failure, or mixed results?",
  "Is the cost of validation proportional to the decision?",
  "Would negative evidence change our roadmap?"
];

const qualityBands = [
  {
    range: "6-7 Yes",
    title: "Decision-ready",
    description: "The team can explain the evidence, trade-offs, and next action with confidence."
  },
  {
    range: "4-5 Yes",
    title: "Needs sharper evidence",
    description: "The opportunity may be promising, but one or two assumptions still deserve validation."
  },
  {
    range: "0-3 Yes",
    title: "Do not scale yet",
    description: "Investment should remain low until the decision criteria and evidence quality improve."
  }
];

const stopCriteria = [
  {
    title: "Customer behavior does not change",
    description: "Users show curiosity but do not complete, repeat, pay, adopt, or rely on the workflow."
  },
  {
    title: "Business case remains weak",
    description: "The opportunity cannot support the cost, risk, or GTM effort required to scale."
  },
  {
    title: "Technical risk exceeds value",
    description: "Reliability, data quality, migration, security, or maintainability risk grows faster than customer value."
  },
  {
    title: "Negative evidence would not change the plan",
    description: "If the team will build regardless of the outcome, the experiment is no longer a decision tool."
  }
];

const reviewQuestions = [
  "What decision did the experiment answer?",
  "Which assumption became more or less risky?",
  "What evidence was stronger than expected?",
  "What evidence contradicted our belief?",
  "What will we build, iterate, pause, or stop now?"
];

const takeaways = [
  "Validation reduces the most expensive uncertainty before increasing investment.",
  "Every experiment should answer one product decision.",
  "Success criteria must be agreed before launch, not interpreted afterward.",
  "Customer behavior is stronger evidence than internal confidence.",
  "Stopping can be a high-quality product decision when evidence is weak."
];

const relatedJournals = [
  {
    title: "Simplilearn Job Guarantee Growth",
    description: "Growth validation across pricing, funnel conversion, learner motivation, and referral loops.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "JoVE Workflow Adoption",
    description: "Customer discovery and workflow validation before committing to richer product buildout.",
    href: "/stories/product-discovery-jove"
  },
  {
    title: "Logix Platform Modernization",
    description: "Phased validation of platform investment before broad migration.",
    href: "/stories/platform-modernization-logix"
  }
];

const breadcrumbs = [
  { name: "Decision Operating System", item: "https://saurabh-product-os.vercel.app/product-operating-system" },
  { name: "Decision Systems", item: "https://saurabh-product-os.vercel.app/decision-systems" },
  { name: "Validation & Experimentation", item: pageUrl }
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

export default function ValidationExperimentationDecisionSystemPage() {
  return (
    <>
      <ReadingProgress label="Validation and Experimentation reading progress" />
      <ValidationSystemViewed name="Validation & Experimentation" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Decision System 02</p>
              <h1 id="decision-system-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Build evidence before confidence. Use experiments to reduce the most expensive uncertainty before increasing product
                investment.
              </p>
              <div className="mt-6 rounded-md border border-line bg-paper p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Core question</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-ink">
                  What evidence proves we should build, scale, iterate, pause, or stop?
                </p>
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
              <nav aria-label="Validation and Experimentation sections" className="mt-4 grid gap-1 text-sm text-muted">
                {tocItems.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <DocSection id="executive-summary" eyebrow="Executive Summary" title="Validation is a decision tool">
              <div className="rounded-md border border-line bg-panel p-5">
                <p className="text-lg leading-8 text-muted">
                  Validation is not about proving that an idea is right. It is about reducing the most expensive uncertainty before
                  committing more product, engineering, design, data, or GTM resources. The goal is to learn enough to make a sharper
                  product decision: build, iterate, pause, or stop. Every experiment should answer one decision, not create a pile of
                  disconnected metrics.
                </p>
              </div>
            </DocSection>

            <DocSection id="decision-system" eyebrow="The Decision System" title="From hypothesis to product decision" background="panel">
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

            <DocSection id="decision-trade-offs" eyebrow="Decision Trade-offs" title="The choices validation makes explicit">
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

            <DocSection id="evidence-hierarchy" eyebrow="Evidence Hierarchy" title="Not all evidence deserves equal confidence" background="panel">
              <div className="grid gap-3">
                {evidenceLevels.map((evidence) => (
                  <article key={evidence.title} className="rounded-md border border-line bg-paper p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line text-sm font-semibold text-accent">
                        {evidence.level}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold leading-tight text-ink">{evidence.title}</h3>
                        <p className="mt-2 leading-7 text-muted">{evidence.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-questions" eyebrow="Decision Questions" title="Prompts for evidence-backed validation">
              <div className="grid gap-4">
                {decisionQuestions.map((group) => (
                  <ValidationQuestionGroup key={group.title} title={group.title} questions={group.questions} />
                ))}
              </div>
            </DocSection>

            <DocSection id="validation-isnt" eyebrow="Validation Isn't..." title="Boundaries that protect decision quality" background="panel">
              <div className="grid gap-3">
                {validationIsnt.map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-line bg-paper p-5">
                    <XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    <p className="leading-7 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="common-mistakes" eyebrow="Common Mistakes" title="Where validation becomes performative">
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

            <DocSection id="failure-modes" eyebrow="Failure Modes" title="Signals that the experiment is not helping" background="panel">
              <div className="grid gap-3">
                {failureModes.map((failureMode) => (
                  <div key={failureMode} className="flex gap-3 rounded-md border border-line bg-paper p-5">
                    <ShieldAlert className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    <p className="leading-7 text-muted">{failureMode}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="recovery-patterns" eyebrow="Recovery Patterns" title="How to regain decision quality">
              <div className="grid gap-4">
                {recoveryPatterns.map((pattern) => (
                  <article key={pattern.symptom} className="rounded-md border border-line bg-panel p-5">
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

            <DocSection id="framework-in-practice" eyebrow="Framework in Practice" title="Three implementation examples" background="panel">
              <div className="grid gap-4">
                {examples.map((example) => (
                  <article key={example.company} className="rounded-md border border-line bg-paper p-5">
                    <GitBranch className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">{example.company}</p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-ink">{example.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{example.focus}</p>
                    <p className="mt-3 leading-7 text-ink">{example.outcome}</p>
                    <ValidationTrackedLink
                      href={example.href}
                      eventName="validation_example_clicked"
                      label={`${example.company}: ${example.title}`}
                      className="mt-5"
                    >
                      Open Decision Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ValidationTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-checkpoint" eyebrow="Decision Checkpoint" title="The question before scaling">
              <div className="rounded-md border border-accent bg-panel p-6">
                <Lightbulb className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-2xl font-semibold leading-snug text-ink">
                  If the experiment succeeds, what product decision will we make differently?
                </p>
              </div>
            </DocSection>

            <DocSection id="confidence-meter" eyebrow="Confidence Meter" title="Move from belief to decision readiness" background="panel">
              <ConfidenceMeter levels={confidenceLevels} />
            </DocSection>

            <DocSection id="decision-scorecard" eyebrow="Decision Scorecard" title="A practical checklist before increasing investment">
              <DecisionScorecard items={scorecardItems} />
            </DocSection>

            <DocSection id="decision-quality-score" eyebrow="Decision Quality Score" title="Interpret the score before scaling" background="panel">
              <DecisionQualityScore bands={qualityBands} />
            </DocSection>

            <DocSection id="stop-criteria" eyebrow="Stop Criteria" title="When evidence should reduce investment">
              <StopCriteriaGrid criteria={stopCriteria} />
            </DocSection>

            <DocSection id="decision-review" eyebrow="Decision Review" title="Close the loop after the experiment" background="panel">
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
                <DecisionReviewStarted name="Validation & Experimentation" />
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
                <p className="mt-5 text-3xl font-semibold leading-tight text-ink">Build evidence before confidence.</p>
              </blockquote>
            </DocSection>

            <DocSection id="how-i-know-this" eyebrow="How I Know This" title="Where the system comes from">
              <div className="rounded-md border border-line bg-panel p-5">
                <BarChart3 className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 leading-8 text-muted">
                  This Decision System is based on product work across growth, enterprise SaaS, platform modernization, and
                  transaction-scale systems where premature scaling would have increased cost, risk, or customer friction. In those
                  environments, better validation reduced waste and made the next product decision easier to defend.
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
                    <ValidationTrackedLink
                      href={journal.href}
                      eventName="validation_example_clicked"
                      label={journal.title}
                      className="mt-5"
                    >
                      Read Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ValidationTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <section id="continue-learning" className="scroll-mt-24 border-b border-line py-12 sm:py-14" aria-labelledby="continue-learning-title">
              <div className="rounded-md border border-line bg-panel p-6">
                <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue Learning</p>
                <h2 id="continue-learning-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  AI Prioritization
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  The next Decision System will clarify how to prioritize AI opportunities once the customer problem and evidence
                  quality are visible.
                </p>
                <ValidationTrackedLink
                  href="/decision-systems/ai-prioritization"
                  eventName="validation_next_module_clicked"
                  label="AI Prioritization"
                  variant="primary"
                  className="mt-6"
                >
                  Next Decision System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  AI Prioritization
                </ValidationTrackedLink>
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
