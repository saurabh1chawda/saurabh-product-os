import { createHash } from "node:crypto";

export type RevisionTargetSection = "headline" | "summary" | "core-skills" | "experience-bullets" | "achievements" | "projects";
export type RevisionBoundaryClass = "ordinary-evidence-backed" | "acknowledged-application-fit-gap" | "bounded-claim-control";
export type RevisionTemplateId = "role-context" | "action-outcome" | "metric-outcome" | "bounded-product-work" | "supported-skill" | "supported-project";

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
};

export type EvidenceConstructionProof = {
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
};

export class EvidenceConstructionError extends Error {
  readonly code = "invalid-construction-proof";
}

type TemplateSupportRule = {
  required_atoms: Array<keyof RevisionClaimAtoms>;
  optional_atoms: Array<keyof RevisionClaimAtoms>;
  allowed_target_sections: RevisionTargetSection[];
  allowed_gap_classes: RevisionBoundaryClass[];
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

export function renderRevisionStatementText(statement: Pick<RevisionStatementLike, "template_id" | "claim_atoms">): string {
  const atom = canonicalClaimAtoms(statement.claim_atoms);
  switch (statement.template_id) {
    case "role-context":
      return joinSentence([atom.role, atom.employer ? `at ${atom.employer}` : "", atom.dates ? `(${atom.dates})` : ""]);
    case "action-outcome":
      return joinSentence([atom.action, atom.object, atom.employer ? `for ${atom.employer}` : "", atom.outcome ? `to ${atom.outcome}` : ""]);
    case "metric-outcome":
      return joinSentence([atom.action, atom.object, atom.metric_value && atom.metric_unit ? `by ${atom.metric_value}${atom.metric_unit}` : "", atom.employer ? `for ${atom.employer}` : "", atom.outcome ? `to ${atom.outcome}` : ""]);
    case "bounded-product-work":
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

export function hashRenderedRevisionStatement(statement: RevisionStatementLike): string {
  return hashJson({
    statement_id: statement.statement_id,
    target_section: statement.target_section,
    template_id: statement.template_id,
    claim_atoms: canonicalClaimAtoms(statement.claim_atoms),
    text: renderRevisionStatementText(statement)
  });
}

export function buildEvidenceConstructionProof(statement: RevisionStatementLike, evidenceItems: TrustedEvidenceItem[]): EvidenceConstructionProof {
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

export function validateDraftStatementConstruction(input: {
  statement: { statement_id?: string; text: string; construction?: EvidenceConstructionProof };
  evidenceItems: TrustedEvidenceItem[];
  requiredGapId?: string;
  requiredBoundaryClass?: RevisionBoundaryClass;
}): void {
  const construction = input.statement.construction;
  if (!input.statement.statement_id) throw constructionError("Constructed statement is missing a statement ID.");
  if (!construction || construction.construction_mode !== "evidence-template") throw constructionError(`Statement ${input.statement.statement_id} lacks deterministic construction provenance.`);
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
    human_review_required: true
  };
  if (input.requiredBoundaryClass && construction.boundary_class !== input.requiredBoundaryClass) {
    throw constructionError(`Statement ${input.statement.statement_id} has incompatible construction boundary.`);
  }
  if (input.requiredGapId && !construction.related_application_fit_gap_ids.includes(input.requiredGapId)) {
    throw constructionError(`Statement ${input.statement.statement_id} is not linked to bounded gap ${input.requiredGapId}.`);
  }
  const expected = buildEvidenceConstructionProof(reconstructed, input.evidenceItems);
  if (input.statement.text !== renderRevisionStatementText(reconstructed)) throw constructionError(`Statement ${input.statement.statement_id} text no longer matches deterministic construction.`);
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

function validateTemplateSupport(statement: RevisionStatementLike, primary: TrustedEvidenceItem): void {
  const rule = revisionTemplateSupportMatrix[statement.template_id];
  if (!rule.allowed_target_sections.includes(statement.target_section)) throw constructionError(`Template ${statement.template_id} cannot target ${statement.target_section}.`);
  if (!rule.allowed_gap_classes.includes(statement.boundary_class)) throw constructionError(`Template ${statement.template_id} cannot be used for ${statement.boundary_class}.`);
  const allowedAtoms = new Set<keyof RevisionClaimAtoms>([...rule.required_atoms, ...rule.optional_atoms]);
  const atoms = canonicalClaimAtoms(statement.claim_atoms);
  for (const key of rule.required_atoms) {
    if (!atoms[key]) throw constructionError(`Missing required claim atom: ${key}.`);
  }
  for (const key of Object.keys(atoms) as Array<keyof RevisionClaimAtoms>) {
    if (!allowedAtoms.has(key)) throw constructionError(`Unsupported claim atom for ${statement.template_id}: ${key}.`);
    if (!atomSupportedByPrimaryEvidence(key, atoms[key] ?? "", primary, statement.template_id)) {
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

function atomSupportedByPrimaryEvidence(key: keyof RevisionClaimAtoms, value: string, primary: TrustedEvidenceItem, templateId: RevisionTemplateId): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (key === "employer") return primary.employer === trimmed || includesAtom(primary.statement, trimmed);
  if (key === "role") return primary.title === trimmed || includesAtom(primary.statement, trimmed);
  if (key === "dates") return primary.dates === trimmed || includesAtom(primary.statement, trimmed);
  if (key === "metric_value" || key === "metric_unit") return includesAtom(primary.statement, trimmed);
  if (key === "bounded_qualifier") return boundedQualifierSupported(trimmed, primary, templateId);
  return includesAtom(primary.statement, trimmed);
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
