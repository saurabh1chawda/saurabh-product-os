import type { AiProductPlaybook } from "@/data/ai-product-playbook/types";

export const aiProductPlaybook: AiProductPlaybook = {
  hero: {
    title: "AI Product Playbook",
    headline: "How I build AI products that drive adoption, trust, and measurable business outcomes.",
    supportingCopy:
      "A practical operating guide for identifying high-value AI opportunities, validating customer workflows, designing trustworthy AI experiences, measuring success, and scaling AI products responsibly.",
    primaryCta: {
      label: "Explore the Playbook",
      href: "#playbook-parts"
    },
    secondaryCta: {
      label: "View Product Leadership Briefs",
      href: "/case-studies"
    }
  },
  parts: [
    {
      id: "philosophy",
      title: "Part I — Philosophy",
      description:
        "AI products are not successful because they use advanced models. They succeed when they solve meaningful customer problems with enough reliability, trust, and business value to change real workflows.",
      frameworks: [
        {
          title: "What Makes AI Products Different",
          description: "Clarify where AI changes product risk, user trust, evaluation, and adoption dynamics.",
          status: "Coming Soon",
          category: "Product Philosophy"
        },
        {
          title: "My AI Product Principles",
          description: "Connect AI product decisions to customer value, workflow adoption, trust, and measurable outcomes.",
          href: "/ai-product-principles",
          status: "In Progress",
          category: "Principles"
        },
        {
          title: "Trust Before Automation Model",
          description: "Define when to increase automation depth based on trust, explainability, reversibility, and fallback paths.",
          status: "In Progress",
          category: "Trust"
        }
      ]
    },
    {
      id: "opportunity",
      title: "Part II — Opportunity",
      description:
        "Not every problem deserves an AI solution. Strong AI product work starts by identifying where intelligence, automation, prediction, generation, or decision support can create measurable customer and business value.",
      frameworks: [
        {
          title: "AI Opportunity Scorecard",
          description: "Evaluate AI opportunities through customer value, workflow frequency, readiness, trust risk, business impact, and cost.",
          status: "In Progress",
          category: "Prioritization"
        },
        {
          title: "Problem vs AI Fit",
          description: "Separate meaningful AI opportunities from problems better solved with simpler product, process, or platform changes.",
          status: "Coming Soon",
          category: "Opportunity"
        },
        {
          title: "Build vs Buy vs Partner",
          description: "Decide whether ownership, configuration, partnership, or platformization creates the strongest strategic leverage.",
          href: "/decision-systems/build-vs-buy-ai",
          status: "In Progress",
          category: "Strategy"
        }
      ]
    },
    {
      id: "discovery",
      title: "Part III — Discovery",
      description:
        "AI discovery must go beyond asking users what they want. It requires understanding workflows, failure points, trust gaps, human judgment, data availability, and the cost of being wrong.",
      frameworks: [
        {
          title: "AI Discovery Framework",
          description: "Discover where AI could improve behavior, workflow quality, decision speed, or measurable outcomes.",
          href: "/decision-systems/customer-discovery",
          status: "In Progress",
          category: "Discovery"
        },
        {
          title: "Customer Workflow Mapping",
          description: "Map the work users already do before deciding where AI should assist, generate, recommend, or act.",
          status: "Coming Soon",
          category: "Workflow"
        },
        {
          title: "AI Risk Assessment",
          description: "Identify trust, accuracy, privacy, compliance, workflow, and operational risks before increasing investment.",
          status: "Coming Soon",
          category: "Risk"
        }
      ]
    },
    {
      id: "design",
      title: "Part IV — Design",
      description:
        "AI product design is about deciding where AI should act, where humans should stay in control, what context the system needs, and how users recover when the model is uncertain or wrong.",
      frameworks: [
        {
          title: "RAG vs Agent Framework",
          description: "Choose the simplest architecture that reliably fits the customer workflow, knowledge need, and risk profile.",
          href: "/decision-systems/rag-vs-agent",
          status: "In Progress",
          category: "Architecture"
        },
        {
          title: "Human-in-the-Loop Framework",
          description: "Decide where human review, approval, override, or escalation should remain part of the product experience.",
          status: "Coming Soon",
          category: "Trust"
        },
        {
          title: "AI UX Principles",
          description: "Design AI experiences that feel understandable, recoverable, measurable, and grounded in user workflow.",
          status: "Coming Soon",
          category: "Experience"
        },
        {
          title: "Prompt & Context Strategy",
          description: "Define what context the system needs, how it should be retrieved, and how quality should be evaluated.",
          status: "Coming Soon",
          category: "System Design"
        }
      ]
    },
    {
      id: "delivery",
      title: "Part V — Delivery",
      description:
        "Shipping AI products requires a product operating model that connects experimentation, evaluation, latency, reliability, cost, adoption, and business outcomes.",
      frameworks: [
        {
          title: "AI Product Lifecycle",
          description: "Move from discovery to prototype, pilot, launch, growth, and scale with explicit learning gates.",
          status: "Coming Soon",
          category: "Lifecycle"
        },
        {
          title: "AI Experimentation Framework",
          description: "Validate the riskiest assumption before committing more product, engineering, design, data, or GTM resources.",
          href: "/decision-systems/validation-experimentation",
          status: "In Progress",
          category: "Validation"
        },
        {
          title: "AI Evaluation Framework",
          description: "Connect qualitative review, automated evaluation, production monitoring, and customer behavior signals.",
          status: "Coming Soon",
          category: "Evaluation"
        },
        {
          title: "AI Metrics Framework",
          description: "Measure customer outcomes first, workflow outcomes second, and model metrics as supporting evidence.",
          href: "/decision-systems/ai-success-metrics",
          status: "In Progress",
          category: "Measurement"
        }
      ]
    },
    {
      id: "leadership",
      title: "Part VI — Leadership",
      description:
        "AI product leadership is about making high-quality decisions under uncertainty, aligning technical and business teams, and resisting the temptation to ship impressive technology without durable customer value.",
      frameworks: [
        {
          title: "AI Product Operating System",
          description: "Use repeatable decision systems to evaluate, validate, prioritize, architect, and measure AI products.",
          href: "/decision-operating-system",
          status: "In Progress",
          category: "Operating System"
        },
        {
          title: "Common AI Product Mistakes",
          description: "Recognize patterns that create impressive demos without trustworthy adoption or business value.",
          status: "Coming Soon",
          category: "Leadership"
        },
        {
          title: "Product Principles",
          description: "Translate AI product lessons into durable operating principles for teams and product reviews.",
          href: "/ai-product-principles",
          status: "In Progress",
          category: "Principles"
        },
        {
          title: "Lessons from Product Leadership Briefs",
          description: "Connect playbook concepts to product decisions, trade-offs, execution, and measurable outcomes.",
          href: "/case-studies",
          status: "In Progress",
          category: "Evidence"
        }
      ]
    }
  ],
  featuredFrameworks: [
    {
      title: "AI Opportunity Scorecard",
      description:
        "Evaluate whether an AI opportunity is worth pursuing based on customer value, workflow frequency, data readiness, trust risk, business impact, and operating cost.",
      status: "In Progress",
      category: "Prioritization"
    },
    {
      title: "Workflow-to-Agent Framework",
      description: "Determine when a workflow should remain manual, become AI-assisted, or evolve into an agentic experience.",
      status: "Coming Soon",
      category: "Architecture"
    },
    {
      title: "Trust Before Automation Model",
      description: "Prioritize user trust, explainability, reversibility, and fallback paths before increasing automation depth.",
      status: "In Progress",
      category: "Trust"
    },
    {
      title: "AI Product Readiness Matrix",
      description: "Assess whether the product, data, user workflow, evaluation loop, and organization are ready for AI execution.",
      status: "Coming Soon",
      category: "Readiness"
    },
    {
      title: "Evidence-Driven AI Prioritization Canvas",
      description:
        "Prioritize AI initiatives using evidence quality, customer pain, strategic leverage, implementation risk, and measurable business outcomes.",
      status: "Coming Soon",
      category: "Strategy"
    }
  ],
  relatedResources: [
    {
      title: "Executive Brief",
      description: "The five-minute overview for recruiters, hiring managers, and product leaders.",
      cta: "Open executive brief",
      href: "/executive"
    },
    {
      title: "Decision Operating System",
      description: "The decision frameworks behind Product OS.",
      cta: "Explore decision systems",
      href: "/decision-operating-system"
    },
    {
      title: "Product Leadership Briefs",
      description: "Real product decisions where these principles are applied.",
      cta: "View case studies",
      href: "/case-studies"
    },
    {
      title: "Professional Profile",
      description: "Career context, business outcomes, and product capabilities.",
      cta: "View profile",
      href: "/profile"
    },
    {
      title: "Product Leadership Operating Principles",
      description: "The leadership heuristics connecting AI product thinking to real product decisions.",
      cta: "Explore operating principles",
      href: "/product-leadership-operating-principles"
    }
  ],
  continueExploring: [
    {
      title: "Executive Brief",
      description: "Return to the concise executive overview of Product OS, evidence, and business impact.",
      href: "/executive"
    },
    {
      title: "Product Leadership Brief: JoVE",
      description: "See how workflow adoption became the stronger product decision than content expansion.",
      href: "/case-studies/jove"
    },
    {
      title: "Decision Operating System",
      description: "Explore the completed v1 decision system behind the AI Product Playbook.",
      href: "/decision-operating-system"
    },
    {
      title: "Professional Profile",
      description: "Review career context, business outcomes, and product capabilities.",
      href: "/profile"
    },
    {
      title: "Product Leadership Operating Principles",
      description: "See the product leadership philosophy that connects the playbook, case studies, and decision systems.",
      href: "/product-leadership-operating-principles"
    }
  ]
};
