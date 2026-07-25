import {
  createRankingReason,
  type GapSeverity,
  type RecommendationPriority
} from "@career-companion/product-intelligence";
import type {
  BusinessObjective,
  CompetencyRequirement,
  EvidenceExpectation,
  JobConstraint,
  JobSignal,
  Responsibility,
  SkillRequirement
} from "../models";
import { confidenceFromScore, containsAny, immutableArray, immutableRecord, normalizeText, uniqueSorted } from "../shared";

export class ResponsibilityMapper {
  map(description: string): readonly Responsibility[] {
    const responsibilities = [
      ["strategy", "Define product strategy and roadmap.", ["strategy", "roadmap", "vision"]],
      ["execution", "Drive execution with cross-functional teams.", ["execute", "delivery", "launch", "cross-functional"]],
      ["discovery", "Identify customer problems and validate opportunities.", ["customer", "discovery", "research", "users"]],
      ["analytics", "Use metrics and analysis to guide product decisions.", ["metric", "analytics", "data", "experiment"]],
      ["technical", "Partner with engineering on technical product trade-offs.", ["technical", "api", "architecture", "platform"]]
    ] as const;

    return immutableArray(responsibilities
      .filter(([, , signals]) => containsAny(description, signals))
      .map(([category, statement], index) => immutableRecord({
        responsibilityId: `responsibility:${category}`,
        statement,
        category,
        rankingReasons: immutableArray([createRankingReason({
          code: `responsibility:${category}`,
          statement: "Mapped from deterministic job-description signals.",
          weight: 1 - index * 0.05
        })])
      })));
  }
}

export class CompetencyMapper {
  map(description: string): readonly CompetencyRequirement[] {
    const competencies = [
      ["product-strategy", "Product Strategy", ["strategy", "market", "roadmap"], true, 0.18],
      ["execution", "Execution", ["execute", "delivery", "launch"], true, 0.16],
      ["analytics", "Analytics", ["data", "metric", "experiment"], true, 0.14],
      ["customer-discovery", "Customer Discovery", ["customer", "research", "user"], true, 0.14],
      ["platform-thinking", "Platform Thinking", ["platform", "api", "architecture"], false, 0.12],
      ["ai-product-management", "AI Product Management", ["ai", "llm", "machine learning"], false, 0.12],
      ["leadership", "Leadership", ["lead", "mentor", "stakeholder"], false, 0.14]
    ] as const;

    const mapped = competencies.filter(([, , signals]) => containsAny(description, signals));
    return immutableArray((mapped.length === 0 ? competencies.slice(0, 2) : mapped).map(([id, name, , required, weight]) => immutableRecord({
      competencyId: id,
      name,
      required,
      weight,
      evidenceExpectationIds: immutableArray([`evidence-expectation:${id}`])
    })));
  }
}

export class SkillMapper {
  mapRequired(description: string): readonly SkillRequirement[] {
    return mapSkills(description, true);
  }

  mapPreferred(description: string): readonly SkillRequirement[] {
    return mapSkills(description, false);
  }
}

export class BusinessObjectiveMapper {
  map(description: string): readonly BusinessObjective[] {
    const objectives = [
      ["growth", "Improve growth, activation, conversion, or retention.", ["growth", "activation", "conversion", "retention"], ["growth rate", "activation lift"]],
      ["platform", "Increase platform capability, reliability, or extensibility.", ["platform", "api", "reliability"], ["reliability", "developer adoption"]],
      ["ai", "Deliver AI-enabled product value with measurable customer impact.", ["ai", "llm", "model"], ["quality", "latency", "adoption"]],
      ["customer", "Solve validated customer problems.", ["customer", "user", "research"], ["customer satisfaction", "problem validation"]]
    ] as const;

    return immutableArray(objectives
      .filter(([, , signals]) => containsAny(description, signals))
      .map(([id, statement, , indicators]) => immutableRecord({
        objectiveId: `objective:${id}`,
        statement,
        successIndicators: immutableArray(indicators)
      })));
  }
}

export class EvidenceExpectationMapper {
  map(competencies: readonly CompetencyRequirement[]): readonly EvidenceExpectation[] {
    return immutableArray(competencies.map((competency) => immutableRecord({
      expectationId: `evidence-expectation:${competency.competencyId}`,
      evidenceType: evidenceTypeFor(competency.name),
      description: `Evidence should demonstrate ${competency.name}.`,
      priority: competency.required ? "High" : "Medium" as RecommendationPriority,
      gapSeverity: competency.required ? "high" : "medium" as GapSeverity
    })));
  }
}

export function mapConstraints(description: string): readonly JobConstraint[] {
  const constraints: JobConstraint[] = [];
  const normalized = normalizeText(description);
  if (normalized.includes("remote") && normalized.includes("office")) {
    constraints.push(constraint("location-conflict", "location", "Job description contains mixed remote and office signals.", false));
  }
  if (normalized.includes("must") || normalized.includes("required")) {
    constraints.push(constraint("mandatory-requirements", "requirement", "Job description includes mandatory requirements.", true));
  }
  return immutableArray(constraints);
}

export function mapSignals(description: string): readonly JobSignal[] {
  return immutableArray(uniqueSorted(["ai", "platform", "roadmap", "customer", "data", "lead", "remote", "hybrid", "office"]
    .filter((signal) => normalizeText(description).includes(signal)))
    .map((signal) => immutableRecord({
      signalId: `signal:${signal}`,
      category: signalCategory(signal),
      value: signal,
      confidence: confidenceFromScore(80, "Signal appeared directly in the job description.")
    })));
}

function mapSkills(description: string, required: boolean): readonly SkillRequirement[] {
  const skills = [
    ["roadmapping", "Roadmapping", ["roadmap", "planning"]],
    ["experimentation", "Experimentation", ["experiment", "ab test", "test"]],
    ["analytics", "Analytics", ["analytics", "data", "metrics"]],
    ["api", "API Product", ["api", "platform"]],
    ["ai", "AI Product", ["ai", "llm", "machine learning"]],
    ["stakeholder", "Stakeholder Management", ["stakeholder", "cross-functional"]]
  ] as const;
  const filtered = skills.filter(([, , signals]) => containsAny(description, signals));
  const selected = required ? filtered.slice(0, 4) : filtered.slice(4);
  return immutableArray(selected.map(([id, name, signals]) => immutableRecord({
    skillId: `skill:${id}`,
    name,
    required,
    sourceSignal: signals[0] ?? id
  })));
}

function evidenceTypeFor(name: string): string {
  const normalized = normalizeText(name);
  if (normalized.includes("analytics")) return "metric";
  if (normalized.includes("customer")) return "research";
  if (normalized.includes("leadership")) return "behavioral-example";
  return "work-sample";
}

function constraint(
  constraintId: string,
  constraintType: string,
  description: string,
  required: boolean
): JobConstraint {
  return immutableRecord({ constraintId: `constraint:${constraintId}`, constraintType, description, required });
}

function signalCategory(signal: string): string {
  if (signal === "remote" || signal === "hybrid" || signal === "office") return "location";
  if (signal === "ai" || signal === "platform") return "domain";
  return "role";
}
