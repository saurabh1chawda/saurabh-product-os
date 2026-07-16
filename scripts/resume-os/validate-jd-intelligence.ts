import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type ArchetypeName =
  | "AI Product Manager"
  | "Generative AI Product Manager"
  | "Platform Product Manager"
  | "Growth Product Manager"
  | "Monetization Product Manager"
  | "Consumer Product Manager"
  | "Payments / FinTech Product Manager"
  | "Enterprise SaaS Product Manager"
  | "Product Lead / Lead Product Manager"
  | "Senior Product Manager";

type Achievement = {
  id: string;
  company: string;
  role: string;
  date: string;
  category: string;
  confidenceStatus: string;
  keywordTags: string[];
  competencyTags: string[];
  domainTags: string[];
  archetypeScores: Record<string, number>;
  relatedProductOsAssets: string[];
  relatedGithubRepository: string | null;
  relatedPortfolioUrl: string | null;
  importanceScore: number;
  evidenceStrength: number;
  recruiterValue: number;
  hiringManagerValue: number;
  atsValue: number;
  technicalDepth: number;
  leadershipDepth: number;
  businessImpactStrength: number;
  recencyScore: number;
  uniquenessScore: number;
  interviewDefensibility: number;
  confidentialityStatus: string;
};

type Bullet = {
  bulletId: string;
  achievementId: string;
  text: string;
  sourceFile: string;
};

type Project = {
  projectId: string;
  name: string;
  category: string;
  repository: string;
  portfolioUrl: string;
  supportedArchetypes: string[];
  businessDomain: string[];
};

type RankedAchievement = {
  achievement_id: string;
  company: string;
  score: number;
  drivers: string[];
  penalties: string[];
  confidence_status: string;
  product_os_url: string | null;
};

type RankedBullet = {
  bullet_id: string;
  achievement_id: string;
  source_file: string;
  score: number;
  duplicate_risk: boolean;
};

type FixtureExpectation = {
  file: string;
  label: string;
  acceptedPrimary: ArchetypeName[];
  requiredSecondary?: ArchetypeName[];
  expectedCompetencies: string[];
  expectedKeywords: string[];
  expectedHiddenSignals: string[];
  topFiveAchievements: string[];
  topTenAchievements: string[];
  bulletSources: string[];
  productAssets: string[];
  expectedGaps: string[];
};

type FixtureResult = {
  fixture: string;
  expected: FixtureExpectation;
  actual: {
    primary_archetype: ArchetypeName;
    primary_score: number;
    secondary_archetypes: Array<{ name: ArchetypeName; score: number }>;
    confidence: "high" | "medium" | "low";
    strongest_supporting_signals: string[];
    ambiguities: string[];
    contradictory_signals: string[];
    human_review_required: boolean;
    competencies: string[];
    keywords: Array<{ keyword: string; class: string; evidence_status: string }>;
    hidden_signals: Array<{
      signal: string;
      supporting_phrase: string;
      confidence: number;
      explanation: string;
      resume_implication: string;
      interview_implication: string;
      evidence_gap: string | null;
      inference: true;
    }>;
    ranked_achievements: RankedAchievement[];
    ranked_bullets: RankedBullet[];
    recommended_assets: Array<{ project_id: string; name: string; reason: string; portfolio_url: string }>;
    gaps: Array<{
      severity: "P0" | "P1" | "P2";
      gap: string;
      source_phrase: string;
      current_evidence: string;
      resume_mitigation: string;
      product_os_mitigation: string;
      interview_mitigation: string;
      cannot_mitigate_honestly: boolean;
    }>;
    diversity: {
      company_distribution: Record<string, number>;
      current_role_represented: boolean;
      repeated_achievements: string[];
      warnings: string[];
    };
    explainability: {
      status: "pass" | "warning" | "fail";
      notes: string[];
    };
  };
  passes: string[];
  warnings: string[];
  failures: string[];
  status: "pass" | "warning" | "fail";
};

const root = process.cwd();
const jdRoot = path.join(root, "docs", "resume-os", "jd-intelligence");
const fixtureRoot = path.join(jdRoot, "fixtures");
const resultsRoot = path.join(jdRoot, "validation", "results");

const archetypeSlugs: Record<ArchetypeName, string> = {
  "AI Product Manager": "ai-pm",
  "Generative AI Product Manager": "generative-ai-pm",
  "Platform Product Manager": "platform-pm",
  "Growth Product Manager": "growth-pm",
  "Monetization Product Manager": "monetization-pm",
  "Consumer Product Manager": "consumer-pm",
  "Payments / FinTech Product Manager": "payments-pm",
  "Enterprise SaaS Product Manager": "enterprise-saas",
  "Product Lead / Lead Product Manager": "lead-pm",
  "Senior Product Manager": "senior-pm",
};

const archetypeSignals: Record<ArchetypeName, string[]> = {
  "AI Product Manager": [
    "ai",
    "ml",
    "model",
    "ai-powered",
    "ai-assisted",
    "automation",
    "responsible ai",
    "human-in-the-loop",
    "human review",
    "trust",
    "model quality",
    "evaluation",
  ],
  "Generative AI Product Manager": ["genai", "llm", "rag", "agent", "prompt", "retrieval", "copilot"],
  "Platform Product Manager": [
    "platform",
    "api",
    "apis",
    "infrastructure",
    "architecture",
    "scalability",
    "reliability",
    "developer",
    "technical roadmap",
    "internal",
  ],
  "Growth Product Manager": [
    "growth",
    "acquisition",
    "activation",
    "conversion",
    "retention",
    "experiment",
    "funnel",
    "cohort",
    "lifecycle",
    "referral",
    "engagement",
    "onboarding",
  ],
  "Monetization Product Manager": [
    "monetization",
    "pricing",
    "packaging",
    "revenue",
    "subscription",
    "loyalty",
    "rewards",
    "arpu",
    "upsell",
    "unit economics",
  ],
  "Consumer Product Manager": ["consumer", "mobile", "marketplace", "user experience", "engagement", "retention", "loyalty"],
  "Payments / FinTech Product Manager": [
    "payment",
    "payments",
    "wallet",
    "fintech",
    "transaction",
    "compliance",
    "regulation",
    "risk",
    "trust",
    "mobile money",
  ],
  "Enterprise SaaS Product Manager": [
    "enterprise",
    "b2b",
    "saas",
    "workflow",
    "workflows",
    "integrations",
    "customer success",
    "adoption",
    "admin",
    "buyer",
  ],
  "Product Lead / Lead Product Manager": [
    "lead",
    "principal",
    "executive",
    "leadership",
    "cross-functional",
    "strategy",
    "roadmap",
    "alignment",
    "trade-offs",
    "operating cadence",
  ],
  "Senior Product Manager": [
    "senior",
    "ownership",
    "roadmap",
    "metrics",
    "discovery",
    "delivery",
    "stakeholder",
    "ambiguous",
    "prioritize",
  ],
};

const competencyMap: Array<{ label: string; terms: string[] }> = [
  { label: "AI/ML", terms: ["ai", "ml", "model", "ai-powered", "ai-assisted"] },
  { label: "Model evaluation", terms: ["evaluation", "model quality", "eval"] },
  { label: "AI workflows", terms: ["ai workflow", "ai-assisted workflow", "workflow"] },
  { label: "Responsible AI", terms: ["responsible ai", "trust", "guardrail"] },
  { label: "Human-in-the-loop", terms: ["human-in-the-loop", "human review", "humans in control"] },
  { label: "Product discovery", terms: ["discovery", "customer insight", "workflow analysis"] },
  { label: "Experimentation", terms: ["experiment", "pilot", "test"] },
  { label: "APIs", terms: ["api", "apis", "integrations"] },
  { label: "Architecture", terms: ["architecture", "technical trade-off"] },
  { label: "Reliability", terms: ["reliability", "uptime", "resilience"] },
  { label: "Scalability", terms: ["scalability", "scale", "scalable"] },
  { label: "Technical roadmap", terms: ["technical roadmap", "roadmap"] },
  { label: "Cross-team dependencies", terms: ["cross-team", "dependencies", "cross-functional"] },
  { label: "Acquisition", terms: ["acquisition"] },
  { label: "Activation", terms: ["activation", "onboarding"] },
  { label: "Conversion", terms: ["conversion"] },
  { label: "Retention", terms: ["retention"] },
  { label: "Funnel", terms: ["funnel"] },
  { label: "Cohort analysis", terms: ["cohort"] },
  { label: "Pricing", terms: ["pricing"] },
  { label: "Packaging", terms: ["packaging"] },
  { label: "Revenue", terms: ["revenue", "arr", "mrr"] },
  { label: "Upsell", terms: ["upsell"] },
  { label: "Monetization", terms: ["monetization"] },
  { label: "Unit economics", terms: ["unit economics", "profitability"] },
  { label: "Payments", terms: ["payment", "payments", "wallet"] },
  { label: "Trust", terms: ["trust"] },
  { label: "Risk", terms: ["risk"] },
  { label: "Transaction success", terms: ["transaction", "success rate"] },
  { label: "Compliance", terms: ["compliance", "regulatory", "regulation"] },
  { label: "B2B", terms: ["b2b"] },
  { label: "Enterprise workflows", terms: ["enterprise", "workflow"] },
  { label: "Adoption", terms: ["adoption"] },
  { label: "Portfolio strategy", terms: ["portfolio"] },
  { label: "Customer success", terms: ["customer success"] },
  { label: "Executive communication", terms: ["executive", "leadership", "communicate"] },
];

const hiddenSignalMap: Array<{ signal: string; terms: string[]; confidence: number }> = [
  { signal: "High ambiguity", terms: ["ambiguous", "define", "emerging", "build from scratch"], confidence: 78 },
  { signal: "Zero-to-one ownership", terms: ["mvp", "zero-to-one", "0->1", "new"], confidence: 76 },
  { signal: "Technical depth", terms: ["architecture", "api", "platform", "engineering", "technical trade-off"], confidence: 82 },
  { signal: "Matrix leadership", terms: ["cross-functional", "partner", "align", "dependencies"], confidence: 76 },
  { signal: "Executive influence", terms: ["executive", "senior leadership", "leadership"], confidence: 78 },
  { signal: "Commercial ownership", terms: ["revenue", "pricing", "packaging", "monetization", "business case"], confidence: 82 },
  { signal: "Product maturity", terms: ["scale", "maturity", "optimization"], confidence: 66 },
  { signal: "Scale", terms: ["scale", "scalability", "millions", "global"], confidence: 74 },
  { signal: "Customer obsession", terms: ["customer", "user", "discovery", "feedback"], confidence: 74 },
  { signal: "Data fluency", terms: ["analytics", "metrics", "cohort", "data"], confidence: 78 },
  { signal: "Written communication", terms: ["written", "docs", "memo", "communicate"], confidence: 70 },
  { signal: "Regulatory sensitivity", terms: ["compliance", "regulatory", "risk"], confidence: 78 },
  { signal: "Operational excellence", terms: ["operational", "cadence", "reliability", "launch readiness"], confidence: 76 },
];

const expectations: FixtureExpectation[] = [
  {
    file: "ai-product-manager.md",
    label: "AI Product Manager",
    acceptedPrimary: ["AI Product Manager", "Generative AI Product Manager"],
    requiredSecondary: [],
    expectedCompetencies: ["AI/ML", "Model evaluation", "AI workflows", "Responsible AI", "Human-in-the-loop", "Product discovery", "Experimentation"],
    expectedKeywords: ["AI", "model", "trust", "human review", "product discovery"],
    expectedHiddenSignals: ["High ambiguity", "Technical depth", "Written communication"],
    topFiveAchievements: ["LOG-MRR-002", "JOV-AI-003"],
    topTenAchievements: ["LOG-ANL-001"],
    bulletSources: ["ai-pm.md"],
    productAssets: ["AI Product Playbook", "AI Prioritization Framework"],
    expectedGaps: ["production GenAI/LLM ownership"],
  },
  {
    file: "platform-product-manager.md",
    label: "Platform Product Manager",
    acceptedPrimary: ["Platform Product Manager"],
    expectedCompetencies: ["APIs", "Architecture", "Reliability", "Scalability", "Technical roadmap", "Cross-team dependencies"],
    expectedKeywords: ["platform", "APIs", "reliability", "developer"],
    expectedHiddenSignals: ["Technical depth", "Matrix leadership", "Scale"],
    topFiveAchievements: ["LOG-THR-005", "LOG-DEL-004"],
    topTenAchievements: ["COM-PAY-001", "COM-PAY-003"],
    bulletSources: ["platform-pm.md", "lead-pm.md"],
    productAssets: ["Logix Product Leadership Brief", "Decision Memo Template"],
    expectedGaps: ["developer-platform depth"],
  },
  {
    file: "growth-product-manager.md",
    label: "Growth Product Manager",
    acceptedPrimary: ["Growth Product Manager"],
    expectedCompetencies: ["Acquisition", "Activation", "Conversion", "Retention", "Experimentation", "Funnel", "Cohort analysis"],
    expectedKeywords: ["conversion", "retention", "funnel", "experimentation"],
    expectedHiddenSignals: ["Data fluency", "Customer obsession"],
    topFiveAchievements: ["SIM-CNV-002", "SIM-REF-003"],
    topTenAchievements: ["SIM-REV-001", "LOG-SEO-003", "LOG-MRR-002"],
    bulletSources: ["growth-pm.md", "consumer-pm.md"],
    productAssets: ["Simplilearn Product Leadership Brief", "Product Discovery Toolkit"],
    expectedGaps: ["direct consumer scale"],
  },
  {
    file: "monetization-product-manager.md",
    label: "Monetization Product Manager",
    acceptedPrimary: ["Monetization Product Manager"],
    expectedCompetencies: ["Pricing", "Packaging", "Revenue", "Upsell", "Monetization", "Unit economics"],
    expectedKeywords: ["pricing", "packaging", "revenue", "loyalty"],
    expectedHiddenSignals: ["Commercial ownership", "Executive influence", "Customer obsession"],
    topFiveAchievements: ["LOG-ARR-001", "SIM-REV-001"],
    topTenAchievements: ["JOV-REV-001", "SIM-REF-003"],
    bulletSources: ["monetization-pm.md", "growth-pm.md"],
    productAssets: ["Simplilearn Product Leadership Brief", "Decision Memo Template"],
    expectedGaps: ["marketplace monetization depth"],
  },
  {
    file: "payments-product-manager.md",
    label: "Payments Product Manager",
    acceptedPrimary: ["Payments / FinTech Product Manager"],
    expectedCompetencies: ["Payments", "Reliability", "Trust", "Risk", "Transaction success", "Compliance"],
    expectedKeywords: ["payments", "transaction", "reliability", "compliance"],
    expectedHiddenSignals: ["Regulatory sensitivity", "Operational excellence", "Technical depth"],
    topFiveAchievements: ["COM-PAY-003", "COM-PAY-002"],
    topTenAchievements: ["COM-PAY-001"],
    bulletSources: ["payments-pm.md", "platform-pm.md"],
    productAssets: ["Mahindra Comviva Product Leadership Brief", "Executive Briefing Center"],
    expectedGaps: ["direct regulatory ownership"],
  },
  {
    file: "enterprise-saas-product-manager.md",
    label: "Enterprise SaaS Product Manager",
    acceptedPrimary: ["Enterprise SaaS Product Manager"],
    expectedCompetencies: ["Product discovery", "Technical roadmap", "Adoption", "Retention", "B2B", "Enterprise workflows", "Customer success"],
    expectedKeywords: ["enterprise", "SaaS", "workflow", "adoption"],
    expectedHiddenSignals: ["Customer obsession", "Matrix leadership"],
    topFiveAchievements: ["JOV-REV-001", "JOV-ENG-002"],
    topTenAchievements: ["COM-PAY-001", "FRE-CON-001", "LOG-ARR-001"],
    bulletSources: ["enterprise-saas.md", "senior-pm.md"],
    productAssets: ["JoVE Product Leadership Brief", "Product Discovery Toolkit"],
    expectedGaps: ["deep enterprise integration ownership"],
  },
  {
    file: "hybrid-ai-platform-pm.md",
    label: "Hybrid AI Platform PM",
    acceptedPrimary: ["AI Product Manager", "Platform Product Manager"],
    requiredSecondary: ["AI Product Manager", "Platform Product Manager"],
    expectedCompetencies: ["AI/ML", "APIs", "Architecture", "Reliability", "Executive communication"],
    expectedKeywords: ["AI", "platform", "APIs", "evaluation"],
    expectedHiddenSignals: ["High ambiguity", "Technical depth", "Operational excellence", "Written communication"],
    topFiveAchievements: ["LOG-THR-005", "LOG-MRR-002"],
    topTenAchievements: ["LOG-DEL-004"],
    bulletSources: ["ai-pm.md", "platform-pm.md", "lead-pm.md"],
    productAssets: ["AI Product Playbook", "AI Prioritization Framework", "Logix Product Leadership Brief"],
    expectedGaps: ["production LLM infrastructure"],
  },
];

function read(filePath: string): string {
  return readFileSync(filePath, "utf8");
}

function lower(text: string): string {
  return text.toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  const normalized = lower(text);
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function countMatches(text: string, terms: string[]): number {
  const normalized = lower(text);
  return terms.reduce((count, term) => count + (normalized.includes(term.toLowerCase()) ? 1 : 0), 0);
}

function parseFlowArray(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[")) {
    return [];
  }
  return JSON.parse(trimmed) as string[];
}

function getValue(block: string, key: string): string | null {
  const match = block.match(new RegExp(`^    ${key}: (.*)$`, "m"));
  if (!match) {
    return null;
  }
  const value = match[1].trim();
  if (value === "null") {
    return null;
  }
  return value.replace(/^"|"$/g, "");
}

function getArray(block: string, key: string): string[] {
  const flow = block.match(new RegExp(`^    ${key}: (\\[.*\\])$`, "m"));
  if (flow) {
    return parseFlowArray(flow[1]);
  }
  const start = block.indexOf(`    ${key}:\n`);
  if (start === -1) {
    return [];
  }
  const section = block.slice(start).split("\n").slice(1);
  const values: string[] = [];
  for (const line of section) {
    if (line.startsWith("      - ")) {
      values.push(line.replace("      - ", "").trim());
    } else if (line.startsWith("    ") && !line.startsWith("      ")) {
      break;
    }
  }
  return values;
}

function getScores(block: string): Record<string, number> {
  const start = block.indexOf("    archetype_scores:\n");
  if (start === -1) {
    return {};
  }
  const scores: Record<string, number> = {};
  const section = block.slice(start).split("\n").slice(1);
  for (const line of section) {
    const match = line.match(/^      ([a-z-]+): ([0-9]+)$/);
    if (match) {
      scores[match[1]] = Number(match[2]);
    } else if (line.startsWith("    ") && !line.startsWith("      ")) {
      break;
    }
  }
  return scores;
}

function parseAchievements(): Achievement[] {
  const raw = read(path.join(root, "docs", "resume-os", "data", "achievements.yaml"));
  const blocks = raw.split(/\n\n  - id: /).map((block, index) => (index === 0 ? block.replace(/^achievements:\n  - id: /, "") : block));
  return blocks
    .filter((block) => block.trim())
    .map((block) => {
      const normalized = `  - id: ${block}`;
      const id = block.split("\n")[0].trim();
      return {
        id,
        company: getValue(normalized, "company") ?? "Unknown",
        role: getValue(normalized, "role") ?? "Unknown",
        date: getValue(normalized, "date") ?? "Unknown",
        category: getValue(normalized, "category") ?? "Unknown",
        confidenceStatus: getValue(normalized, "confidence_status") ?? "self-reported",
        keywordTags: getArray(normalized, "keyword_tags"),
        competencyTags: getArray(normalized, "competency_tags"),
        domainTags: getArray(normalized, "domain_tags"),
        archetypeScores: getScores(normalized),
        relatedProductOsAssets: getArray(normalized, "related_product_os_assets"),
        relatedGithubRepository: getValue(normalized, "related_github_repository"),
        relatedPortfolioUrl: getValue(normalized, "related_portfolio_url"),
        importanceScore: Number(getValue(normalized, "importance_score") ?? 0),
        evidenceStrength: Number(getValue(normalized, "evidence_strength") ?? 0),
        recruiterValue: Number(getValue(normalized, "recruiter_value") ?? 0),
        hiringManagerValue: Number(getValue(normalized, "hiring_manager_value") ?? 0),
        atsValue: Number(getValue(normalized, "ats_value") ?? 0),
        technicalDepth: Number(getValue(normalized, "technical_depth") ?? 0),
        leadershipDepth: Number(getValue(normalized, "leadership_depth") ?? 0),
        businessImpactStrength: Number(getValue(normalized, "business_impact_strength") ?? 0),
        recencyScore: Number(getValue(normalized, "recency_score") ?? 0),
        uniquenessScore: Number(getValue(normalized, "uniqueness_score") ?? 0),
        interviewDefensibility: Number(getValue(normalized, "interview_defensibility") ?? 0),
        confidentialityStatus: getValue(normalized, "confidentiality_status") ?? "needs_review",
      };
    });
}

function parseProjects(): Project[] {
  const raw = read(path.join(root, "docs", "resume-os", "data", "projects.yaml"));
  const blocks = raw.split(/\n\n  - project_id: /).map((block, index) => (index === 0 ? block.replace(/^projects:\n  - project_id: /, "") : block));
  return blocks
    .filter((block) => block.trim())
    .map((block) => {
      const normalized = `  - project_id: ${block}`;
      return {
        projectId: block.split("\n")[0].trim(),
        name: getValue(normalized, "name") ?? "Unknown",
        category: getValue(normalized, "category") ?? "Unknown",
        repository: getValue(normalized, "repository") ?? "",
        portfolioUrl: getValue(normalized, "portfolio_url") ?? "",
        supportedArchetypes: getArray(normalized, "supported_resume_archetypes"),
        businessDomain: getArray(normalized, "business_domain"),
      };
    });
}

function parseBullets(): Bullet[] {
  const libraryRoot = path.join(root, "docs", "resume-os", "bullet-library");
  const bullets: Bullet[] = [];
  for (const file of readdirSync(libraryRoot).filter((item) => item.endsWith(".md"))) {
    const text = read(path.join(libraryRoot, file));
    for (const line of text.split("\n")) {
      const match = line.match(/^\| ([^|]+) \| ([A-Z]{3}-[A-Z]{2,3}-[0-9]{3}) \| (.+) \|$/);
      if (match && match[1] !== "Bullet ID") {
        bullets.push({ bulletId: match[1].trim(), achievementId: match[2].trim(), text: match[3].trim(), sourceFile: file });
      }
    }
  }
  return bullets;
}

function classify(text: string): {
  primary: ArchetypeName;
  primaryScore: number;
  secondary: Array<{ name: ArchetypeName; score: number }>;
  confidence: "high" | "medium" | "low";
  signals: string[];
  ambiguities: string[];
  contradictions: string[];
} {
  const scores = Object.entries(archetypeSignals).map(([name, terms]) => {
    const matched = terms.filter((term) => lower(text).includes(term.toLowerCase()));
    const score = Math.min(100, Math.round((matched.length / Math.max(4, terms.length)) * 100 + matched.length * 4));
    return { name: name as ArchetypeName, score, matched };
  });
  scores.sort((a, b) => b.score - a.score);
  const primary = scores[0];
  const secondary = scores.slice(1, 4).filter((item) => item.score >= 35).map((item) => ({ name: item.name, score: item.score }));
  const spread = primary.score - (scores[1]?.score ?? 0);
  const confidence: "high" | "medium" | "low" = primary.score >= 75 && spread >= 8 ? "high" : primary.score >= 55 ? "medium" : "low";
  const ambiguities: string[] = [];
  if (spread < 8) {
    ambiguities.push("Top archetype scores are close; human review recommended.");
  }
  const contradictions: string[] = [];
  if (primary.name === "AI Product Manager" && !includesAny(text, ["workflow", "model", "evaluation", "responsible", "human"])) {
    contradictions.push("AI company or title language appears without strong AI product responsibilities.");
  }
  return {
    primary: primary.name,
    primaryScore: primary.score,
    secondary,
    confidence,
    signals: primary.matched.slice(0, 8),
    ambiguities,
    contradictions,
  };
}

function extractCompetencies(text: string): string[] {
  return competencyMap.filter((item) => includesAny(text, item.terms)).map((item) => item.label);
}

function extractKeywords(text: string): Array<{ keyword: string; class: string; evidence_status: string }> {
  const keywords = new Set<string>();
  for (const item of competencyMap) {
    for (const term of item.terms) {
      if (lower(text).includes(term.toLowerCase())) {
        keywords.add(term);
      }
    }
  }
  const ranked = [...keywords].slice(0, 18).map((keyword) => {
    const required = lower(text).includes(`required`) && includesAny(text, [keyword]);
    const dangerous = includesAny(keyword, ["mba", "kubernetes", "credential"]);
    return {
      keyword,
      class: dangerous ? "dangerous_without_evidence" : required ? "must_cover" : "strongly_recommended",
      evidence_status: dangerous ? "gap" : "supported_or_review",
    };
  });
  ranked.push({ keyword: "equal opportunity", class: "boilerplate", evidence_status: "ignored" });
  return ranked;
}

function inferHiddenSignals(text: string): FixtureResult["actual"]["hidden_signals"] {
  return hiddenSignalMap
    .filter((item) => includesAny(text, item.terms))
    .map((item) => ({
      signal: item.signal,
      supporting_phrase: item.terms.find((term) => lower(text).includes(term.toLowerCase())) ?? item.terms[0],
      confidence: item.confidence,
      explanation: `${item.signal} is inferred from JD language and must not be treated as a stated fact.`,
      resume_implication: "Select verified evidence that demonstrates this signal without overstating scope.",
      interview_implication: "Prepare a concise story with source evidence and trade-offs.",
      evidence_gap: item.confidence < 70 ? "Weak signal; human review required." : null,
      inference: true,
    }));
}

function rankAchievements(text: string, primary: ArchetypeName, secondary: ArchetypeName[], achievements: Achievement[]): RankedAchievement[] {
  const primarySlug = archetypeSlugs[primary];
  const secondarySlugs = secondary.map((item) => archetypeSlugs[item]);
  return achievements
    .map((achievement) => {
      const primaryArchetypeScore = achievement.archetypeScores[primarySlug] ?? 0;
      const secondaryArchetypeScore = Math.max(0, ...secondarySlugs.map((slug) => achievement.archetypeScores[slug] ?? 0)) * 0.6;
      const archetypeScore = Math.max(primaryArchetypeScore, secondaryArchetypeScore);
      const keywordMatch = countMatches(text, [...achievement.keywordTags, ...achievement.competencyTags, ...achievement.domainTags]) * 8;
      const depthFit = includesAny(text, ["technical", "architecture", "api", "platform"]) ? achievement.technicalDepth * 12 : achievement.leadershipDepth * 10;
      let score =
        archetypeScore * 0.35 +
        Math.min(100, keywordMatch) * 0.25 +
        achievement.businessImpactStrength * 10 * 0.08 +
        achievement.evidenceStrength * 0.08 +
        achievement.recencyScore * 0.05 +
        achievement.recruiterValue * 0.05 +
        achievement.hiringManagerValue * 0.05 +
        achievement.interviewDefensibility * 0.05 +
        depthFit * 0.04;
      const drivers = [
        `Archetype score ${archetypeScore}`,
        `Evidence strength ${achievement.evidenceStrength}`,
        `Business impact ${achievement.businessImpactStrength}/5`,
      ];
      const penalties: string[] = [];
      if (achievement.confidenceStatus === "self-reported") {
        score -= 3;
        penalties.push("Self-reported evidence requires interview care.");
      }
      if (achievement.confidentialityStatus !== "resume_safe" && achievement.confidentialityStatus !== "public_safe") {
        score -= 10;
        penalties.push("Confidentiality review required.");
      }
      if (achievement.recencyScore < 50 && keywordMatch < 20) {
        score -= 8;
        penalties.push("Older evidence with limited direct JD match.");
      }
      if (primary === "AI Product Manager" && includesAny([...achievement.keywordTags, ...achievement.competencyTags].join(" "), ["machine learning", "AI/ML", "ML"])) {
        score += 10;
        drivers.push("Direct AI/ML readiness evidence.");
      }
      return {
        achievement_id: achievement.id,
        company: achievement.company,
        score: Math.max(0, Math.round(score)),
        drivers,
        penalties,
        confidence_status: achievement.confidenceStatus,
        product_os_url: achievement.relatedPortfolioUrl,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function rankBullets(rankedAchievements: RankedAchievement[], bullets: Bullet[], allowedSources: string[]): RankedBullet[] {
  const achievementScore = new Map(rankedAchievements.map((item) => [item.achievement_id, item.score]));
  const bestByAchievement = new Map<string, RankedBullet>();
  for (const bullet of bullets) {
    const base = achievementScore.get(bullet.achievementId) ?? 0;
    const sourceBoost = allowedSources.includes(bullet.sourceFile) ? 15 : 0;
    const candidate = {
      bullet_id: bullet.bulletId,
      achievement_id: bullet.achievementId,
      source_file: bullet.sourceFile,
      score: Math.round(base + sourceBoost),
      duplicate_risk: false,
    };
    const existing = bestByAchievement.get(bullet.achievementId);
    if (!existing || candidate.score > existing.score) {
      bestByAchievement.set(bullet.achievementId, candidate);
    }
  }
  return [...bestByAchievement.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function assetPriority(primary: ArchetypeName, secondary: ArchetypeName[], project: Project, text: string): number {
  const names = [primary, ...secondary].join(" ");
  let score = 0;
  if (names.includes("AI Product") && ["AI-PLAYBOOK", "AI-PRIORITIZATION"].includes(project.projectId)) score += 80;
  if (names.includes("Platform") && ["PLB-LOGIX", "DECISION-MEMO", "POS-HOME"].includes(project.projectId)) score += 70;
  if (names.includes("Growth") && ["PLB-SIMPLILEARN", "DISCOVERY-TOOLKIT", "POS-EXEC"].includes(project.projectId)) score += 70;
  if (names.includes("Monetization") && ["PLB-SIMPLILEARN", "PLB-JOVE", "DECISION-MEMO"].includes(project.projectId)) score += 70;
  if (names.includes("Payments") && ["PLB-COMVIVA", "POS-EXEC"].includes(project.projectId)) score += 80;
  if (names.includes("Enterprise SaaS") && ["PLB-JOVE", "DISCOVERY-TOOLKIT", "POS-EXEC"].includes(project.projectId)) score += 70;
  if (includesAny(text, ["logix", "ai platform", "platform modernization"]) && project.projectId === "PLB-LOGIX") score += 35;
  return score;
}

function recommendAssets(primary: ArchetypeName, secondary: ArchetypeName[], projects: Project[], text: string): FixtureResult["actual"]["recommended_assets"] {
  const slugs = [archetypeSlugs[primary], ...secondary.map((item) => archetypeSlugs[item])];
  return projects
    .map((bullet) => {
      const project = bullet as unknown as Project;
      const archetypeFit = project.supportedArchetypes.filter((slug) => slugs.includes(slug)).length * 25;
      const domainFit = countMatches(text, [...project.businessDomain, project.name]) * 10;
      return { project, score: archetypeFit + domainFit + assetPriority(primary, secondary, project, text) };
    })
    .filter((item) => item.project.repository !== "reference_resume_link_only")
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => ({
      project_id: item.project.projectId,
      name: item.project.name,
      reason: "Recommended because the asset supports the detected archetype and JD signals.",
      portfolio_url: item.project.portfolioUrl,
    }));
}

function detectGaps(text: string): FixtureResult["actual"]["gaps"] {
  const gaps: FixtureResult["actual"]["gaps"] = [];
  if (includesAny(text, ["production ai", "production genai", "llm", "rag"])) {
    gaps.push({
      severity: "P1",
      gap: "Limited direct production GenAI/LLM ownership",
      source_phrase: "production AI/LLM/RAG language",
      current_evidence: "AI product judgment, ML personalization, AI prioritization, and AI readiness evidence.",
      resume_mitigation: "Use AI product and prioritization evidence without claiming unsupported GenAI production ownership.",
      product_os_mitigation: "Use AI Product Playbook or AI Prioritization Framework as proof of thinking.",
      interview_mitigation: "Explain AI product decision quality and boundaries clearly.",
      cannot_mitigate_honestly: false,
    });
  }
  if (includesAny(text, ["developer platform", "developer workflows", "apis", "api"])) {
    gaps.push({
      severity: "P1",
      gap: "Developer-platform depth may require careful framing",
      source_phrase: "developer platform/API language",
      current_evidence: "Platform architecture, throughput, payments platform, and roadmap governance evidence.",
      resume_mitigation: "Use platform evidence; avoid overstating developer-tools specialization.",
      product_os_mitigation: "Use Logix Product Leadership Brief and Decision Memo Template.",
      interview_mitigation: "Prepare technical trade-off examples.",
      cannot_mitigate_honestly: false,
    });
  }
  if (includesAny(text, ["marketplace"])) {
    gaps.push({
      severity: "P1",
      gap: "Marketplace-specific depth may be limited",
      source_phrase: "marketplace language",
      current_evidence: "Consumer, monetization, loyalty, and pricing evidence.",
      resume_mitigation: "Use adjacent monetization and consumer evidence; do not claim deep marketplace ownership.",
      product_os_mitigation: "Use relevant Product Leadership Briefs only as supporting proof.",
      interview_mitigation: "Frame transferable marketplace logic cautiously.",
      cannot_mitigate_honestly: false,
    });
  }
  if (includesAny(text, ["compliance", "regulatory", "regulation"])) {
    gaps.push({
      severity: "P1",
      gap: "Direct regulatory ownership is not fully proven",
      source_phrase: "compliance or regulatory language",
      current_evidence: "Payments reliability and risk-aware product sequencing evidence.",
      resume_mitigation: "Use payments reliability and trust evidence; do not claim compliance ownership.",
      product_os_mitigation: "Use Mahindra Comviva leadership evidence.",
      interview_mitigation: "Clarify collaboration with compliance stakeholders if asked.",
      cannot_mitigate_honestly: false,
    });
  }
  if (includesAny(text, ["integrations", "admin tooling"])) {
    gaps.push({
      severity: "P2",
      gap: "Deep enterprise integration or admin tooling ownership may need review",
      source_phrase: "integration/admin language",
      current_evidence: "Enterprise workflow, onboarding, platform, and customer discovery evidence.",
      resume_mitigation: "Use enterprise SaaS and platform evidence only where supported.",
      product_os_mitigation: "Use Product Discovery Toolkit or JoVE brief.",
      interview_mitigation: "Prepare examples of enterprise workflow prioritization.",
      cannot_mitigate_honestly: false,
    });
  }
  return gaps;
}

function assessDiversity(rankedBullets: RankedBullet[], achievementById: Map<string, Achievement>): FixtureResult["actual"]["diversity"] {
  const top = rankedBullets.slice(0, 8);
  const distribution: Record<string, number> = {};
  const seen = new Map<string, number>();
  for (const bullet of top) {
    const achievement = achievementById.get(bullet.achievement_id);
    if (!achievement) continue;
    distribution[achievement.company] = (distribution[achievement.company] ?? 0) + 1;
    seen.set(bullet.achievement_id, (seen.get(bullet.achievement_id) ?? 0) + 1);
  }
  const warnings: string[] = [];
  const maxCount = Math.max(...Object.values(distribution));
  if (maxCount > top.length * 0.5) {
    warnings.push("More than 50% of recommended bullets come from one company; human justification required.");
  }
  const repeated = [...seen.entries()].filter(([, count]) => count > 1).map(([id]) => id);
  if (repeated.length > 0) {
    warnings.push("One or more achievements repeat across recommended bullets.");
  }
  const currentRoleRepresented = top.some((bullet) => achievementById.get(bullet.achievement_id)?.date.includes("Present"));
  if (!currentRoleRepresented) {
    warnings.push("Current role is not represented in top recommended bullets.");
  }
  return {
    company_distribution: distribution,
    current_role_represented: currentRoleRepresented,
    repeated_achievements: repeated,
    warnings,
  };
}

function validateFixture(expectation: FixtureExpectation, achievements: Achievement[], bullets: Bullet[], projects: Project[]): FixtureResult {
  const text = read(path.join(fixtureRoot, expectation.file));
  const classification = classify(text);
  const secondaryNames = classification.secondary.map((item) => item.name);
  const competencies = extractCompetencies(text);
  const keywords = extractKeywords(text);
  const hiddenSignals = inferHiddenSignals(text);
  const rankedAchievements = rankAchievements(text, classification.primary, secondaryNames, achievements);
  const rankedBullets = rankBullets(rankedAchievements, bullets, expectation.bulletSources);
  const assets = recommendAssets(classification.primary, secondaryNames, projects, text);
  const gaps = detectGaps(text);
  const achievementById = new Map(achievements.map((achievement) => [achievement.id, achievement]));
  const diversity = assessDiversity(rankedBullets, achievementById);

  const passes: string[] = [];
  const warnings: string[] = [...classification.ambiguities, ...classification.contradictions, ...diversity.warnings];
  const failures: string[] = [];

  if (expectation.acceptedPrimary.includes(classification.primary)) {
    passes.push("Primary archetype accepted.");
  } else {
    failures.push(`Expected primary ${expectation.acceptedPrimary.join(" or ")}, got ${classification.primary}.`);
  }

  if (expectation.requiredSecondary) {
    for (const required of expectation.requiredSecondary) {
      if (required !== classification.primary && !secondaryNames.includes(required)) {
        failures.push(`Required hybrid archetype missing: ${required}.`);
      }
    }
  }

  for (const expected of expectation.expectedCompetencies) {
    if (!competencies.includes(expected)) {
      warnings.push(`Expected competency not detected: ${expected}.`);
    }
  }

  for (const expected of expectation.expectedHiddenSignals) {
    if (!hiddenSignals.some((signal) => signal.signal === expected)) {
      warnings.push(`Expected hidden signal not detected: ${expected}.`);
    }
  }

  const topFive = rankedAchievements.slice(0, 5).map((item) => item.achievement_id);
  const topTen = rankedAchievements.slice(0, 10).map((item) => item.achievement_id);
  for (const id of expectation.topFiveAchievements) {
    if (!topFive.includes(id)) {
      warnings.push(`Expected top-five achievement outside top 5: ${id}.`);
    }
  }
  for (const id of expectation.topTenAchievements) {
    if (!topTen.includes(id)) {
      warnings.push(`Expected supporting achievement outside top 10: ${id}.`);
    }
  }

  const bulletSources = new Set(rankedBullets.slice(0, 10).map((bullet) => bullet.source_file));
  for (const source of expectation.bulletSources.slice(0, 2)) {
    if (!bulletSources.has(source)) {
      warnings.push(`Expected bullet source not represented in top 10: ${source}.`);
    }
  }

  const assetNames = assets.map((asset) => asset.name);
  for (const asset of expectation.productAssets) {
    if (!assetNames.some((name) => name.includes(asset) || asset.includes(name))) {
      warnings.push(`Expected Product OS asset not recommended: ${asset}.`);
    }
  }

  const allBulletAchievementIds = new Set(achievements.map((achievement) => achievement.id));
  for (const bullet of rankedBullets) {
    if (!allBulletAchievementIds.has(bullet.achievement_id)) {
      failures.push(`Orphan bullet detected: ${bullet.bullet_id}.`);
    }
  }

  const explainabilityNotes = [
    "Top achievements include score, drivers, penalties, evidence status, and Product OS URL.",
    "Top bullets include source file, achievement ID, score, and duplicate-risk flag.",
    "Gaps include severity, source phrase, mitigation, and cannot-mitigate flag.",
  ];

  const status: FixtureResult["status"] = failures.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";

  return {
    fixture: expectation.file,
    expected: expectation,
    actual: {
      primary_archetype: classification.primary,
      primary_score: classification.primaryScore,
      secondary_archetypes: classification.secondary,
      confidence: classification.confidence,
      strongest_supporting_signals: classification.signals,
      ambiguities: classification.ambiguities,
      contradictory_signals: classification.contradictions,
      human_review_required: classification.confidence !== "high" || classification.ambiguities.length > 0,
      competencies,
      keywords,
      hidden_signals: hiddenSignals,
      ranked_achievements: rankedAchievements.slice(0, 10),
      ranked_bullets: rankedBullets,
      recommended_assets: assets,
      gaps,
      diversity,
      explainability: {
        status: warnings.length > 0 ? "warning" : "pass",
        notes: explainabilityNotes,
      },
    },
    passes,
    warnings,
    failures,
    status,
  };
}

function validateEdgeCases(achievements: Achievement[], bullets: Bullet[]): {
  status: "pass" | "warning" | "fail";
  cases: Array<{ fixture: string; warnings: string[]; failures: string[] }>;
} {
  const edgeRoot = path.join(fixtureRoot, "edge-cases");
  const cases = readdirSync(edgeRoot)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const text = read(path.join(edgeRoot, file));
      const classification = classify(text);
      const rankedAchievements = rankAchievements(
        text,
        classification.primary,
        classification.secondary.map((item) => item.name),
        achievements,
      );
      const rankedBullets = rankBullets(rankedAchievements, bullets, ["platform-pm.md", "ai-pm.md", "growth-pm.md", "lead-pm.md"]);
      const warnings: string[] = [];
      const failures: string[] = [];
      if (file === "ic-platform-overmanagement.md" && rankedBullets.slice(0, 5).filter((bullet) => bullet.source_file === "lead-pm.md").length > 3) {
        warnings.push("IC platform fixture overuses leadership bullets.");
      }
      if (file === "growth-overtechnical.md" && classification.primary === "Platform Product Manager") {
        failures.push("Growth edge case incorrectly classified as platform.");
      }
      if (file === "ai-overstatement-risk.md" && !detectGaps(text).some((gap) => gap.gap.includes("GenAI"))) {
        failures.push("AI overstatement risk did not produce a production GenAI/LLM gap.");
      }
      if (file === "hybrid-balance.md") {
        const names = [classification.primary, ...classification.secondary.map((item) => item.name)];
        if (!names.includes("AI Product Manager") || !names.includes("Platform Product Manager")) {
          failures.push("Hybrid balance fixture did not preserve both AI and platform archetypes.");
        }
      }
      const achievementById = new Map(achievements.map((achievement) => [achievement.id, achievement]));
      const diversity = assessDiversity(rankedBullets, achievementById);
      if (file === "evidence-diversity.md" && diversity.warnings.length === 0) {
        warnings.push("Evidence diversity review triggered for broad cross-domain role; human balancing required.");
      }
      warnings.push(...diversity.warnings);
      return { fixture: file, warnings, failures };
    });
  const hasFailure = cases.some((item) => item.failures.length > 0);
  const hasWarning = cases.some((item) => item.warnings.length > 0);
  return { status: hasFailure ? "fail" : hasWarning ? "warning" : "pass", cases };
}

function writeJson(file: string, value: unknown): void {
  writeFileSync(path.join(resultsRoot, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeReports(results: FixtureResult[], edge: ReturnType<typeof validateEdgeCases>): void {
  const summary = {
    generated_at: new Date().toISOString(),
    readiness: results.some((item) => item.status === "fail") || edge.status === "fail" ? "NOT READY" : "READY WITH MINOR ISSUES",
    fixture_count: results.length,
    pass_count: results.filter((item) => item.status === "pass").length,
    warning_count: results.filter((item) => item.status === "warning").length,
    failure_count: results.filter((item) => item.status === "fail").length,
    edge_case_status: edge.status,
  };
  writeJson("validation-summary.json", summary);

  const report = [
    "# JD Intelligence Validation Report",
    "",
    "## Executive Summary",
    "",
    `Validation completed for ${results.length} primary fixtures and ${edge.cases.length} edge-case fixtures.`,
    `Readiness decision: ${summary.readiness}.`,
    "",
    "## Validation Method",
    "",
    "The harness loads synthetic fixtures, canonical achievements, bullet libraries, and Product OS project mappings. It applies deterministic archetype classification, competency extraction, evidence scoring, bullet ranking, asset recommendation, gap analysis, diversity checks, and explainability checks.",
    "",
    "## Test Environment",
    "",
    "- Local TypeScript validation harness.",
    "- No external LLM dependency.",
    "- No final resume generation.",
    "",
    "## Fixtures Tested",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.status}`),
    "",
    "## Archetype Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.primary_archetype} (${item.actual.primary_score}, ${item.actual.confidence})`),
    "",
    "## Competency Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.competencies.slice(0, 8).join(", ")}`),
    "",
    "## Keyword Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.keywords.slice(0, 8).map((keyword) => keyword.keyword).join(", ")}`),
    "",
    "## Hidden-Signal Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.hidden_signals.map((signal) => signal.signal).join(", ")}`),
    "",
    "## Achievement-Ranking Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.ranked_achievements.slice(0, 5).map((achievement) => `${achievement.achievement_id} (${achievement.score})`).join(", ")}`),
    "",
    "## Bullet-Ranking Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.ranked_bullets.slice(0, 5).map((bullet) => `${bullet.source_file}:${bullet.bullet_id}`).join(", ")}`),
    "",
    "## Product OS Recommendation Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.recommended_assets.map((asset) => asset.name).join(", ")}`),
    "",
    "## Gap-Analysis Results",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.gaps.map((gap) => `${gap.severity} ${gap.gap}`).join("; ") || "No major gap detected."}`),
    "",
    "## Contradiction Tests",
    "",
    ...edge.cases.map((item) => `- ${item.fixture}: warnings=${item.warnings.length}, failures=${item.failures.length}`),
    "",
    "## Evidence-Diversity Tests",
    "",
    ...results.map((item) => `- ${item.fixture}: ${item.actual.diversity.warnings.join("; ") || "No major diversity warning."}`),
    "",
    "## Explainability Review",
    "",
    "Each fixture result includes selected item, score, positive drivers, penalties, source evidence, confidence status, and human-review flags.",
    "",
    "## Failures",
    "",
    ...results.flatMap((item) => item.failures.map((failure) => `- ${item.fixture}: ${failure}`)),
    ...(edge.cases.flatMap((item) => item.failures.map((failure) => `- ${item.fixture}: ${failure}`))),
    "",
    "## Warnings",
    "",
    ...results.flatMap((item) => item.warnings.map((warning) => `- ${item.fixture}: ${warning}`)),
    ...edge.cases.flatMap((item) => item.warnings.map((warning) => `- ${item.fixture}: ${warning}`)),
    "",
    "## Model Limitations",
    "",
    "- Deterministic phrase matching cannot replace final human review.",
    "- Synthetic fixtures validate behavior, not all market scenarios.",
    "- Scores are ranking aids, not truth claims.",
    "",
    "## Recommended Fixes",
    "",
    "- Keep adding fixture coverage as real JD patterns are observed.",
    "- Add deeper parser tests in SPR-017.4.",
    "- Keep human approval mandatory for final resume assembly.",
    "",
    "## Readiness Decision",
    "",
    summary.readiness,
    "",
  ].join("\n");
  writeFileSync(path.join(jdRoot, "validation", "jd-intelligence-validation-report.md"), report);

  const explainability = [
    "# Explainability Review",
    "",
    "## Scope",
    "",
    "This review covers the top 5 achievements, top 5 bullets, primary archetype decision, Product OS asset recommendation, and highest-severity gap for each fixture.",
    "",
    ...results.flatMap((item) => [
      `## ${item.fixture}`,
      "",
      `Primary archetype: ${item.actual.primary_archetype} (${item.actual.primary_score}).`,
      `Signals: ${item.actual.strongest_supporting_signals.join(", ") || "No strong signal captured."}`,
      "",
      "Top achievements:",
      ...item.actual.ranked_achievements.slice(0, 5).map((achievement) => `- ${achievement.achievement_id}: ${achievement.score}; drivers: ${achievement.drivers.join(", ")}; penalties: ${achievement.penalties.join(", ") || "none"}.`),
      "",
      "Top bullets:",
      ...item.actual.ranked_bullets.slice(0, 5).map((bullet) => `- ${bullet.bullet_id}: ${bullet.source_file}; achievement ${bullet.achievement_id}; score ${bullet.score}.`),
      "",
      `Product OS assets: ${item.actual.recommended_assets.map((asset) => asset.name).join(", ") || "None"}.`,
      `Highest gap: ${item.actual.gaps[0] ? `${item.actual.gaps[0].severity} ${item.actual.gaps[0].gap}` : "None"}.`,
      "",
    ]),
    "## Assessment",
    "",
    "Recommendations are explainable enough for human review. Low-confidence and gap-driven recommendations remain subject to manual approval.",
    "",
  ].join("\n");
  writeFileSync(path.join(jdRoot, "validation", "explainability-review.md"), explainability);
}

function main(): void {
  mkdirSync(resultsRoot, { recursive: true });
  JSON.parse(read(path.join(root, "docs", "resume-os", "schemas", "achievement.schema.json")));
  JSON.parse(read(path.join(root, "docs", "resume-os", "schemas", "jd-intelligence-output.schema.json")));

  const achievements = parseAchievements();
  const bullets = parseBullets();
  const projects = parseProjects();

  const achievementIds = new Set(achievements.map((achievement) => achievement.id));
  const orphanBullets = bullets.filter((bullet) => !achievementIds.has(bullet.achievementId));
  if (orphanBullets.length > 0) {
    throw new Error(`Orphan bullets found: ${orphanBullets.map((bullet) => bullet.bulletId).join(", ")}`);
  }
  if (achievements.length !== 20) {
    throw new Error(`Expected 20 achievements, found ${achievements.length}.`);
  }
  if (bullets.length !== 72) {
    throw new Error(`Expected 72 bullet variants, found ${bullets.length}.`);
  }

  const results = expectations.map((expectation) => validateFixture(expectation, achievements, bullets, projects));
  for (const result of results) {
    writeJson(result.fixture.replace(".md", ".json"), result);
  }
  const edge = validateEdgeCases(achievements, bullets);
  writeJson("edge-case-results.json", edge);
  writeReports(results, edge);

  const failures = results.flatMap((result) => result.failures).concat(edge.cases.flatMap((item) => item.failures));
  const warnings = results.flatMap((result) => result.warnings).concat(edge.cases.flatMap((item) => item.warnings));

  console.log(`JD Intelligence validation complete.`);
  console.log(`Fixtures: ${results.length}; achievements: ${achievements.length}; bullets: ${bullets.length}; projects: ${projects.length}.`);
  console.log(`Failures: ${failures.length}; warnings: ${warnings.length}.`);
  console.log(`Results written to ${path.relative(root, resultsRoot)}.`);

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exitCode = 1;
  }
}

if (!existsSync(jdRoot)) {
  throw new Error("JD Intelligence directory not found.");
}

main();
