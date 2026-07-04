import type { AIProductStudioData } from "@/data/ai-product-playbook/types";

export const aiProductStudio: AIProductStudioData = {
  title: "AI Product Studio",
  subtitle:
    "A guided product design review for evaluating whether an AI idea should be built, how much automation it should use, and what trust safeguards are required before launch.",
  steps: [
    {
      id: "customer-problem",
      step: "Step 1",
      title: "Define the Customer Problem",
      purpose: "AI product work should begin with a customer workflow, not a model capability.",
      question: "What customer problem are we trying to solve?",
      guidance:
        "Start by describing the workflow, user pain, frequency, cost of failure, and business outcome. If the customer problem is weak, AI will only make the product more complex.",
      fields: [
        {
          title: "User workflow",
          description: "The repeated task, journey, or decision the customer is already trying to complete."
        },
        {
          title: "Pain intensity",
          description: "How painful the current workflow is, and whether users already spend effort avoiding or fixing it."
        },
        {
          title: "Frequency",
          description: "How often the workflow happens and whether the pain is occasional, recurring, or mission-critical."
        },
        {
          title: "Cost of failure",
          description: "What happens when the workflow breaks, produces the wrong answer, or creates delay."
        },
        {
          title: "Business outcome",
          description: "The measurable customer or business result the product decision should improve."
        }
      ],
      output: "Problem clarity",
      status: "Foundation step"
    },
    {
      id: "ai-opportunity",
      step: "Step 2",
      title: "Assess AI Opportunity",
      framework: "AI Opportunity Scorecard",
      purpose:
        "Decide whether AI is the right solution or whether a simpler workflow, rules engine, or UX improvement would create more value.",
      criteria: [
        { title: "Customer pain", description: "Is the pain meaningful enough to justify additional product complexity?" },
        { title: "Workflow frequency", description: "Does the workflow happen often enough for AI assistance to compound value?" },
        { title: "Data readiness", description: "Is there enough usable data or context to support reliable AI behavior?" },
        { title: "Trust sensitivity", description: "Would customers trust the system when outputs influence real decisions?" },
        { title: "Business value", description: "Can the opportunity move adoption, retention, efficiency, revenue, or cost?" },
        { title: "Cost of error", description: "What happens when the AI response is wrong, incomplete, late, or hard to explain?" },
        { title: "Model cost", description: "Will inference, evaluation, monitoring, and operations fit the product economics?" },
        { title: "Strategic fit", description: "Does the capability reinforce the product strategy rather than chase novelty?" }
      ],
      outputExamples: ["Strong AI fit", "AI-assisted fit", "Rules-based fit", "Not an AI problem yet"],
      output: "AI fit assessment",
      status: "Scorecard review"
    },
    {
      id: "automation-depth",
      step: "Step 3",
      title: "Choose Automation Depth",
      framework: "Workflow-to-Agent Framework",
      purpose:
        "Determine whether the workflow should remain manual, become AI-assisted, become a copilot experience, or evolve into an agentic workflow.",
      decisionFactors: [
        "Decision complexity",
        "Need for human judgment",
        "Reversibility",
        "Error risk",
        "User trust",
        "Regulatory sensitivity"
      ],
      output: "Appropriate automation depth",
      status: "Automation review"
    },
    {
      id: "trust",
      step: "Step 4",
      title: "Evaluate Trust Before Automation",
      framework: "Trust Before Automation Model",
      purpose: "Evaluate whether the product has enough trust infrastructure before increasing automation.",
      outputExamples: [
        "Ready for assisted AI",
        "Needs human-in-the-loop",
        "Not ready for automation",
        "Requires stronger safeguards"
      ],
      output: "Trust readiness level",
      status: "Safeguard review"
    },
    {
      id: "recommendation",
      step: "Step 5",
      title: "Generate Product Recommendation",
      purpose: "Synthesize the previous steps into a product strategy that connects AI fit, architecture, trust, risk, and measurable outcomes.",
      output: "Recommended AI Product Strategy",
      status: "Recommendation panel"
    }
  ],
  automationLadder: [
    {
      id: "manual",
      level: "1",
      title: "Manual workflow",
      description: "Keep the workflow human-led when the problem is unclear, low-frequency, high-risk, or better solved through product clarity."
    },
    {
      id: "assisted",
      level: "2",
      title: "AI-assisted workflow",
      description: "Use AI to summarize, suggest, retrieve, classify, or reduce effort while the user remains clearly in control."
    },
    {
      id: "copilot",
      level: "3",
      title: "Copilot",
      description: "Help the user complete a workflow faster with contextual recommendations and clear review points.",
      isDefault: true
    },
    {
      id: "agent-approval",
      level: "4",
      title: "Agent with human approval",
      description: "Let the system prepare or execute multi-step actions only when a human can review, approve, reverse, or escalate."
    },
    {
      id: "autonomous",
      level: "5",
      title: "Autonomous agent",
      description: "Use autonomy only when trust, observability, safeguards, reversibility, and business value are already proven."
    }
  ],
  trustChecklist: [
    { title: "Explainability", description: "Users can understand why the system made a recommendation or took an action." },
    { title: "User control", description: "Users can accept, reject, edit, pause, or override the AI experience." },
    { title: "Reversibility", description: "Wrong actions can be undone without creating customer or business damage." },
    { title: "Human escalation", description: "The product defines when and how a human should intervene." },
    { title: "Fallback path", description: "The workflow remains usable when AI confidence, context, or availability is weak." },
    { title: "Auditability", description: "Important decisions can be reviewed through logs, context, source data, or change history." },
    { title: "Accuracy expectations", description: "The product sets realistic expectations instead of implying certainty." },
    { title: "Failure communication", description: "The user knows when the system is uncertain, incomplete, delayed, or unable to act." }
  ],
  recommendation: {
    aiFit: "High",
    architecture: "AI Copilot with human approval",
    trustModel: "Human-in-the-loop with explainability, fallback, and audit trail",
    primaryRisks: ["Trust", "Data quality", "Cost of error"],
    successMetrics: [
      "Task completion rate",
      "Acceptance rate",
      "Time saved",
      "Human override rate",
      "Customer trust score",
      "Business outcome lift"
    ],
    nextStep: "Run a limited workflow pilot before scaling automation."
  },
  relatedEvidence: [
    {
      title: "JoVE Product Leadership Brief",
      description: "Workflow adoption before content expansion.",
      cta: "Read JoVE brief",
      href: "/case-studies/jove"
    },
    {
      title: "Decision Operating System",
      description: "The decision framework behind Product OS.",
      cta: "Explore decision system",
      href: "/decision-operating-system"
    },
    {
      title: "Professional Profile",
      description: "Career context, outcomes, and product leadership signals.",
      cta: "View profile",
      href: "/profile"
    }
  ]
};
