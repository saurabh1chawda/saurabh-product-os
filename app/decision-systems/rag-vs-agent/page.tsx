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

import { ReadingProgress } from "@/components/decision-system-interactions";
import {
  ArchitectureScorecard,
  ArchitectureSelectionMatrix,
  RagAgentQuestionGroup,
  RagAgentTrackedLink,
  RagAgentViewed
} from "@/components/rag-agent-interactions";
import { SiteHeader } from "@/components/site-header";

const pageTitle = "RAG vs Agent";
const metadataTitle = "RAG vs Agent Decision System | Product Operating System";
const pageDescription =
  "A product decision system for choosing between RAG, agents, hybrid AI systems, and traditional software based on customer workflow, knowledge needs, risk, complexity, and operational readiness.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-systems/rag-vs-agent";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/decision-systems/rag-vs-agent"
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
  { href: "#capability-ladder", label: "AI Capability Ladder" },
  { href: "#decision-tree", label: "Architecture Decision Tree" },
  { href: "#complexity-value", label: "Complexity vs Value Curve" },
  { href: "#decision-trade-offs", label: "Decision Trade-offs" },
  { href: "#rag-isnt", label: "RAG Isn't..." },
  { href: "#agent-isnt", label: "Agent Isn't..." },
  { href: "#decision-questions", label: "Decision Questions" },
  { href: "#architecture-biases", label: "Architecture Biases" },
  { href: "#common-mistakes", label: "Common Mistakes" },
  { href: "#failure-modes", label: "Failure Modes" },
  { href: "#recovery-patterns", label: "Recovery Patterns" },
  { href: "#framework-in-practice", label: "Framework in Practice" },
  { href: "#architecture-selection-matrix", label: "Architecture Selection Matrix" },
  { href: "#decision-scorecard", label: "Decision Scorecard" },
  { href: "#stop-criteria", label: "Stop Criteria" },
  { href: "#decision-review", label: "Decision Review" },
  { href: "#key-takeaways", label: "Key Takeaways" },
  { href: "#operating-principle", label: "Operating Principle" },
  { href: "#how-i-know-this", label: "How I Know This" },
  { href: "#related-systems", label: "Related Decision Systems" },
  { href: "#continue-learning", label: "Continue Learning" }
];

const capabilityLadder = [
  {
    title: "Search",
    description: "Customer needs to find known information."
  },
  {
    title: "Retrieve",
    description: "Customer needs relevant context from trusted sources."
  },
  {
    title: "Generate",
    description: "Customer needs synthesized language or structured output."
  },
  {
    title: "Reason",
    description: "Customer needs multi-step judgment, comparison, or interpretation."
  },
  {
    title: "Act",
    description: "Customer needs the system to complete tasks with guardrails."
  },
  {
    title: "Autonomous Workflow",
    description: "Customer needs repeated task execution across systems with monitoring and escalation."
  }
];

const decisionTree = [
  {
    question: "Need external knowledge?",
    answer: "RAG",
    description: "Use retrieval when trusted knowledge, documents, or private context must ground the answer."
  },
  {
    question: "Need multi-step reasoning?",
    answer: "Agent",
    description: "Use agentic patterns when the system must reason across steps, tools, or conditional paths."
  },
  {
    question: "Need deterministic workflow?",
    answer: "Traditional Software",
    description: "Use deterministic software when rules, forms, routing, or workflow state can solve the task reliably."
  },
  {
    question: "Need both?",
    answer: "Hybrid",
    description: "Combine retrieval, reasoning, deterministic steps, and approvals only when customer value justifies the complexity."
  }
];

const complexityCurve = [
  {
    title: "Traditional Software",
    description: "Lowest complexity. Best when rules and deterministic workflows solve the problem reliably."
  },
  {
    title: "RAG",
    description: "Adds knowledge grounding. Useful when trusted context changes the customer outcome."
  },
  {
    title: "Agent",
    description: "Adds reasoning and tool use. Useful only when multi-step decisions are necessary."
  },
  {
    title: "Hybrid",
    description: "Highest complexity. Justified when retrieval, reasoning, action, guardrails, and workflow logic all create value."
  }
];

const tradeOffs = [
  {
    title: "Simplicity vs capability",
    description: "More capability is only useful when the customer problem needs it."
  },
  {
    title: "Accuracy vs autonomy",
    description: "Autonomy increases product risk when the system cannot be evaluated or recovered."
  },
  {
    title: "Determinism vs flexibility",
    description: "Flexible reasoning should not replace reliable deterministic workflows without a clear customer benefit."
  },
  {
    title: "Latency vs reasoning depth",
    description: "A deeper answer can still fail if it makes the workflow too slow."
  },
  {
    title: "User control vs automation",
    description: "Higher automation requires clearer approval, override, and escalation paths."
  },
  {
    title: "Cost vs reliability",
    description: "Complex architectures must justify their operational and inference costs with measurable value."
  }
];

const ragIsnt = [
  "RAG isn't a reasoning system by default.",
  "RAG isn't useful if the source knowledge is weak.",
  "RAG isn't a replacement for clear information architecture.",
  "RAG isn't accurate just because it cites sources.",
  "RAG isn't the answer when the customer needs action, not information."
];

const agentIsnt = [
  "An agent isn't automatically more advanced product strategy.",
  "An agent isn't safe without boundaries, monitoring, and recovery.",
  "An agent isn't needed for deterministic workflows.",
  "An agent isn't successful because it can use tools.",
  "An agent isn't ready if customers cannot understand or override it."
];

const decisionQuestions = [
  {
    title: "Customer",
    questions: [
      "What customer problem needs to become easier?",
      "Does the user need an answer, a decision, or an action?",
      "What failure would break trust?",
      "Would the customer value a simpler workflow more than an intelligent one?"
    ]
  },
  {
    title: "Workflow",
    questions: [
      "Is the workflow single-step or multi-step?",
      "Does the system need to coordinate across tools?",
      "Can the workflow be solved with deterministic software?",
      "Which steps require judgment and which steps require reliability?"
    ]
  },
  {
    title: "Knowledge",
    questions: [
      "Does the system need external or private knowledge?",
      "Are the sources accurate, current, and governed?",
      "Can retrieved context be evaluated?",
      "What source failure would make the answer untrustworthy?"
    ]
  },
  {
    title: "Reasoning",
    questions: [
      "Does the task require multi-step judgment?",
      "Can reasoning be constrained or checked?",
      "What reasoning failure would be unacceptable?",
      "Would a structured workflow outperform open-ended reasoning?"
    ]
  },
  {
    title: "Action",
    questions: [
      "Does the system need to perform tasks?",
      "What actions require approval?",
      "What should the system never do autonomously?",
      "What rollback or recovery path is required?"
    ]
  },
  {
    title: "Risk",
    questions: [
      "What is the cost of a wrong answer or wrong action?",
      "Is human review required?",
      "What guardrails are needed before launch?",
      "What trust signal would make the architecture acceptable?"
    ]
  },
  {
    title: "Operations",
    questions: [
      "Who monitors failures, drift, cost, and tool usage?",
      "How are escalations handled?",
      "Can the team debug the system in production?",
      "What logs, evaluation sets, and fallback states are required?"
    ]
  },
  {
    title: "Measurement",
    questions: [
      "What metric proves the architecture works?",
      "Are we measuring customer outcome or model behavior?",
      "What would make us simplify the architecture?",
      "How will the team know complexity is creating value?"
    ]
  }
];

const architectureBiases = [
  {
    title: "LLM bias",
    description: "Assuming every problem needs generation."
  },
  {
    title: "Agent hype bias",
    description: "Assuming agents are better because they sound more autonomous."
  },
  {
    title: "Framework bias",
    description: "Choosing architecture based on developer tooling instead of customer need."
  },
  {
    title: "Vendor bias",
    description: "Adopting a vendor's reference architecture as product strategy."
  },
  {
    title: "Research-paper bias",
    description: "Overweighting technical novelty before workflow reliability."
  },
  {
    title: "Over-engineering bias",
    description: "Adding intelligence layers before customer value requires them."
  }
];

const mistakes = [
  {
    title: "Starting with RAG or agents",
    description: "Architecture selection should follow the customer problem, not precede it."
  },
  {
    title: "Using agents for deterministic workflows",
    description: "Rules, state, forms, and workflow logic are often more reliable than open-ended reasoning."
  },
  {
    title: "Using RAG when source quality is poor",
    description: "Retrieval cannot rescue weak, stale, or ungoverned source knowledge."
  },
  {
    title: "Treating citations as proof",
    description: "Citations improve traceability, but they do not guarantee the answer is correct."
  },
  {
    title: "Allowing action without recovery paths",
    description: "Agents need permissions, approvals, rollback, and escalation before they should act."
  },
  {
    title: "Measuring model behavior only",
    description: "The product succeeds when customer outcomes improve, not when architecture looks sophisticated."
  }
];

const failureModes = [
  "Retrieval returns plausible but irrelevant context.",
  "Generated answers sound confident but are wrong.",
  "Agent takes the wrong action.",
  "Tool calls fail silently.",
  "Latency makes the workflow unusable.",
  "Cost grows faster than customer value.",
  "Users cannot understand or override the system.",
  "Operations cannot debug failures.",
  "The architecture solves the demo but not the workflow."
];

const recoveryPatterns = [
  {
    symptom: "RAG answers cite sources but still feel wrong.",
    likelyCause: "Retrieval quality, chunking, or source governance is weak.",
    recoveryAction: "Improve source quality, retrieval evaluation, and answer constraints before adding reasoning layers.",
    expectedOutcome: "Higher answer trust without unnecessary architecture complexity."
  },
  {
    symptom: "Agent behavior is inconsistent.",
    likelyCause: "The task needs clearer workflow constraints or deterministic steps.",
    recoveryAction: "Convert repeated steps into deterministic software and leave AI for judgment-heavy parts.",
    expectedOutcome: "More reliable workflow execution."
  },
  {
    symptom: "The system works in demo but fails in production.",
    likelyCause: "Edge cases, permissions, latency, and operational monitoring were underdesigned.",
    recoveryAction: "Add guardrails, observability, fallback states, and human approval paths.",
    expectedOutcome: "Safer rollout and clearer operational ownership."
  },
  {
    symptom: "Cost rises without measurable customer impact.",
    likelyCause: "Architecture complexity increased faster than customer value.",
    recoveryAction: "Simplify the architecture and revalidate the customer outcome.",
    expectedOutcome: "Better economics and sharper product focus."
  }
];

const examples = [
  {
    company: "JoVE",
    title: "Workflow Adoption",
    focus: "Workflow adoption required understanding how users worked before adding richer intelligence.",
    outcome: "Start with workflow fit before adding generative or agentic layers.",
    href: "/stories/product-discovery-jove"
  },
  {
    company: "Logix",
    title: "Platform Modernization",
    focus: "Platform modernization improved latency, release velocity, and reliability.",
    outcome: "Architecture should simplify and strengthen the system before adding intelligence.",
    href: "/stories/platform-modernization-logix"
  },
  {
    company: "Comviva",
    title: "Payment Reliability",
    focus: "Payment reliability mattered more than adding new intelligent features.",
    outcome: "In high-trust systems, deterministic reliability may matter more than autonomy.",
    href: "/stories/payments-reliability-comviva"
  }
];

const matrixQuadrants = [
  {
    quadrant: "Low Workflow Complexity / Low Knowledge Variability",
    action: "Traditional Software",
    description: "Use deterministic logic when the workflow is stable and knowledge does not vary much.",
    risk: "Adding AI can make a reliable workflow less predictable."
  },
  {
    quadrant: "Low Workflow Complexity / High Knowledge Variability",
    action: "RAG",
    description: "Use retrieval when trusted external or private knowledge needs to ground a simple workflow.",
    risk: "Poor source governance can make confident answers untrustworthy."
  },
  {
    quadrant: "High Workflow Complexity / Low Knowledge Variability",
    action: "Workflow Automation",
    description: "Use structured workflow logic when steps are complex but knowledge is stable.",
    risk: "An agent may add variability where deterministic orchestration would work better."
  },
  {
    quadrant: "High Workflow Complexity / High Knowledge Variability",
    action: "Agent or Hybrid",
    description: "Use agentic or hybrid patterns when the task needs retrieval, reasoning, action, and guardrails.",
    risk: "Operational complexity can outrun customer value."
  }
];

const scorecardDimensions = [
  "Customer Problem Clarity",
  "Workflow Complexity",
  "Knowledge Variability",
  "Source Quality",
  "Reasoning Need",
  "Action Risk",
  "User Trust Requirement",
  "Human Override Need",
  "Operational Readiness",
  "Latency Sensitivity",
  "Cost Sensitivity",
  "Measurement Clarity"
];

const recommendationBands = [
  { range: "50-60", title: "Agent or Hybrid with strong guardrails" },
  { range: "40-49", title: "RAG plus constrained workflow logic" },
  { range: "30-39", title: "RAG or deterministic automation" },
  { range: "20-29", title: "Traditional software or simpler retrieval" },
  { range: "12-19", title: "Reframe problem before choosing architecture" }
];

const stopCriteria = [
  {
    title: "Customer problem is unclear",
    description: "Architecture choice is premature if the customer problem and workflow are not understood."
  },
  {
    title: "Traditional software solves the workflow",
    description: "Do not add AI where deterministic logic solves the job reliably."
  },
  {
    title: "Source knowledge is weak",
    description: "RAG should stop when the knowledge base is stale, ungoverned, or hard to evaluate."
  },
  {
    title: "System cannot be monitored or debugged",
    description: "Agents and hybrid systems need observability, recovery, and operational ownership."
  },
  {
    title: "Wrong actions create unacceptable risk",
    description: "Autonomy should stop when customers cannot approve, override, or recover from failure."
  },
  {
    title: "Latency or cost makes the workflow worse",
    description: "Architecture complexity is not justified if it slows the customer down or weakens economics."
  }
];

const reviewQuestions = [
  "Why did we choose this architecture?",
  "What customer problem did it solve?",
  "Did complexity increase customer value proportionally?",
  "What failed in production?",
  "What should become deterministic?",
  "What should remain AI-assisted?",
  "Would we simplify this architecture today?"
];

const takeaways = [
  "Architecture choice is a product decision.",
  "RAG helps when trusted knowledge matters.",
  "Agents help only when multi-step reasoning or action is required.",
  "Traditional software is still the right answer for deterministic workflows.",
  "Complexity should increase only when customer value increases with it."
];

const relatedSystems = [
  {
    title: "Customer Discovery",
    description: "Clarify the customer problem before choosing the architecture.",
    href: "/decision-systems/customer-discovery"
  },
  {
    title: "Validation & Experimentation",
    description: "Validate the riskiest assumption before increasing implementation complexity.",
    href: "/decision-systems/validation-experimentation"
  },
  {
    title: "AI Prioritization",
    description: "Prioritize AI opportunities by customer value, business value, and readiness.",
    href: "/decision-systems/ai-prioritization"
  },
  {
    title: "Build vs Buy AI",
    description: "Decide what to buy, configure, extend, build, or platformize.",
    href: "/decision-systems/build-vs-buy-ai"
  }
];

const breadcrumbs = [
  { name: "Decision Operating System", item: "https://saurabh-product-os.vercel.app/product-operating-system" },
  { name: "Decision Systems", item: "https://saurabh-product-os.vercel.app/decision-systems" },
  { name: "RAG vs Agent", item: pageUrl }
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

export default function RagVsAgentDecisionSystemPage() {
  return (
    <>
      <ReadingProgress label="RAG vs Agent reading progress" />
      <RagAgentViewed name="RAG vs Agent" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Decision System 05</p>
              <h1 id="decision-system-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Choose the simplest architecture that reliably solves the customer problem.
              </p>
              <div className="mt-6 rounded-md border border-line bg-paper p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Core question</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-ink">
                  Which AI architecture best fits the customer problem, workflow, risk profile, and operational complexity?
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
              <nav aria-label="RAG vs Agent sections" className="mt-4 grid gap-1 text-sm text-muted">
                {tocItems.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <DocSection id="executive-summary" eyebrow="Executive Summary" title="Architecture choice is product judgment">
              <div className="rounded-md border border-line bg-panel p-5">
                <p className="text-lg leading-8 text-muted">
                  The first question is not whether to use RAG or agents. The first question is what the customer needs the system to do
                  reliably. Traditional software, search, retrieval, generation, reasoning, and action all have a place. The right
                  architecture is the simplest one that improves the workflow, protects trust, and can be operated safely.
                </p>
              </div>
            </DocSection>

            <DocSection id="capability-ladder" eyebrow="AI Capability Ladder" title="Architectures should climb only when value requires it" background="panel">
              <FlowList items={capabilityLadder} />
            </DocSection>

            <DocSection id="decision-tree" eyebrow="Architecture Decision Tree" title="Start from the customer problem">
              <div className="rounded-md border border-line bg-panel p-5">
                <p className="text-lg font-semibold leading-7 text-ink">Customer Problem</p>
              </div>
              <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                <ArrowDown className="h-5 w-5" />
              </div>
              <div className="grid gap-4">
                {decisionTree.map((branch) => (
                  <article key={branch.question} className="rounded-md border border-line bg-panel p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{branch.question}</p>
                    <h3 className="mt-3 text-xl font-semibold leading-tight text-ink">{branch.answer}</h3>
                    <p className="mt-3 leading-7 text-muted">{branch.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="complexity-value" eyebrow="Complexity vs Value Curve" title="Complexity must earn its place" background="panel">
              <div className="grid gap-3">
                {complexityCurve.map((stage, index) => (
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
                    {index < complexityCurve.length - 1 ? (
                      <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                        <ArrowDown className="h-5 w-5" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-6 leading-8 text-muted">
                Increasing architectural complexity only makes sense when customer value increases proportionally.
              </p>
            </DocSection>

            <DocSection id="decision-trade-offs" eyebrow="Decision Trade-offs" title="The choices architecture makes visible">
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

            <DocSection id="rag-isnt" eyebrow="RAG Isn't..." title="Boundaries that prevent weak retrieval design" background="panel">
              <SimpleList items={ragIsnt} icon={<XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="agent-isnt" eyebrow="Agent Isn't..." title="Boundaries that prevent premature autonomy">
              <SimpleList items={agentIsnt} icon={<XCircle className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="decision-questions" eyebrow="Decision Questions" title="Prompts for architecture selection" background="panel">
              <div className="grid gap-4">
                {decisionQuestions.map((group) => (
                  <RagAgentQuestionGroup key={group.title} title={group.title} questions={group.questions} />
                ))}
              </div>
            </DocSection>

            <DocSection id="architecture-biases" eyebrow="Architecture Biases" title="Biases that make complexity look responsible">
              <div className="grid gap-4 sm:grid-cols-2">
                {architectureBiases.map((bias) => (
                  <article key={bias.title} className="rounded-md border border-line bg-panel p-5">
                    <Gauge className="h-5 w-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{bias.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{bias.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="common-mistakes" eyebrow="Common Mistakes" title="Where architecture decisions lose product discipline" background="panel">
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

            <DocSection id="failure-modes" eyebrow="Failure Modes" title="How RAG and agent systems fail after launch">
              <SimpleList items={failureModes} icon={<ShieldAlert className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="recovery-patterns" eyebrow="Recovery Patterns" title="How to recover architecture quality" background="panel">
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
                    <RagAgentTrackedLink
                      href={example.href}
                      eventName="rag_agent_example_clicked"
                      label={`${example.company}: ${example.title}`}
                      className="mt-5"
                    >
                      Open Decision Journal
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </RagAgentTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="architecture-selection-matrix" eyebrow="Architecture Selection Matrix" title="Workflow and knowledge determine the pattern" background="panel">
              <ArchitectureSelectionMatrix quadrants={matrixQuadrants} />
            </DocSection>

            <DocSection id="decision-scorecard" eyebrow="Decision Scorecard" title="Score the architecture decision before committing">
              <ArchitectureScorecard dimensions={scorecardDimensions} />
              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                {recommendationBands.map((band) => (
                  <div key={band.range} className="rounded-md border border-line bg-panel p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{band.range}</p>
                    <p className="mt-2 font-semibold text-ink">{band.title}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="stop-criteria" eyebrow="Stop Criteria" title="When architecture complexity should stop" background="panel">
              <div className="grid gap-4 sm:grid-cols-2">
                {stopCriteria.map((criterion) => (
                  <article key={criterion.title} className="rounded-md border border-line bg-paper p-5">
                    <h3 className="text-xl font-semibold leading-tight text-ink">{criterion.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{criterion.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="decision-review" eyebrow="Decision Review" title="Revisit the architecture after evidence changes">
              <div className="rounded-md border border-line bg-panel p-5">
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

            <DocSection id="key-takeaways" eyebrow="Key Takeaways" title="What this system should reinforce" background="panel">
              <SimpleList items={takeaways} icon={<CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />} />
            </DocSection>

            <DocSection id="operating-principle" eyebrow="Operating Principle" title="The principle behind the system">
              <blockquote className="rounded-md border border-line bg-panel p-6">
                <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-3xl font-semibold leading-tight text-ink">
                  Architectures should become more intelligent only when customer value requires it.
                </p>
              </blockquote>
            </DocSection>

            <DocSection id="how-i-know-this" eyebrow="How I Know This" title="Where the system comes from" background="panel">
              <div className="rounded-md border border-line bg-paper p-5">
                <BarChart3 className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 leading-8 text-muted">
                  This system is grounded in product contexts across customer discovery, platform modernization, enterprise SaaS,
                  payments reliability, and AI product strategy. The best product decision was not always the most technically advanced
                  architecture. Strong architecture judgment means choosing the simplest reliable system that changes customer behavior,
                  protects trust, and can be operated safely.
                </p>
              </div>
            </DocSection>

            <DocSection id="related-systems" eyebrow="Related Decision Systems" title="Where this framework connects">
              <div className="grid gap-4">
                {relatedSystems.map((system) => (
                  <article key={system.title} className="rounded-md border border-line bg-panel p-5">
                    <Layers className="h-6 w-6 text-accent" aria-hidden="true" />
                    <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{system.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{system.description}</p>
                    <RagAgentTrackedLink href={system.href} eventName="rag_agent_example_clicked" label={system.title} className="mt-5">
                      Open Decision System
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </RagAgentTrackedLink>
                  </article>
                ))}
              </div>
            </DocSection>

            <section id="continue-learning" className="scroll-mt-24 border-b border-line py-12 sm:py-14" aria-labelledby="continue-learning-title">
              <div className="rounded-md border border-line bg-panel p-6">
                <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue Learning</p>
                <h2 id="continue-learning-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  AI Success Metrics
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  The next Decision System will clarify how to measure AI product success beyond model performance.
                </p>
                <RagAgentTrackedLink
                  href="/decision-systems/ai-success-metrics"
                  eventName="rag_agent_next_module_clicked"
                  label="AI Success Metrics"
                  variant="primary"
                  className="mt-6"
                >
                  Next Decision System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  AI Success Metrics
                </RagAgentTrackedLink>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

function FlowList({ items }: { items: Array<{ description: string; title: string }> }) {
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
