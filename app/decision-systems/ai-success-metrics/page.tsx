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
  Layers,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  XCircle
} from "lucide-react";

import {
  AiMetricsQuestionGroup,
  AiMetricsTrackedLink,
  AiMetricsViewed,
  AiSuccessScorecard,
  MeasurementMatrix
} from "@/components/ai-metrics-interactions";
import { ReadingProgress } from "@/components/decision-system-interactions";
import { SiteHeader } from "@/components/site-header";

const pageTitle = "AI Success Metrics";
const metadataTitle = "AI Success Metrics Decision System | Product Operating System";
const pageDescription =
  "A product decision system for measuring whether AI products create customer outcomes, workflow improvement, business value, trust, and sustainable performance beyond model metrics.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-systems/ai-success-metrics";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/decision-systems/ai-success-metrics"
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
  { label: "Last Updated", value: "July 2026" }
];

const tocItems = [
  { href: "#executive-summary", label: "Executive Summary" },
  { href: "#measurement-pyramid", label: "AI Measurement Pyramid" },
  { href: "#metric-cascade", label: "Metric Cascade" },
  { href: "#leading-lagging", label: "Leading vs Lagging Metrics" },
  { href: "#metric-evolution", label: "Metric Evolution" },
  { href: "#measurement-triggers", label: "Measurement Triggers" },
  { href: "#decision-questions", label: "Decision Questions" },
  { href: "#metric-trade-offs", label: "Metric Trade-offs" },
  { href: "#ai-metrics-arent", label: "AI Metrics Aren't..." },
  { href: "#measurement-biases", label: "Measurement Biases" },
  { href: "#common-mistakes", label: "Common Mistakes" },
  { href: "#failure-modes", label: "Failure Modes" },
  { href: "#recovery-patterns", label: "Recovery Patterns" },
  { href: "#framework-in-practice", label: "Framework in Practice" },
  { href: "#measurement-matrix", label: "Measurement Matrix" },
  { href: "#success-scorecard", label: "AI Success Scorecard" },
  { href: "#stop-criteria", label: "Stop Criteria" },
  { href: "#decision-review", label: "Decision Review" },
  { href: "#key-takeaways", label: "Key Takeaways" },
  { href: "#operating-principle", label: "Operating Principle" },
  { href: "#how-i-know-this", label: "How I Know This" },
  { href: "#related-systems", label: "Related Decision Systems" },
  { href: "#continue-learning", label: "Continue Learning" }
];

const measurementPyramid = [
  {
    title: "Business Outcomes",
    description: "Retention, revenue, expansion, cost reduction, margin, or risk reduction."
  },
  {
    title: "Customer Outcomes",
    description: "Adoption, trust, satisfaction, repeat usage, and durable behavior change."
  },
  {
    title: "Workflow Outcomes",
    description: "Task completion, time saved, error reduction, handoff reduction, and decision quality."
  },
  {
    title: "AI System Outcomes",
    description: "Prompt success, output usefulness, tool success, fallback rate, and confidence calibration."
  },
  {
    title: "Model Metrics",
    description: "Accuracy, precision, recall, latency, hallucination rate, and retrieval quality."
  }
];

const metricCascade = [
  {
    title: "Business Goal",
    description: "What revenue, retention, risk, margin, or cost outcome should improve?"
  },
  {
    title: "Customer Behavior",
    description: "What customer action or repeated behavior should change?"
  },
  {
    title: "Workflow Improvement",
    description: "What task becomes faster, easier, safer, or more reliable?"
  },
  {
    title: "AI Capability",
    description: "Which AI capability improves the workflow outcome?"
  },
  {
    title: "Model Metric",
    description: "Which model or retrieval metric explains whether the capability is improving?"
  }
];

const leadingMetrics = ["Prompt Success", "Retrieval Quality", "Workflow Completion", "Trust", "Adoption"];
const laggingMetrics = ["Retention", "Revenue", "Expansion", "Cost Reduction", "Customer Satisfaction"];

const metricEvolution = [
  "Prototype",
  "Prompt Success",
  "Pilot",
  "Workflow Completion",
  "Launch",
  "Adoption",
  "Growth",
  "Retention",
  "Scale",
  "Business Outcomes"
];

const measurementTriggers = [
  {
    trigger: "Product launches",
    changed: "The AI capability moves from internal validation to real customer usage.",
    evolve: "The team needs to measure behavior in production conditions, not only test quality.",
    metrics: ["Adoption", "Workflow completion", "Latency", "Fallback rate", "Support issues"]
  },
  {
    trigger: "Customer adoption increases",
    changed: "More customers begin using the AI capability repeatedly.",
    evolve: "Repeat usage makes trust, usefulness, and habit formation more important than first-use curiosity.",
    metrics: ["Repeat usage", "Trust signal", "Override rate", "Acceptance rate", "Retained usage"]
  },
  {
    trigger: "Enterprise customers onboard",
    changed: "Larger customers introduce governance, compliance, security, and reliability expectations.",
    evolve: "Enterprise value depends on trust, consistency, auditability, and operational confidence.",
    metrics: ["Reliability", "Auditability", "Escalation rate", "SLA performance", "Admin adoption"]
  },
  {
    trigger: "Revenue scales",
    changed: "The AI capability begins affecting revenue, expansion, or margin.",
    evolve: "The team must understand whether AI usage creates sustainable economics.",
    metrics: ["Revenue influenced", "Expansion rate", "Cost-to-value", "Margin impact", "Cost per successful workflow"]
  },
  {
    trigger: "Workflow stabilizes",
    changed: "The core use case becomes clearer and more repeatable.",
    evolve: "The team can move from broad learning signals to sharper workflow quality and efficiency metrics.",
    metrics: ["Task completion", "Time saved", "Error reduction", "Handoff reduction", "Decision quality"]
  },
  {
    trigger: "Operational complexity increases",
    changed: "The AI system requires monitoring, escalation, support, evaluation, or model and data maintenance.",
    evolve: "Product quality now depends on whether the system can be operated safely and reliably.",
    metrics: ["Drift", "Failure rate", "Fallback success", "Support volume", "Incident rate", "Evaluation coverage"]
  }
];

const decisionQuestions = [
  {
    title: "Business",
    questions: [
      "Which business outcome should improve if the AI product works?",
      "Is the metric tied to revenue, retention, margin, risk, or cost?",
      "What business metric would justify continued investment?",
      "What outcome would make the team stop scaling?"
    ]
  },
  {
    title: "Customer",
    questions: [
      "What customer behavior should change?",
      "Would customers notice if the AI capability disappeared?",
      "What metric proves trust or repeat usage?",
      "Which customer segment should improve first?"
    ]
  },
  {
    title: "Workflow",
    questions: [
      "What task becomes faster, easier, safer, or more reliable?",
      "Does the workflow completion rate improve?",
      "Are users making better decisions or fewer errors?",
      "What workflow metric would show the AI is useful in context?"
    ]
  },
  {
    title: "AI System",
    questions: [
      "Does the system produce useful outputs in the product context?",
      "Are fallbacks, retries, and escalations visible?",
      "Can users recover from weak outputs?",
      "What system metric explains customer success or failure?"
    ]
  },
  {
    title: "Model",
    questions: [
      "Which model metric actually affects customer value?",
      "Are we measuring quality in real product conditions?",
      "What model improvement would not matter to users?",
      "What evaluation set reflects production behavior?"
    ]
  },
  {
    title: "Trust",
    questions: [
      "Do users accept, override, or ignore AI output?",
      "Are errors understandable and recoverable?",
      "Does confidence increase with repeated use?",
      "What trust failure would damage adoption?"
    ]
  },
  {
    title: "Operations",
    questions: [
      "Can the team monitor failures and drift?",
      "Are support issues decreasing or changing?",
      "Is the AI system maintainable after launch?",
      "What operational metric should trigger intervention?"
    ]
  },
  {
    title: "Economics",
    questions: [
      "Does usage create sustainable cost-to-value?",
      "Are inference and operational costs proportional to impact?",
      "Does scale improve or weaken product economics?",
      "What cost metric defines the boundary for scaling?"
    ]
  }
];

const tradeOffs = [
  {
    title: "Accuracy vs Usefulness",
    description: "A technically better answer still fails if it does not improve the customer workflow."
  },
  {
    title: "Adoption vs Trust",
    description: "Curiosity can drive usage before the product earns durable confidence."
  },
  {
    title: "Speed vs Quality",
    description: "Faster output creates value only when it remains reliable enough for the context."
  },
  {
    title: "Automation vs Human Control",
    description: "Higher automation should be measured against override, approval, and recovery behavior."
  },
  {
    title: "Cost vs Customer Value",
    description: "AI usage must create enough value to justify inference, operations, and support costs."
  },
  {
    title: "Short-term Engagement vs Durable Retention",
    description: "Initial engagement matters less than whether customers return and rely on the capability."
  },
  {
    title: "Model Improvement vs Workflow Improvement",
    description: "Model gains should translate into easier tasks, better decisions, or fewer failures."
  },
  {
    title: "Precision vs Coverage",
    description: "A narrow, precise capability may beat a broader one if it supports the highest-value workflow."
  }
];

const metricsArent = [
  "AI metrics aren't product outcomes.",
  "Accuracy isn't enough.",
  "Usage isn't success.",
  "Prompt success isn't customer value.",
  "Benchmarks don't prove production impact.",
  "Dashboards don't improve decisions by themselves."
];

const measurementBiases = [
  {
    title: "Accuracy bias",
    description: "Overweighting model performance because it is easy to quantify."
  },
  {
    title: "Dashboard bias",
    description: "Assuming visible metrics are the most important metrics."
  },
  {
    title: "Vanity metric bias",
    description: "Celebrating usage, prompts, or sessions without outcome change."
  },
  {
    title: "Executive metric bias",
    description: "Choosing metrics that sound strategic but do not guide product decisions."
  },
  {
    title: "Activity bias",
    description: "Measuring what users do, not whether the product helped them succeed."
  },
  {
    title: "Benchmark bias",
    description: "Trusting benchmark scores over real workflow performance."
  }
];

const mistakes = [
  {
    title: "Measuring model performance without customer behavior",
    description: "Model quality only matters when it explains or improves product outcomes."
  },
  {
    title: "Treating usage as adoption",
    description: "A user can try a feature without trusting it or returning to it."
  },
  {
    title: "Ignoring trust",
    description: "Acceptance, overrides, corrections, and repeated use often reveal more than volume."
  },
  {
    title: "Optimizing prompts instead of workflows",
    description: "Prompt success is weak if the workflow still fails."
  },
  {
    title: "Measuring averages only",
    description: "Averages can hide failures in high-risk or high-value segments."
  },
  {
    title: "Ignoring cost and latency",
    description: "AI value weakens when the product becomes slow, expensive, or hard to operate."
  },
  {
    title: "Using lagging metrics only",
    description: "Retention and revenue confirm value late; teams also need earlier learning signals."
  },
  {
    title: "Defining success after launch",
    description: "Teams should agree success criteria before interpretation becomes political."
  }
];

const failureModes = [
  "Model improves but customer outcomes do not.",
  "Users try the feature once but do not return.",
  "Customers use the feature but do not trust the result.",
  "AI output is technically correct but not useful in workflow.",
  "Costs scale faster than value.",
  "Metrics hide failures in high-risk segments.",
  "Dashboard shows activity but not decision quality.",
  "Leadership declares success before lagging outcomes appear."
];

const recoveryPatterns = [
  {
    symptom: "Model accuracy improves but adoption stays flat.",
    likelyCause: "The feature is not solving a meaningful workflow problem.",
    recoveryAction: "Reconnect metrics to customer behavior and workflow completion.",
    expectedOutcome: "Clearer signal on whether the AI capability creates user value."
  },
  {
    symptom: "Usage rises but trust declines.",
    likelyCause: "Users are experimenting but not relying on the output.",
    recoveryAction: "Measure acceptance, override, corrections, and repeat usage.",
    expectedOutcome: "Better understanding of whether AI is earning confidence."
  },
  {
    symptom: "Dashboard looks positive but business impact is weak.",
    likelyCause: "Metrics are focused on activity rather than outcomes.",
    recoveryAction: "Cascade from business goal to customer behavior to workflow improvement.",
    expectedOutcome: "Stronger alignment between product decisions and business value."
  },
  {
    symptom: "Costs rise faster than product impact.",
    likelyCause: "The team did not measure cost-to-value at scale.",
    recoveryAction: "Add cost per successful workflow, cost per retained customer, or cost per resolved task.",
    expectedOutcome: "Clearer economic boundary for scaling."
  }
];

const examples = [
  {
    company: "Simplilearn",
    title: "Job Guarantee Growth",
    focus: "Growth and monetization metrics.",
    outcome: "Revenue growth required measuring funnel behavior, conversion, and product-led loops, not just campaign activity.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    company: "JoVE",
    title: "Workflow Adoption",
    focus: "Workflow adoption.",
    outcome: "Engagement and institutional adoption depended on whether the product fit how users worked.",
    href: "/stories/product-discovery-jove"
  },
  {
    company: "Comviva",
    title: "Payments Reliability",
    focus: "Payments reliability and trust.",
    outcome: "In payments, successful transactions are expected; failures shape trust, satisfaction, and customer experience.",
    href: "/stories/payments-reliability-comviva"
  }
];

const matrixQuadrants = [
  {
    quadrant: "High Customer Value / Strong AI Signal",
    action: "Scale",
    description: "Customer behavior and AI system quality both support broader investment.",
    risk: "Scaling before operational and economic metrics are ready."
  },
  {
    quadrant: "High Customer Value / Weak AI Signal",
    action: "Improve System Quality",
    description: "The product problem matters, but retrieval, output quality, reliability, or latency needs work.",
    risk: "Blaming the use case when the system is the constraint."
  },
  {
    quadrant: "Low Customer Value / Strong AI Signal",
    action: "Reframe Product Use Case",
    description: "The AI performs well, but the capability is not attached to a meaningful customer outcome.",
    risk: "Celebrating model performance while product value stays weak."
  },
  {
    quadrant: "Low Customer Value / Weak AI Signal",
    action: "Stop or Rebuild",
    description: "Neither product value nor AI quality justifies continued scaling.",
    risk: "Continuing because the dashboard has activity."
  }
];

const scorecardDimensions = [
  "Business Outcome Clarity",
  "Customer Behavior Change",
  "Workflow Completion",
  "Trust Signal",
  "Adoption Quality",
  "Retention / Repeat Usage",
  "AI Output Usefulness",
  "Retrieval / Model Quality",
  "Latency & Reliability",
  "Cost-to-Value",
  "Operational Observability",
  "Decision Usefulness"
];

const recommendationBands = [
  { range: "50-60", title: "Scale with confidence" },
  { range: "40-49", title: "Improve and expand selectively" },
  { range: "30-39", title: "Validate further before scaling" },
  { range: "20-29", title: "Reframe metrics or workflow" },
  { range: "12-19", title: "Stop or rebuild measurement model" }
];

const stopCriteria = [
  {
    title: "Metrics disconnected from customer outcomes",
    description: "Measurement should stop when dashboards cannot explain customer or business value."
  },
  {
    title: "Usage without trust",
    description: "Volume is weak if users ignore, override, or avoid relying on the output."
  },
  {
    title: "Better models without workflow improvement",
    description: "Model gains should change task completion, decision quality, or customer behavior."
  },
  {
    title: "Cost exceeds value",
    description: "AI scale should stop when cost-to-value weakens with usage."
  },
  {
    title: "Hidden failure modes",
    description: "Averages should not hide failures in critical segments, workflows, or customer types."
  },
  {
    title: "Poor observability",
    description: "Teams need to monitor drift, quality, failures, fallback, and escalation."
  },
  {
    title: "Undefined success criteria",
    description: "The team should not interpret success after launch without pre-agreed thresholds."
  }
];

const reviewQuestions = [
  "Which customer outcome improved?",
  "Which business outcome moved?",
  "Did workflow improve?",
  "Did trust increase?",
  "Which model metric mattered?",
  "Which metric misled us?",
  "What should we stop measuring?",
  "What should we measure next?"
];

const takeaways = [
  "AI product success starts with customer and business outcomes.",
  "Model metrics matter only when they explain or improve product outcomes.",
  "Leading metrics help teams learn before lagging metrics move.",
  "Trust, workflow completion, and repeat usage are core AI product signals.",
  "A good AI dashboard should change product decisions, not just report activity."
];

const relatedSystems = [
  {
    title: "Customer Discovery",
    description: "Clarify which customer behavior the product should change.",
    href: "/decision-systems/customer-discovery"
  },
  {
    title: "Validation & Experimentation",
    description: "Define success criteria before increasing investment.",
    href: "/decision-systems/validation-experimentation"
  },
  {
    title: "AI Prioritization",
    description: "Prioritize AI opportunities by customer value, business value, and readiness.",
    href: "/decision-systems/ai-prioritization"
  },
  {
    title: "Build vs Buy AI",
    description: "Decide what capability the team should buy, configure, extend, build, or platformize.",
    href: "/decision-systems/build-vs-buy-ai"
  },
  {
    title: "RAG vs Agent",
    description: "Choose the simplest architecture that reliably solves the customer problem.",
    href: "/decision-systems/rag-vs-agent"
  }
];

const breadcrumbs = [
  { name: "Decision Operating System", item: "https://saurabh-product-os.vercel.app/decision-operating-system" },
  { name: "Decision Systems", item: "https://saurabh-product-os.vercel.app/decision-systems" },
  { name: "AI Success Metrics", item: pageUrl }
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

export default function AiSuccessMetricsDecisionSystemPage() {
  return (
    <>
      <ReadingProgress label="AI Success Metrics reading progress" />
      <AiMetricsViewed name="AI Success Metrics" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Decision System 06</p>
              <h1 id="decision-system-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Measure customer outcomes first. Measure AI performance second.
              </p>
              <div className="mt-6 rounded-md border border-line bg-paper p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Core question</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-ink">
                  Which metrics tell us that our AI product is creating measurable customer and business value, not just producing
                  technically good predictions?
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
              <nav aria-label="AI Success Metrics sections" className="mt-4 grid gap-1 text-sm text-muted">
                {tocItems.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <DocSection id="executive-summary" eyebrow="Executive Summary" title="Model metrics are not product outcomes">
              <div className="rounded-md border border-line bg-panel p-5">
                <p className="text-lg leading-8 text-muted">
                  AI product success starts with the customer and the business. Model quality matters, but it is only useful when it
                  explains or improves workflow completion, trust, adoption, retention, cost-to-value, or business outcomes. The best
                  metrics help teams decide what to build, improve, scale, pause, or stop.
                </p>
              </div>
            </DocSection>

            <DocSection id="measurement-pyramid" eyebrow="AI Measurement Pyramid" title="Product success sits above model performance" background="panel">
              <FlowList items={measurementPyramid} direction="up" />
              <p className="mt-6 leading-8 text-muted">
                Model metrics support product success, but they never define it by themselves.
              </p>
            </DocSection>

            <DocSection id="metric-cascade" eyebrow="Metric Cascade" title="Every AI metric should connect back to outcomes">
              <FlowList items={metricCascade} />
            </DocSection>

            <DocSection id="leading-lagging" eyebrow="Leading vs Lagging Metrics" title="Learn early, confirm later" background="panel">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricList title="Leading" items={leadingMetrics} />
                <MetricList title="Lagging" items={laggingMetrics} />
              </div>
            </DocSection>

            <DocSection id="metric-evolution" eyebrow="Metric Evolution" title="Measurement should mature with the product">
              <div className="grid gap-3">
                {metricEvolution.map((item, index) => (
                  <div key={`${item}-${index}`}>
                    <div className="rounded-md border border-line bg-panel p-5">
                      <p className="text-lg font-semibold leading-7 text-ink">{item}</p>
                    </div>
                    {index < metricEvolution.length - 1 ? (
                      <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                        <ArrowDown className="h-5 w-5" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-6 leading-8 text-muted">
                AI product metrics should evolve as product maturity increases. Early teams need fast learning signals such as prompt
                success and workflow completion. As products mature, measurement should shift toward adoption quality, retention,
                customer satisfaction, operational efficiency, cost-to-value, and business outcomes.
              </p>
            </DocSection>

            <DocSection id="measurement-triggers" eyebrow="Measurement Triggers" title="Business events should change what teams measure" background="panel">
              <div className="grid gap-4">
                {measurementTriggers.map((trigger) => (
                  <article key={trigger.trigger} className="rounded-md border border-line bg-paper p-5">
                    <h3 className="text-xl font-semibold leading-tight text-ink">{trigger.trigger}</h3>
                    <dl className="mt-5 grid gap-4">
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">What changed</dt>
                        <dd className="mt-2 leading-7 text-muted">{trigger.changed}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Why measurement should evolve</dt>
                        <dd className="mt-2 leading-7 text-muted">{trigger.evolve}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">New metrics</dt>
                        <dd className="mt-3 flex flex-wrap gap-2">
                          {trigger.metrics.map((metric) => (
                            <span key={metric} className="rounded-full border border-line bg-panel px-3 py-1 text-sm font-medium text-muted">
                              {metric}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-questions" eyebrow="Decision Questions" title="Prompts for AI product measurement">
              <div className="grid gap-4">
                {decisionQuestions.map((group) => (
                  <AiMetricsQuestionGroup key={group.title} title={group.title} questions={group.questions} />
                ))}
              </div>
            </DocSection>

            <DocSection id="metric-trade-offs" eyebrow="Metric Trade-offs" title="The choices metrics make visible" background="panel">
              <div className="grid gap-4 sm:grid-cols-2">
                {tradeOffs.map((tradeOff) => (
                  <article key={tradeOff.title} className="rounded-md border border-line bg-paper p-5">
                    <SlidersHorizontal className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{tradeOff.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{tradeOff.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="ai-metrics-arent" eyebrow="AI Metrics Aren't..." title="Boundaries that keep measurement honest">
              <SimpleList items={metricsArent} icon={<XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="measurement-biases" eyebrow="Measurement Biases" title="Biases that make weak dashboards look strong" background="panel">
              <div className="grid gap-4 sm:grid-cols-2">
                {measurementBiases.map((bias) => (
                  <article key={bias.title} className="rounded-md border border-line bg-paper p-5">
                    <Gauge className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{bias.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{bias.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="common-mistakes" eyebrow="Common Mistakes" title="Where AI measurement loses product discipline">
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

            <DocSection id="failure-modes" eyebrow="Failure Modes" title="How AI metrics fail in production" background="panel">
              <SimpleList items={failureModes} icon={<ShieldAlert className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="recovery-patterns" eyebrow="Recovery Patterns" title="How to recover measurement quality">
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
                    <AiMetricsTrackedLink
                      href={example.href}
                      eventName="ai_metrics_example_clicked"
                      label={`${example.company}: ${example.title}`}
                      className="mt-5"
                    >
                      Open Decision Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </AiMetricsTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="measurement-matrix" eyebrow="Measurement Matrix" title="Customer value and AI signal determine the action">
              <MeasurementMatrix quadrants={matrixQuadrants} />
            </DocSection>

            <DocSection id="success-scorecard" eyebrow="AI Success Scorecard" title="Score product success before scaling" background="panel">
              <AiSuccessScorecard dimensions={scorecardDimensions} />
              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                {recommendationBands.map((band) => (
                  <div key={band.range} className="rounded-md border border-line bg-paper p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{band.range}</p>
                    <p className="mt-2 font-semibold text-ink">{band.title}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="stop-criteria" eyebrow="Stop Criteria" title="When measurement should be rebuilt">
              <div className="grid gap-4 sm:grid-cols-2">
                {stopCriteria.map((criterion) => (
                  <article key={criterion.title} className="rounded-md border border-line bg-panel p-5">
                    <h3 className="text-xl font-semibold leading-tight text-ink">{criterion.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{criterion.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-review" eyebrow="Decision Review" title="Revisit metrics after evidence changes" background="panel">
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
              <SimpleList items={takeaways} icon={<CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="operating-principle" eyebrow="Operating Principle" title="The principle behind the system" background="panel">
              <blockquote className="rounded-md border border-line bg-paper p-6">
                <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-3xl font-semibold leading-tight text-ink">
                  Products succeed because customers achieve better outcomes, not because models achieve better scores.
                </p>
              </blockquote>
            </DocSection>

            <DocSection id="how-i-know-this" eyebrow="How I Know This" title="Where the system comes from">
              <div className="rounded-md border border-line bg-panel p-5">
                <BarChart3 className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 leading-8 text-muted">
                  This system is grounded in product work across growth products, enterprise SaaS, payments, customer discovery, and AI
                  strategy. Across these contexts, the strongest metrics were the ones that helped teams decide what to build, improve,
                  scale, pause, or stop.
                </p>
              </div>
            </DocSection>

            <DocSection id="related-systems" eyebrow="Related Decision Systems" title="Where this framework connects" background="panel">
              <div className="grid gap-4">
                {relatedSystems.map((system) => (
                  <article key={system.title} className="rounded-md border border-line bg-paper p-5">
                    <Layers className="h-6 w-6 text-accent" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{system.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{system.description}</p>
                    <AiMetricsTrackedLink href={system.href} eventName="ai_metrics_example_clicked" label={system.title} className="mt-5">
                      Open Decision System
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </AiMetricsTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <section id="continue-learning" className="scroll-mt-24 border-b border-line py-12 sm:py-14" aria-labelledby="continue-learning-title">
              <div className="rounded-md border border-line bg-panel p-6">
                <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue Learning</p>
                <h2 id="continue-learning-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  This completes AI Product Operating System v1.
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  Return to the Decision Operating System home or start the guided recruiter tour.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <AiMetricsTrackedLink
                    href="/decision-operating-system"
                    eventName="ai_metrics_next_module_clicked"
                    label="Decision Operating System"
                    variant="primary"
                  >
                    Return to Decision Operating System
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </AiMetricsTrackedLink>
                  <AiMetricsTrackedLink
                    href="/recruiter-tour"
                    eventName="ai_metrics_next_module_clicked"
                    label="Recruiter Guided Tour"
                    variant="secondary"
                  >
                    Start the Recruiter Guided Tour
                  </AiMetricsTrackedLink>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

function MetricList({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="rounded-md border border-line bg-paper p-5">
      <h3 className="text-xl font-semibold leading-tight text-ink">{title}</h3>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
            <p className="leading-7 text-muted">{item}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function FlowList({ direction = "down", items }: { direction?: "down" | "up"; items: Array<{ description: string; title: string }> }) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={item.title}>
          <article className="rounded-md border border-line bg-paper p-5">
            <h3 className="text-xl font-semibold leading-tight text-ink">{item.title}</h3>
            <p className="mt-2 leading-7 text-muted">{item.description}</p>
          </article>
          {index < items.length - 1 ? (
            <div className="flex justify-center py-2 text-accent" aria-hidden="true">
              <ArrowDown className={`h-5 w-5 ${direction === "up" ? "rotate-180" : ""}`} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SimpleList({ icon, items }: { icon: ReactNode; items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 rounded-md border border-line bg-panel p-5">
          {icon}
          <p className="leading-7 text-muted">{item}</p>
        </div>
      ))}
    </div>
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
