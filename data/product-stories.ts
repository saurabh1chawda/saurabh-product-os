export type ProductStory = {
  slug: string;
  hero: {
    title: string;
    company: string;
    timeline: string;
    role: string;
    metric: string;
    summary: string;
    keyTakeaway: string;
  };
  snapshot: Array<{
    label: string;
    value: string;
  }>;
  whyItMattered: string[];
  context: Array<{
    label: string;
    description: string;
  }>;
  options: Array<{
    label: string;
    title: string;
    description: string;
    tradeoff: string;
    chosen?: boolean;
  }>;
  decisionFramework: {
    explanation: string;
    criteria: Array<{
      label: string;
      score: number;
    }>;
  };
  decisionFlow: string[];
  decision: string[];
  timeline: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  results: Array<{
    label: string;
    outcomes: string[];
  }>;
  reflection: Array<{
    question: string;
    answer: string;
  }>;
  beyondProject: string;
  evidence: Array<{
    title: string;
    description: string;
  }>;
  relatedStories: Array<{
    title: string;
    tag: string;
    href: string;
  }>;
};

export const simplilearnJobGuaranteeGrowthStory: ProductStory = {
  slug: "simplilearn-job-guarantee-growth",
  hero: {
    title: "How I Helped Grow Job Guarantee Revenue 10×",
    company: "Simplilearn",
    timeline: "4 months",
    role: "Product Manager, Growth & Monetization",
    metric: "₹1M → ₹10M",
    summary:
      "I owned the product growth diagnosis and helped turn a promising Job Guarantee motion into a repeatable revenue system by tightening the funnel, improving referral loops, and measuring product-led monetization bets.",
    keyTakeaway:
      "I increased confidence in growth decisions by fixing the product system before scaling acquisition."
  },
  snapshot: [
    {
      label: "Problem",
      value:
        "I saw strong learner demand, but the funnel I was measuring did not yet convert intent into predictable paid enrollment at scale."
    },
    {
      label: "Decision",
      value:
        "I prioritized conversion and referral-loop improvements before broad channel expansion, so growth could compound from a stronger product journey."
    },
    {
      label: "Outcome",
      value:
        "Revenue grew from ₹1M to ₹10M in 4 months while I helped the team build a clearer operating model for acquisition, activation, and conversion."
    },
    {
      label: "Business Impact",
      value:
        "My recommendation gave leadership a higher-confidence path to scale a premium career outcome product without relying only on paid acquisition."
    }
  ],
  whyItMattered: [
    "Job Guarantee was a high-trust promise: learners were not just buying content, they were betting on a career outcome.",
    "I treated that trust gap as a product problem. Every weak step in the funnel reduced both conversion and confidence, so I focused on the moments where learners needed clearer proof before moving forward.",
    "I believed that if we improved the decision journey, we could grow revenue while making the proposition easier for learners to understand."
  ],
  context: [
    {
      label: "Customer",
      description:
        "I focused on career-oriented learners who needed to believe that a paid program could credibly help them move into a better job outcome."
    },
    {
      label: "Business",
      description:
        "I worked on a premium program with early revenue traction, leadership attention, and pressure to prove that growth could become repeatable."
    },
    {
      label: "Constraints",
      description:
        "I had to make decisions with limited time, multiple funnel drop-offs, trust-heavy messaging, and a need to improve growth without overcomplicating the learner journey."
    }
  ],
  options: [
    {
      label: "Option A",
      title: "Increase paid acquisition",
      description:
        "I could have recommended pushing more leads into the existing funnel through broader campaigns and channel spend.",
      tradeoff:
        "Fastest way to increase volume, but weak conversion would make spend inefficient and hide the real product journey problems."
    },
    {
      label: "Option B",
      title: "Reposition the offer",
      description:
        "I could have led a broader packaging and messaging shift to make the Job Guarantee promise feel more differentiated.",
      tradeoff:
        "Useful for clarity, but risky as a first move because it could shift the promise before we understood where learners were dropping off."
    },
    {
      label: "Option C",
      title: "Strengthen the funnel and referral loop",
      description:
        "I chose to improve the existing product journey, tighten proof points, reduce decision friction, and use referrals to compound trust.",
      tradeoff:
        "Slower than simply buying traffic, but it addressed the conversion system and created a more durable path to revenue growth.",
      chosen: true
    }
  ],
  decisionFramework: {
    explanation:
      "I evaluated the available options against customer value, business impact, implementation cost, delivery speed, and long-term scalability before selecting the final approach.",
    criteria: [
      {
        label: "Customer Impact",
        score: 5
      },
      {
        label: "Business Impact",
        score: 5
      },
      {
        label: "Engineering Cost",
        score: 3
      },
      {
        label: "Speed to Value",
        score: 4
      },
      {
        label: "Long-term Scalability",
        score: 5
      }
    ]
  },
  decisionFlow: ["Problem", "Three Options", "Chosen Strategy", "Execution", "Measured Outcomes"],
  decision: [
    "I chose to treat the revenue goal as a product-system problem, not only a marketing problem.",
    "My reasoning was simple: if the promise required high trust, then growth depended on the quality of the learner decision journey. I pushed for sharper proof, clearer progression, and more reasons for qualified learners to keep moving.",
    "I influenced the team toward funnel optimization, referral loops, and product-led growth experiments that could improve both confidence and conversion before we scaled acquisition more aggressively."
  ],
  timeline: [
    {
      step: "01",
      title: "Mapped the funnel",
      description:
        "I mapped where learner intent weakened and where the promise needed stronger proof or a clearer next action."
    },
    {
      step: "02",
      title: "Prioritized conversion blockers",
      description:
        "I separated messaging gaps, journey friction, and qualification issues so the team could focus on changes with direct revenue leverage."
    },
    {
      step: "03",
      title: "Improved referral loops",
      description:
        "I used trust from existing learners and advocates to support acquisition quality and make the offer feel more credible."
    },
    {
      step: "04",
      title: "Ran product-led experiments",
      description:
        "I measured funnel, proof, and activation changes with a bias toward movement in qualified conversion."
    },
    {
      step: "05",
      title: "Scaled what worked",
      description:
        "I helped expand the winning motions and translated learnings into a repeatable growth operating rhythm."
    }
  ],
  results: [
    {
      label: "Customer outcomes",
      outcomes: [
        "I clarified the Job Guarantee promise and the steps learners needed to evaluate it.",
        "I helped create a more confidence-building journey from interest to enrollment.",
        "I introduced more trust signals through referral and proof-based decision moments."
      ]
    },
    {
      label: "Business outcomes",
      outcomes: [
        "Revenue grew from ₹1M to ₹10M in 4 months.",
        "I helped make growth less dependent on simply increasing top-of-funnel traffic.",
        "I measured which funnel levers actually moved monetization and helped the team scale those motions."
      ]
    },
    {
      label: "Product outcomes",
      outcomes: [
        "I created a clearer funnel model for acquisition, activation, and conversion.",
        "I left the team with reusable experiments and learnings for future growth motions.",
        "I strengthened the link between product decisions and revenue outcomes."
      ]
    }
  ],
  reflection: [
    {
      question: "What worked?",
      answer:
        "Focusing on the product journey before scaling channels worked. I could improve conversion quality with the team instead of masking friction with more traffic."
    },
    {
      question: "What surprised me?",
      answer:
        "I was surprised by how much trust and clarity mattered even after learners showed strong intent. The offer was compelling, but the journey still had to earn confidence step by step."
    },
    {
      question: "What would I do differently today?",
      answer:
        "I would instrument the journey even earlier, especially around learner confidence signals, so qualitative objections and quantitative funnel data could reinforce each other faster."
    }
  ],
  beyondProject:
    "This project reinforced my belief that sustainable growth comes from improving the product system before increasing acquisition. I continue to apply this principle when evaluating growth opportunities because durable revenue is usually the outcome of better product decisions rather than larger marketing budgets.",
  evidence: [
    {
      title: "PRD",
      description: "Placeholder for the product requirements and decision narrative."
    },
    {
      title: "Funnel",
      description: "Placeholder for funnel analysis, drop-off points, and prioritization inputs."
    },
    {
      title: "Experiment",
      description: "Placeholder for experiment design, variants, and decision criteria."
    },
    {
      title: "Dashboard",
      description: "Placeholder for revenue, conversion, and cohort performance views."
    },
    {
      title: "Wireframes",
      description: "Placeholder for journey, proof-point, or conversion flow artifacts."
    }
  ],
  relatedStories: [
    {
      title: "How I supported payments reliability at 10M+ monthly transaction scale",
      tag: "Comviva · Payments platform",
      href: "/stories/comviva-payments-reliability"
    },
    {
      title: "How I scaled SaaS product engagement and biopharma revenue",
      tag: "JoVE · SaaS product strategy",
      href: "/stories/jove-biopharma-saas-growth"
    },
    {
      title: "How I reduced query latency by 40%",
      tag: "Platform modernization",
      href: "/stories/platform-query-latency-reduction"
    }
  ]
};
