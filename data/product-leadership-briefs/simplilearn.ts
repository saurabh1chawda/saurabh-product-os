import type { ProductLeadershipBrief } from "./types";

export const simplilearnBrief: ProductLeadershipBrief = {
  slug: "simplilearn",
  company: "Simplilearn",
  domain: "EdTech, digital learning, product-led growth, experimentation",
  coreDecision: "Optimized the funnel before scaling acquisition.",
  businessImpact: "10× revenue growth, 62% traffic-to-lead improvement, 40% lead-to-customer improvement.",
  readingTime: "12 min read",
  status: "Available",
  href: "/case-studies/simplilearn",
  hero: {
    headline: "We optimized the funnel before scaling growth.",
    supportingCopy: [
      "Instead of increasing acquisition spend or shipping more features, we paused expansion to redesign the conversion system itself.",
      "By optimizing web performance, reducing customer friction, and engineering organic growth loops, we transformed an inefficient acquisition engine into a scalable monetization platform that grew the Job Guarantee portfolio from ₹1M to ₹10M."
    ],
    kpis: [
      { label: "Commercial", value: "10× Revenue Growth" },
      { label: "Customer", value: "62% Traffic-to-Lead" },
      { label: "Customer", value: "40% Lead-to-Customer" },
      { label: "Growth", value: "Refer & Earn" },
      { label: "Growth", value: "1.5% → 3%" },
      { label: "Platform", value: "25% Lower Development Cost" },
      { label: "Platform", value: "15% Faster Time-to-Market" }
    ]
  },
  executiveSnapshot: [
    { label: "Role", value: "Senior Product Manager" },
    { label: "Company", value: "Simplilearn" },
    { label: "Timeline", value: "September 2021 - December 2022" },
    { label: "Domain", value: "EdTech, Digital Learning, Product-Led Growth, Experimentation" },
    { label: "Product Scope", value: "Job Guarantee Portfolio, Conversion Optimization, Referral Systems, Growth Platform" },
    {
      label: "Primary Responsibility",
      value:
        "Owned product strategy, experimentation roadmap, conversion optimization, user journey improvements, and commercial growth."
    }
  ],
  situation: {
    eyebrow: "Situation",
    title: "The Job Guarantee portfolio had strong demand, but the conversion system was not efficient enough to scale.",
    body: [
      "The Job Guarantee portfolio had ambitious commercial targets. Traffic acquisition continued growing. However, customer conversion efficiency remained significantly below its potential.",
      "Marketing investment was increasing while the underlying funnel leaked valuable users."
    ]
  },
  complication: {
    eyebrow: "Complication",
    title: "Scaling demand into an inefficient funnel would only make growth more expensive.",
    body: [
      "Core Web Vitals issues, slow platform responsiveness, user journey friction, heavy dependence on paid acquisition, and low organic referrals created a system where more traffic did not automatically mean more durable growth.",
      "Scaling traffic into an inefficient funnel would only increase acquisition costs."
    ]
  },
  question: {
    eyebrow: "Question",
    title: "Should we scale acquisition immediately, or first optimize the conversion system that determines sustainable growth?",
    body: [
      "The product decision was not whether growth mattered. It did. The real question was whether the next investment should increase demand or improve the system that converts demand into customer and business value."
    ]
  },
  discovery: {
    eyebrow: "Discovery",
    title: "Discovery showed that traffic was not the bottleneck. Funnel efficiency was.",
    body: [
      "The strongest evidence came from performance signals, conversion behavior, referral contribution, and roadmap throughput.",
      "The pattern was clear: product experimentation created more leverage than additional marketing spend because the funnel itself was structurally under-optimized."
    ],
    bullets: [
      "Traffic was not the bottleneck.",
      "Funnel efficiency limited growth.",
      "Platform responsiveness reduced conversions.",
      "Referral contribution remained minimal.",
      "Product experimentation created more leverage than additional marketing spend."
    ]
  },
  strategicOptions: [
    {
      label: "Option A",
      title: "Increase Paid Acquisition",
      description: "Scale traffic immediately through additional paid acquisition spend.",
      benefits: ["Fast traffic growth."],
      risks: ["Higher CAC.", "Scaling an inefficient funnel.", "Reduced profitability."],
      decision: "Rejected.",
      tradeoff: "Fast traffic growth, but with higher CAC, inefficient conversion, and reduced profitability."
    },
    {
      label: "Option B",
      title: "Complete Platform Rewrite",
      description: "Pause growth optimization and rebuild the platform for long-term flexibility.",
      benefits: ["Long-term flexibility."],
      risks: ["High cost.", "Delayed commercial impact.", "Roadmap freeze."],
      decision: "Rejected.",
      tradeoff: "Long-term flexibility, but high cost, delayed commercial impact, and roadmap freeze."
    },
    {
      label: "Option C",
      title: "High-Leverage Funnel Optimization & Product-Led Growth",
      description: "Improve conversion, performance, referral loops, and roadmap sequencing before scaling acquisition.",
      benefits: ["Higher conversion.", "Lower CAC.", "Organic growth.", "Improved monetization."],
      risks: ["Required disciplined experimentation and tighter cross-functional sequencing."],
      decision: "Chosen.",
      tradeoff: "Higher conversion, lower CAC, organic growth, and improved monetization with stronger execution discipline.",
      selected: true
    }
  ],
  constraintMapping: [
    {
      constraint: "Core Web Vitals",
      businessImpact: "High bounce",
      decision: "Performance optimization"
    },
    {
      constraint: "User Journey Friction",
      businessImpact: "Lower conversion",
      decision: "Journey redesign"
    },
    {
      constraint: "Paid Acquisition Dependence",
      businessImpact: "Higher CAC",
      decision: "Referral engine"
    },
    {
      constraint: "Roadmap Inefficiency",
      businessImpact: "Higher engineering cost",
      decision: "Roadmap restructuring"
    }
  ],
  productDecision: {
    eyebrow: "Product Decision",
    title: "We optimized the funnel before scaling growth.",
    body: [
      "I chose to focus the roadmap on the conversion system before increasing acquisition pressure.",
      "Fixing the funnel created significantly more leverage than simply buying more traffic because every downstream improvement made future demand more valuable.",
      "Growth compounds only when the underlying funnel is structurally efficient. This is why the AI Experimentation Framework, AI Metrics Framework, and Evidence-Driven AI Prioritization Canvas in the AI Product Playbook all start with evidence quality before scale."
    ]
  },
  productStrategy: {
    eyebrow: "Product Strategy",
    title: "Turn growth from acquisition dependence into a product-led conversion system.",
    body: [
      "The strategy was to improve the system that converted attention into customer value.",
      "That meant improving performance, reducing journey friction, strengthening referral loops, and governing roadmap sequencing around experiments that could move commercial outcomes."
    ],
    bullets: [
      "Funnel optimization",
      "Core Web Vitals improvements",
      "User journey redesign",
      "Product-led growth",
      "Refer & Earn",
      "Experimentation",
      "Roadmap governance"
    ]
  },
  visualSections: [
    {
      eyebrow: "Growth Evolution",
      id: "growth-evolution",
      title: "Growth improved when the product system converted demand more efficiently.",
      description: "The growth sequence moved from raw traffic toward performance, conversion, referral loops, and revenue.",
      steps: ["Traffic", "Performance Optimization", "Higher Conversion", "Organic Referral Loop", "Revenue Growth"]
    },
    {
      eyebrow: "Growth Flywheel",
      eventName: "growth_flywheel_viewed",
      id: "growth-flywheel",
      title: "The growth system created a compounding loop.",
      description: "Performance and customer experience improvements increased conversion, which funded more experimentation and stronger organic growth.",
      steps: ["Web Performance", "Customer Experience", "Higher Conversion", "Revenue", "Experimentation", "Better Product", "Organic Growth"]
    },
    {
      eyebrow: "Experimentation Loop",
      eventName: "experimentation_loop_viewed",
      id: "experimentation-loop",
      title: "Experimentation turned roadmap decisions into measurable learning.",
      description: "The operating loop kept growth decisions tied to evidence instead of opinions about which features should ship next.",
      steps: ["Observe", "Hypothesis", "Experiment", "Measure", "Decision", "Scale"]
    }
  ],
  execution: {
    eyebrow: "Execution",
    title: "Execution required aligning marketing, engineering, sales, design, and product around funnel efficiency.",
    body: [
      "Marketing brought demand signals and acquisition pressure. Engineering improved performance and implementation efficiency. Sales helped clarify conversion friction and buyer objections. Design reduced journey friction. Product sequenced experiments and roadmap trade-offs around measurable growth.",
      "Roadmap restructuring reduced development costs while improving experimentation velocity because the team could focus on fewer, higher-leverage changes instead of spreading effort across disconnected feature requests."
    ],
    bullets: ["Marketing", "Engineering", "Sales", "Design", "Product"]
  },
  tradeoffs: [
    {
      decision: "Paused new feature expansion",
      tradeoff: "New features would have created visible activity, but the larger constraint was the funnel's ability to convert existing demand.",
      leadershipSignal: "Prioritized conversion leverage over output volume."
    },
    {
      decision: "Accepted slower short-term feature releases",
      tradeoff: "The team slowed some feature expansion so performance, journey quality, and experimentation infrastructure could improve.",
      leadershipSignal: "Protected the growth system instead of chasing near-term roadmap optics."
    },
    {
      decision: "Focused engineering on optimization",
      tradeoff: "Engineering effort moved toward performance and conversion systems rather than only adding visible surfaces.",
      leadershipSignal: "Connected technical work directly to commercial outcomes."
    },
    {
      decision: "Prioritized sustainable growth over visible growth",
      tradeoff: "Increasing traffic would have looked faster, but optimizing conversion created a stronger path to profitable scale.",
      leadershipSignal: "Scaled the system only after improving its efficiency."
    }
  ],
  impactDashboard: [
    {
      title: "Commercial",
      metrics: [{ label: "Revenue", value: "10×" }],
      note: "The Job Guarantee portfolio grew from ₹1M to ₹10M after the conversion system became more efficient."
    },
    {
      title: "Growth",
      metrics: [{ label: "Referral Contribution", value: "1.5% → 3%" }],
      note: "Refer & Earn improved organic contribution and reduced sole dependence on paid acquisition."
    },
    {
      title: "Conversion",
      metrics: [
        { label: "Traffic-to-Lead", value: "62%" },
        { label: "Lead-to-Customer", value: "40%" }
      ],
      note: "Journey and funnel improvements converted demand into higher quality leads and customers."
    },
    {
      title: "Platform",
      metrics: [
        { label: "Lower Development Cost", value: "25%" },
        { label: "Faster Delivery", value: "15%" }
      ],
      note: "Roadmap restructuring improved engineering efficiency while supporting faster experimentation."
    }
  ],
  stakeholderAlignment: {
    eyebrow: "Stakeholder Alignment",
    title: "Each team was optimizing a different growth lever.",
    body: [
      "Marketing wanted more acquisition. Commercial teams wanted more programs. Engineering wanted roadmap stability. Product reframed growth around funnel efficiency.",
      "Nobody was wrong. Each team optimized a different growth lever.",
      "My responsibility was to align everyone around the highest-leverage bottleneck."
    ]
  },
  reflection: [
    {
      prompt: "What surprised me?",
      response:
        "The biggest surprise was how much growth was already available inside the existing funnel. The business did not only need more demand. It needed a better system for converting the demand it already had."
    },
    {
      prompt: "What would I do differently?",
      response:
        "I would introduce experimentation instrumentation earlier. Faster instrumentation would have made it easier to separate real customer behavior from noisy funnel assumptions."
    },
    {
      prompt: "What still guides my product decisions?",
      response:
        "Before scaling demand, I look for the highest-leverage conversion constraint. If that constraint is unresolved, growth spend often amplifies inefficiency instead of creating sustainable business value."
    }
  ],
  signaturePrinciple: {
    quote: "Optimization is the prerequisite for scale.",
    supportingCopy: "High traffic means nothing if the underlying customer journey cannot convert attention into customer value."
  },
  leadershipToday: {
    eyebrow: "Leadership Today",
    title: "How this changes how I build products today",
    body: [
      "Whenever I evaluate a growth roadmap, I begin by identifying the highest-leverage constraint preventing customer conversion.",
      "I ask: Are we optimizing the system before we scale demand?",
      "If the answer is no, increasing traffic rarely creates sustainable business growth. This principle now guides how I approach AI products, enterprise platforms, consumer experiences, and growth initiatives."
    ]
  },
  productPrinciples: [
    {
      title: "Growth is a system, not a channel.",
      description: "Sustainable growth depends on acquisition, performance, journey quality, conversion, referrals, and measurement working together."
    },
    {
      title: "Optimization comes before scale.",
      description: "Scaling traffic before fixing the conversion system increases cost faster than it creates value."
    },
    {
      title: "Experiments should change roadmap decisions.",
      description: "Experimentation matters when it helps the team choose what to build, pause, improve, or scale next."
    }
  ],
  relatedResources: [
    {
      title: "Decision Operating System",
      description: "The decision systems behind Product OS and evidence-backed prioritization.",
      href: "/decision-operating-system"
    },
    {
      title: "AI Product Playbook",
      description: "Explore AI experimentation, metrics, and evidence-driven prioritization patterns.",
      href: "/ai-product-playbook"
    },
    {
      title: "Professional Profile",
      description: "Career context, business outcomes, and product leadership signals.",
      href: "/profile"
    },
    {
      title: "JoVE Product Leadership Brief",
      description: "A complementary brief on workflow adoption and product strategy.",
      href: "/case-studies/jove"
    },
    {
      title: "Logix Product Leadership Brief",
      description: "A complementary brief on platform modernization and AI readiness.",
      href: "/case-studies/logix"
    },
    {
      title: "Mahindra Comviva Product Leadership Brief",
      description: "Reliability and payments product judgment at transaction scale.",
      href: "/stories/payments-reliability-comviva"
    }
  ],
  continueExploring: [
    {
      title: "AI Product Playbook",
      description: "Review the operating guide behind experimentation, metrics, and evidence-driven prioritization.",
      href: "/ai-product-playbook"
    },
    {
      title: "Decision Operating System",
      description: "Explore the broader decision systems that support growth strategy and product judgment.",
      href: "/decision-operating-system"
    },
    {
      title: "Product Leadership Operating Principles",
      description: "Connect optimization-before-scale to the broader product leadership philosophy.",
      href: "/product-leadership-operating-principles"
    }
  ]
};
