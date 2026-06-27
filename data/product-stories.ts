export type ProductStory = {
  slug: string;
  hero: {
    title: string;
    company: string;
    timeline: string;
    role: string;
    metric: string;
    summary: string;
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
      "I helped turn a promising Job Guarantee motion into a repeatable growth system by tightening the funnel, improving referral loops, and sequencing product-led monetization bets."
  },
  snapshot: [
    {
      label: "Problem",
      value:
        "The Job Guarantee offering had demand, but the funnel did not yet convert intent into predictable paid enrollment at scale."
    },
    {
      label: "Decision",
      value:
        "Prioritize conversion and referral-loop improvements before broad channel expansion, so growth could compound from a stronger product journey."
    },
    {
      label: "Outcome",
      value:
        "Revenue grew from ₹1M to ₹10M in 4 months while the team built a clearer operating model for acquisition, activation, and conversion."
    },
    {
      label: "Business Impact",
      value:
        "The motion gave leadership a higher-confidence path to scale a premium career outcome product without relying only on paid acquisition."
    }
  ],
  whyItMattered: [
    "Job Guarantee was a high-trust promise: learners were not just buying content, they were betting on a career outcome.",
    "That made the product journey unusually sensitive to clarity, proof, and confidence. Every weak step in the funnel reduced both conversion and trust.",
    "If we could improve the decision journey, the business could grow revenue while also making the proposition easier for learners to understand."
  ],
  context: [
    {
      label: "Customer",
      description:
        "Career-focused learners evaluating whether a paid program could credibly help them move into a better job outcome."
    },
    {
      label: "Business",
      description:
        "A premium program with early revenue traction, leadership attention, and pressure to prove that growth could become repeatable."
    },
    {
      label: "Constraints",
      description:
        "Limited time, multiple funnel drop-offs, trust-heavy messaging, and the need to improve growth without overcomplicating the learner journey."
    }
  ],
  options: [
    {
      label: "Option A",
      title: "Increase paid acquisition",
      description:
        "Push more leads into the existing funnel through broader campaigns and channel spend.",
      tradeoff:
        "Fastest way to increase volume, but weak conversion would make spend inefficient and hide the real product journey problems."
    },
    {
      label: "Option B",
      title: "Reposition the offer",
      description:
        "Change the program packaging and messaging to make the Job Guarantee promise feel more differentiated.",
      tradeoff:
        "Useful for clarity, but risky as a first move because it could shift the promise before we understood where learners were dropping off."
    },
    {
      label: "Option C",
      title: "Strengthen the funnel and referral loop",
      description:
        "Improve the existing product journey, tighten proof points, reduce decision friction, and use referrals to compound trust.",
      tradeoff:
        "Slower than simply buying traffic, but it addressed the conversion system and created a more durable path to revenue growth.",
      chosen: true
    }
  ],
  decision: [
    "I chose to treat the revenue goal as a product-system problem, not only a marketing problem.",
    "The reasoning was simple: if the promise required high trust, then growth depended on the quality of the learner decision journey. We needed sharper proof, clearer progression, and more reasons for qualified learners to keep moving.",
    "That pushed the work toward funnel optimization, referral loops, and product-led growth experiments that could improve both confidence and conversion before scaling more aggressively."
  ],
  timeline: [
    {
      step: "01",
      title: "Mapped the funnel",
      description:
        "Identified the steps where learner intent weakened and where the promise needed stronger proof or clearer next action."
    },
    {
      step: "02",
      title: "Prioritized conversion blockers",
      description:
        "Separated messaging gaps, journey friction, and qualification issues so the team could focus on changes with direct revenue leverage."
    },
    {
      step: "03",
      title: "Improved referral loops",
      description:
        "Used trust from existing learners and advocates to support acquisition quality and make the offer feel more credible."
    },
    {
      step: "04",
      title: "Ran product-led experiments",
      description:
        "Tested funnel, proof, and activation changes with a bias toward measurable movement in qualified conversion."
    },
    {
      step: "05",
      title: "Scaled what worked",
      description:
        "Expanded the winning motions and translated learnings into a repeatable growth operating rhythm."
    }
  ],
  results: [
    {
      label: "Customer outcomes",
      outcomes: [
        "Clearer understanding of the Job Guarantee promise and the steps needed to evaluate it.",
        "A more confidence-building journey from interest to enrollment.",
        "More trust signals through referral and proof-based decision moments."
      ]
    },
    {
      label: "Business outcomes",
      outcomes: [
        "Revenue grew from ₹1M to ₹10M in 4 months.",
        "Growth became less dependent on simply increasing top-of-funnel traffic.",
        "The team gained a stronger view of which funnel levers actually moved monetization."
      ]
    },
    {
      label: "Product outcomes",
      outcomes: [
        "A clearer funnel model for acquisition, activation, and conversion.",
        "Reusable experiments and learnings for future growth motions.",
        "A tighter link between product decisions and revenue outcomes."
      ]
    }
  ],
  reflection: [
    {
      question: "What worked?",
      answer:
        "Focusing on the product journey before scaling channels. The team could improve conversion quality instead of masking friction with more traffic."
    },
    {
      question: "What surprised me?",
      answer:
        "How much trust and clarity mattered even after learners showed strong intent. The offer was compelling, but the journey still had to earn confidence step by step."
    },
    {
      question: "What would I do differently today?",
      answer:
        "I would instrument the journey even earlier, especially around learner confidence signals, so qualitative objections and quantitative funnel data could reinforce each other faster."
    }
  ],
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
