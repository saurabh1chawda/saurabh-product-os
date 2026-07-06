import type { ProductLeadershipBrief } from "./types";

export const joveBrief: ProductLeadershipBrief = {
  slug: "jove",
  company: "JoVE",
  domain: "SaaS product strategy",
  coreDecision: "Prioritized workflow adoption over content expansion.",
  businessImpact: "+30% portfolio revenue, +40% session duration, +15% page views.",
  readingTime: "10 min read",
  status: "Available",
  href: "/case-studies/jove",
  hero: {
    headline: "We prioritized workflow adoption over content expansion.",
    supportingCopy: [
      "Researchers were not abandoning the platform because we lacked scientific content.",
      "They were abandoning it because our product stopped at the laboratory door.",
      "Instead of investing in producing more videos, we invested in helping researchers successfully execute scientific workflows.",
      "That decision fundamentally changed platform adoption."
    ],
    kpis: [
      { label: "Portfolio Revenue", value: "+30%" },
      { label: "Session Duration", value: "+40%" },
      { label: "Page Views", value: "+15%" },
      { label: "Video Consumption", value: "+12%" }
    ]
  },
  executiveSnapshot: [
    { label: "Role", value: "Senior Product Manager" },
    { label: "Company", value: "JoVE" },
    { label: "Timeline", value: "January 2023 - May 2025" },
    { label: "Domain", value: "Enterprise SaaS, research, biopharma" },
    { label: "Product Area", value: "Research and Biopharma portfolios" },
    { label: "Users", value: "Researchers, educators, lab teams, institutional customers" },
    { label: "Team", value: "Product, engineering, design, analytics, content, customer-facing teams" },
    { label: "Business Outcomes", value: "+30% portfolio revenue, +40% session duration, +15% page views, +12% video consumption" },
    { label: "Primary Responsibility", value: "Owned product strategy, discovery, roadmap direction, and execution alignment." }
  ],
  situation: {
    eyebrow: "Situation",
    title: "The product had valuable scientific content, but adoption was not scaling with content investment.",
    body: [
      "JoVE served specialized users who needed scientific content to support research, teaching, planning, and execution.",
      "The product had a strong content foundation, but engagement signals suggested that more content alone was not enough to create durable adoption."
    ],
    bullets: [
      "The business needed stronger engagement and portfolio performance.",
      "Users needed help applying content inside real research and teaching workflows.",
      "The roadmap risk was mistaking content supply for product value."
    ]
  },
  complication: {
    eyebrow: "Complication",
    title: "More content looked like progress, but it did not answer the adoption problem.",
    body: [
      "Content expansion was easy to understand, easy to justify, and easy to measure.",
      "The harder question was whether users could discover, evaluate, and apply content at the moment their work required it."
    ],
    bullets: [
      "A larger library could increase choice without reducing workflow friction.",
      "Discovery, trust, and applicability mattered as much as content availability.",
      "If the product stopped at the lab door, users still had to translate value on their own."
    ]
  },
  question: {
    eyebrow: "Question",
    title: "Should we keep scaling content volume, or improve the workflow that made content useful?",
    body: [
      "The product question was not whether content mattered. It did.",
      "The strategic question was whether the next investment should create more content or make existing content easier to adopt inside customer workflows."
    ]
  },
  discovery: {
    eyebrow: "Discovery",
    title: "Discovery shifted the problem from supply to workflow fit.",
    body: [
      "Customer signals showed that users were not simply browsing for information. They were trying to complete work with limited time, existing habits, and high expectations for relevance.",
      "The strongest product signal was workflow friction: finding the right material, trusting it quickly, and using it inside a real task."
    ],
    bullets: [
      "Users needed confidence that content matched their context.",
      "They needed faster paths from discovery to application.",
      "Engagement depended on whether the product fit how they already worked."
    ]
  },
  strategicOptions: [
    {
      label: "Option A",
      title: "Expand content supply",
      description: "Continue investing primarily in more scientific videos and breadth of coverage.",
      tradeoff: "Visible and easy to justify, but risked increasing volume without solving adoption friction."
    },
    {
      label: "Option B",
      title: "Improve discovery surfaces",
      description: "Make content easier to browse, evaluate, and navigate through better product surfaces.",
      tradeoff: "Useful incremental improvement, but still incomplete if the product did not connect to user workflows."
    },
    {
      label: "Option C",
      title: "Prioritize workflow adoption",
      description: "Shape roadmap decisions around how users apply scientific content inside research, teaching, and lab workflows.",
      tradeoff: "Required more alignment and sharper prioritization, but had the strongest path to durable engagement.",
      selected: true
    }
  ],
  productDecision: {
    eyebrow: "Product Decision",
    title: "We prioritized workflow adoption over content expansion.",
    body: [
      "I recommended reframing the roadmap from content volume to workflow usefulness.",
      "The decision moved the team toward product experiences that helped users find, trust, and apply content in the context of their work."
    ]
  },
  productStrategy: {
    eyebrow: "Product Strategy",
    title: "Turn scientific content into workflow support, not just a larger library.",
    body: [
      "The strategy was to make the product more useful at the point of application.",
      "That meant connecting discovery, evaluation, and usage signals to roadmap choices instead of treating content inventory as the primary product lever."
    ],
    bullets: [
      "Improve content discovery around user intent.",
      "Reduce friction between finding content and applying it.",
      "Measure engagement quality, not only content availability."
    ]
  },
  execution: {
    eyebrow: "Execution",
    title: "Aligned roadmap, discovery, analytics, and stakeholder conversations around adoption behavior.",
    body: [
      "Execution required making the hidden assumption visible: that more content would solve adoption.",
      "I translated discovery signals into roadmap priorities and used engagement metrics to keep the conversation grounded in customer behavior."
    ],
    bullets: [
      "Synthesized customer signals into workflow opportunities.",
      "Aligned teams around adoption behavior and engagement quality.",
      "Connected product decisions to portfolio revenue and product usage outcomes."
    ]
  },
  tradeoffs: [
    {
      decision: "Content volume vs. workflow usefulness",
      tradeoff: "Content expansion was easier to explain, but workflow improvements had a stronger path to durable adoption.",
      leadershipSignal: "Prioritized the problem that changed customer behavior, not the work that looked most visible."
    },
    {
      decision: "Speed vs. confidence",
      tradeoff: "Moving directly into content build would have been faster, but discovery reduced the risk of scaling the wrong answer.",
      leadershipSignal: "Used evidence to slow the decision just enough to improve product direction."
    },
    {
      decision: "Surface improvements vs. strategic reframing",
      tradeoff: "Navigation improvements helped, but the broader product issue was how content fit into real work.",
      leadershipSignal: "Kept the roadmap connected to the customer job rather than isolated UI changes."
    }
  ],
  impactDashboard: [
    {
      title: "Business Impact",
      metrics: [
        { label: "Portfolio Revenue", value: "+30%" },
        { label: "Video Consumption", value: "+12%" }
      ],
      note: "The portfolio performed better when product work focused on adoption behavior and workflow value."
    },
    {
      title: "Behavioral Impact",
      metrics: [
        { label: "Session Duration", value: "+40%" },
        { label: "Page Views", value: "+15%" }
      ],
      note: "Engagement improved as users found more reason to spend time with the product."
    },
    {
      title: "Product Impact",
      metrics: [
        { label: "Core Decision", value: "Workflow" },
        { label: "Roadmap Focus", value: "Adoption" }
      ],
      note: "The roadmap shifted from output volume toward usefulness inside real customer workflows."
    }
  ],
  reflection: [
    {
      prompt: "What worked?",
      response:
        "Making the hidden assumption visible worked. Once the team could see that we were assuming more content would solve adoption, it became easier to test whether that assumption matched customer behavior."
    },
    {
      prompt: "What surprised me?",
      response:
        "The surprising part was how reasonable the wrong answer looked. More content was not a bad idea in isolation. It was just incomplete because it did not address workflow friction."
    },
    {
      prompt: "What would I do differently?",
      response:
        "I would formalize the workflow map earlier. The sooner the team sees the customer's real sequence of work, the sooner product decisions can move from feature supply to behavior change."
    }
  ],
  productPrinciples: [
    {
      title: "Adoption follows workflow fit.",
      description: "Users do not adopt products because they understand them. They adopt products because those products become part of how they already work."
    },
    {
      title: "More output is not always more value.",
      description: "Product teams should validate whether increasing supply changes customer behavior before scaling production."
    },
    {
      title: "Discovery should change decisions.",
      description: "Customer discovery becomes valuable when it changes what the team prioritizes, measures, and builds."
    }
  ],
  relatedResources: [
    {
      title: "Customer Discovery Decision System",
      description: "How to decide whether the problem is worth solving before choosing a solution path.",
      href: "/decision-systems/customer-discovery"
    },
    {
      title: "Validation & Experimentation",
      description: "How to reduce expensive uncertainty before scaling product investment.",
      href: "/decision-systems/validation-experimentation"
    },
    {
      title: "AI Product Principles",
      description: "The product philosophy behind AI decisions that create customer and business value.",
      href: "/ai-product-principles"
    }
  ],
  continueExploring: [
    {
      title: "Executive Brief",
      description: "Return to the five-minute overview of Product OS and its strongest evidence.",
      href: "/executive"
    },
    {
      title: "Decision Operating System",
      description: "Review the operating principles and decision systems behind Product OS.",
      href: "/decision-operating-system"
    },
    {
      title: "Professional Profile",
      description: "Understand the career context and business outcomes behind the work.",
      href: "/profile"
    },
    {
      title: "Product Leadership Operating Principles",
      description: "See how this brief contributes to the broader product leadership philosophy.",
      href: "/product-leadership-operating-principles"
    }
  ]
};
