import { describe, expect, it } from "vitest";
import {
  buildEvidenceConstructionProof,
  canonicalMetricProjection,
  constructionProofSchemaVersion,
  renderRevisionStatementText,
  validateDraftStatementConstruction,
  type ApplicationFitGapLike,
  type GapRegisterReferenceLike,
  type RevisionStatementLike,
  type TrustedEvidenceItem
} from "./resume-construction-proof";

describe("career-os resume construction proof", () => {
  it("accepts proof v2 metric outcomes from the primary structured metric", () => {
    const evidence = metricEvidence();
    const selectedMetric = canonicalMetricProjection(evidence[0]);
    const statement = metricStatement(selectedMetric.metric_key);

    const proof = buildEvidenceConstructionProof(statement, evidence, { proofSchemaVersion: constructionProofSchemaVersion });

    expect(proof.proof_schema_version).toBe("2.0.0");
    expect(proof.selected_metric_projection).toMatchObject({
      metric_key: selectedMetric.metric_key,
      source: "primary_evidence.metric",
      value: "42",
      unit: "%",
      state: "claimed in source"
    });
    expect(proof.selected_metric_projection?.projection_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(proof.construction_proof_hash).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("requires current Strategy when validating proof v2 constructions", () => {
    const evidence = metricEvidence();
    const selectedMetric = canonicalMetricProjection(evidence[0]);
    const statement = metricStatement(selectedMetric.metric_key);
    const proof = buildEvidenceConstructionProof(statement, evidence, { proofSchemaVersion: constructionProofSchemaVersion });
    const text = renderRevisionStatementText(statement, { proofSchemaVersion: constructionProofSchemaVersion });

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text, construction: proof },
        evidenceItems: evidence,
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: metricStrategy()
      })
    ).not.toThrow();

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text, construction: proof },
        evidenceItems: evidence,
        requiredProofSchemaVersion: constructionProofSchemaVersion
      })
    ).toThrow(/Current Strategy is required/u);

    const staleStatement = { ...statement, strategy_support_references: ["strategy.mapping:metric"] };
    const staleProof = buildEvidenceConstructionProof(staleStatement, evidence, { proofSchemaVersion: constructionProofSchemaVersion });
    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: staleStatement.statement_id, text, construction: staleProof },
        evidenceItems: evidence,
        requiredProofSchemaVersion: constructionProofSchemaVersion
      })
    ).toThrow(/Current Strategy is required/u);
    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: staleStatement.statement_id, text, construction: staleProof },
        evidenceItems: evidence,
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: metricStrategy()
      })
    ).toThrow(/Unsupported Strategy support reference syntax/u);
  });

  it("preserves proof v1 validation without Strategy and rejects unknown proof versions", () => {
    const evidence = metricEvidence();
    const statement = actionStatement();
    const proof = buildEvidenceConstructionProof(statement, evidence);

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text: renderRevisionStatementText(statement), construction: proof },
        evidenceItems: evidence
      })
    ).not.toThrow();

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text: renderRevisionStatementText(statement), construction: { ...proof, proof_schema_version: "9.9.9" as "2.0.0" } },
        evidenceItems: evidence
      })
    ).toThrow(/Unsupported construction proof schema version/u);
  });

  it("rejects forged metric projections", () => {
    const evidence = metricEvidence();
    const selectedMetric = canonicalMetricProjection(evidence[0]);
    const cases: Array<[Partial<RevisionStatementLike["claim_atoms"]>, string, RegExp]> = [
      [{ metric_value: "43", metric_unit: "%" }, selectedMetric.metric_key, /Unsupported metric_value/u],
      [{ metric_value: "42", metric_unit: "points" }, selectedMetric.metric_key, /Unsupported metric_unit/u],
      [{}, `metric:EV-metric:${"0".repeat(16)}`, /canonical key/u]
    ];

    for (const [claimPatch, metricKey, expected] of cases) {
      expect(() => buildEvidenceConstructionProof(metricStatement(metricKey, claimPatch), evidence, { proofSchemaVersion: constructionProofSchemaVersion })).toThrow(expected);
    }
  });

  it("rejects stale metric state, projection hash, evidence hash and rendered metric text", () => {
    const evidence = metricEvidence();
    const selectedMetric = canonicalMetricProjection(evidence[0]);
    const statement = metricStatement(selectedMetric.metric_key);
    const proof = buildEvidenceConstructionProof(statement, evidence, { proofSchemaVersion: constructionProofSchemaVersion });
    const text = renderRevisionStatementText(statement, { proofSchemaVersion: constructionProofSchemaVersion });

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text, construction: proof },
        evidenceItems: [{ ...evidence[0], metric: { value: "42", unit: "%", state: "altered state" } }],
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: metricStrategy()
      })
    ).toThrow(/canonical key|stale|forged/u);

    expect(() =>
      validateDraftStatementConstruction({
        statement: {
          statement_id: statement.statement_id,
          text,
          construction: { ...proof, selected_metric_projection: { ...proof.selected_metric_projection!, projection_hash: "0".repeat(64) } }
        },
        evidenceItems: evidence,
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: metricStrategy()
      })
    ).toThrow(/stale or forged/u);

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text: "Improved synthetic product strategy by 43% for Synthetic Labs to measurable outcomes.", construction: proof },
        evidenceItems: evidence,
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: metricStrategy()
      })
    ).toThrow(/text no longer matches/u);

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text, construction: proof },
        evidenceItems: [{ ...evidence[0], statement: "Reduced unrelated operational friction at Synthetic Labs.", metric: { value: "42", unit: "%", state: "claimed in source" } }],
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: metricStrategy()
      })
    ).toThrow(/Unsupported action|coherent primary evidence clause/u);
  });

  it("rejects supporting-record metric substitution", () => {
    const evidence = metricEvidence();
    const selectedMetric = canonicalMetricProjection(evidence[1]);
    const statement = {
      ...metricStatement(selectedMetric.metric_key),
      primary_evidence_id: "EV-context",
      supporting_evidence_ids: ["EV-metric"],
      trusted_evidence_ids: ["EV-context", "EV-metric"]
    };

    expect(() => buildEvidenceConstructionProof(statement, evidence, { proofSchemaVersion: constructionProofSchemaVersion })).toThrow(/Unsupported metric_value|canonical metric/u);
  });

  it("rejects same-record cross-clause atom composition and derived metrics", () => {
    const evidence = [{
      ...metricEvidence()[0],
      statement: "Improved synthetic product strategy at Synthetic Labs. Measurable outcomes supported reporting quality.",
      metric: { value: "42", unit: "%", state: "claimed in source" }
    }];
    const selectedMetric = canonicalMetricProjection(evidence[0]);

    expect(() => buildEvidenceConstructionProof(metricStatement(selectedMetric.metric_key), evidence, { proofSchemaVersion: constructionProofSchemaVersion })).toThrow(/one coherent primary evidence clause/u);
    expect(() =>
      buildEvidenceConstructionProof(
        metricStatement(selectedMetric.metric_key, { metric_value: "84", metric_unit: "%" }),
        [{ ...metricEvidence()[0], statement: `${metricEvidence()[0].statement} Also mentions 84%.` }],
        { proofSchemaVersion: constructionProofSchemaVersion }
      )
    ).toThrow(/Unsupported metric_value/u);
  });

  it("accepts proof v2 bounded product work with a non-rendered boundary control", () => {
    const evidence = boundedEvidence();
    const statement = boundedStatement();
    const proof = buildEvidenceConstructionProof(statement, evidence, boundedContext());
    const rendered = renderRevisionStatementText(statement, { proofSchemaVersion: constructionProofSchemaVersion });

    expect(proof.proof_schema_version).toBe("2.0.0");
    expect(proof.boundary_control_projection).toMatchObject({
      related_gap_id: "G05",
      gap_register_id: "GAPREG-synthetic",
      allowed_representation: "bounded-product-work"
    });
    expect(proof.boundary_control_projection?.projection_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(rendered).toBe("AI prioritization framework for Synthetic Labs.");
    expect(rendered).not.toMatch(/bounded|boundary|G05|proof|gap/u);
  });

  it.each([
    ["unknown gap", [{ ...boundedGap(), gap_id: "G99" }], /Unknown bounded application-fit gap/u],
    ["duplicate current-register rows", [boundedGap(), boundedGap()], /Duplicate current application gap register gap ID/u],
    ["unresolved gap", [{ ...boundedGap(), status: "unresolved", resolution_state: "requires-human-review" }], /not a bounded claim/u],
    ["missing safety flags", [{ ...boundedGap(), human_review_required: false }], /safety flags/u],
    ["wrong evidence", [{ ...boundedGap(), closest_supported_evidence_ids: ["EV-other"] }], /not permitted/u]
  ])("rejects invalid bounded controls: %s", (_label, applicationGaps, expected) => {
    expect(() => buildEvidenceConstructionProof(boundedStatement(), boundedEvidence(), { ...boundedContext(), currentRegisterGaps: applicationGaps })).toThrow(expected);
  });

  it.each([
    ["status", { status: "unresolved" }, /Draft\/current-register gap mismatch/u],
    ["resolution_state", { resolution_state: "requires-human-review" }, /not a bounded claim/u],
    ["human_review_required", { human_review_required: false }, /Draft\/current-register gap mismatch/u],
    ["positive_claim_prohibited", { positive_claim_prohibited: false }, /Draft\/current-register gap mismatch/u],
    ["claim_boundary", { claim_boundary: "Altered boundary." }, /Draft\/current-register gap mismatch/u],
    ["normalized_requirement_key", { normalized_requirement_key: "altered-key" }, /Draft\/current-register gap mismatch/u]
  ])("rejects stale bounded boundary material: %s", (_label, gapPatch, expected) => {
    const statement = boundedStatement();
    const evidence = boundedEvidence();
    const proof = buildEvidenceConstructionProof(statement, evidence, boundedContext());
    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text: renderRevisionStatementText(statement, { proofSchemaVersion: constructionProofSchemaVersion }), construction: proof },
        evidenceItems: evidence,
        currentRegisterGaps: [{ ...boundedGap(), ...gapPatch }],
        draftApplicationFitGaps: [draftBoundedGap()],
        gapRegisterReference: gapRegisterReference(),
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: boundedStrategy()
      })
    ).toThrow(expected);
  });

  it("rejects forged bounded projection and register hashes", () => {
    const statement = boundedStatement();
    const evidence = boundedEvidence();
    const proof = buildEvidenceConstructionProof(statement, evidence, boundedContext());
    const text = renderRevisionStatementText(statement, { proofSchemaVersion: constructionProofSchemaVersion });
    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text, construction: { ...proof, boundary_control_projection: { ...proof.boundary_control_projection!, projection_hash: "0".repeat(64) } } },
        evidenceItems: evidence,
        currentRegisterGaps: [boundedGap()],
        draftApplicationFitGaps: [draftBoundedGap()],
        gapRegisterReference: gapRegisterReference(),
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: boundedStrategy()
      })
    ).toThrow(/stale or forged/u);

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text, construction: proof },
        evidenceItems: evidence,
        currentRegisterGaps: [boundedGap()],
        draftApplicationFitGaps: [draftBoundedGap()],
        gapRegisterReference: { ...gapRegisterReference(), file_hash: "0".repeat(64) },
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: boundedStrategy()
      })
    ).toThrow(/stale or forged/u);
  });

  it.each([
    ["production-deployment-ownership", { action: "Deployed AI", object: "framework" }],
    ["deployment-scale", { action: "Scaled AI", object: "framework for users" }],
    ["model-operations", { action: "Model-ops", object: "framework" }],
    ["mlops-maturity", { action: "MLOps", object: "framework" }],
    ["unsupported-ai-production-impact", { action: "AI", object: "framework", outcome: "revenue growth" }]
  ])("rejects bounded strengthening class: %s", (_label, claim_atoms) => {
    expect(() =>
      buildEvidenceConstructionProof(
        { ...boundedStatement(), claim_atoms },
        [{ ...boundedEvidence()[0], statement: Object.values(claim_atoms).join(" ") }],
        boundedContext()
      )
    ).toThrow(/prohibited strengthening|Unsupported/u);
  });

  it("rejects stale rendered text, mixed version expectations and prohibited strengthening", () => {
    const evidence = boundedEvidence();
    const statement = boundedStatement();
    const proof = buildEvidenceConstructionProof(statement, evidence, boundedContext());

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text: "Altered text.", construction: proof },
        evidenceItems: evidence,
        currentRegisterGaps: [boundedGap()],
        draftApplicationFitGaps: [draftBoundedGap()],
        gapRegisterReference: gapRegisterReference(),
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: boundedStrategy()
      })
    ).toThrow(/text no longer matches/u);

    expect(() =>
      validateDraftStatementConstruction({
        statement: { statement_id: statement.statement_id, text: renderRevisionStatementText(statement), construction: { ...proof, proof_schema_version: undefined } },
        evidenceItems: evidence,
        requiredProofSchemaVersion: constructionProofSchemaVersion,
        strategy: boundedStrategy()
      })
    ).toThrow(/proof schema version/u);

    expect(() =>
      buildEvidenceConstructionProof(
        { ...boundedStatement(), claim_atoms: { ...boundedStatement().claim_atoms, outcome: "AI production impact" } },
        [{ ...boundedEvidence()[0], statement: "AI prioritization framework for Synthetic Labs with AI production impact." }],
        boundedContext()
      )
    ).toThrow(/prohibited strengthening/u);
  });
});

function metricEvidence(): TrustedEvidenceItem[] {
  return [
    {
      evidence_id: "EV-metric",
      statement: "Improved synthetic product strategy at Synthetic Labs during 2024-Present with measurable outcomes.",
      status: "verified",
      employer: "Synthetic Labs",
      dates: "2024-Present",
      metric: { value: "42", unit: "%", state: "claimed in source" }
    },
    {
      evidence_id: "EV-context",
      statement: "Improved synthetic product strategy at Synthetic Labs during 2024-Present with measurable outcomes.",
      status: "verified",
      employer: "Synthetic Labs",
      dates: "2024-Present",
      metric: { value: "50", unit: "%", state: "claimed in source" }
    }
  ];
}

function metricStatement(selectedMetricKey: string, claimPatch: Partial<RevisionStatementLike["claim_atoms"]> = {}): RevisionStatementLike {
  return {
    statement_id: "stmt:metric",
    target_section: "achievements",
    template_id: "metric-outcome",
    claim_atoms: {
      action: "Improved",
      object: "synthetic product strategy",
      metric_value: "42",
      metric_unit: "%",
      employer: "Synthetic Labs",
      dates: "2024-Present",
      outcome: "measurable outcomes",
      ...claimPatch
    },
    primary_evidence_id: "EV-metric",
    supporting_evidence_ids: [],
    trusted_evidence_ids: ["EV-metric"],
    strategy_support_references: ["strategy.evidence_to_requirement_mapping[0]"],
    related_application_fit_gap_ids: [],
    boundary_class: "ordinary-evidence-backed",
    human_review_required: true,
    selected_metric_key: selectedMetricKey
  };
}

function boundedEvidence(): TrustedEvidenceItem[] {
  return [
    {
      evidence_id: "EV-bounded",
      statement: "AI prioritization framework for Synthetic Labs product planning.",
      status: "verified",
      employer: "Synthetic Labs"
    }
  ];
}

function boundedStatement(): RevisionStatementLike {
  return {
    statement_id: "stmt:bounded-g05",
    target_section: "experience-bullets",
    template_id: "bounded-product-work",
    claim_atoms: { action: "AI prioritization", object: "framework", employer: "Synthetic Labs" },
    primary_evidence_id: "EV-bounded",
    supporting_evidence_ids: [],
    trusted_evidence_ids: ["EV-bounded"],
    strategy_support_references: ["strategy.application_level_gaps[G05]"],
    related_application_fit_gap_ids: ["G05"],
    boundary_class: "bounded-claim-control",
    human_review_required: true
  };
}

function boundedGap(): ApplicationFitGapLike {
  return {
    gap_id: "G05",
    requirement: "Restaurant AI product experience",
    normalized_requirement_key: "restaurant-ai-product-experience",
    status: "bounded-claim",
    resolution_state: "bounded",
    claim_boundary: "May describe AI prioritization framework, not production AI ownership.",
    closest_supported_evidence_ids: ["EV-bounded"],
    human_review_required: true,
    positive_claim_prohibited: true
  };
}

function draftBoundedGap(): ApplicationFitGapLike {
  return {
    ...boundedGap(),
    gap_register_id: "GAPREG-synthetic",
    gap_class: "bounded-claim-control",
    generated_disposition: "generated-bounded-control",
    included_statement_ids: ["stmt:bounded-g05"]
  };
}

function gapRegisterReference(): GapRegisterReferenceLike {
  return {
    gap_register_id: "GAPREG-synthetic",
    file_hash: "f".repeat(64),
    material_hash: "a".repeat(64)
  };
}

function boundedContext() {
  return {
    proofSchemaVersion: constructionProofSchemaVersion,
    currentRegisterGaps: [boundedGap()],
    gapRegisterReference: gapRegisterReference()
  };
}

function actionStatement(): RevisionStatementLike {
  return {
    statement_id: "stmt:action",
    target_section: "summary",
    template_id: "action-outcome",
    claim_atoms: {
      action: "Improved",
      object: "synthetic product strategy",
      employer: "Synthetic Labs",
      dates: "2024-Present",
      outcome: "measurable outcomes"
    },
    primary_evidence_id: "EV-metric",
    supporting_evidence_ids: [],
    trusted_evidence_ids: ["EV-metric"],
    strategy_support_references: ["strategy.evidence_to_requirement_mapping[0]"],
    related_application_fit_gap_ids: [],
    boundary_class: "ordinary-evidence-backed",
    human_review_required: true
  };
}

function metricStrategy() {
  return {
    evidence_to_requirement_mapping: [{ status: "evidence-backed", evidence_ids: ["EV-metric"] }],
    supported_positioning_themes: [],
    recommended_resume_sections_or_emphasis: [],
    application_level_gaps: []
  };
}

function boundedStrategy() {
  return {
    evidence_to_requirement_mapping: [],
    supported_positioning_themes: [],
    recommended_resume_sections_or_emphasis: [],
    application_level_gaps: [boundedGap()]
  };
}
