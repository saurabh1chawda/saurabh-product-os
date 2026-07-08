import type { ProductLeadershipBrief } from "./types";

export const logixBrief: ProductLeadershipBrief = {
  slug: "logix",
  company: "Logix",
  domain: "AI platforms, enterprise SaaS, product-led growth",
  coreDecision: "Modernized the platform before expanding visible AI capability.",
  businessImpact: "₹1M+ ARR, +20% MRR, +25% engagement, 3× delivery velocity.",
  readingTime: "12 min read",
  status: "Available",
  href: "/case-studies/logix",
  hero: {
    headline: "We modernized the platform before teaching it to think.",
    supportingCopy: [
      "The fastest way to ship AI features was not to build them first.",
      "It was to rebuild the platform that would eventually make those capabilities scalable, reliable, measurable, and commercially successful.",
      "By prioritizing platform modernization, mobile-first customer experience, and architectural scalability before advanced AI capability expansion, we unlocked sustainable customer value instead of short-lived feature velocity."
    ],
    kpis: [
      { label: "Commercial: ARR", value: "₹1M+" },
      { label: "Commercial: MRR", value: "+20%" },
      { label: "Customer: Engagement", value: "+25%" },
      { label: "Customer: Organic Traffic", value: "2×" },
      { label: "Platform: Delivery Velocity", value: "3×" },
      { label: "Platform: Faster Releases", value: "2×" },
      { label: "Platform: Throughput", value: "+15%" }
    ]
  },
  executiveSnapshot: [
    { label: "Role", value: "Head of Product" },
    { label: "Company", value: "Logix Built Infotech Solutions" },
    { label: "Timeline", value: "May 2025 - Present" },
    { label: "Domain", value: "AI Platforms, Enterprise SaaS, Product-Led Growth" },
    { label: "Product Scope", value: "Platform Modernization, Mobile Experience, AI Readiness, Architecture Strategy" },
    {
      label: "Primary Responsibility",
      value: "Own product strategy, platform roadmap, AI readiness, customer experience, and commercial growth."
    }
  ],
  situation: {
    eyebrow: "Situation",
    title: "Commercial momentum was growing, but the platform was not ready for durable AI expansion.",
    body: [
      "The company had strong commercial momentum, but years of incremental delivery had created a platform constrained by technical debt, fragmented customer journeys, slow release cycles, and desktop-first experiences.",
      "Although demand for AI-powered capabilities was increasing, the existing platform could not support reliable, scalable AI execution."
    ]
  },
  complication: {
    eyebrow: "Complication",
    title: "The organization needed speed, stability, customer simplicity, and AI progress at the same time.",
    body: [
      "The organization faced simultaneous pressure from multiple directions.",
      "Sales wanted visible AI features immediately. Engineering wanted a long infrastructure-only stabilization period. Customers wanted faster, simpler experiences. Leadership wanted commercial momentum to continue.",
      "The platform could not satisfy all of these expectations simultaneously."
    ]
  },
  question: {
    eyebrow: "Question",
    title: "Should we pursue visible AI features immediately, or first modernize the platform beneath them?",
    body: [
      "The core product decision was whether to chase near-term AI visibility or sequence the roadmap around the foundation that would determine whether those AI capabilities could scale, earn trust, and move business outcomes."
    ]
  },
  discovery: {
    eyebrow: "Discovery",
    title: "The strongest signals pointed to platform readiness as the highest-leverage product constraint.",
    body: [
      "Discovery was not only customer interviews or feature requests. It included customer behavior, funnel leakage, product friction, release patterns, engineering constraints, and commercial pressure.",
      "The evidence showed that AI expansion would only compound existing platform weaknesses if the product system did not improve first."
    ],
    bullets: [
      "Technical debt was limiting release velocity.",
      "Desktop-first UX created customer friction.",
      "Conversion funnels were leaking users.",
      "Platform architecture slowed experimentation.",
      "AI capability expansion without modernization would amplify existing weaknesses."
    ]
  },
  strategicOptions: [
    {
      label: "Option A",
      title: "Complete Greenfield Rewrite",
      description: "Rebuild the platform from scratch to maximize architectural flexibility.",
      benefits: ["Maximum architectural flexibility."],
      risks: ["12+ month delivery delay.", "Revenue disruption.", "Migration risk."],
      decision: "Rejected.",
      tradeoff: "Maximum architectural flexibility, but created 12+ month delivery delay, revenue disruption, and migration risk."
    },
    {
      label: "Option B",
      title: "Patch and Optimize the Monolith",
      description: "Keep the existing architecture and focus on short-term performance and UX improvements.",
      benefits: ["Fast short-term improvements."],
      risks: ["Preserved long-term architectural constraints."],
      decision: "Rejected.",
      tradeoff: "Fast short-term improvements, but preserved long-term architectural constraints."
    },
    {
      label: "Option C",
      title: "Incremental Core Modernization + Parallel Mobile-First Redesign",
      description:
        "Improve platform foundations while continuously shipping customer-facing value through a mobile-first product experience.",
      benefits: [
        "Customer value delivered continuously.",
        "Business momentum preserved.",
        "Platform improved incrementally.",
        "AI readiness increased."
      ],
      risks: ["Required sharper sequencing and cross-functional alignment."],
      decision: "Chosen.",
      tradeoff: "Customer value delivered continuously, business momentum preserved, platform improved incrementally, and AI readiness increased.",
      selected: true
    }
  ],
  constraintMapping: [
    {
      constraint: "Legacy Architecture",
      businessImpact: "Slow releases",
      decision: "Platform modernization"
    },
    {
      constraint: "Desktop-first UX",
      businessImpact: "Customer drop-off",
      decision: "Mobile-first redesign"
    },
    {
      constraint: "Technical Debt",
      businessImpact: "Reduced engineering velocity",
      decision: "Incremental modernization"
    },
    {
      constraint: "AI Market Pressure",
      businessImpact: "Risk of superficial AI",
      decision: "Delay AI until platform ready"
    }
  ],
  productDecision: {
    eyebrow: "Product Decision",
    title: "We modernized the platform before teaching it to think.",
    body: [
      "I chose a leverage-first sequencing strategy: improve the platform foundations that would make future AI capabilities reliable, measurable, and commercially useful.",
      "The decision was not anti-AI. It was pro-durable AI. Platform leverage creates sustainable AI leverage because better architecture improves release speed, customer experience, observability, experimentation, and trust.",
      "This is the same product logic behind the AI Opportunity Scorecard, Workflow-to-Agent Framework, and Trust Before Automation Model in the AI Product Playbook: validate the product system before increasing automation depth."
    ]
  },
  productStrategy: {
    eyebrow: "Product Strategy",
    title: "Sequence the roadmap around platform leverage, customer value, and AI readiness.",
    body: [
      "The strategy balanced commercial momentum with platform modernization. Instead of pausing all visible product progress, we paired foundational platform work with mobile-first customer improvements and product-led growth loops.",
      "The roadmap treated AI readiness as an outcome of better product infrastructure, not a detached technology initiative."
    ],
    bullets: [
      "Platform-first roadmap",
      "Mobile-first transformation",
      "DevOps maturity",
      "API standardization",
      "Product-led growth",
      "AI readiness"
    ]
  },
  architectureEvolution: {
    eyebrow: "Architecture Evolution",
    id: "architecture-evolution",
    title: "Modernization created the path from legacy platform to customer-facing AI.",
    description: "The product sequence stayed intentionally simple: stabilize the foundation before expanding intelligent capability.",
    steps: ["Legacy Platform", "Platform Modernization", "AI-Ready Foundation", "Customer-Facing AI"]
  },
  platformFlywheel: {
    eyebrow: "Platform Leverage Flywheel",
    id: "platform-flywheel",
    title: "Platform leverage created a compounding product loop.",
    description: "The modernization decision connected technical progress to customer adoption, commercial outcomes, and future investment capacity.",
    steps: [
      "Platform Modernization",
      "Faster Releases",
      "Better Customer Experience",
      "Higher Adoption",
      "Revenue Growth",
      "Investment Capacity",
      "More Platform Modernization"
    ]
  },
  execution: {
    eyebrow: "Execution",
    title: "Roadmap sequencing kept commercial momentum alive while the foundation improved.",
    body: [
      "Execution required cross-functional collaboration across engineering, design, product, commercial teams, and DevOps.",
      "Engineering focused on modernization and delivery velocity. Design pushed the mobile-first customer experience forward. Product sequenced work around visible customer value and platform leverage. Commercial teams stayed aligned around what could be sold responsibly while AI readiness matured.",
      "The operating principle was simple: keep shipping customer value while removing the constraints that made future AI and platform scale fragile."
    ],
    bullets: ["Engineering", "Design", "Product", "Commercial", "DevOps"]
  },
  tradeoffs: [
    {
      decision: "Delayed AI visibility",
      tradeoff: "Visible AI features could have created short-term market energy, but they would have rested on weak product foundations.",
      leadershipSignal: "Protected long-term AI leverage over short-term demo value."
    },
    {
      decision: "Slower short-term feature expansion",
      tradeoff: "The team accepted fewer visible features in the near term so release velocity, system reliability, and customer experience could improve.",
      leadershipSignal: "Chose sequencing discipline over feature volume."
    },
    {
      decision: "Customer-facing improvements plus backend modernization",
      tradeoff: "Pure infrastructure work would have reduced customer value. Pure UX work would have preserved platform constraints.",
      leadershipSignal: "Balanced customer momentum with foundational leverage."
    },
    {
      decision: "Long-term leverage over short-term hype",
      tradeoff: "The roadmap avoided superficial AI launches until the product system could support useful, measurable automation.",
      leadershipSignal: "Kept AI strategy grounded in product outcomes."
    }
  ],
  impactDashboard: [
    {
      title: "Commercial",
      metrics: [
        { label: "ARR", value: "₹1M+" },
        { label: "MRR Growth", value: "20%" }
      ],
      note: "Commercial outcomes improved as platform modernization and product-led growth created more durable value."
    },
    {
      title: "Customer",
      metrics: [
        { label: "Engagement", value: "25%" },
        { label: "Organic Traffic", value: "2×" }
      ],
      note: "Mobile-first customer experience and growth improvements increased customer interaction and acquisition quality."
    },
    {
      title: "Platform",
      metrics: [
        { label: "Delivery Velocity", value: "3×" },
        { label: "Faster Releases", value: "2×" },
        { label: "Throughput Increase", value: "15%" }
      ],
      note: "Platform improvements increased the organization's ability to ship, learn, and prepare for scalable AI capability."
    }
  ],
  stakeholderAlignment: {
    eyebrow: "Stakeholder Alignment",
    title: "The disagreement was real because every team was optimizing for a legitimate constraint.",
    body: [
      "Engineering was infrastructure-first. Sales was feature-first. Product had to be leverage-first.",
      "Neither team was wrong. Each optimized for a different constraint.",
      "My responsibility was not to choose a side. It was to redefine success around the highest-leverage business outcome."
    ]
  },
  reflection: [
    {
      prompt: "What surprised me?",
      response:
        "The strongest product decision was not the most visible one. Modernization looked like technical work from the outside, but it was the decision that made better customer experience, faster releases, and future AI capability possible."
    },
    {
      prompt: "What would I do differently today?",
      response:
        "I would make the constraint map explicit even earlier. When stakeholders can see which constraint each team is optimizing for, alignment becomes less emotional and more strategic."
    },
    {
      prompt: "What principle still guides me?",
      response:
        "Great product sequencing starts by identifying the constraint that compounds. If the foundation is weak, more features only create more surface area for failure."
    }
  ],
  signaturePrinciple: {
    quote: "Great product leaders don't solve the loudest problem. They solve the highest-leverage constraint.",
    supportingCopy:
      "This brief is a reminder that AI readiness is not created by announcing AI features. It is created by improving the product system that makes intelligent capabilities useful, trustworthy, measurable, and scalable."
  },
  productPrinciples: [
    {
      title: "Platform leverage creates AI leverage.",
      description: "AI capability becomes more durable when the underlying product, data, release, and measurement systems are strong enough to support it."
    },
    {
      title: "Sequencing is product strategy.",
      description: "The order in which a team improves customer experience, architecture, growth, and AI readiness determines whether momentum compounds or fragments."
    },
    {
      title: "Modernization should keep delivering customer value.",
      description: "Platform work should create customer value continuously rather than delaying all value until infrastructure work is complete."
    }
  ],
  relatedResources: [
    {
      title: "Decision Operating System",
      description: "The decision systems behind Product OS and the product judgment used to choose leverage-first sequencing.",
      href: "/decision-operating-system"
    },
    {
      title: "AI Product Playbook",
      description: "Explore the AI Opportunity Scorecard, Workflow-to-Agent Framework, and Trust Before Automation Model referenced in this brief.",
      href: "/ai-product-playbook"
    },
    {
      title: "Professional Profile",
      description: "Career context, business outcomes, and product leadership signals behind the work.",
      href: "/profile"
    },
    {
      title: "JoVE Product Leadership Brief",
      description: "A complementary brief on workflow adoption, discovery, and product strategy.",
      href: "/case-studies/jove"
    }
  ],
  continueExploring: [
    {
      title: "Contact Saurabh",
      description: "Discuss how this AI platform and modernization evidence maps to your open role.",
      href: "/contact"
    },
    {
      title: "Executive Brief",
      description: "Return to the five-minute overview of Product OS and its strongest evidence.",
      href: "/executive"
    },
    {
      title: "AI Product Playbook",
      description: "Review the operating guide behind AI opportunity, automation depth, and trust decisions.",
      href: "/ai-product-playbook"
    },
    {
      title: "Decision Operating System",
      description: "Explore the broader decision systems that support product sequencing and evidence-backed strategy.",
      href: "/decision-operating-system"
    },
    {
      title: "Product Leadership Operating Principles",
      description: "Connect platform-before-intelligence to the operating philosophy behind Product OS.",
      href: "/product-leadership-operating-principles"
    }
  ]
};
