export type ExecutiveLink = {
  href: string;
  label: string;
};

export type CareerMilestone = {
  href: string;
  label: string;
};

export type LeadershipDomain = {
  description: string;
  evidence: string;
  href: string;
  title: string;
};

export type ExecutiveMetric = {
  href: string;
  label: string;
  value: string;
};

export type ExecutivePrinciple = {
  href: string;
  summary: string;
  title: string;
};

export type FeaturedDecision = {
  businessImpact: string;
  decision: string;
  href: string;
  principle: string;
  roleFit: string;
  title: string;
};

export type HiringReason = {
  evidence: ExecutiveLink[];
  summary: string;
  title: string;
};

export type RecruiterResource = {
  cta: string;
  description: string;
  href: string;
  title: string;
};

export type ReadingPath = {
  audience: string;
  href: string;
  steps: string[];
  time: string;
};

export const careerMilestones: CareerMilestone[] = [
  { label: "Analytics", href: "/profile#career-journey" },
  { label: "Payments", href: "/stories/payments-reliability-comviva" },
  { label: "Growth", href: "/case-studies/simplilearn" },
  { label: "Enterprise SaaS", href: "/case-studies/jove" },
  { label: "AI Platforms", href: "/case-studies/logix" },
  { label: "Product Leadership", href: "/product-leadership-operating-principles" }
];

export const leadershipDomains: LeadershipDomain[] = [
  {
    title: "Customer Leadership",
    evidence: "JoVE",
    description: "Turned adoption friction into a workflow-led product decision.",
    href: "/case-studies/jove"
  },
  {
    title: "Platform Leadership",
    evidence: "Logix",
    description: "Sequenced platform modernization before visible AI expansion.",
    href: "/case-studies/logix"
  },
  {
    title: "Trust Leadership",
    evidence: "Mahindra Comviva",
    description: "Grounded payments product work in reliability, confidence, and transaction-scale experience.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "Growth Leadership",
    evidence: "Simplilearn",
    description: "Optimized conversion systems before scaling demand.",
    href: "/case-studies/simplilearn"
  }
];

export const businessImpactMetrics: ExecutiveMetric[] = [
  { value: "₹1M+", label: "ARR", href: "/case-studies/logix" },
  { value: "10×", label: "Portfolio Growth", href: "/case-studies/simplilearn" },
  { value: "+20%", label: "MRR", href: "/case-studies/logix" },
  { value: "10M+", label: "Monthly Transactions", href: "/stories/payments-reliability-comviva" },
  { value: "94%", label: "CSAT", href: "/stories/payments-reliability-comviva" },
  { value: "+62%", label: "Traffic-to-Lead", href: "/case-studies/simplilearn" },
  { value: "+40%", label: "Lead-to-Customer", href: "/case-studies/simplilearn" },
  { value: "30+", label: "Enterprise Deployments", href: "/profile#business-outcomes" },
  { value: "25%", label: "Development Cost Reduction", href: "/case-studies/simplilearn" },
  { value: "15%", label: "Faster Delivery", href: "/case-studies/simplilearn" }
];

export const executivePrinciples: ExecutivePrinciple[] = [
  {
    title: "Solve the Highest-Leverage Constraint First",
    summary: "Find the bottleneck that unlocks the greatest long-term leverage.",
    href: "/product-leadership-operating-principles"
  },
  {
    title: "Adoption Before Expansion",
    summary: "Expansion compounds only when customers adopt what already exists.",
    href: "/case-studies/jove"
  },
  {
    title: "Platform Before Intelligence",
    summary: "AI needs reliable product, data, release, and measurement foundations.",
    href: "/case-studies/logix"
  },
  {
    title: "Trust Before Innovation",
    summary: "Customers accept innovation after they trust the platform delivering it.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "Optimization Before Scale",
    summary: "Scaling an inefficient system amplifies inefficiency.",
    href: "/case-studies/simplilearn"
  },
  {
    title: "Customer Confidence Compounds Faster Than Features",
    summary: "Confidence lowers adoption friction for every future capability.",
    href: "/product-leadership-operating-principles"
  },
  {
    title: "Great AI Requires Great Foundations",
    summary: "Responsible AI depends on platform maturity, reliable data, and operational readiness.",
    href: "/ai-product-playbook"
  },
  {
    title: "Measure Outcomes, Not Output",
    summary: "Product quality shows up in customer behavior and business outcomes.",
    href: "/decision-systems/ai-success-metrics"
  }
];

export const featuredDecisions: FeaturedDecision[] = [
  {
    title: "JoVE",
    decision: "Workflow adoption over content expansion.",
    businessImpact: "+30% portfolio revenue, +40% session duration.",
    principle: "Adoption Before Expansion",
    roleFit: "Discovery & Enterprise SaaS",
    href: "/case-studies/jove"
  },
  {
    title: "Logix",
    decision: "Platform modernization before visible AI expansion.",
    businessImpact: "₹1M+ ARR, +20% MRR, 3× delivery velocity.",
    principle: "Platform Before Intelligence",
    roleFit: "AI Platforms & Modernization",
    href: "/case-studies/logix"
  },
  {
    title: "Mahindra Comviva",
    decision: "Reliability before platform expansion.",
    businessImpact: "10M+ monthly transactions, 94% CSAT.",
    principle: "Trust Before Innovation",
    roleFit: "Payments & Reliability",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "Simplilearn",
    decision: "Funnel optimization before acquisition scale.",
    businessImpact: "10× revenue growth, +62% traffic-to-lead.",
    principle: "Optimization Before Scale",
    roleFit: "Growth & Product-Led Growth",
    href: "/case-studies/simplilearn"
  }
];

export const hiringReasons: HiringReason[] = [
  {
    title: "I simplify complex product decisions.",
    summary: "I turn competing constraints into explicit options, trade-offs, and measurable decisions.",
    evidence: [
      { label: "Decision Operating System", href: "/decision-operating-system" },
      { label: "Logix", href: "/case-studies/logix" }
    ]
  },
  {
    title: "I connect technology with business outcomes.",
    summary: "I evaluate technical work through customer value, commercial impact, and long-term platform leverage.",
    evidence: [
      { label: "AI Product Playbook", href: "/ai-product-playbook" },
      { label: "Logix", href: "/case-studies/logix" }
    ]
  },
  {
    title: "I build systems before scaling features.",
    summary: "I look for the product system that must improve before more roadmap output can create durable value.",
    evidence: [
      { label: "Comviva", href: "/stories/payments-reliability-comviva" },
      { label: "Simplilearn", href: "/case-studies/simplilearn" }
    ]
  },
  {
    title: "I lead through evidence instead of opinion.",
    summary: "I use customer behavior, constraints, metrics, and stakeholder alignment to make decisions visible.",
    evidence: [
      { label: "Operating Principles", href: "/product-leadership-operating-principles" },
      { label: "All Product Leadership Briefs", href: "/case-studies" }
    ]
  }
];

export const recruiterResources: RecruiterResource[] = [
  {
    title: "Professional Profile",
    description: "Career context, capabilities, outcomes, and contact details.",
    cta: "View profile",
    href: "/profile"
  },
  {
    title: "Profile Context",
    description: "Product OS career context. Tailored resumes remain application-specific.",
    cta: "Review context",
    href: "/profile"
  },
  {
    title: "LinkedIn",
    description: "Current professional profile and conversation path.",
    cta: "Open LinkedIn",
    href: "https://www.linkedin.com/in/chawdasaurabh/"
  },
  {
    title: "GitHub",
    description: "Implementation evidence behind Product OS.",
    cta: "Open GitHub",
    href: "https://github.com/saurabh1chawda"
  },
  {
    title: "Email",
    description: "Direct contact for Senior / Lead PM, AI PM, and platform roles.",
    cta: "Email Saurabh",
    href: "mailto:saurabh1chawda@gmail.com"
  },
  {
    title: "AI Product Playbook",
    description: "Interactive playbook now; PDF version can be added later.",
    cta: "Open playbook",
    href: "/ai-product-playbook"
  }
];

export const readingPaths: ReadingPath[] = [
  {
    audience: "Recruiter",
    time: "5 Minutes",
    href: "/contact",
    steps: ["Executive Brief", "Professional Profile", "Contact"]
  },
  {
    audience: "Hiring Manager",
    time: "15 Minutes",
    href: "/product-leadership-operating-principles",
    steps: ["Executive Brief", "Operating Principles", "Logix", "AI Product Playbook"]
  },
  {
    audience: "Product Leader",
    time: "30-45 Minutes",
    href: "/decision-operating-system",
    steps: [
      "Executive Brief",
      "Decision Operating System",
      "Operating Principles",
      "JoVE",
      "Logix",
      "Mahindra Comviva",
      "Simplilearn",
      "AI Product Playbook"
    ]
  }
];
