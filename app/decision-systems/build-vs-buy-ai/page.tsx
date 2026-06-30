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
  Target,
  XCircle
} from "lucide-react";

import {
  BuildBuyQuestionGroup,
  BuildBuyTrackedLink,
  BuildBuyViewed,
  OwnershipMatrix,
  OwnershipScorecard
} from "@/components/build-buy-ai-interactions";
import { ReadingProgress } from "@/components/decision-system-interactions";
import { SiteHeader } from "@/components/site-header";

const pageTitle = "Build vs Buy AI";
const metadataTitle = "Build vs Buy AI Decision System | Product Operating System";
const pageDescription =
  "A product decision system for deciding whether to buy, configure, extend, build, or platformize AI capabilities based on differentiation, data advantage, speed, risk, and long-term ownership value.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-systems/build-vs-buy-ai";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/decision-systems/build-vs-buy-ai"
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
  { href: "#decision-framework", label: "Build vs Buy Framework" },
  { href: "#decision-horizon", label: "Decision Horizon" },
  { href: "#ownership-evolution", label: "Ownership Evolution" },
  { href: "#ownership-triggers", label: "Ownership Triggers" },
  { href: "#advantage-pyramid", label: "Competitive Advantage Pyramid" },
  { href: "#decision-questions", label: "Decision Questions" },
  { href: "#build-isnt", label: "Build Isn't..." },
  { href: "#buy-isnt", label: "Buy Isn't..." },
  { href: "#common-mistakes", label: "Common Mistakes" },
  { href: "#ownership-biases", label: "Ownership Biases" },
  { href: "#failure-modes", label: "Failure Modes" },
  { href: "#recovery-patterns", label: "Recovery Patterns" },
  { href: "#framework-in-practice", label: "Framework in Practice" },
  { href: "#ownership-matrix", label: "Ownership Matrix" },
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
    title: "Customer Need",
    description: "Clarify the workflow problem before comparing internal build effort with external options."
  },
  {
    title: "Business Differentiation",
    description: "Decide whether owning the capability changes revenue, retention, margin, risk, or customer experience."
  },
  {
    title: "Data Advantage",
    description: "Evaluate whether proprietary data improves quality, personalization, ranking, prediction, or workflow intelligence."
  },
  {
    title: "Speed Requirement",
    description: "Separate the need to learn quickly from the need to own permanently."
  },
  {
    title: "Risk",
    description: "Assess reliability, compliance, vendor dependency, switching cost, operational burden, and trust."
  },
  {
    title: "Decision",
    description: "Choose buy, configure, extend, build, or platform based on differentiation and readiness."
  }
];

const ownershipOutcomes = [
  {
    title: "Buy",
    description: "Use when the capability is commodity, mature, low differentiation, and speed matters."
  },
  {
    title: "Configure",
    description: "Use when an existing product works, but workflow fit, compliance, or process adaptation matters."
  },
  {
    title: "Extend",
    description: "Use when the base capability exists, but product differentiation requires custom logic or experience."
  },
  {
    title: "Build",
    description: "Use when the capability is core to product value, data advantage, or strategic control."
  },
  {
    title: "Platform",
    description: "Use when the capability compounds across products, teams, or customer segments."
  }
];

const decisionHorizon = ["Today", "Buy", "Configure", "Extend", "Build", "Platform"];

const ownershipEvolution = [
  "Need Speed",
  "Buy",
  "Workflow Differentiation",
  "Configure",
  "Customer Adoption",
  "Extend",
  "Strategic Differentiation",
  "Build",
  "Cross-Product Capability",
  "Platform"
];

const ownershipTriggers = [
  {
    trigger: "Customer adoption increases",
    changed: "The capability moves from experiment to repeated customer behavior.",
    evolve: "Workflow fit, reliability, and product experience become more important than speed alone.",
    next: "Configure or Extend"
  },
  {
    trigger: "Vendor costs exceed thresholds",
    changed: "Usage growth makes vendor pricing materially affect product economics.",
    evolve: "The team needs more control over cost, routing, optimization, or high-volume use cases.",
    next: "Extend or Build"
  },
  {
    trigger: "Proprietary data becomes strategically valuable",
    changed: "Internal data improves quality, personalization, ranking, prediction, or workflow intelligence.",
    evolve: "The company can create differentiated outcomes that generic vendors cannot easily replicate.",
    next: "Build"
  },
  {
    trigger: "Multiple internal products require the capability",
    changed: "The same capability is needed across teams, products, or customer segments.",
    evolve: "Reuse, governance, consistency, and shared infrastructure become more valuable than isolated implementation.",
    next: "Platform"
  },
  {
    trigger: "Regulatory or compliance requirements change",
    changed: "Data handling, explainability, auditability, residency, or approval requirements become stricter.",
    evolve: "Vendor dependency may create unacceptable risk or require deeper controls.",
    next: "Configure, Extend, or Build"
  },
  {
    trigger: "Workflow differentiation becomes a competitive advantage",
    changed: "The capability directly shapes customer adoption, retention, or decision quality.",
    evolve: "The company should own the experience, feedback loop, and improvement path.",
    next: "Extend or Build"
  }
];

const advantagePyramid = [
  {
    title: "Commodity",
    description: "Buy unless there is a trust, compliance, cost, or integration reason not to."
  },
  {
    title: "Integration",
    description: "Configure or extend when workflow fit and system connection matter."
  },
  {
    title: "Workflow",
    description: "Extend or build when the experience shapes adoption and customer value."
  },
  {
    title: "Intelligence",
    description: "Build when decision quality becomes a differentiating product capability."
  },
  {
    title: "Data",
    description: "Own when proprietary data improves outcomes and compounds with use."
  },
  {
    title: "Moat",
    description: "Platformize when capability compounds across products, teams, and customer segments."
  }
];

const decisionQuestions = [
  {
    title: "Customer",
    questions: [
      "Does this capability solve a real workflow problem?",
      "Would customers care whether this is built internally?",
      "Does the experience need to feel native to the product?",
      "What customer behavior would prove ownership matters?"
    ]
  },
  {
    title: "Business",
    questions: [
      "Does owning this capability improve revenue, retention, margin, risk, or speed?",
      "Is this capability core to differentiation?",
      "What is the cost of delayed launch?",
      "What would make purchase price less important than strategic control?"
    ]
  },
  {
    title: "Data",
    questions: [
      "Do we have proprietary data that improves the capability?",
      "Will usage create a data advantage over time?",
      "Can a vendor access the data safely and legally?",
      "What data loop would we lose if we outsourced the capability?"
    ]
  },
  {
    title: "Model",
    questions: [
      "Is model behavior generic, specialized, or tied to our workflow?",
      "What model quality threshold matters for customer trust?",
      "Can a vendor meet the evaluation standard we need?",
      "Would internal ownership improve quality over time?"
    ]
  },
  {
    title: "Engineering",
    questions: [
      "What should engineering own because it affects system reliability or product control?",
      "What commodity infrastructure would distract from differentiating work?",
      "How hard is the integration, migration, or replacement path?",
      "What architecture decision becomes expensive to reverse?"
    ]
  },
  {
    title: "Operations",
    questions: [
      "Who monitors quality, failures, cost, and customer escalations?",
      "Can the organization operate this capability after launch?",
      "What support, success, compliance, or training burden is created?",
      "Does buying reduce operational risk or hide it?"
    ]
  },
  {
    title: "Risk",
    questions: [
      "What happens if vendor pricing, roadmap, latency, or reliability changes?",
      "What customer trust or compliance failure would be unacceptable?",
      "Can we safely share data with a vendor?",
      "What risk do we create by building too early?"
    ]
  },
  {
    title: "Vendor",
    questions: [
      "Does the vendor solve the workflow or only provide infrastructure?",
      "How hard is it to switch later?",
      "Does the vendor roadmap align with our product strategy?",
      "What capability would we still need to own internally?"
    ]
  },
  {
    title: "Strategy",
    questions: [
      "Is this temporary capability, product differentiation, or future platform infrastructure?",
      "Would owning this change our competitive position?",
      "What should we learn before committing to ownership?",
      "Will owning this capability create strategic learning that compounds over time?"
    ]
  }
];

const buildIsnt = [
  "Build isn't automatically more strategic.",
  "Build isn't justified by engineering preference alone.",
  "Build isn't cheaper if maintenance, evaluation, and operations are ignored.",
  "Build isn't ownership unless the company controls the data, workflow, and improvement loop.",
  "Build isn't the right answer before differentiation is proven."
];

const buyIsnt = [
  "Buy isn't a lack of ambition.",
  "Buy isn't risk-free.",
  "Buy isn't fast if integration, compliance, and change management are ignored.",
  "Buy isn't enough when the workflow is strategically differentiating.",
  "Buy isn't permanent if the capability becomes core over time."
];

const mistakes = [
  {
    title: "Treating build vs buy as binary",
    description: "The stronger decision often sits between buy, configure, extend, build, and platform."
  },
  {
    title: "Building before customer value is proven",
    description: "Internal ownership is expensive when the problem, workflow, or adoption signal is still weak."
  },
  {
    title: "Buying infrastructure for a workflow problem",
    description: "A vendor may provide capability without solving the product experience that customers need."
  },
  {
    title: "Ignoring switching cost",
    description: "The first ownership decision can quietly limit future product strategy."
  },
  {
    title: "Ignoring data ownership",
    description: "Teams can lose the improvement loop that makes intelligence more useful over time."
  },
  {
    title: "Comparing purchase price to build cost",
    description: "A mature decision includes maintenance, operations, vendor risk, trust, and long-term control."
  }
];

const ownershipBiases = [
  {
    title: "Engineering bias",
    description: "Assuming internal build is better because the team can build it."
  },
  {
    title: "Procurement bias",
    description: "Assuming buying is safer because it is easier to approve or contract."
  },
  {
    title: "Executive bias",
    description: "Overweighting leadership preference before customer value and long-term ownership cost are clear."
  },
  {
    title: "Vendor bias",
    description: "Accepting a vendor's roadmap as a substitute for product strategy."
  },
  {
    title: "Sunk-cost bias",
    description: "Continuing a build or vendor path because the team has already invested too much to stop."
  }
];

const failureModes = [
  "Vendor solves the generic use case but not the customer workflow.",
  "Internal build takes too long and misses market timing.",
  "Bought solution becomes expensive as usage scales.",
  "Build decision creates hidden maintenance burden.",
  "Data cannot be shared safely with the vendor.",
  "Vendor roadmap diverges from product strategy.",
  "Internal platform becomes overbuilt before enough demand exists.",
  "Teams lose ownership of the customer experience."
];

const recoveryPatterns = [
  {
    symptom: "Vendor tool launches quickly but adoption is weak.",
    likelyCause: "The solution did not fit the native workflow.",
    recoveryAction: "Configure or extend around the core workflow before expanding rollout.",
    expectedOutcome: "Better workflow fit and clearer signal on whether ownership is needed."
  },
  {
    symptom: "Internal build is consuming more time than expected.",
    likelyCause: "The team tried to own commodity infrastructure too early.",
    recoveryAction: "Buy or configure the commodity layer and reserve build effort for differentiating workflow logic.",
    expectedOutcome: "Faster delivery and better use of internal engineering capacity."
  },
  {
    symptom: "Vendor costs rise sharply with usage.",
    likelyCause: "Unit economics were not evaluated at scale.",
    recoveryAction: "Model cost thresholds and decide whether to renegotiate, route selectively, or build the high-volume layer.",
    expectedOutcome: "Stronger economic control and clearer ownership path."
  },
  {
    symptom: "Teams disagree on whether the capability is strategic.",
    likelyCause: "Differentiation criteria were not explicit.",
    recoveryAction: "Score customer value, data advantage, workflow ownership, speed, risk, and learning value.",
    expectedOutcome: "A more objective buy, configure, extend, build, or platform decision."
  }
];

const examples = [
  {
    company: "Logix",
    title: "Platform Modernization",
    focus: "Choosing a practical platform modernization path instead of overbuying expensive vendor capability.",
    outcome: "Own architecture choices that affect cost, release velocity, and long-term platform control.",
    href: "/stories/platform-modernization-logix"
  },
  {
    company: "JoVE",
    title: "Workflow Intelligence",
    focus: "Prioritizing workflow intelligence over generic feature expansion.",
    outcome: "Build or extend where workflow fit creates adoption advantage.",
    href: "/stories/product-discovery-jove"
  },
  {
    company: "Comviva",
    title: "Payment Reliability",
    focus: "Prioritizing reliability and trust before adding new intelligent capabilities.",
    outcome: "Own the parts of the product experience where failure directly affects customer confidence.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    company: "Product OS",
    title: "AI Prioritization",
    focus: "Evaluating whether AI deserves investment before deciding the ownership model.",
    outcome: "Build vs buy should follow customer value, business value, and execution readiness.",
    href: "/decision-systems/ai-prioritization"
  }
];

const ownershipQuadrants = [
  {
    quadrant: "High Differentiation / High Readiness",
    action: "Build or Platform",
    description: "Own the capability when it shapes customer value and the organization can operate it responsibly.",
    risk: "Overbuilding before reuse or compounding value is proven."
  },
  {
    quadrant: "High Differentiation / Low Readiness",
    action: "Extend or Prototype",
    description: "Use external capability to learn while de-risking data, workflow, reliability, or operations.",
    risk: "Locking into a vendor before the strategic layer is understood."
  },
  {
    quadrant: "Low Differentiation / High Readiness",
    action: "Buy or Configure",
    description: "Move quickly when the capability is commodity and ownership does not improve customer value.",
    risk: "Spending internal effort on work that does not differentiate."
  },
  {
    quadrant: "Low Differentiation / Low Readiness",
    action: "Reject or Park",
    description: "Avoid investment when neither differentiation nor readiness justifies the ownership burden.",
    risk: "Continuing because the idea sounds strategic without evidence."
  }
];

const scorecardDimensions = [
  { title: "Customer Workflow Importance" },
  { title: "Business Differentiation" },
  { title: "Proprietary Data Advantage" },
  { title: "Speed Requirement" },
  { title: "Model or Technical Feasibility" },
  { title: "Integration Complexity" },
  { title: "Trust & Compliance Risk" },
  { title: "Vendor Lock-in Risk" },
  { title: "Operating Cost at Scale" },
  { title: "Long-term Platform Value" },
  {
    title: "Learning Value",
    question: "Will owning this capability create strategic learning that compounds over time?"
  }
];

const recommendationBands = [
  { range: "47-55", title: "Build or Platform" },
  { range: "38-46", title: "Extend or Build Selectively" },
  { range: "29-37", title: "Configure or Prototype" },
  { range: "20-28", title: "Buy or Park" },
  { range: "11-19", title: "Reject or Reframe" }
];

const stopCriteria = [
  {
    title: "Capability does not affect customer value",
    description: "If customers do not experience meaningful improvement, ownership is not justified."
  },
  {
    title: "Capability is commodity",
    description: "Buy when mature vendors solve the problem well and ownership does not create advantage."
  },
  {
    title: "Proprietary data does not improve the outcome",
    description: "Without data advantage, internal ownership may add cost without strategic learning."
  },
  {
    title: "Internal build cost exceeds differentiation value",
    description: "The build path should stop when cost and maintenance outweigh the product advantage."
  },
  {
    title: "Vendor risk is unacceptable",
    description: "A buy path should stop when trust, compliance, roadmap, or switching risk cannot be managed."
  },
  {
    title: "Team cannot operate the capability",
    description: "Build or platform decisions fail when monitoring, support, governance, and improvement loops are missing."
  }
];

const reviewQuestions = [
  "Why did we choose buy, configure, extend, build, or platform?",
  "What did we believe was differentiating?",
  "What changed about customer value, vendor maturity, data advantage, or cost?",
  "Would we make the same ownership decision today?",
  "What should we continue owning?",
  "What should we stop owning?",
  "What should we buy, replace, or platformize next?"
];

const takeaways = [
  "Build vs buy is a spectrum, not a binary.",
  "Own what differentiates the product or compounds over time.",
  "Buy commodity capability when speed and reliability matter more than ownership.",
  "Configure or extend when workflow fit matters but full ownership is premature.",
  "Platformize only when a capability becomes reusable, strategic, and compounding."
];

const relatedJournals = [
  {
    title: "Platform Modernization",
    description: "A decision journal about cost, release velocity, and long-term platform control.",
    href: "/stories/platform-modernization-logix"
  },
  {
    title: "Payments Reliability",
    description: "A decision journal about owning reliability where customer trust is directly affected.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "JoVE Workflow",
    description: "A decision journal about workflow differentiation and adoption.",
    href: "/stories/product-discovery-jove"
  },
  {
    title: "AI Prioritization",
    description: "A Decision System for deciding whether AI deserves investment before ownership is chosen.",
    href: "/decision-systems/ai-prioritization"
  }
];

const breadcrumbs = [
  { name: "Decision Operating System", item: "https://saurabh-product-os.vercel.app/product-operating-system" },
  { name: "Decision Systems", item: "https://saurabh-product-os.vercel.app/decision-systems" },
  { name: "Build vs Buy AI", item: pageUrl }
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

export default function BuildVsBuyAiDecisionSystemPage() {
  return (
    <>
      <ReadingProgress label="Build vs Buy AI reading progress" />
      <BuildBuyViewed name="Build vs Buy AI" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Decision System 04</p>
              <h1 id="decision-system-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">Own what differentiates you. Buy what doesn&apos;t.</p>
              <div className="mt-6 rounded-md border border-line bg-paper p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Core question</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-ink">
                  Should we build this AI capability ourselves, buy an existing solution, configure a platform, extend an existing
                  product, or create a long-term strategic capability?
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
              <nav aria-label="Build vs Buy AI sections" className="mt-4 grid gap-1 text-sm text-muted">
                {tocItems.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <DocSection id="executive-summary" eyebrow="Executive Summary" title="Build vs buy is an ownership decision">
              <div className="rounded-md border border-line bg-panel p-5">
                <p className="text-lg leading-8 text-muted">
                  Build vs buy is rarely binary. AI capabilities often move across stages: buying for speed, configuring for workflow
                  fit, extending for product differentiation, building for strategic control, and platformizing when capability becomes
                  reusable infrastructure. The right decision depends on customer need, differentiation, data advantage, speed, risk,
                  and long-term ownership value.
                </p>
              </div>
            </DocSection>

            <DocSection id="decision-framework" eyebrow="Build vs Buy Decision Framework" title="From customer need to ownership choice" background="panel">
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
                {ownershipOutcomes.map((outcome) => (
                  <article key={outcome.title} className="rounded-md border border-line bg-paper p-5">
                    <Target className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{outcome.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{outcome.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-horizon" eyebrow="Decision Horizon" title="Ownership can evolve over time">
              <FlowList items={decisionHorizon} />
              <p className="mt-6 leading-8 text-muted">
                Buying today does not prevent building later. Building too early can create unnecessary cost before differentiation is
                proven.
              </p>
            </DocSection>

            <DocSection id="ownership-evolution" eyebrow="Ownership Evolution" title="Evidence should change the ownership model" background="panel">
              <FlowList items={ownershipEvolution} />
              <p className="mt-6 leading-8 text-muted">
                A team may buy to learn quickly, configure to fit the workflow, extend when adoption proves value, build once
                differentiation becomes clear, and platformize only when the capability compounds across products, teams, or customer
                segments.
              </p>
            </DocSection>

            <DocSection id="ownership-triggers" eyebrow="Ownership Triggers" title="Signals that the ownership model needs to evolve">
              <div className="grid gap-4">
                {ownershipTriggers.map((trigger) => (
                  <article key={trigger.trigger} className="rounded-md border border-line bg-panel p-5">
                    <h3 className="text-xl font-semibold leading-tight text-ink">{trigger.trigger}</h3>
                    <dl className="mt-5 grid gap-4">
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">What changed</dt>
                        <dd className="mt-2 leading-7 text-muted">{trigger.changed}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Why ownership should evolve</dt>
                        <dd className="mt-2 leading-7 text-muted">{trigger.evolve}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Recommended next ownership stage</dt>
                        <dd className="mt-2 font-semibold leading-7 text-ink">{trigger.next}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="advantage-pyramid" eyebrow="Competitive Advantage Pyramid" title="The higher the layer, the stronger the case to own" background="panel">
              <div className="grid gap-3">
                {advantagePyramid.map((level, index) => (
                  <article key={level.title} className="rounded-md border border-line bg-paper p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line text-sm font-semibold text-accent">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold leading-tight text-ink">{level.title}</h3>
                        <p className="mt-2 leading-7 text-muted">{level.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-questions" eyebrow="Decision Questions" title="Prompts for AI ownership decisions">
              <div className="grid gap-4">
                {decisionQuestions.map((group) => (
                  <BuildBuyQuestionGroup key={group.title} title={group.title} questions={group.questions} />
                ))}
              </div>
            </DocSection>

            <DocSection id="build-isnt" eyebrow="Build Isn't..." title="Boundaries that prevent overbuilding" background="panel">
              <SimpleList items={buildIsnt} icon={<XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="buy-isnt" eyebrow="Buy Isn't..." title="Boundaries that prevent false speed">
              <SimpleList items={buyIsnt} icon={<XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="common-mistakes" eyebrow="Common Mistakes" title="Where ownership decisions lose discipline" background="panel">
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

            <DocSection id="ownership-biases" eyebrow="Ownership Biases" title="Organizational forces that distort the decision">
              <div className="grid gap-4 sm:grid-cols-2">
                {ownershipBiases.map((bias) => (
                  <article key={bias.title} className="rounded-md border border-line bg-panel p-5">
                    <Gauge className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{bias.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{bias.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="failure-modes" eyebrow="Failure Modes" title="How build vs buy decisions fail after launch" background="panel">
              <SimpleList items={failureModes} icon={<ShieldAlert className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="recovery-patterns" eyebrow="Recovery Patterns" title="How to recover ownership quality">
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

            <DocSection id="framework-in-practice" eyebrow="Framework in Practice" title="Four implementation examples" background="panel">
              <div className="grid gap-4">
                {examples.map((example) => (
                  <article key={example.company} className="rounded-md border border-line bg-paper p-5">
                    <GitBranch className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">{example.company}</p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-ink">{example.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{example.focus}</p>
                    <p className="mt-3 leading-7 text-ink">{example.outcome}</p>
                    <BuildBuyTrackedLink
                      href={example.href}
                      eventName="build_buy_example_clicked"
                      label={`${example.company}: ${example.title}`}
                      className="mt-5"
                    >
                      Open Decision Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </BuildBuyTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="ownership-matrix" eyebrow="Ownership Matrix" title="Differentiation and readiness determine the path">
              <OwnershipMatrix quadrants={ownershipQuadrants} />
            </DocSection>

            <DocSection id="decision-scorecard" eyebrow="Decision Scorecard" title="Score the ownership decision before committing" background="panel">
              <OwnershipScorecard dimensions={scorecardDimensions} />
              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                {recommendationBands.map((band) => (
                  <div key={band.range} className="rounded-md border border-line bg-paper p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{band.range}</p>
                    <p className="mt-2 font-semibold text-ink">{band.title}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="stop-criteria" eyebrow="Stop Criteria" title="When the ownership path should change">
              <div className="grid gap-4 sm:grid-cols-2">
                {stopCriteria.map((criterion) => (
                  <article key={criterion.title} className="rounded-md border border-line bg-panel p-5">
                    <h3 className="text-xl font-semibold leading-tight text-ink">{criterion.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{criterion.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-review" eyebrow="Decision Review" title="Revisit ownership as the product evolves" background="panel">
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
                  Own what differentiates you.
                  <br />
                  Buy what doesn&apos;t.
                </p>
              </blockquote>
            </DocSection>

            <DocSection id="how-i-know-this" eyebrow="How I Know This" title="Where the system comes from">
              <div className="rounded-md border border-line bg-panel p-5">
                <BarChart3 className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 leading-8 text-muted">
                  This system is grounded in product contexts across platform modernization, enterprise SaaS, payments, growth
                  products, and AI platform strategy. The strongest decisions were not ideological build or buy choices. They were
                  ownership decisions based on differentiation, readiness, data advantage, and the cost of being wrong.
                </p>
              </div>
            </DocSection>

            <DocSection id="related-journals" eyebrow="Related Decision Journals" title="Where this framework shows up" background="panel">
              <div className="grid gap-4">
                {relatedJournals.map((journal) => (
                  <article key={journal.title} className="rounded-md border border-line bg-paper p-5">
                    <Layers className="h-6 w-6 text-accent" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{journal.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{journal.description}</p>
                    <BuildBuyTrackedLink href={journal.href} eventName="build_buy_example_clicked" label={journal.title} className="mt-5">
                      Read Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </BuildBuyTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <section id="continue-learning" className="scroll-mt-24 border-b border-line py-12 sm:py-14" aria-labelledby="continue-learning-title">
              <div className="rounded-md border border-line bg-panel p-6">
                <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue Learning</p>
                <h2 id="continue-learning-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  RAG vs Agent
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  The next Decision System will clarify when a retrieval workflow, agentic workflow, or simpler product pattern is the
                  right AI architecture choice.
                </p>
                <BuildBuyTrackedLink
                  href="/decision-systems/rag-vs-agent"
                  eventName="build_buy_next_module_clicked"
                  label="RAG vs Agent"
                  variant="primary"
                  className="mt-6"
                >
                  Next Decision System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  RAG vs Agent
                </BuildBuyTrackedLink>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

function FlowList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={`${item}-${index}`}>
          <div className="rounded-md border border-line bg-paper p-5">
            <p className="text-lg font-semibold leading-7 text-ink">{item}</p>
          </div>
          {index < items.length - 1 ? (
            <div className="flex justify-center py-2 text-accent" aria-hidden="true">
              <ArrowDown className="h-5 w-5" />
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
