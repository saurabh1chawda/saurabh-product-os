export const capabilities = [
  {
    name: "Growth & Monetization",
    description: "Revenue growth, pricing, conversion, retention, and product-led monetization."
  },
  {
    name: "Platform Strategy",
    description: "Technical systems, internal leverage, architecture trade-offs, and scalable foundations."
  },
  {
    name: "Platform Scale",
    description: "High-volume systems, operating resilience, scalability constraints, and platform performance."
  },
  {
    name: "Payments & Reliability",
    description: "Payment journeys, transaction scale, operational resilience, and trust-critical products."
  },
  {
    name: "Customer Discovery",
    description: "Problem framing, qualitative evidence, product discovery, and journey understanding."
  },
  {
    name: "AI Product Strategy",
    description: "AI product judgment, model-enabled workflows, platform choices, and responsible adoption."
  },
  {
    name: "Leadership & Execution",
    description: "Cross-functional direction, prioritization, delivery rhythm, and outcome accountability."
  }
] as const;

export type CapabilityName = (typeof capabilities)[number]["name"];
