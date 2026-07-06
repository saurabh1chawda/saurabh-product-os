export type JourneyStatus = "Available" | "Coming Soon" | "In Progress" | "Planned";

export type JourneyDestination = {
  href?: string;
  label: string;
  status: JourneyStatus;
};

export type VisitorJourney = {
  description: string;
  destination: JourneyDestination;
  estimatedTime: string;
  futureDestination?: JourneyDestination;
  id: string;
  status: JourneyStatus;
  title: string;
};

export type ContinueExploringItem = {
  description: string;
  destination: JourneyDestination;
  title: string;
};

export const visitorJourneys: VisitorJourney[] = [
  {
    id: "background",
    title: "Get to know my background",
    description: "Understand my experience, business impact, and career progression in just a few minutes.",
    estimatedTime: "≈ 5 min",
    destination: {
      label: "Professional Profile",
      href: "/profile",
      status: "Available"
    },
    status: "Available"
  },
  {
    id: "product-building",
    title: "See how I build products",
    description: "Explore how I approach product strategy, execution, experimentation, and measurable outcomes.",
    estimatedTime: "≈ 12 min",
    destination: {
      label: "Decision Operating System",
      href: "/decision-operating-system",
      status: "Available"
    },
    futureDestination: {
      label: "Case studies",
      status: "Coming Soon"
    },
    status: "In Progress"
  },
  {
    id: "decision-systems",
    title: "Explore my decision systems",
    description: "Understand the principles, frameworks, and operating models that guide how I make product decisions.",
    estimatedTime: "≈ 20 min",
    destination: {
      label: "Decision Operating System",
      href: "/decision-operating-system",
      status: "Available"
    },
    futureDestination: {
      label: "AI Product Playbook",
      href: "/ai-product-playbook",
      status: "In Progress"
    },
    status: "Available"
  },
  {
    id: "engineering-partnership",
    title: "See how I partner with engineering",
    description: "Learn how I collaborate with engineering teams to modernize platforms, build APIs, and deliver scalable AI products.",
    estimatedTime: "≈ 15 min",
    destination: {
      label: "Professional Profile",
      href: "/profile",
      status: "Available"
    },
    futureDestination: {
      label: "Engineering case studies",
      status: "Coming Soon"
    },
    status: "Planned"
  }
];

export const profileContinueExploring: ContinueExploringItem[] = [
  {
    title: "Executive Brief",
    description: "Start with the five-minute executive overview of Product OS, evidence, and business impact.",
    destination: {
      label: "Executive Brief",
      href: "/executive",
      status: "Available"
    }
  },
  {
    title: "Decision Operating System",
    description: "Continue from career context into the decision systems behind the work.",
    destination: {
      label: "Decision Operating System",
      href: "/decision-operating-system",
      status: "Available"
    }
  },
  {
    title: "AI Product Playbook",
    description: "Move from professional context into the operating guide for AI product execution.",
    destination: {
      label: "AI Product Playbook",
      href: "/ai-product-playbook",
      status: "In Progress"
    }
  },
  {
    title: "Product Leadership Operating Principles",
    description: "See the leadership heuristics that connect career outcomes, case studies, and decision systems.",
    destination: {
      label: "Product Leadership Operating Principles",
      href: "/product-leadership-operating-principles",
      status: "Available"
    }
  }
];

export const decisionOsContinueExploring: ContinueExploringItem[] = [
  {
    title: "Executive Brief",
    description: "Return to the concise executive overview of Product OS and its strongest evidence.",
    destination: {
      label: "Executive Brief",
      href: "/executive",
      status: "Available"
    }
  },
  {
    title: "AI Product Playbook",
    description: "Translate the decision system into practical AI product execution patterns.",
    destination: {
      label: "AI Product Playbook",
      href: "/ai-product-playbook",
      status: "In Progress"
    }
  },
  {
    title: "Product Leadership Operating Principles",
    description: "Connect the decision systems to the operating philosophy behind real product leadership decisions.",
    destination: {
      label: "Product Leadership Operating Principles",
      href: "/product-leadership-operating-principles",
      status: "Available"
    }
  }
];
