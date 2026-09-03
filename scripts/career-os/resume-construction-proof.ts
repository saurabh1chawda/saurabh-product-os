import { createHash } from "node:crypto";
import {
  canonicalStrategySupportReferences,
  type StrategySupportReferenceStrategy
} from "./resume-strategy-support-reference.ts";

export type RevisionTargetSection = "headline" | "summary" | "core-skills" | "experience-bullets" | "achievements" | "projects";
export type RevisionBoundaryClass = "ordinary-evidence-backed" | "acknowledged-application-fit-gap" | "bounded-claim-control";
export type RevisionTemplateId = "role-context" | "action-outcome" | "metric-outcome" | "bounded-product-work" | "supported-skill" | "supported-project";
export type ConstructionProofSchemaVersion = "2.0.0";
export const constructionProofSchemaVersion = "2.0.0" as const;
export type ProhibitedStrengtheningClass =
  | "production-deployment-ownership"
  | "deployment-scale"
  | "model-operations"
  | "mlops-maturity"
  | "unsupported-ai-production-impact";

export type RevisionClaimAtoms = {
  employer?: string;
  role?: string;
  dates?: string;
  action?: string;
  object?: string;
  metric_value?: string;
  metric_unit?: string;
  outcome?: string;
  skill?: string;
  project?: string;
  bounded_qualifier?: string;
};

export type TrustedEvidenceMetric = {
  value: string;
  unit: string;
  state: string;
};

export type TrustedEvidenceItem = {
  evidence_id: string;
  statement: string;
  status?: "verified" | "human-review-required";
  tags?: string[];
  source_reference?: string;
  source_field?: string;
  evidence_classification?: string;
  employer?: string;
  title?: string;
  dates?: string;
  category?: string;
  metric?: TrustedEvidenceMetric | null;
  metric_state?: "achieved" | "projected" | "estimated" | "target";
  collaboration_scope?: "individual" | "team" | "partnered" | "supported";
};

export type RevisionStatementLike = {
  statement_id: string;
  predecessor_statement_id?: string;
  target_section: RevisionTargetSection;
  template_id: RevisionTemplateId;
  claim_atoms: RevisionClaimAtoms;
  primary_evidence_id: string;
  supporting_evidence_ids: string[];
  trusted_evidence_ids: string[];
  strategy_support_references: string[];
  related_application_fit_gap_ids: string[];
  boundary_class: RevisionBoundaryClass;
  human_review_required: true;
  selected_metric_key?: string;
};

export type BoundaryControlProjection = {
  related_gap_id: string;
  gap_register_id: string;
  gap_register_file_hash: string;
  gap_register_material_hash: string;
  gap_boundary_hash: string;
  allowed_representation: "bounded-product-work";
  prohibited_strengthening_classes: ProhibitedStrengtheningClass[];
  projection_hash: string;
};

export type MetricProjection = {
  metric_key: string;
  source: "primary_evidence.metric";
  value: string;
  unit: string;
  state: string;
  projection_hash: string;
};

export type SupportClauseProjection = {
  source: "primary_evidence.statement_clause";
  clause_index: number;
  clause_hash: string;
  atom_spans: Array<{ atom: "action" | "object" | "outcome"; start: number; end: number }>;
  projection_hash: string;
};

export type EvidenceConstructionProof = {
  proof_schema_version?: ConstructionProofSchemaVersion;
  construction_mode: "evidence-template";
  template_id: RevisionTemplateId;
  target_section: RevisionTargetSection;
  primary_evidence_id: string;
  primary_evidence_record_hash: string;
  supporting_evidence_ids: string[];
  claim_atoms: Record<string, string>;
  claim_atom_projection_hash: string;
  strategy_support_references: string[];
  related_application_fit_gap_ids: string[];
  boundary_class: RevisionBoundaryClass;
  rendered_text_hash: string;
  construction_proof_hash: string;
  predecessor_statement_id?: string;
  evidence_ids: string[];
  selected_metric_projection?: MetricProjection;
  boundary_control_projection?: BoundaryControlProjection;
  support_clause_projection?: SupportClauseProjection;
};

export class EvidenceConstructionError extends Error {
  readonly code = "invalid-construction-proof";
}

type TemplateSupportRule = {
  required_atoms: Array<keyof RevisionClaimAtoms>;
  optional_atoms: Array<keyof RevisionClaimAtoms>;
  v2_required_atoms?: Array<keyof RevisionClaimAtoms>;
  v2_optional_atoms?: Array<keyof RevisionClaimAtoms>;
  allowed_target_sections: RevisionTargetSection[];
  allowed_gap_classes: RevisionBoundaryClass[];
};

export type ApplicationFitGapLike = {
  gap_id: string;
  gap_register_id?: string;
  requirement?: string;
  normalized_requirement_key?: string;
  status?: string;
  resolution_state?: string;
  gap_class?: string;
  generated_disposition?: string;
  claim_boundary: string;
  closest_supported_evidence_ids?: string[];
  included_statement_ids?: string[];
  human_review_required: boolean;
  positive_claim_prohibited: boolean;
};

export type GapRegisterReferenceLike = {
  gap_register_id: string;
  file_hash: string;
  material_hash: string;
};

export type ConstructionProofOptions = {
  proofSchemaVersion?: "1.0.0" | ConstructionProofSchemaVersion;
  currentRegisterGaps?: ApplicationFitGapLike[];
  draftApplicationFitGaps?: ApplicationFitGapLike[];
  gapRegisterReference?: GapRegisterReferenceLike;
  strategy?: StrategySupportReferenceStrategy;
};

export const revisionTemplateSupportMatrix: Record<RevisionTemplateId, TemplateSupportRule> = {
  "role-context": {
    required_atoms: ["role", "employer"],
    optional_atoms: ["dates"],
    allowed_target_sections: ["headline", "summary"],
    allowed_gap_classes: ["ordinary-evidence-backed"]
  },
  "action-outcome": {
    required_atoms: ["action", "object", "outcome"],
    optional_atoms: ["employer", "dates"],
    allowed_target_sections: ["summary", "experience-bullets", "achievements", "projects"],
    allowed_gap_classes: ["ordinary-evidence-backed"]
  },
  "metric-outcome": {
    required_atoms: ["action", "object", "metric_value", "metric_unit"],
    optional_atoms: ["employer", "dates", "outcome"],
    allowed_target_sections: ["summary", "experience-bullets", "achievements"],
    allowed_gap_classes: ["ordinary-evidence-backed"]
  },
  "bounded-product-work": {
    required_atoms: ["bounded_qualifier", "action", "object"],
    optional_atoms: ["employer", "outcome"],
    v2_required_atoms: ["action", "object"],
    v2_optional_atoms: ["employer", "outcome"],
    allowed_target_sections: ["summary", "experience-bullets", "achievements", "projects"],
    allowed_gap_classes: ["bounded-claim-control"]
  },
  "supported-skill": {
    required_atoms: ["skill"],
    optional_atoms: [],
    allowed_target_sections: ["core-skills"],
    allowed_gap_classes: ["ordinary-evidence-backed"]
  },
  "supported-project": {
    required_atoms: ["project", "outcome"],
    optional_atoms: [],
    allowed_target_sections: ["projects"],
    allowed_gap_classes: ["ordinary-evidence-backed"]
  }
};

export function renderRevisionStatementText(statement: Pick<RevisionStatementLike, "template_id" | "claim_atoms">, options: { proofSchemaVersion?: "1.0.0" | ConstructionProofSchemaVersion } = {}): string {
  const atom = canonicalClaimAtoms(statement.claim_atoms);
  switch (statement.template_id) {
    case "role-context":
      return joinSentence([atom.role, atom.employer ? `at ${atom.employer}` : "", atom.dates ? `(${atom.dates})` : ""]);
    case "action-outcome":
      return joinSentence([atom.action, atom.object, atom.employer ? `for ${atom.employer}` : "", atom.outcome ? `to ${atom.outcome}` : ""]);
    case "metric-outcome":
      return joinSentence([atom.action, atom.object, atom.metric_value && atom.metric_unit ? `by ${atom.metric_value}${atom.metric_unit}` : "", atom.employer ? `for ${atom.employer}` : "", atom.outcome ? `to ${atom.outcome}` : ""]);
    case "bounded-product-work":
      if (options.proofSchemaVersion === constructionProofSchemaVersion) {
        return joinSentence([atom.action, atom.object, atom.employer ? `for ${atom.employer}` : "", atom.outcome ? `to ${atom.outcome}` : ""]);
      }
      return joinSentence([atom.bounded_qualifier, atom.action, atom.object, atom.employer ? `for ${atom.employer}` : "", atom.outcome ? `to ${atom.outcome}` : ""]);
    case "supported-skill":
      return requireAtom(atom.skill, "skill");
    case "supported-project":
      return joinSentence([atom.project, atom.outcome ? `focused on ${atom.outcome}` : ""]);
  }
}

export function hashTrustedEvidenceRecord(record: TrustedEvidenceItem): string {
  return hashJson(canonicalEvidenceRecord(record));
}

export function hashRenderedRevisionStatement(statement: RevisionStatementLike, options: { proofSchemaVersion?: "1.0.0" | ConstructionProofSchemaVersion } = {}): string {
  return hashJson({
    statement_id: statement.statement_id,
    target_section: statement.target_section,
    template_id: statement.template_id,
    claim_atoms: canonicalClaimAtoms(statement.claim_atoms),
    text: renderRevisionStatementText(statement, options)
  });
}

export function buildEvidenceConstructionProof(statement: RevisionStatementLike, evidenceItems: TrustedEvidenceItem[], options: ConstructionProofOptions = {}): EvidenceConstructionProof {
  const version = options.proofSchemaVersion ?? "1.0.0";
  if (version === constructionProofSchemaVersion) return buildEvidenceConstructionProofV2(statement, evidenceItems, options);
  if (version !== "1.0.0") throw constructionError("Unsupported construction proof schema version.");
  return buildEvidenceConstructionProofV1(statement, evidenceItems);
}

function buildEvidenceConstructionProofV1(statement: RevisionStatementLike, evidenceItems: TrustedEvidenceItem[]): EvidenceConstructionProof {
  validateStatementShell(statement);
  const evidenceById = new Map(evidenceItems.map((item) => [item.evidence_id, item]));
  const primary = evidenceById.get(statement.primary_evidence_id);
  if (!primary) throw constructionError(`Unknown primary evidence ID: ${statement.primary_evidence_id}.`);
  if (primary.status && primary.status !== "verified") throw constructionError(`Primary evidence ${primary.evidence_id} is not verified.`);
  validateEvidenceIds(statement, evidenceById);
  validateTemplateSupport(statement, primary);
  const renderedText = renderRevisionStatementText(statement);
  const supportingEvidenceIds = canonicalUnique(statement.supporting_evidence_ids, "supporting evidence");
  const claimAtoms = canonicalClaimAtoms(statement.claim_atoms);
  const claimAtomProjectionHash = hashJson({
    template_id: statement.template_id,
    primary_evidence_id: statement.primary_evidence_id,
    claim_atoms: claimAtoms
  });
  const renderedTextHash = hashRenderedRevisionStatement(statement);
  const proofBase = {
    statement_id: statement.statement_id,
    predecessor_statement_id: statement.predecessor_statement_id ?? null,
    target_section: statement.target_section,
    template_id: statement.template_id,
    primary_evidence_id: statement.primary_evidence_id,
    primary_evidence_record_hash: hashTrustedEvidenceRecord(primary),
    supporting_evidence_ids: supportingEvidenceIds,
    claim_atoms: claimAtoms,
    claim_atom_projection_hash: claimAtomProjectionHash,
    strategy_support_references: canonicalUnique(statement.strategy_support_references, "Strategy support reference"),
    related_application_fit_gap_ids: canonicalUnique(statement.related_application_fit_gap_ids, "application-fit gap"),
    boundary_class: statement.boundary_class,
    rendered_text: renderedText,
    rendered_text_hash: renderedTextHash
  };
  return {
    construction_mode: "evidence-template",
    template_id: proofBase.template_id,
    target_section: proofBase.target_section,
    primary_evidence_id: proofBase.primary_evidence_id,
    primary_evidence_record_hash: proofBase.primary_evidence_record_hash,
    supporting_evidence_ids: proofBase.supporting_evidence_ids,
    claim_atoms: proofBase.claim_atoms,
    claim_atom_projection_hash: proofBase.claim_atom_projection_hash,
    strategy_support_references: proofBase.strategy_support_references,
    related_application_fit_gap_ids: proofBase.related_application_fit_gap_ids,
    boundary_class: proofBase.boundary_class,
    rendered_text_hash: proofBase.rendered_text_hash,
    construction_proof_hash: hashJson(proofBase),
    ...(statement.predecessor_statement_id ? { predecessor_statement_id: statement.predecessor_statement_id } : {}),
    evidence_ids: [statement.primary_evidence_id, ...proofBase.supporting_evidence_ids]
  };
}

function buildEvidenceConstructionProofV2(statement: RevisionStatementLike, evidenceItems: TrustedEvidenceItem[], options: ConstructionProofOptions): EvidenceConstructionProof {
  validateStatementShell(statement);
  const evidenceById = new Map(evidenceItems.map((item) => [item.evidence_id, item]));
  const primary = evidenceById.get(statement.primary_evidence_id);
  if (!primary) throw constructionError(`Unknown primary evidence ID: ${statement.primary_evidence_id}.`);
  if (primary.status && primary.status !== "verified") throw constructionError(`Primary evidence ${primary.evidence_id} is not verified.`);
  validateEvidenceIds(statement, evidenceById);
  validateTemplateSupport(statement, primary, constructionProofSchemaVersion);
  const supportClauseProjection = supportClauseProjectionForStatement(statement, primary);
  const selectedMetricProjection = statement.template_id === "metric-outcome" ? metricProjectionForStatement(statement, primary) : undefined;
  if (statement.template_id === "bounded-product-work" && (statement.claim_atoms.metric_value || statement.claim_atoms.metric_unit || statement.selected_metric_key)) {
    throw constructionError("Bounded product work cannot include structured metrics in proof v2.");
  }
  const boundaryControlProjection = statement.template_id === "bounded-product-work" ? boundaryControlForStatement(statement, options) : undefined;
  const renderedText = renderRevisionStatementText(statement, { proofSchemaVersion: constructionProofSchemaVersion });
  validateProhibitedStrengthening(renderedText, statement, boundaryControlProjection);
  const supportingEvidenceIds = canonicalUnique(statement.supporting_evidence_ids, "supporting evidence");
  const claimAtoms = canonicalClaimAtoms(statement.claim_atoms);
  const claimAtomProjectionHash = hashJson({
    proof_schema_version: constructionProofSchemaVersion,
    template_id: statement.template_id,
    primary_evidence_id: statement.primary_evidence_id,
    claim_atoms: claimAtoms,
    ...(supportClauseProjection ? { support_clause_projection_hash: supportClauseProjection.projection_hash } : {}),
    ...(selectedMetricProjection ? { selected_metric_projection_hash: selectedMetricProjection.projection_hash } : {}),
    ...(boundaryControlProjection ? { boundary_control_projection_hash: boundaryControlProjection.projection_hash } : {})
  });
  const renderedTextHash = hashRenderedRevisionStatement(statement, { proofSchemaVersion: constructionProofSchemaVersion });
  const proofBase = {
    proof_schema_version: constructionProofSchemaVersion,
    statement_id: statement.statement_id,
    predecessor_statement_id: statement.predecessor_statement_id ?? null,
    target_section: statement.target_section,
    template_id: statement.template_id,
    primary_evidence_id: statement.primary_evidence_id,
    primary_evidence_record_hash: hashTrustedEvidenceRecord(primary),
    supporting_evidence_ids: supportingEvidenceIds,
    claim_atoms: claimAtoms,
    claim_atom_projection_hash: claimAtomProjectionHash,
    strategy_support_references: canonicalUnique(statement.strategy_support_references, "Strategy support reference"),
    related_application_fit_gap_ids: canonicalUnique(statement.related_application_fit_gap_ids, "application-fit gap"),
    boundary_class: statement.boundary_class,
    rendered_text: renderedText,
    rendered_text_hash: renderedTextHash,
    ...(supportClauseProjection ? { support_clause_projection: supportClauseProjection } : {}),
    ...(selectedMetricProjection ? { selected_metric_projection: selectedMetricProjection } : {}),
    ...(boundaryControlProjection ? { boundary_control_projection: boundaryControlProjection } : {})
  };
  return {
    proof_schema_version: constructionProofSchemaVersion,
    construction_mode: "evidence-template",
    template_id: proofBase.template_id,
    target_section: proofBase.target_section,
    primary_evidence_id: proofBase.primary_evidence_id,
    primary_evidence_record_hash: proofBase.primary_evidence_record_hash,
    supporting_evidence_ids: proofBase.supporting_evidence_ids,
    claim_atoms: proofBase.claim_atoms,
    claim_atom_projection_hash: proofBase.claim_atom_projection_hash,
    strategy_support_references: proofBase.strategy_support_references,
    related_application_fit_gap_ids: proofBase.related_application_fit_gap_ids,
    boundary_class: proofBase.boundary_class,
    rendered_text_hash: proofBase.rendered_text_hash,
    construction_proof_hash: hashJson(proofBase),
    ...(statement.predecessor_statement_id ? { predecessor_statement_id: statement.predecessor_statement_id } : {}),
    evidence_ids: [statement.primary_evidence_id, ...proofBase.supporting_evidence_ids],
    ...(supportClauseProjection ? { support_clause_projection: supportClauseProjection } : {}),
    ...(selectedMetricProjection ? { selected_metric_projection: selectedMetricProjection } : {}),
    ...(boundaryControlProjection ? { boundary_control_projection: boundaryControlProjection } : {})
  };
}

export function validateDraftStatementConstruction(input: {
  statement: { statement_id?: string; text: string; construction?: EvidenceConstructionProof };
  evidenceItems: TrustedEvidenceItem[];
  requiredGapId?: string;
  requiredBoundaryClass?: RevisionBoundaryClass;
  currentRegisterGaps?: ApplicationFitGapLike[];
  draftApplicationFitGaps?: ApplicationFitGapLike[];
  gapRegisterReference?: GapRegisterReferenceLike;
  requiredProofSchemaVersion?: ConstructionProofSchemaVersion;
  strategy?: StrategySupportReferenceStrategy;
}): void {
  const construction = input.statement.construction;
  if (!input.statement.statement_id) throw constructionError("Constructed statement is missing a statement ID.");
  if (!construction || construction.construction_mode !== "evidence-template") throw constructionError(`Statement ${input.statement.statement_id} lacks deterministic construction provenance.`);
  const proofSchemaVersion = construction.proof_schema_version ?? "1.0.0";
  if (input.requiredProofSchemaVersion && proofSchemaVersion !== input.requiredProofSchemaVersion) {
    throw constructionError(`Statement ${input.statement.statement_id} has incompatible proof schema version.`);
  }
  if (proofSchemaVersion !== "1.0.0" && proofSchemaVersion !== constructionProofSchemaVersion) throw constructionError("Unsupported construction proof schema version.");
  const reconstructed: RevisionStatementLike = {
    statement_id: input.statement.statement_id,
    ...(construction.predecessor_statement_id ? { predecessor_statement_id: construction.predecessor_statement_id } : {}),
    target_section: construction.target_section,
    template_id: construction.template_id,
    claim_atoms: construction.claim_atoms,
    primary_evidence_id: construction.primary_evidence_id,
    supporting_evidence_ids: construction.supporting_evidence_ids,
    trusted_evidence_ids: construction.evidence_ids,
    strategy_support_references: construction.strategy_support_references,
    related_application_fit_gap_ids: construction.related_application_fit_gap_ids,
    boundary_class: construction.boundary_class,
    human_review_required: true,
    ...(construction.selected_metric_projection ? { selected_metric_key: construction.selected_metric_projection.metric_key } : {})
  };
  if (input.requiredBoundaryClass && construction.boundary_class !== input.requiredBoundaryClass) {
    throw constructionError(`Statement ${input.statement.statement_id} has incompatible construction boundary.`);
  }
  if (input.requiredGapId && !construction.related_application_fit_gap_ids.includes(input.requiredGapId)) {
    throw constructionError(`Statement ${input.statement.statement_id} is not linked to bounded gap ${input.requiredGapId}.`);
  }
  const currentRegisterGaps = input.currentRegisterGaps;
  const draftApplicationFitGaps = input.draftApplicationFitGaps;
  if (proofSchemaVersion === constructionProofSchemaVersion && construction.boundary_class === "bounded-claim-control") {
    validateBoundedGapAuthorities(reconstructed, currentRegisterGaps, draftApplicationFitGaps);
  }
  if (proofSchemaVersion === constructionProofSchemaVersion) {
    if (!input.strategy) throw constructionError("Current Strategy is required for proof schema 2.0.0.");
    canonicalStrategySupportReferences(input.strategy, reconstructed, "persisted");
  }
  const expected = buildEvidenceConstructionProof(reconstructed, input.evidenceItems, {
    proofSchemaVersion,
    currentRegisterGaps,
    gapRegisterReference: input.gapRegisterReference
  });
  if (input.statement.text !== renderRevisionStatementText(reconstructed, { proofSchemaVersion })) throw constructionError(`Statement ${input.statement.statement_id} text no longer matches deterministic construction.`);
  if (JSON.stringify(construction) !== JSON.stringify(expected)) throw constructionError(`Statement ${input.statement.statement_id} construction proof is stale or forged.`);
}

function validateStatementShell(statement: RevisionStatementLike): void {
  if (!statement.statement_id.trim()) throw constructionError("Revision statement is missing a statement ID.");
  if (statement.human_review_required !== true) throw constructionError("Revision statements must require human review.");
  if (!revisionTemplateSupportMatrix[statement.template_id]) throw constructionError("Unsupported revision template.");
  if (!Array.isArray(statement.strategy_support_references) || statement.strategy_support_references.length === 0) throw constructionError("Revision statements must cite Strategy support references.");
}

function validateEvidenceIds(statement: RevisionStatementLike, evidenceById: Map<string, TrustedEvidenceItem>): void {
  const supporting = canonicalUnique(statement.supporting_evidence_ids, "supporting evidence");
  if (supporting.includes(statement.primary_evidence_id)) throw constructionError("Primary evidence cannot be repeated as supporting evidence.");
  for (const evidenceId of supporting) {
    if (!evidenceById.has(evidenceId)) throw constructionError(`Unknown supporting evidence ID: ${evidenceId}.`);
  }
  const canonicalEvidenceIds = [statement.primary_evidence_id, ...supporting];
  if (JSON.stringify(statement.trusted_evidence_ids) !== JSON.stringify(canonicalEvidenceIds)) {
    throw constructionError("Trusted evidence IDs must equal primary evidence followed by canonical supporting evidence IDs.");
  }
}

function validateTemplateSupport(statement: RevisionStatementLike, primary: TrustedEvidenceItem, proofSchemaVersion: "1.0.0" | ConstructionProofSchemaVersion = "1.0.0"): void {
  const rule = revisionTemplateSupportMatrix[statement.template_id];
  if (!rule.allowed_target_sections.includes(statement.target_section)) throw constructionError(`Template ${statement.template_id} cannot target ${statement.target_section}.`);
  if (!rule.allowed_gap_classes.includes(statement.boundary_class)) throw constructionError(`Template ${statement.template_id} cannot be used for ${statement.boundary_class}.`);
  const requiredAtoms = proofSchemaVersion === constructionProofSchemaVersion && rule.v2_required_atoms ? rule.v2_required_atoms : rule.required_atoms;
  const optionalAtoms = proofSchemaVersion === constructionProofSchemaVersion && rule.v2_optional_atoms ? rule.v2_optional_atoms : rule.optional_atoms;
  const allowedAtoms = new Set<keyof RevisionClaimAtoms>([...requiredAtoms, ...optionalAtoms]);
  const atoms = canonicalClaimAtoms(statement.claim_atoms);
  for (const key of requiredAtoms) {
    if (!atoms[key]) throw constructionError(`Missing required claim atom: ${key}.`);
  }
  for (const key of Object.keys(atoms) as Array<keyof RevisionClaimAtoms>) {
    if (!allowedAtoms.has(key)) throw constructionError(`Unsupported claim atom for ${statement.template_id}: ${key}.`);
    if (!atomSupportedByPrimaryEvidence(key, atoms[key] ?? "", primary, statement.template_id, proofSchemaVersion)) {
      throw constructionError(`Unsupported ${key} in primary evidence record ${primary.evidence_id}.`);
    }
  }
  if (statement.template_id === "metric-outcome" && primary.metric_state && primary.metric_state !== "achieved") {
    throw constructionError("Metric templates require achieved metric evidence.");
  }
  if (statement.boundary_class === "bounded-claim-control" && statement.related_application_fit_gap_ids.length === 0) {
    throw constructionError("Bounded claim controls must link to an application-fit gap.");
  }
}

function atomSupportedByPrimaryEvidence(key: keyof RevisionClaimAtoms, value: string, primary: TrustedEvidenceItem, templateId: RevisionTemplateId, proofSchemaVersion: "1.0.0" | ConstructionProofSchemaVersion): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (key === "employer") return primary.employer === trimmed || includesAtom(primary.statement, trimmed);
  if (key === "role") return primary.title === trimmed || includesAtom(primary.statement, trimmed);
  if (key === "dates") return primary.dates === trimmed || includesAtom(primary.statement, trimmed);
  if (proofSchemaVersion === constructionProofSchemaVersion && (key === "metric_value" || key === "metric_unit")) return metricAtomSupported(key, trimmed, primary);
  if (key === "metric_value" || key === "metric_unit") return includesAtom(primary.statement, trimmed);
  if (key === "bounded_qualifier") return boundedQualifierSupported(trimmed, primary, templateId);
  return includesAtom(primary.statement, trimmed);
}

export function canonicalMetricProjection(primary: TrustedEvidenceItem): MetricProjection {
  if (!primary.metric || typeof primary.metric.value !== "string" || typeof primary.metric.unit !== "string" || typeof primary.metric.state !== "string") {
    throw constructionError(`Primary evidence ${primary.evidence_id} does not include a canonical metric.`);
  }
  const metricBase = {
    source: "primary_evidence.metric" as const,
    value: primary.metric.value.trim(),
    unit: primary.metric.unit.trim(),
    state: primary.metric.state.trim()
  };
  if (!metricBase.value || !metricBase.unit || !metricBase.state) throw constructionError(`Primary evidence ${primary.evidence_id} metric is incomplete.`);
  const metricBodyHash = hashJson(metricBase);
  const withoutProjection = {
    metric_key: `metric:${primary.evidence_id}:${metricBodyHash.slice(0, 16)}`,
    ...metricBase
  };
  return {
    ...withoutProjection,
    projection_hash: hashJson(withoutProjection)
  };
}

function metricProjectionForStatement(statement: RevisionStatementLike, primary: TrustedEvidenceItem): MetricProjection {
  const projection = canonicalMetricProjection(primary);
  if (!statement.selected_metric_key || statement.selected_metric_key !== projection.metric_key) {
    throw constructionError("Metric outcome must select the primary evidence metric by canonical key.");
  }
  const atoms = canonicalClaimAtoms(statement.claim_atoms);
  if (atoms.metric_value !== projection.value || atoms.metric_unit !== projection.unit) {
    throw constructionError("Metric outcome atoms must match the selected primary evidence metric.");
  }
  return projection;
}

function metricAtomSupported(key: keyof RevisionClaimAtoms, value: string, primary: TrustedEvidenceItem): boolean {
  if (!primary.metric) return false;
  return key === "metric_value" ? primary.metric.value === value : primary.metric.unit === value;
}

function supportClauseProjectionForStatement(statement: RevisionStatementLike, primary: TrustedEvidenceItem): SupportClauseProjection | undefined {
  const atoms = canonicalClaimAtoms(statement.claim_atoms);
  const orderedAtoms = (["action", "object", "outcome"] as const).filter((atom) => atoms[atom]);
  if (orderedAtoms.length < 2) return undefined;
  const clauses = normalizedSourceClauses(primary.statement);
  for (let clauseIndex = 0; clauseIndex < clauses.length; clauseIndex += 1) {
    const clause = clauses[clauseIndex];
    const spans = orderedAtoms.map((atom) => {
      const span = findAtomSpan(clause.normalized, normalizeAtom(atoms[atom]));
      return span ? { atom, ...span } : null;
    });
    if (spans.some((span) => !span)) continue;
    const typedSpans = spans as Array<{ atom: "action" | "object" | "outcome"; start: number; end: number }>;
    const ordered = typedSpans.every((span, index) => index === 0 || typedSpans[index - 1].end <= span.start);
    const nonOverlapping = typedSpans.every((span, index) => index === 0 || typedSpans[index - 1].end <= span.start);
    if (!ordered || !nonOverlapping) continue;
    const projectionBase = {
      source: "primary_evidence.statement_clause" as const,
      clause_index: clauseIndex,
      clause_hash: hashJson({ clause: clause.normalized }),
      atom_spans: typedSpans
    };
    return {
      ...projectionBase,
      projection_hash: hashJson(projectionBase)
    };
  }
  throw constructionError("Revision statement atoms must occur in one coherent primary evidence clause.");
}

function normalizedSourceClauses(statement: string): Array<{ normalized: string }> {
  return statement
    .split(/[.;:\n\r]+|\s+\bbut\b\s+/iu)
    .map((clause) => normalizeAtom(clause))
    .filter((clause) => clause.length > 0)
    .map((normalized) => ({ normalized }));
}

function findAtomSpan(clause: string, atom: string): { start: number; end: number } | null {
  if (!atom) return null;
  const pattern = new RegExp(`(?:^|[^a-z0-9])(${escapeRegExp(atom)})(?=$|[^a-z0-9])`, "u");
  const match = pattern.exec(clause);
  if (!match || typeof match.index !== "number") return null;
  const prefixLength = match[0].length - match[1].length;
  const start = match.index + prefixLength;
  return { start, end: start + match[1].length };
}

function normalizeAtom(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9%]+/gu, " ").replace(/\s+/gu, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function canonicalBoundaryControlProjection(input: {
  statement: RevisionStatementLike;
  gap: ApplicationFitGapLike;
  gapRegisterReference: GapRegisterReferenceLike;
}): BoundaryControlProjection {
  const relatedGapIds = canonicalUnique(input.statement.related_application_fit_gap_ids, "application-fit gap");
  if (relatedGapIds.length !== 1) throw constructionError("Bounded product work must link exactly one application-fit gap.");
  const relatedGapId = relatedGapIds[0];
  if (input.gap.gap_id !== relatedGapId) throw constructionError("Bounded boundary control gap mismatch.");
  if (input.gap.gap_register_id && input.gap.gap_register_id !== input.gapRegisterReference.gap_register_id) throw constructionError("Bounded boundary control register mismatch.");
  const status = input.gap.status ?? (input.gap.gap_class === "bounded-claim-control" ? "bounded-claim" : "");
  const resolutionState = input.gap.resolution_state ?? (input.gap.generated_disposition === "generated-bounded-control" ? "bounded" : "");
  if (status !== "bounded-claim" || resolutionState !== "bounded") throw constructionError(`Gap ${relatedGapId} is not a bounded claim.`);
  if (input.gap.human_review_required !== true || input.gap.positive_claim_prohibited !== true) throw constructionError(`Gap ${relatedGapId} is missing bounded safety flags.`);
  if (Array.isArray(input.gap.closest_supported_evidence_ids) && input.gap.closest_supported_evidence_ids.length > 0 && !input.gap.closest_supported_evidence_ids.includes(input.statement.primary_evidence_id)) {
    throw constructionError(`Primary evidence ${input.statement.primary_evidence_id} is not permitted by bounded gap ${relatedGapId}.`);
  }
  if (Array.isArray(input.gap.included_statement_ids) && input.gap.included_statement_ids.length > 0 && !input.gap.included_statement_ids.includes(input.statement.statement_id)) {
    throw constructionError(`Statement ${input.statement.statement_id} is not linked from bounded gap ${relatedGapId}.`);
  }
  const boundaryBase = {
    related_gap_id: relatedGapId,
    gap_register_id: input.gapRegisterReference.gap_register_id,
      gap_register_file_hash: input.gapRegisterReference.file_hash,
      gap_register_material_hash: input.gapRegisterReference.material_hash,
      gap_boundary_hash: hashJson({
        gap_id: input.gap.gap_id,
      ...(input.gap.normalized_requirement_key ? { normalized_requirement_key: input.gap.normalized_requirement_key } : {}),
      status,
      resolution_state: resolutionState,
      claim_boundary: input.gap.claim_boundary,
      human_review_required: input.gap.human_review_required,
      positive_claim_prohibited: input.gap.positive_claim_prohibited
    }),
    allowed_representation: "bounded-product-work" as const,
    prohibited_strengthening_classes: prohibitedStrengtheningClasses()
  };
  return {
    ...boundaryBase,
    projection_hash: hashJson(boundaryBase)
  };
}

function boundaryControlForStatement(statement: RevisionStatementLike, options: ConstructionProofOptions): BoundaryControlProjection {
  if (!options.gapRegisterReference || !options.currentRegisterGaps) throw constructionError("Bounded product work requires current gap register context.");
  const relatedGapIds = canonicalUnique(statement.related_application_fit_gap_ids, "application-fit gap");
  if (relatedGapIds.length !== 1) throw constructionError("Bounded product work must link exactly one application-fit gap.");
  const gap = resolveUniqueGap(options.currentRegisterGaps, relatedGapIds[0], "current application gap register");
  if (!gap) throw constructionError(`Unknown bounded application-fit gap: ${relatedGapIds[0]}.`);
  return canonicalBoundaryControlProjection({ statement, gap, gapRegisterReference: options.gapRegisterReference });
}

function validateBoundedGapAuthorities(
  statement: RevisionStatementLike,
  currentRegisterGaps: ApplicationFitGapLike[] | undefined,
  draftApplicationFitGaps: ApplicationFitGapLike[] | undefined
): void {
  if (!currentRegisterGaps || !draftApplicationFitGaps) throw constructionError("Bounded product work requires current register and Draft gap context.");
  const relatedGapIds = canonicalUnique(statement.related_application_fit_gap_ids, "application-fit gap");
  if (relatedGapIds.length !== 1) throw constructionError("Bounded product work must link exactly one application-fit gap.");
  const currentGap = resolveUniqueGap(currentRegisterGaps, relatedGapIds[0], "current application gap register");
  const draftGap = resolveUniqueGap(draftApplicationFitGaps, relatedGapIds[0], "Draft application-fit gaps");
  if (!currentGap || !draftGap) throw constructionError(`Missing bounded application-fit gap: ${relatedGapIds[0]}.`);
  reconcileGapField(draftGap.normalized_requirement_key, currentGap.normalized_requirement_key, "normalized requirement key");
  reconcileGapField(draftGap.requirement, currentGap.requirement, "requirement");
  reconcileGapField(draftGap.claim_boundary, currentGap.claim_boundary, "claim boundary");
  reconcileGapField(draftGap.human_review_required, currentGap.human_review_required, "human review flag");
  reconcileGapField(draftGap.positive_claim_prohibited, currentGap.positive_claim_prohibited, "positive claim prohibition flag");
  reconcileGapArray(draftGap.closest_supported_evidence_ids, currentGap.closest_supported_evidence_ids, "closest supported evidence IDs");
  const expectedGapClass = currentGap.status === "bounded-claim" ? "bounded-claim-control" : "acknowledged-application-fit-gap";
  const expectedDisposition = currentGap.status === "bounded-claim" ? "generated-bounded-control" : "generated-exclusion";
  reconcileGapField(draftGap.gap_class, expectedGapClass, "Draft gap class");
  reconcileGapField(draftGap.generated_disposition, expectedDisposition, "Draft generated disposition");
  if (!Array.isArray(draftGap.included_statement_ids) || !draftGap.included_statement_ids.includes(statement.statement_id)) {
    throw constructionError(`Draft bounded gap ${relatedGapIds[0]} does not include statement ${statement.statement_id}.`);
  }
}

function resolveUniqueGap(gaps: ApplicationFitGapLike[], gapId: string, label: string): ApplicationFitGapLike | null {
  const matches = gaps.filter((gap) => gap.gap_id === gapId);
  if (matches.length > 1) throw constructionError(`Duplicate ${label} gap ID: ${gapId}.`);
  return matches[0] ?? null;
}

function reconcileGapField(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) throw constructionError(`Draft/current-register gap mismatch: ${label}.`);
}

function reconcileGapArray(actual: string[] | undefined, expected: string[] | undefined, label: string): void {
  const actualCanonical = canonicalUnique(actual ?? [], label);
  const expectedCanonical = canonicalUnique(expected ?? [], label);
  if (JSON.stringify(actualCanonical) !== JSON.stringify(expectedCanonical)) {
    throw constructionError(`Draft/current-register gap mismatch: ${label}.`);
  }
}

function prohibitedStrengtheningClasses(): ProhibitedStrengtheningClass[] {
  return [
    "production-deployment-ownership",
    "deployment-scale",
    "model-operations",
    "mlops-maturity",
    "unsupported-ai-production-impact"
  ];
}

function validateProhibitedStrengthening(text: string, statement: RevisionStatementLike, boundaryControl: BoundaryControlProjection | undefined): void {
  if (!boundaryControl) return;
  const normalized = text.toLowerCase();
  const patterns: Array<[ProhibitedStrengtheningClass, RegExp]> = [
    ["production-deployment-ownership", /\b(production|deployed|launched)\b.*\b(ai|ml|model|personalization)\b|\b(ai|ml|model|personalization)\b.*\b(production|deployed|launched)\b/u],
    ["deployment-scale", /\b(scale|scaled|millions?|users?|transactions?|traffic)\b.*\b(ai|ml|model|personalization)\b|\b(ai|ml|model|personalization)\b.*\b(scale|scaled|millions?|users?|transactions?|traffic)\b/u],
    ["model-operations", /\b(model operations|model[- ]?ops|prompt[- ]?ops|inference|training pipeline|fine[- ]?tuning)\b/u],
    ["mlops-maturity", /\bmlops|model monitoring|feature store|model registry\b/u],
    ["unsupported-ai-production-impact", /\b(ai|ml|model|personalization)\b.*\b(mrr|revenue|arr|growth|conversion|engagement lift)\b/u]
  ];
  for (const [label, pattern] of patterns) {
    if (pattern.test(normalized)) throw constructionError(`Bounded product work contains prohibited strengthening: ${label}.`);
  }
  if (statement.claim_atoms.bounded_qualifier) throw constructionError("Bounded product work proof v2 must not carry an evidence-backed bounded qualifier.");
}

function boundedQualifierSupported(value: string, primary: TrustedEvidenceItem, templateId: RevisionTemplateId): boolean {
  if (templateId !== "bounded-product-work") return false;
  const normalized = value.toLowerCase();
  if (!["bounded", "exposure to", "supported", "partnered on", "contributed to"].includes(normalized)) return false;
  if (includesAtom(primary.statement, value)) return true;
  if (normalized === "supported") return primary.collaboration_scope === "supported";
  if (normalized === "partnered on") return primary.collaboration_scope === "partnered";
  if (normalized === "contributed to") return ["team", "partnered", "supported"].includes(primary.collaboration_scope ?? "");
  return false;
}

function canonicalClaimAtoms(atoms: RevisionClaimAtoms | Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(atoms)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0)
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

function canonicalEvidenceRecord(record: TrustedEvidenceItem): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined).sort(([left], [right]) => left.localeCompare(right)));
}

function canonicalUnique(values: string[], label: string): string[] {
  if (!Array.isArray(values)) throw constructionError(`${label} IDs must be an array.`);
  const trimmed = values.map((value) => value.trim()).filter(Boolean).sort();
  if (new Set(trimmed).size !== trimmed.length) throw constructionError(`Duplicate ${label} ID.`);
  return trimmed;
}

function includesAtom(statement: string, atom: string): boolean {
  return statement.toLowerCase().includes(atom.toLowerCase());
}

function joinSentence(parts: Array<string | undefined>): string {
  const text = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part)).join(" ").replace(/\s+([).])/g, "$1");
  if (!text) throw constructionError("Revision template produced empty text.");
  return text.endsWith(".") ? text : `${text}.`;
}

function requireAtom(value: string | undefined, label: string): string {
  if (!value?.trim()) throw constructionError(`Missing required claim atom: ${label}.`);
  return value.trim();
}

function constructionError(message: string): EvidenceConstructionError {
  return new EvidenceConstructionError(message);
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
