import type { RevisionBoundaryClass, RevisionTargetSection, RevisionTemplateId } from "./resume-construction-proof.ts";

export type StrategySupportReferenceMode = "builder" | "persisted";

export type StrategySupportReferenceStatement = {
  statement_id: string;
  target_section: RevisionTargetSection;
  template_id: RevisionTemplateId;
  primary_evidence_id: string;
  related_application_fit_gap_ids: string[];
  boundary_class: RevisionBoundaryClass;
  strategy_support_references: string[];
};

export type StrategySupportReferenceStrategy = {
  evidence_to_requirement_mapping?: Array<{ status?: string; evidence_ids?: string[] }>;
  supported_positioning_themes?: Array<{ status?: string; evidence_ids?: string[] }>;
  recommended_resume_sections_or_emphasis?: Array<{ section?: string; status?: string; evidence_ids?: string[] }>;
  application_level_gaps?: Array<{
    gap_id?: string;
    status?: string;
    resolution_state?: string;
    human_review_required?: boolean;
    positive_claim_prohibited?: boolean;
    closest_supported_evidence_ids?: string[];
  }>;
};

export class StrategySupportReferenceError extends Error {
  readonly code = "invalid-strategy-support-reference";
}

type ParsedReference =
  | { kind: "mapping"; value: string; index: number; entry: NonNullable<StrategySupportReferenceStrategy["evidence_to_requirement_mapping"]>[number] }
  | { kind: "theme"; value: string; index: number; entry: NonNullable<StrategySupportReferenceStrategy["supported_positioning_themes"]>[number] }
  | { kind: "section"; value: string; index: number; entry: NonNullable<StrategySupportReferenceStrategy["recommended_resume_sections_or_emphasis"]>[number] }
  | { kind: "gap"; value: string; gapId: string; entry: NonNullable<StrategySupportReferenceStrategy["application_level_gaps"]>[number] };

export function canonicalStrategySupportReferences(
  strategy: StrategySupportReferenceStrategy,
  statement: StrategySupportReferenceStatement,
  mode: StrategySupportReferenceMode
): string[] {
  if (!Array.isArray(statement.strategy_support_references) || statement.strategy_support_references.length === 0) {
    throw referenceError("Revision statements must cite Strategy support references.");
  }
  const gapById = strategyGapIndex(strategy);
  const parsed = statement.strategy_support_references.map((value) => parseReference(strategy, value, gapById));
  assertNoDuplicates(parsed.map((item) => item.value));
  const canonical = parsed.map((item) => item.value).sort(compareReference);
  if (mode === "persisted" && JSON.stringify(statement.strategy_support_references) !== JSON.stringify(canonical)) {
    throw referenceError("Strategy support references must be stored in canonical order.");
  }
  validateReferenceSemantics(statement, parsed);
  return canonical;
}

function parseReference(strategy: StrategySupportReferenceStrategy, value: string, gapById = strategyGapIndex(strategy)): ParsedReference {
  if (typeof value !== "string" || value.trim() !== value || !value) {
    throw referenceError("Strategy support reference must be a trimmed non-empty string.");
  }
  const mapping = /^strategy\.evidence_to_requirement_mapping\[(0|[1-9][0-9]*)\]$/u.exec(value);
  if (mapping) {
    const index = Number(mapping[1]);
    const entry = strategy.evidence_to_requirement_mapping?.[index];
    if (!entry) throw referenceError("Strategy evidence mapping reference does not exist.");
    return { kind: "mapping", value, index, entry };
  }
  const theme = /^strategy\.supported_positioning_themes\[(0|[1-9][0-9]*)\]$/u.exec(value);
  if (theme) {
    const index = Number(theme[1]);
    const entry = strategy.supported_positioning_themes?.[index];
    if (!entry) throw referenceError("Strategy positioning theme reference does not exist.");
    return { kind: "theme", value, index, entry };
  }
  const section = /^strategy\.recommended_resume_sections_or_emphasis\[(0|[1-9][0-9]*)\]$/u.exec(value);
  if (section) {
    const index = Number(section[1]);
    const entry = strategy.recommended_resume_sections_or_emphasis?.[index];
    if (!entry) throw referenceError("Strategy section reference does not exist.");
    return { kind: "section", value, index, entry };
  }
  const gap = /^strategy\.application_level_gaps\[([A-Za-z0-9][A-Za-z0-9_-]*)\]$/u.exec(value);
  if (gap) {
    const gapId = gap[1];
    const entry = gapById.get(gapId);
    if (!entry) throw referenceError("Strategy application gap reference does not exist.");
    return { kind: "gap", value, gapId, entry };
  }
  throw referenceError("Unsupported Strategy support reference syntax.");
}

function strategyGapIndex(strategy: StrategySupportReferenceStrategy): Map<string, NonNullable<StrategySupportReferenceStrategy["application_level_gaps"]>[number]> {
  const gaps = strategy.application_level_gaps ?? [];
  const byId = new Map<string, NonNullable<StrategySupportReferenceStrategy["application_level_gaps"]>[number]>();
  for (const gap of gaps) {
    if (!gap.gap_id) continue;
    if (byId.has(gap.gap_id)) throw referenceError(`Duplicate Strategy application gap ID: ${gap.gap_id}.`);
    byId.set(gap.gap_id, gap);
  }
  return byId;
}

function validateReferenceSemantics(statement: StrategySupportReferenceStatement, references: ParsedReference[]): void {
  const claimSupport = references.filter((item) => item.kind === "mapping" || item.kind === "theme");
  const sections = references.filter((item): item is Extract<ParsedReference, { kind: "section" }> => item.kind === "section");
  const gaps = references.filter((item): item is Extract<ParsedReference, { kind: "gap" }> => item.kind === "gap");

  for (const item of claimSupport) {
    if (item.entry.status !== "evidence-backed") throw referenceError("Strategy support reference must be evidence-backed.");
    if (!item.entry.evidence_ids?.includes(statement.primary_evidence_id)) {
      throw referenceError("Strategy support reference must include the primary evidence ID.");
    }
  }
  for (const item of sections) {
    if (item.entry.status !== "evidence-backed") throw referenceError("Strategy section reference must be evidence-backed.");
    if (!sectionMatches(item.entry.section, statement.target_section)) throw referenceError("Strategy section reference does not match the target section.");
    if (Array.isArray(item.entry.evidence_ids) && item.entry.evidence_ids.length > 0 && !item.entry.evidence_ids.includes(statement.primary_evidence_id)) {
      throw referenceError("Strategy section reference must include the primary evidence ID.");
    }
  }
  if (statement.template_id === "bounded-product-work" || statement.boundary_class === "bounded-claim-control") {
    if (gaps.length !== 1 || references.length !== 1) throw referenceError("Bounded product work requires exactly one Strategy gap-control reference.");
    const [gap] = gaps;
    if (statement.related_application_fit_gap_ids.length !== 1 || statement.related_application_fit_gap_ids[0] !== gap.gapId) {
      throw referenceError("Strategy gap reference must match the statement related gap.");
    }
    if (gap.entry.status !== "bounded-claim" || gap.entry.resolution_state !== "bounded") {
      throw referenceError("Strategy gap reference must resolve to a bounded claim control.");
    }
    if (gap.entry.human_review_required !== true || gap.entry.positive_claim_prohibited !== true) {
      throw referenceError("Strategy gap reference is missing bounded safety flags.");
    }
    if (Array.isArray(gap.entry.closest_supported_evidence_ids) && gap.entry.closest_supported_evidence_ids.length > 0 && !gap.entry.closest_supported_evidence_ids.includes(statement.primary_evidence_id)) {
      throw referenceError("Strategy gap reference must include the primary evidence ID as closest support.");
    }
    return;
  }
  if (gaps.length > 0) throw referenceError("Application gap references are only allowed for bounded product work.");
  if (sections.length > 0 && claimSupport.length === 0) {
    throw referenceError("Strategy section references require claim-support provenance.");
  }
  if (claimSupport.length === 0) throw referenceError("Revision statements require evidence-backed Strategy claim support.");
}

function sectionMatches(section: string | undefined, target: RevisionTargetSection): boolean {
  const normalized = section?.trim().toLowerCase();
  const sectionTargets: Record<string, RevisionTargetSection[]> = {
    headline: ["headline"],
    summary: ["summary"],
    skills: ["core-skills"],
    "core-skills": ["core-skills"],
    experience: ["experience-bullets"],
    "experience-bullets": ["experience-bullets"],
    achievements: ["achievements"],
    projects: ["projects"]
  };
  return Boolean(normalized && sectionTargets[normalized]?.includes(target));
}

function assertNoDuplicates(values: string[]): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw referenceError("Duplicate Strategy support reference ID.");
    seen.add(value);
  }
}

function compareReference(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function referenceError(message: string): StrategySupportReferenceError {
  return new StrategySupportReferenceError(message);
}
