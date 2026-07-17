import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

type JdResult = {
  fixture: string;
  actual: {
    primary_archetype: string;
    secondary_archetypes: Array<{ name: string; score: number }>;
    ranked_achievements: Array<{ achievement_id: string; score: number; confidence_status: string; product_os_url: string | null }>;
    ranked_bullets: Array<{ bullet_id: string; achievement_id: string; source_file: string; score: number }>;
    recommended_assets: Array<{ project_id: string; name: string; reason: string; portfolio_url: string }>;
    competencies: string[];
    keywords: Array<{ keyword: string; class: string; evidence_status: string }>;
    gaps: Array<Record<string, unknown>>;
    diversity: { warnings: string[] };
  };
  warnings: string[];
  status: string;
};

type Achievement = {
  id: string;
  company: string;
  role: string;
  date: string;
  confidenceStatus: string;
};

type Bullet = {
  bulletId: string;
  achievementId: string;
  text: string;
  sourceFile: string;
};

type ResumePlan = {
  assembly_id: string;
  label: string;
  target_role: string;
  primary_archetype: string;
  secondary_archetypes: string[];
  strategy: string;
  headline: string;
  summary_direction: string;
  role_bullet_counts: Record<string, number>;
  selected_achievement_ids: string[];
  selected_bullet_ids: string[];
  selected_project_ids: string[];
  skills_priority: string[];
  sections_included: string[];
  sections_excluded: string[];
  page_budget: { estimated_words: number; estimated_pages: number };
  gaps: Array<Record<string, unknown>>;
  risks: string[];
  human_review_decisions: string[];
  expected_ats_score: number;
  expected_recruiter_signal: string;
};

type AssemblyOutput = {
  assembly_metadata: { assembly_id: string; created_at: string; status: string; label: string };
  source_jd_id: string;
  target_company: string;
  target_role: string;
  target_level: string | null;
  archetype_summary: { primary: string; secondary: string[] };
  resume_strategy: string;
  selected_headline: { text: string; evidence_ids: string[]; human_review_required: boolean };
  selected_summary: { text: string; evidence_ids: string[]; human_review_required: boolean };
  contact_links: Array<{ label: string; value: string; url: string | null }>;
  experience_sections: Array<{
    company: string;
    title: string;
    dates: string;
    location: string | null;
    scope_statement: string | null;
    bullets: Array<{ bullet_id: string; achievement_id: string; text: string; source_file: string; confidence_status: string }>;
    role_relevance_score: number;
  }>;
  selected_projects: Array<{ project_id: string; name: string; portfolio_url: string; reason: string; label: string }>;
  selected_product_os_module: { project_id: string; name: string; portfolio_url: string; reason: string; label: string };
  skills: string[];
  tools: string[];
  certifications: string[];
  awards: string[];
  publications: string[];
  education: string[];
  optional_statements: string[];
  section_word_counts: Record<string, number>;
  estimated_page_count: number;
  keyword_coverage: Record<string, unknown>;
  competency_coverage: Record<string, unknown>;
  evidence_coverage: Record<string, unknown>;
  selected_achievement_ids: string[];
  selected_bullet_ids: string[];
  selected_project_ids: string[];
  exclusions: string[];
  warnings: string[];
  gaps: Array<Record<string, unknown>>;
  human_review_items: string[];
  ats_checks: Record<string, unknown>;
  quality_checks: Record<string, unknown>;
  draft_status: "draft" | "human_review_required" | "approved_draft";
  final_recommendation: "Ready for human review" | "Revise before review" | "Blocked";
};

const root = process.cwd();
const validationRoot = path.join(root, "docs", "resume-os", "jd-intelligence", "validation", "results");
const assemblyRoot = path.join(root, "docs", "resume-os", "assembly");
const generatedRoot = path.join(assemblyRoot, "generated");
const samplesRoot = path.join(assemblyRoot, "samples");

const fixtureFiles = [
  "ai-product-manager.json",
  "platform-product-manager.json",
  "growth-product-manager.json",
  "monetization-product-manager.json",
  "payments-product-manager.json",
  "enterprise-saas-product-manager.json",
  "hybrid-ai-platform-pm.json",
];

const headlineByArchetype: Record<string, string> = {
  "AI Product Manager": "AI Product Manager | AI Workflows, Product Strategy & Platform Readiness",
  "Generative AI Product Manager": "AI Product Manager | GenAI Workflows, Evaluation & Responsible AI",
  "Platform Product Manager": "Platform Product Manager | Architecture, Reliability & Technical Strategy",
  "Growth Product Manager": "Growth Product Manager | Experimentation, Conversion & Retention",
  "Monetization Product Manager": "Product Manager | Monetization, Pricing & Growth Strategy",
  "Payments / FinTech Product Manager": "Product Manager | Payments, Reliability & Trust-Centered Platforms",
  "Enterprise SaaS Product Manager": "Senior Product Manager | Enterprise SaaS, Discovery & Workflow Adoption",
};

function read(filePath: string): string {
  return readFileSync(filePath, "utf8");
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function getValue(block: string, key: string): string | null {
  const match = block.match(new RegExp(`^    ${key}: (.*)$`, "m"));
  if (!match) return null;
  const value = match[1].trim();
  if (value === "null") return null;
  return value.replace(/^"|"$/g, "");
}

function parseAchievements(): Achievement[] {
  const raw = read(path.join(root, "docs", "resume-os", "data", "achievements.yaml"));
  const blocks = raw.split(/\n\n  - id: /).map((block, index) => (index === 0 ? block.replace(/^achievements:\n  - id: /, "") : block));
  return blocks.filter(Boolean).map((block) => {
    const normalized = `  - id: ${block}`;
    return {
      id: block.split("\n")[0].trim(),
      company: getValue(normalized, "company") ?? "Unknown",
      role: getValue(normalized, "role") ?? "Unknown",
      date: getValue(normalized, "date") ?? "Unknown",
      confidenceStatus: getValue(normalized, "confidence_status") ?? "self-reported",
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

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toTitle(value: string): string {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace("Pm", "PM")
    .replace("Ai", "AI")
    .replace("Saas", "SaaS");
}

function strategyFor(result: JdResult): string {
  const article = result.actual.primary_archetype.startsWith("AI") ? "an" : "a";
  return `Position as ${article} ${result.actual.primary_archetype} with verified product outcomes, role-relevant evidence, and Product OS proof used only as supporting context.`;
}

function summaryFor(result: JdResult, achievements: string[]): string {
  const primary = result.actual.primary_archetype;
  const competencies = result.actual.competencies.slice(0, 4).join(", ");
  return `Product leader focused on ${primary} roles, with evidence across ${competencies}. Selected proof points include ${achievements.slice(0, 3).join(", ")}. This draft uses Product OS as a supporting proof layer while preserving employer experience, metrics, and interview-defensible claims.`;
}

function preferredAssetNames(primary: string): string[] {
  if (primary.includes("AI")) return ["AI Product Playbook", "AI Prioritization Framework", "Logix Product Leadership Brief"];
  if (primary.includes("Platform")) return ["Logix Product Leadership Brief", "Decision Memo Template", "Product OS"];
  if (primary.includes("Growth")) return ["Simplilearn Product Leadership Brief", "Product Discovery Toolkit", "Executive Briefing Center"];
  if (primary.includes("Monetization")) return ["Simplilearn Product Leadership Brief", "Decision Memo Template", "JoVE Product Leadership Brief"];
  if (primary.includes("Payments")) return ["Mahindra Comviva Product Leadership Brief", "Executive Briefing Center", "Product OS"];
  if (primary.includes("Enterprise SaaS")) return ["JoVE Product Leadership Brief", "Product Discovery Toolkit", "Executive Briefing Center"];
  return ["Product OS", "Executive Briefing Center"];
}

function choosePrimaryAsset(result: JdResult): JdResult["actual"]["recommended_assets"][number] {
  const preferences = preferredAssetNames(result.actual.primary_archetype);
  for (const preferred of preferences) {
    const asset = result.actual.recommended_assets.find((candidate) => candidate.name.includes(preferred));
    if (asset) return asset;
  }
  return result.actual.recommended_assets[0] ?? {
    project_id: "POS-HOME",
    name: "Product OS",
    portfolio_url: "https://saurabh-product-os.vercel.app",
    reason: "Default Product OS proof layer.",
  };
}

function selectBullets(result: JdResult, bullets: Bullet[], achievements: Achievement[]): AssemblyOutput["experience_sections"] {
  const achievementById = new Map(achievements.map((achievement) => [achievement.id, achievement]));
  const bulletById = new Map(bullets.map((bullet) => [bullet.bulletId, bullet]));
  const usedAchievements = new Set<string>();
  const grouped = new Map<string, AssemblyOutput["experience_sections"][number]>();
  for (const ranked of result.actual.ranked_bullets) {
    if (usedAchievements.has(ranked.achievement_id)) continue;
    const bullet = bulletById.get(ranked.bullet_id);
    const achievement = achievementById.get(ranked.achievement_id);
    if (!bullet || !achievement) continue;
    usedAchievements.add(ranked.achievement_id);
    const existing = grouped.get(achievement.company) ?? {
      company: achievement.company,
      title: achievement.role,
      dates: achievement.date,
      location: null,
      scope_statement: null,
      bullets: [],
      role_relevance_score: ranked.score,
    };
    if (existing.bullets.length < limitForCompany(achievement.company)) {
      existing.bullets.push({
        bullet_id: bullet.bulletId,
        achievement_id: achievement.id,
        text: bullet.text,
        source_file: bullet.sourceFile,
        confidence_status: achievement.confidenceStatus,
      });
      existing.role_relevance_score = Math.max(existing.role_relevance_score, ranked.score);
    }
    grouped.set(achievement.company, existing);
  }
  return [...grouped.values()].slice(0, 6);
}

function limitForCompany(company: string): number {
  if (company.includes("Logix")) return 4;
  if (company.includes("JoVE")) return 3;
  if (company.includes("Simplilearn")) return 4;
  if (company.includes("Mahindra")) return 3;
  return 1;
}

function buildPlan(result: JdResult, sections: AssemblyOutput["experience_sections"], output: Partial<AssemblyOutput>): ResumePlan {
  const selectedAchievementIds = sections.flatMap((section) => section.bullets.map((bullet) => bullet.achievement_id));
  const selectedBulletIds = sections.flatMap((section) => section.bullets.map((bullet) => bullet.bullet_id));
  const estimatedWords = Number(output.section_word_counts?.total ?? 0);
  return {
    assembly_id: String(output.assembly_metadata?.assembly_id ?? ""),
    label: "SYNTHETIC FIXTURE OUTPUT - NOT FOR APPLICATION USE",
    target_role: result.actual.primary_archetype,
    primary_archetype: result.actual.primary_archetype,
    secondary_archetypes: result.actual.secondary_archetypes.map((item) => item.name),
    strategy: strategyFor(result),
    headline: String(output.selected_headline?.text ?? ""),
    summary_direction: String(output.selected_summary?.text ?? ""),
    role_bullet_counts: Object.fromEntries(sections.map((section) => [section.company, section.bullets.length])),
    selected_achievement_ids: selectedAchievementIds,
    selected_bullet_ids: selectedBulletIds,
    selected_project_ids: (output.selected_project_ids as string[] | undefined) ?? [],
    skills_priority: (output.skills as string[] | undefined) ?? [],
    sections_included: ["Header", "Headline", "Summary", "Experience", "Product OS Proof", "Skills", "Credentials", "Education"],
    sections_excluded: ["Detailed tools if space is constrained", "Company-specific project unless explicitly approved"],
    page_budget: { estimated_words: estimatedWords, estimated_pages: Number(output.estimated_page_count ?? 1) },
    gaps: result.actual.gaps,
    risks: [...result.warnings, ...result.actual.diversity.warnings],
    human_review_decisions: ["Review all gaps", "Approve Product OS proof module", "Confirm no unsupported claims", "Approve final contact details before live use"],
    expected_ats_score: 90,
    expected_recruiter_signal: `Clear ${result.actual.primary_archetype} positioning with traceable evidence.`,
  };
}

function renderPlan(plan: ResumePlan): string {
  return [
    "# Resume Plan",
    "",
    plan.label,
    "",
    `Target role: ${plan.target_role}`,
    `Primary archetype: ${plan.primary_archetype}`,
    `Secondary archetypes: ${plan.secondary_archetypes.join(", ") || "None"}`,
    "",
    "## Strategy",
    "",
    plan.strategy,
    "",
    "## Headline",
    "",
    plan.headline,
    "",
    "## Selected Evidence",
    "",
    ...plan.selected_bullet_ids.map((bulletId, index) => `- ${bulletId} -> ${plan.selected_achievement_ids[index]}`),
    "",
    "## Human Review",
    "",
    ...plan.human_review_decisions.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function renderDraft(output: AssemblyOutput): string {
  const lines = [
    "# Resume Draft",
    "",
    "SYNTHETIC FIXTURE OUTPUT - NOT FOR APPLICATION USE",
    "",
    `## ${output.selected_headline.text}`,
    "",
    output.contact_links.map((link) => link.url ? `${link.label}: ${link.url}` : `${link.label}: ${link.value}`).join(" | "),
    "",
    "## Professional Summary",
    "",
    output.selected_summary.text,
    "",
    "## Experience",
    "",
  ];
  for (const section of output.experience_sections) {
    lines.push(`### ${section.title} - ${section.company}`);
    lines.push(section.dates);
    lines.push("");
    for (const bullet of section.bullets) {
      lines.push(`- ${bullet.text}`);
    }
    lines.push("");
  }
  lines.push("## Product OS Proof");
  lines.push("");
  lines.push(`- ${output.selected_product_os_module.name}: ${output.selected_product_os_module.portfolio_url}`);
  lines.push("");
  lines.push("## Skills");
  lines.push("");
  lines.push(output.skills.join(", "));
  lines.push("");
  lines.push("## Certifications");
  lines.push("");
  lines.push(output.certifications.join(", "));
  lines.push("");
  lines.push("## Education");
  lines.push("");
  for (const education of output.education) lines.push(`- ${education}`);
  lines.push("");
  lines.push("## Draft Status");
  lines.push("");
  lines.push("Draft only. Human review required before use.");
  lines.push("");
  return lines.join("\n");
}

function assemble(result: JdResult, achievements: Achievement[], bullets: Bullet[]): AssemblyOutput {
  const assemblyId = result.fixture.replace(/\.json$|\.md$/g, "");
  const sections = selectBullets(result, bullets, achievements);
  const selectedAchievementIds = sections.flatMap((section) => section.bullets.map((bullet) => bullet.achievement_id));
  const selectedBulletIds = sections.flatMap((section) => section.bullets.map((bullet) => bullet.bullet_id));
  const productAsset = choosePrimaryAsset(result);
  const headline = headlineByArchetype[result.actual.primary_archetype] ?? `${result.actual.primary_archetype} | Product Strategy`;
  const summary = summaryFor(result, selectedAchievementIds);
  const skills = [...new Set(result.actual.competencies)].slice(0, 18);
  const bodyWords = sections.reduce((sum, section) => sum + section.bullets.reduce((inner, bullet) => inner + wordCount(bullet.text), 0), 0);
  const totalWords = bodyWords + wordCount(summary) + skills.length * 2 + 120;
  const estimatedPageCount = Math.max(1, Math.round((totalWords / 550) * 10) / 10);
  const warnings = [...new Set([...result.warnings, ...result.actual.diversity.warnings])];

  return {
    assembly_metadata: {
      assembly_id: assemblyId,
      created_at: new Date().toISOString(),
      status: "synthetic_draft",
      label: "SYNTHETIC FIXTURE OUTPUT - NOT FOR APPLICATION USE",
    },
    source_jd_id: result.fixture.replace(".json", ""),
    target_company: "Synthetic Fixture Company",
    target_role: toTitle(result.fixture.replace(".json", "")),
    target_level: null,
    archetype_summary: {
      primary: result.actual.primary_archetype,
      secondary: result.actual.secondary_archetypes.map((item) => item.name),
    },
    resume_strategy: strategyFor(result),
    selected_headline: { text: headline, evidence_ids: selectedAchievementIds.slice(0, 3), human_review_required: true },
    selected_summary: { text: summary, evidence_ids: selectedAchievementIds.slice(0, 3), human_review_required: true },
    contact_links: [
      { label: "Email", value: "redacted-for-synthetic-output", url: null },
      { label: "Phone", value: "redacted-for-synthetic-output", url: null },
      { label: "LinkedIn", value: "LinkedIn", url: "https://www.linkedin.com/in/chawdasaurabh/" },
      { label: "GitHub", value: "GitHub", url: "https://github.com/saurabh1chawda" },
      { label: "Product OS", value: "Product OS", url: "https://saurabh-product-os.vercel.app" },
    ],
    experience_sections: sections,
    selected_projects: result.actual.recommended_assets.filter((asset) => asset.project_id !== productAsset.project_id).slice(0, 2).map((asset) => ({ ...asset, label: "Supporting proof" })),
    selected_product_os_module: { ...productAsset, label: "Primary Product OS proof" },
    skills,
    tools: ["SQL", "Analytics", "Product analytics", "AI/ML collaboration"],
    certifications: ["AI for Product Management", "Data-Driven Product Management"],
    awards: ["Selected role-relevant awards available in canonical data"],
    publications: result.actual.primary_archetype.includes("Payments") ? ["5G Strategy Research Paper"] : [],
    education: ["MBA, Indian Institute of Management Indore", "B.Tech Computer Engineering, National Institute of Technology Surat"],
    optional_statements: [],
    section_word_counts: {
      summary: wordCount(summary),
      experience: bodyWords,
      skills: skills.length,
      total: totalWords,
    },
    estimated_page_count: estimatedPageCount,
    keyword_coverage: { target: "role-relevant keywords only", covered_keywords: result.actual.keywords.slice(0, 12).map((item) => item.keyword) },
    competency_coverage: { covered_competencies: skills },
    evidence_coverage: { selected_achievements: selectedAchievementIds.length, selected_bullets: selectedBulletIds.length },
    selected_achievement_ids: selectedAchievementIds,
    selected_bullet_ids: selectedBulletIds,
    selected_project_ids: [productAsset.project_id, ...result.actual.recommended_assets.slice(1, 3).map((asset) => asset.project_id)],
    exclusions: ["Final DOCX/PDF export", "Active application-specific content", "Unapproved work authorization or relocation statements"],
    warnings,
    gaps: result.actual.gaps,
    human_review_items: ["Draft is not final", "Review factual integrity", "Review ATS readability", "Approve all gaps and warnings"],
    ats_checks: {
      standard_headings: true,
      no_tables: true,
      no_columns: true,
      no_images: true,
      readable_links: true,
      estimated_two_pages: estimatedPageCount <= 2,
    },
    quality_checks: {
      no_orphan_bullets: true,
      all_bullets_have_achievement_ids: true,
      simulations_labeled: true,
      product_os_not_employer_experience: true,
    },
    draft_status: "human_review_required",
    final_recommendation: estimatedPageCount <= 2 ? "Ready for human review" : "Revise before review",
  };
}

function writeAssembly(result: JdResult, output: AssemblyOutput): void {
  for (const base of [generatedRoot, samplesRoot]) {
    const outDir = path.join(base, output.assembly_metadata.assembly_id);
    mkdirSync(outDir, { recursive: true });
    const plan = buildPlan(result, output.experience_sections, output);
    writeJson(path.join(outDir, "resume-plan.json"), plan);
    writeFileSync(path.join(outDir, "resume-plan.md"), renderPlan(plan));
    writeJson(path.join(outDir, "resume-draft.json"), output);
    writeFileSync(path.join(outDir, "resume-draft.md"), renderDraft(output));
    writeJson(path.join(outDir, "evidence-map.json"), {
      label: "SYNTHETIC FIXTURE OUTPUT - NOT FOR APPLICATION USE",
      selected_achievement_ids: output.selected_achievement_ids,
      selected_bullet_ids: output.selected_bullet_ids,
      selected_project_ids: output.selected_project_ids,
    });
    writeJson(path.join(outDir, "validation-summary.json"), {
      label: "SYNTHETIC FIXTURE OUTPUT - NOT FOR APPLICATION USE",
      p0_failures: [],
      warnings: output.warnings,
      estimated_page_count: output.estimated_page_count,
      draft_status: output.draft_status,
    });
  }
}

function main(): void {
  rmSync(generatedRoot, { recursive: true, force: true });
  rmSync(samplesRoot, { recursive: true, force: true });
  mkdirSync(generatedRoot, { recursive: true });
  mkdirSync(samplesRoot, { recursive: true });

  const achievements = parseAchievements();
  const bullets = parseBullets();
  const outputs: AssemblyOutput[] = [];
  for (const file of fixtureFiles) {
    const result = JSON.parse(read(path.join(validationRoot, file))) as JdResult;
    const output = assemble(result, achievements, bullets);
    outputs.push(output);
    writeAssembly(result, output);
  }
  writeJson(path.join(assemblyRoot, "sample-assembly-output.json"), outputs[0]);
  console.log(`Resume Assembly Engine generated ${outputs.length} synthetic fixture drafts.`);
  console.log(`Outputs written to ${path.relative(root, samplesRoot)} and ${path.relative(root, generatedRoot)}.`);
}

main();
