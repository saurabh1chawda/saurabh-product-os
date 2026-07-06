export type OperatingPrincipleResource = {
  href: string;
  title: string;
};

export type OperatingPrinciple = {
  evidence: OperatingPrincipleResource[];
  explanation: string;
  principleType: string;
  relatedResources: OperatingPrincipleResource[];
  summary: string;
  title: string;
  whyItMatters: string;
};

export type CompassDirection = {
  direction: "Customer" | "Growth" | "Platform" | "Trust";
  href: string;
  label: string;
};

export type PrincipleMatrixRow = {
  example: string;
  primaryEvidence: OperatingPrincipleResource;
  principle: string;
  supportingEvidence: OperatingPrincipleResource;
};

export const operatingModelSteps = [
  "Observe",
  "Identify Highest-Leverage Constraint",
  "Generate Strategic Options",
  "Evaluate Trade-offs",
  "Make Decision",
  "Measure Outcomes",
  "Extract Principle"
];

export const leadershipCompass: CompassDirection[] = [
  { direction: "Customer", label: "JoVE", href: "/case-studies/jove" },
  { direction: "Platform", label: "Logix", href: "/case-studies/logix" },
  { direction: "Trust", label: "Mahindra Comviva", href: "/stories/payments-reliability-comviva" },
  { direction: "Growth", label: "Simplilearn", href: "/case-studies/simplilearn" }
];

export const operatingPrinciples: OperatingPrinciple[] = [
  {
    title: "Solve the Highest-Leverage Constraint First",
    summary:
      "The loudest problem is rarely the most important one. The best product decisions remove the constraint that unlocks the greatest long-term leverage.",
    explanation:
      "Product leaders create leverage by identifying the constraint that limits customer value, commercial progress, platform readiness, or trust. Once that constraint is removed, multiple downstream outcomes improve together.",
    whyItMatters:
      "Teams often optimize what is most visible. This principle keeps roadmap decisions focused on the constraint that compounds.",
    principleType: "Decision Quality",
    evidence: [
      { title: "JoVE", href: "/case-studies/jove" },
      { title: "Logix", href: "/case-studies/logix" },
      { title: "Comviva", href: "/stories/payments-reliability-comviva" },
      { title: "Simplilearn", href: "/case-studies/simplilearn" }
    ],
    relatedResources: [
      { title: "Decision Operating System", href: "/decision-operating-system" },
      { title: "AI Product Playbook", href: "/ai-product-playbook" }
    ]
  },
  {
    title: "Adoption Before Expansion",
    summary: "Growth only compounds when customers successfully adopt the product already built.",
    explanation:
      "Expansion is useful only when the product is already working inside real customer behavior. Otherwise, teams risk adding surface area before solving the adoption problem.",
    whyItMatters:
      "Adoption quality shows whether the product has become useful enough to earn more investment.",
    principleType: "Customer",
    evidence: [{ title: "JoVE", href: "/case-studies/jove" }],
    relatedResources: [
      { title: "AI Product Playbook", href: "/ai-product-playbook" },
      { title: "Decision Operating System", href: "/decision-operating-system" }
    ]
  },
  {
    title: "Platform Before Intelligence",
    summary: "AI scales only when the underlying platform is capable of supporting reliable execution.",
    explanation:
      "Intelligence does not compensate for weak foundations. Platform maturity, release velocity, observability, and customer experience determine whether AI can become useful at scale.",
    whyItMatters:
      "AI features without platform readiness can create demos faster than they create durable customer value.",
    principleType: "Platform",
    evidence: [{ title: "Logix", href: "/case-studies/logix" }],
    relatedResources: [
      { title: "AI Product Playbook", href: "/ai-product-playbook" },
      { title: "RAG vs Agent Decision System", href: "/decision-systems/rag-vs-agent" }
    ]
  },
  {
    title: "Trust Before Innovation",
    summary: "Customers embrace innovation only after they trust the platform delivering it.",
    explanation:
      "Innovation creates value only when customers believe the product will work reliably in moments that matter. Trust is not a soft signal; it is a product requirement.",
    whyItMatters:
      "In payments, platforms, and AI products, trust determines whether customers adopt new capabilities or avoid risk.",
    principleType: "Trust",
    evidence: [{ title: "Mahindra Comviva", href: "/stories/payments-reliability-comviva" }],
    relatedResources: [
      { title: "AI Product Playbook", href: "/ai-product-playbook" },
      { title: "AI Success Metrics", href: "/decision-systems/ai-success-metrics" }
    ]
  },
  {
    title: "Optimization Before Scale",
    summary: "Scaling an inefficient system simply amplifies inefficiency.",
    explanation:
      "Growth becomes durable when the conversion system is structurally efficient. Before scaling demand, the product should convert attention into customer value predictably.",
    whyItMatters:
      "Traffic, campaigns, and roadmap expansion are expensive if the underlying journey leaks value.",
    principleType: "Growth",
    evidence: [{ title: "Simplilearn", href: "/case-studies/simplilearn" }],
    relatedResources: [
      { title: "Validation & Experimentation", href: "/decision-systems/validation-experimentation" },
      { title: "AI Product Playbook", href: "/ai-product-playbook" }
    ]
  },
  {
    title: "Customer Confidence Compounds Faster Than Features",
    summary: "Trust creates durable adoption. Feature velocity without confidence rarely creates sustainable growth.",
    explanation:
      "Customers return to products that reduce uncertainty. Teams earn that confidence through reliability, clarity, supportable workflows, and consistent outcomes.",
    whyItMatters:
      "Confidence compounds because it lowers adoption friction for every future capability.",
    principleType: "Trust",
    evidence: [
      { title: "Comviva", href: "/stories/payments-reliability-comviva" },
      { title: "Logix", href: "/case-studies/logix" }
    ],
    relatedResources: [
      { title: "Decision Operating System", href: "/decision-operating-system" },
      { title: "Professional Profile", href: "/profile" }
    ]
  },
  {
    title: "Great AI Requires Great Foundations",
    summary: "Responsible AI depends on platform maturity, reliable data, and operational readiness.",
    explanation:
      "AI product quality depends on the product system around the model: data, workflow fit, evaluation, latency, reliability, cost, trust, and human control.",
    whyItMatters:
      "Without strong foundations, AI increases complexity faster than it creates customer value.",
    principleType: "AI",
    evidence: [
      { title: "Logix", href: "/case-studies/logix" },
      { title: "AI Product Playbook", href: "/ai-product-playbook" }
    ],
    relatedResources: [
      { title: "Build vs Buy AI", href: "/decision-systems/build-vs-buy-ai" },
      { title: "AI Prioritization", href: "/decision-systems/ai-prioritization" }
    ]
  },
  {
    title: "Measure Outcomes, Not Output",
    summary: "Customers reward business outcomes, not feature counts.",
    explanation:
      "The strongest product reviews connect decisions to customer behavior, commercial outcomes, platform health, trust, and learning velocity rather than shipped artifacts alone.",
    whyItMatters:
      "Outcome measurement helps teams decide whether to build, iterate, pause, or stop.",
    principleType: "Measurement",
    evidence: [
      { title: "All Product Leadership Briefs", href: "/case-studies" },
      { title: "Decision Operating System", href: "/decision-operating-system" },
      { title: "AI Product Playbook", href: "/ai-product-playbook" }
    ],
    relatedResources: [
      { title: "AI Success Metrics", href: "/decision-systems/ai-success-metrics" },
      { title: "Professional Profile", href: "/profile" }
    ]
  }
];

export const principleEvolution = ["2016", "Analytics", "Payments", "Growth", "Enterprise SaaS", "AI Platforms", "Operating Principles"];

export const principleMatrix: PrincipleMatrixRow[] = [
  {
    principle: "Optimization Before Scale",
    primaryEvidence: { title: "Simplilearn", href: "/case-studies/simplilearn" },
    supportingEvidence: { title: "Decision Operating System", href: "/decision-operating-system" },
    example: "Growth improved when the funnel became more efficient before scaling acquisition."
  },
  {
    principle: "Platform Before Intelligence",
    primaryEvidence: { title: "Logix", href: "/case-studies/logix" },
    supportingEvidence: { title: "AI Product Playbook", href: "/ai-product-playbook" },
    example: "AI readiness improved after platform modernization created stronger execution foundations."
  },
  {
    principle: "Trust Before Innovation",
    primaryEvidence: { title: "Comviva", href: "/stories/payments-reliability-comviva" },
    supportingEvidence: { title: "Decision Operating System", href: "/decision-operating-system" },
    example: "Payment reliability mattered because customers remember failed transactions more than successful ones."
  },
  {
    principle: "Adoption Before Expansion",
    primaryEvidence: { title: "JoVE", href: "/case-studies/jove" },
    supportingEvidence: { title: "AI Product Playbook", href: "/ai-product-playbook" },
    example: "Workflow adoption created more product value than expanding content volume alone."
  }
];

export const operatingPrinciplesContinue = [
  { title: "Professional Profile", href: "/profile", description: "Career context, outcomes, and product leadership signals." },
  { title: "Decision Operating System", href: "/decision-operating-system", description: "The decision systems behind these principles." },
  { title: "AI Product Playbook", href: "/ai-product-playbook", description: "The practical AI product operating guide." },
  { title: "JoVE", href: "/case-studies/jove", description: "Workflow adoption before content expansion." },
  { title: "Logix", href: "/case-studies/logix", description: "Platform modernization before AI expansion." },
  { title: "Comviva", href: "/stories/payments-reliability-comviva", description: "Trust and reliability at payment scale." },
  { title: "Simplilearn", href: "/case-studies/simplilearn", description: "Optimization before growth scale." }
];
