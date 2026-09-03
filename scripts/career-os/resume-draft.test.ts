import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hashApplicationGapRegisterMaterial, hashApplicationLevelGaps, normalizeApplicationRequirement, type ApplicationGapRegister, type ApplicationLevelGap } from "./application-gap-register";
import { canonicalMetricProjection, constructionProofSchemaVersion } from "./resume-construction-proof";
import { ResumeDraftError, runCareerOsResumeDraft } from "./resume-draft";
import { hashResumeReviewDecisionMaterial, legacyDraftReviewMigrationMode, legacyDraftReviewMigrationSchemaVersion, type ResumeReviewDecisionArtifact } from "./resume-review-decision";
import { hashResumeRevisionInputMaterial, renderRevisionStatementText, type ResumeRevisionInputArtifact, type RevisionStatement } from "./resume-revision-input";
import { hashResumeStrategyMaterial } from "./resume-strategy";

const now = "2026-08-25T09:00:00.000Z";

describe("career-os resume draft", () => {
  it("generates a review-required draft from a valid strategy and evidence", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");

    expect(result.status).toBe("created");
    expect(result.summary.lifecycle_state).toBe("human_review_required");
    expect(result.draft?.label).toBe("DRAFT - HUMAN REVIEW REQUIRED - NOT FOR APPLICATION USE");
    expect(result.draft?.target.company).toBe("Synthetic Labs");
    expect(result.draft?.professional_headline?.text).toContain("Synthetic product leader");
  });

  it("dry run produces zero durable writes", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--dry-run");

    expect(existsSync(result.output_dir)).toBe(false);
  });

  it("apply creates the exact private output set", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");

    expect(result.status).toBe("created");
    expect(existsSync(result.outputs.json)).toBe(true);
    expect(existsSync(result.outputs.markdown)).toBe(true);
    expect(existsSync(result.outputs.checklist)).toBe(true);
    expect(readFileSync(result.outputs.markdown, "utf8")).toContain("DRAFT - HUMAN REVIEW REQUIRED - NOT FOR APPLICATION USE");
  });

  it("identical apply is idempotent", () => {
    const fixture = createFixture();
    const first = runDraft(fixture, "--apply");
    const second = runDraft(fixture, "--apply");

    expect(first.status).toBe("created");
    expect(second.status).toBe("duplicate");
    expect(second.summary.draft_id).toBe(first.summary.draft_id);
  });

  it("rejects conflicting output", () => {
    const fixture = createFixture();
    const first = runDraft(fixture, "--apply");
    writeJson(first.outputs.json, { conflict: true });

    expect(() => runDraft(fixture, "--apply")).toThrow(/conflicts/u);
  });

  it("rejects blocked strategies", () => {
    const fixture = createFixture({ readiness: "blocked" });

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/Blocked strategies/u);
  });

  it("rejects unsupported strategy schema", () => {
    const fixture = createFixture({ strategyPatch: { schema_version: "2.0.0" } });

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/Unsupported strategy schema_version/u);
  });

  it("rejects missing candidate evidence", () => {
    const fixture = createFixture();

    expect(() =>
      runCareerOsResumeDraft({
        cwd: fixture.workspace,
        now,
        argv: ["--strategy", fixture.paths.strategy, "--dry-run"]
      })
    ).toThrow(/--candidate-evidence is required/u);
  });

  it("rejects untrusted candidate evidence", () => {
    const fixture = createFixture({ evidencePatch: { trust: { verified: false } } });

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/explicitly trusted/u);
  });

  it("rejects strategy and evidence hash mismatch", () => {
    const fixture = createFixture({ strategyPatch: { candidate_evidence_source: { source_hash: "wrong" } } });

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/candidate evidence source hash mismatch/u);
  });

  it("rejects cross-record ID mismatch", () => {
    const fixture = createFixture({ applicationPatch: { application_id: "APP-different" } });

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/application ID mismatch/u);
  });

  it("rejects path traversal references", () => {
    const fixture = createFixture({ strategyPatch: { handoff: { source_path: "../resume-handoffs/HANDOFF-1.json" } } });

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/Path traversal/u);
  });

  it("rejects unsafe symlink inputs", () => {
    const fixture = createFixture();
    const link = path.join(fixture.workspace, "strategy-link.json");
    try {
      symlinkSync(fixture.paths.strategy, link);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-draft.ts"), "utf8");

        expect(source).toContain("function rejectSymlink");
        expect(source).toContain("lstatSync(file).isSymbolicLink()");
        return;
      }
      throw error;
    }

    expect(() =>
      runCareerOsResumeDraft({
        cwd: fixture.workspace,
        now,
        argv: ["--strategy", link, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/Symlink inputs/u);
  });

  it("does not insert unsupported JD keywords into the draft", () => {
    const fixture = createFixture({ strategyPatch: { prioritized_signals: ["Kubernetes", "Marketplace"] } });
    const result = runDraft(fixture, "--apply");
    const body = JSON.stringify(result.draft);

    expect(body).not.toContain("Kubernetes");
    expect(body).not.toContain("Marketplace");
  });

  it("keeps missing evidence as a gap", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");

    expect(result.draft?.evidence_gaps.map((gap) => gap.requirement)).toContain("Deep compliance ownership");
    expect(result.draft?.excluded_unsupported_claims.map((claim) => claim.claim)).toContain("Deep compliance ownership");
  });

  it("preserves application-level gaps in the draft and review checklist", () => {
    const fixture = createFixture({ withApplicationGaps: true });
    const result = runDraft(fixture, "--apply");
    const activeGaps = result.draft?.application_level_gaps.filter((gap) => ["unresolved", "bounded-claim"].includes(gap.status)) ?? [];
    const checklistByGapId = new Map(
      result.checklist?.items
        .filter((item) => item.category === "Application-fit gap review")
        .map((item) => [item.check_id.replace(/^application-gap-/u, "").toUpperCase(), item]) ?? []
    );

    expect(result.draft?.references.application_gap_register_id).toBe("GAPREG-synthetic-labs");
    expect(result.draft?.schema_version).toBe("1.1.0");
    expect(result.draft?.application_level_gaps.map((gap) => gap.gap_id)).toEqual(["G01", "G02"]);
    expect(result.draft?.application_fit_gaps?.map((gap) => gap.gap_id)).toEqual(["G01", "G02"]);
    expect(activeGaps.map((gap) => gap.gap_id)).toEqual(["G01", "G02"]);
    expect(result.draft?.evidence_gaps.map((gap) => gap.requirement)).not.toContain("Ten years of product management experience");
    expect(result.draft?.evidence_gaps.map((gap) => gap.requirement)).not.toContain("Restaurant technology experience");
    expect(result.draft?.excluded_unsupported_claims.map((claim) => claim.claim)).not.toContain("Ten years of product management experience");
    expect(result.draft?.excluded_unsupported_claims.map((claim) => claim.claim)).not.toContain("Restaurant technology experience");
    expect(checklistByGapId.size).toBe(activeGaps.length);
    expect(result.checklist?.approval_state).toBe("human_review_required");
    for (const gap of activeGaps) {
      const checklistItem = checklistByGapId.get(gap.gap_id);
      expect(checklistItem?.status).toBe("pending");
      expect(checklistItem?.prompt).toContain(`application-fit gap ${gap.gap_id}`);
      expect(checklistItem?.prompt).toContain(gap.requirement);
      expect(checklistItem?.prompt).toContain("Preserve the claim boundary");
      expect(checklistItem?.prompt).toContain("Do not convert it into a positive resume claim");
      expect(gap.human_review_required).toBe(true);
    }
    expect(activeGaps.find((gap) => gap.gap_id === "G01")?.positive_claim_prohibited).toBe(true);
    expect(activeGaps.find((gap) => gap.gap_id === "G02")?.claim_boundary).toContain("bounded adjacent platform experience");
    expect(result.draft?.application_fit_gaps?.find((gap) => gap.gap_id === "G02")?.gap_class).toBe("bounded-claim-control");
    expect(result.summary.lifecycle_state).toBe("human_review_required");
    expect(result.draft?.label).toContain("NOT FOR APPLICATION USE");
    const positiveResumeText = JSON.stringify({
      headline: result.draft?.professional_headline,
      summary: result.draft?.professional_summary,
      skills: result.draft?.core_skills,
      bullets: result.draft?.role_specific_experience_bullets,
      achievements: result.draft?.selected_achievements
    });
    expect(positiveResumeText).not.toMatch(/10\+ years|ten years of product management/iu);
    expect(positiveResumeText).not.toMatch(/restaurant technology experience/iu);
  });

  it("rejects tampered application-level gap strategy fields", () => {
    const staleHash = createFixture({ withApplicationGaps: true, strategyPatch: { integrity: { application_level_gaps_hash: "stale-gap-hash" } } });
    expect(() => runDraft(staleHash, "--dry-run")).toThrow(/application level gaps hash mismatch/u);

    const resolvedWithoutEvidence = createFixture({
      withApplicationGaps: true,
      strategyPatch: {
        application_level_gaps: [
          {
            gap_id: "G01",
            requirement: "Ten years of product management experience",
            normalized_requirement_key: normalizeApplicationRequirement("Ten years of product management experience"),
            status: "resolved-with-verified-evidence",
            resolution_state: "resolved",
            explanation: "Synthetic invalid resolved gap.",
            closest_supported_evidence_ids: [],
            source_reference: "strategy.application_level_gaps",
            human_review_required: false,
            positive_claim_prohibited: false,
            claim_boundary: "Do not claim ten years unless verified."
          }
        ]
      }
    });
    expect(() => runDraft(resolvedWithoutEvidence, "--dry-run")).toThrow(/cannot be resolved without verified evidence/u);
  });

  it("rejects stale or malformed containing strategy material hashes before consuming fields", () => {
    const staleMaterialHash = createFixture({ preserveStrategyMaterialHash: true, strategyPatch: { integrity: { material_hash: "0".repeat(64) } } });
    expect(() => runDraft(staleMaterialHash, "--dry-run")).toThrow(/strategy material hash mismatch/u);

    const malformedMaterialHash = createFixture({ preserveStrategyMaterialHash: true, strategyPatch: { integrity: { material_hash: "not-a-sha" } } });
    expect(() => runDraft(malformedMaterialHash, "--dry-run")).toThrow(/material hash is missing or malformed/u);

    const materialFieldTampered = createFixture();
    const materialStrategy = JSON.parse(readFileSync(materialFieldTampered.paths.strategy, "utf8")) as Record<string, unknown>;
    materialStrategy.target = { company: "Altered Synthetic Labs", role: "Lead Product Manager" };
    writeJson(materialFieldTampered.paths.strategy, materialStrategy);
    expect(() => runDraft(materialFieldTampered, "--dry-run")).toThrow(/strategy material hash mismatch/u);
  });

  it("rejects internally rehashed application-gap tampering when the containing strategy hash is stale", () => {
    const fixture = createFixture({ withApplicationGaps: true });
    const strategy = JSON.parse(readFileSync(fixture.paths.strategy, "utf8")) as {
      application_level_gap_register: { gap_count: number; unresolved_gap_count: number; gaps_hash: string };
      application_level_gaps: ApplicationLevelGap[];
      integrity: { application_level_gaps_hash: string };
    };
    strategy.application_level_gaps = [
      {
        ...strategy.application_level_gaps[0],
        requirement: "Seven years of synthetic product management experience",
        normalized_requirement_key: normalizeApplicationRequirement("Seven years of synthetic product management experience")
      }
    ];
    const rehashedGaps = hashApplicationLevelGaps(strategy.application_level_gaps);
    strategy.application_level_gap_register.gap_count = strategy.application_level_gaps.length;
    strategy.application_level_gap_register.unresolved_gap_count = strategy.application_level_gaps.length;
    strategy.application_level_gap_register.gaps_hash = rehashedGaps;
    strategy.integrity.application_level_gaps_hash = rehashedGaps;
    writeJson(fixture.paths.strategy, strategy);

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/strategy material hash mismatch/u);
  });

  it("rejects stale application-gap register linkage even when embedded gaps are unchanged", () => {
    const fixture = createFixture({ withApplicationGaps: true });
    const strategy = JSON.parse(readFileSync(fixture.paths.strategy, "utf8")) as {
      application_level_gap_register: { gap_register_id: string };
    };
    strategy.application_level_gap_register.gap_register_id = "GAPREG-altered-synthetic-labs";
    writeJson(fixture.paths.strategy, strategy);

    expect(() => runDraft(fixture, "--dry-run")).toThrow(/strategy material hash mismatch/u);
  });

  it("rejects independent application-gap register references and structured gaps", () => {
    const missingReference = createFixture({ withApplicationGaps: true, strategyPatch: { application_level_gap_register: undefined } });
    expect(() => runDraft(missingReference, "--dry-run")).toThrow(/reference and embedded gaps must be present together/u);

    const missingGaps = createFixture({ withApplicationGaps: true, strategyPatch: { application_level_gaps: undefined } });
    expect(() => runDraft(missingGaps, "--dry-run")).toThrow(/reference and embedded gaps must be present together/u);
  });

  it("consumes structured revision input through deterministic templates", () => {
    const fixture = createFixture({ withApplicationGaps: true });
    const revision = createRevisionInputFixture(fixture);
    const result = runDraftWithRevision(fixture, revision.path, "--apply");

    const revised = result.draft?.professional_summary[0];
    expect(revised?.text).toBe(renderRevisionStatementText(revision.statement));
    expect(revised?.construction?.construction_mode).toBe("evidence-template");
    expect(revised?.construction?.primary_evidence_id).toBe("EV-summary");
    expect(revised?.construction?.primary_evidence_record_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(revised?.construction?.claim_atom_projection_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(revised?.construction?.construction_proof_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(revised?.construction?.rendered_text_hash).toBeDefined();
    expect(result.draft?.references.revision_input_id).toBe("RREVINPUT-synthetic");
    expect(result.checklist?.items.every((item) => item.status === "pending")).toBe(true);

    const alternate = createFixture({ withApplicationGaps: true });
    const alternateRevision = createRevisionInputFixture(alternate, { statementPatch: { claim_atoms: { action: "Built", object: "product systems", outcome: "platform", employer: "Synthetic Labs" } } });
    const alternateResult = runDraftWithRevision(alternate, alternateRevision.path, "--apply");
    expect(alternateResult.draft?.draft_id).not.toBe(result.draft?.draft_id);
  });

  it("consumes revision-input 1.1 metric and bounded proof v2 through the real Draft path", () => {
    const fixture = createProofV2DraftConsumerFixture();
    const dryRun = runDraftWithRevision(fixture, fixture.paths.revision, "--dry-run");

    expect(dryRun.status).toBe("planned");
    expect(existsSync(dryRun.output_dir)).toBe(false);

    const result = runDraftWithRevision(fixture, fixture.paths.revision, "--apply");
    const metric = result.draft?.selected_achievements.find((item) => item.statement_id === "stmt:metric-v2");
    const bounded = result.draft?.role_specific_experience_bullets.find((item) => item.statement_id === "stmt:bounded-g05-v2");
    const g05 = result.draft?.application_fit_gaps?.find((gap) => gap.gap_id === "G05");

    expect(result.draft?.schema_version).toBe("1.1.0");
    expect(result.draft?.references.revision_input_id).toBe("RREVINPUT-proof-v2");
    expect(result.draft?.references.predecessor_draft_id).toBe("RDRAFT-legacy-v2");
    expect(result.draft?.lifecycle_state).toBe("human_review_required");
    expect(result.draft?.readiness_state).toBe("human_review_required");
    expect(metric?.construction?.proof_schema_version).toBe(constructionProofSchemaVersion);
    expect(metric?.construction?.selected_metric_projection).toMatchObject(canonicalMetricProjection(readJson<{ evidence_items: Array<{ evidence_id: string }> }>(fixture.paths.evidence).evidence_items.find((item) => item.evidence_id === "EV-metric-v2") as never));
    expect(metric?.text).toBe("Improved synthetic product strategy by 42% for Synthetic Labs to measurable outcomes.");
    expect(metric?.text).not.toContain("claimed in source");
    expect(bounded?.construction?.proof_schema_version).toBe(constructionProofSchemaVersion);
    expect(bounded?.construction?.boundary_control_projection?.related_gap_id).toBe("G05");
    expect(bounded?.text).toBe("AI prioritization framework for Synthetic Labs.");
    expect(bounded?.text).not.toMatch(/boundary|proof|G05|gap|bounded/iu);
    expect(g05?.included_statement_ids).toEqual(["stmt:bounded-g05-v2"]);
    expect(result.draft?.application_fit_gaps?.filter((gap) => ["G01", "G02", "G03", "G04"].includes(gap.gap_id)).every((gap) => gap.included_statement_ids.length === 0)).toBe(true);
    expect(result.draft?.evidence_gaps).toEqual([]);
    expect(result.draft?.excluded_unsupported_claims).toEqual([]);
    expect(result.checklist?.items.every((item) => item.status === "pending")).toBe(true);

    const duplicate = runDraftWithRevision(fixture, fixture.paths.revision, "--apply");
    expect(duplicate.status).toBe("duplicate");
    writeJson(result.outputs.json, { conflict: true });
    expect(() => runDraftWithRevision(fixture, fixture.paths.revision, "--apply")).toThrow(/conflicts/u);
  });

  it("rejects arbitrary or unsupported structured revision input before Draft generation", () => {
    const arbitrary = createFixture({ withApplicationGaps: true });
    const arbitraryRevision = createRevisionInputFixture(arbitrary, { statementPatch: { text: "Unrelated restaurant AI leadership claim." } });
    expect(() => runDraftWithRevision(arbitrary, arbitraryRevision.path, "--dry-run")).toThrow(/templates, not free-form text/u);

    const unsupportedMetric = createFixture({ withApplicationGaps: true });
    const unsupportedRevision = createRevisionInputFixture(unsupportedMetric, {
      statementPatch: { template_id: "metric-outcome", claim_atoms: { action: "Reduced", object: "query latency", metric_value: "900", metric_unit: "%" } }
    });
    expect(() => runDraftWithRevision(unsupportedMetric, unsupportedRevision.path, "--dry-run")).toThrow(/Unsupported action|Unsupported metric_value/u);

    const crossRecord = createFixture({ withApplicationGaps: true });
    const crossRecordRevision = createRevisionInputFixture(crossRecord, {
      statementPatch: {
        claim_atoms: { action: "Built", object: "product systems", outcome: "verified evidence", employer: "Other Labs" },
        supporting_evidence_ids: ["EV-achievement-platform-latency"],
        trusted_evidence_ids: ["EV-summary", "EV-achievement-platform-latency"]
      }
    });
    expect(() => runDraftWithRevision(crossRecord, crossRecordRevision.path, "--dry-run")).toThrow(/Unsupported employer/u);
  });

  it("keeps metrics attached to the correct employer evidence record", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");
    const metric = result.draft?.role_specific_experience_bullets.find((item) => item.text.includes("42%"));

    expect(metric?.provenance.evidence_record_id).toBe("EV-achievement-platform-latency");
    expect(metric?.text).toContain("Synthetic Labs");
  });

  it("does not rewrite projected metrics as achieved metrics", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");
    const projected = result.draft?.role_specific_experience_bullets.find((item) => item.provenance.evidence_record_id === "EV-projected-retention");

    expect(projected?.text).toMatch(/projected/iu);
    expect(projected?.text).not.toMatch(/\bachieved\b|\bdelivered\b|\bincreased\b/iu);
    expect(result.draft?.review_flags.some((flag) => flag.includes("projected metric preserved"))).toBe(true);
  });

  it("does not rewrite collaborative outcomes as sole ownership", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");
    const collaborative = result.draft?.role_specific_experience_bullets.find((item) => item.provenance.evidence_record_id === "EV-collaborative-launch");

    expect(collaborative?.text.startsWith("Partnered on")).toBe(true);
    expect(result.draft?.review_flags.some((flag) => flag.includes("collaborative scope preserved"))).toBe(true);
  });

  it("flags chronology and conflicting dates", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");

    expect(result.draft?.review_flags.some((flag) => flag.includes("Potential overlapping or contradictory dates"))).toBe(true);
  });

  it("attaches provenance to every draft statement", () => {
    const fixture = createFixture();
    const result = runDraft(fixture, "--apply");
    const statements = [
      result.draft?.professional_headline,
      ...(result.draft?.professional_summary ?? []),
      ...(result.draft?.core_skills ?? []),
      ...(result.draft?.role_specific_experience_bullets ?? []),
      ...(result.draft?.education ?? []),
      ...(result.draft?.certifications ?? []),
      ...(result.draft?.projects_or_portfolio_evidence ?? [])
    ].filter(Boolean);

    expect(statements.length).toBeGreaterThan(0);
    expect(statements.every((item) => item?.provenance.evidence_record_id && item.provenance.integrity_hash)).toBe(true);
  });

  it("output is deterministic", () => {
    const fixture = createFixture();
    const first = runDraft(fixture, "--apply");
    const second = runDraft(fixture, "--apply");

    expect(first.summary).toEqual(second.summary);
    expect(first.draft).toEqual(second.draft);
    expect(first.draft?.integrity.material_hash).toBe(second.draft?.integrity.material_hash);
  });

  it("rollback preserves pre-existing files", () => {
    const fixture = createFixture();
    const marker = path.join(fixture.registryRoot, "resume-drafts", "pre-existing.json");
    writeJson(marker, { preserved: true });

    expect(() =>
      runCareerOsResumeDraft({
        cwd: fixture.workspace,
        now,
        simulateWriteFailure: true,
        argv: ["--strategy", fixture.paths.strategy, "--candidate-evidence", fixture.paths.evidence, "--apply"]
      })
    ).toThrow(ResumeDraftError);
    expect(readFileSync(marker, "utf8")).toContain("preserved");
  });

  it("normal CLI output does not emit sensitive candidate content", () => {
    const fixture = createFixture({
      evidencePatch: {
        candidate_profile: {
          candidate_name: "Sensitive Candidate Marker",
          current_positioning: "Sensitive Positioning Marker",
          contact_links: [{ label: "Email", value: "sensitive@example.invalid" }]
        },
        evidence_items: [
          {
            evidence_id: "EV-sensitive-summary",
            statement: "Sensitive evidence statement that must never print in normal CLI output.",
            tags: ["Product Strategy"],
            status: "verified",
            source_reference: "candidate.summary",
            category: "summary"
          }
        ]
      }
    });
    const stdout = execFileSync(
      process.execPath,
      [
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
        "--experimental-strip-types",
        path.join(process.cwd(), "scripts", "career-os", "resume-draft.ts"),
        "--strategy",
        fixture.paths.strategy,
        "--candidate-evidence",
        fixture.paths.evidence,
        "--dry-run"
      ],
      { cwd: fixture.workspace, encoding: "utf8" }
    );

    expect(stdout).toContain("DRY RUN - no files written");
    expect(stdout).toContain("Draft ID:");
    expect(stdout).toContain("Strategy ID:");
    expect(stdout).toContain("Lifecycle:");
    expect(stdout).toContain("Statements:");
    expect(stdout).toContain("Evidence gaps:");
    expect(stdout).toContain("Review flags:");
    expect(stdout).toContain("Output:");
    expect(stdout).not.toContain("Sensitive Candidate Marker");
    expect(stdout).not.toContain("Sensitive Positioning Marker");
    expect(stdout).not.toContain("sensitive@example.invalid");
    expect(stdout).not.toContain("Sensitive evidence statement");
  });

  it("does not directly dump draft or candidate evidence objects", () => {
    const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-draft.ts"), "utf8");

    expect(source).not.toMatch(/console\.log\(\s*(result\.draft|draft|evidence|candidateEvidence|professional_summary)/u);
  });

  it("does not use provider, LLM, browser or network primitives", () => {
    const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-draft.ts"), "utf8");

    expect(source).not.toMatch(/fetch\(|OpenAI|streamText|generateText|api\.openai|puppeteer|playwright|https?\.request/u);
  });
});

type FixtureOptions = {
  readiness?: "human_review_required" | "blocked";
  strategyPatch?: Record<string, unknown>;
  applicationPatch?: Record<string, unknown>;
  evidencePatch?: Record<string, unknown>;
  withApplicationGaps?: boolean;
  preserveStrategyMaterialHash?: boolean;
};

function runDraft(fixture: ReturnType<typeof createFixture>, mode: "--dry-run" | "--apply") {
  return runCareerOsResumeDraft({
    cwd: fixture.workspace,
    now,
    argv: ["--strategy", fixture.paths.strategy, "--candidate-evidence", fixture.paths.evidence, mode]
  });
}

function runDraftWithRevision(fixture: ReturnType<typeof createFixture>, revisionPath: string, mode: "--dry-run" | "--apply") {
  return runCareerOsResumeDraft({
    cwd: fixture.workspace,
    now,
    argv: ["--strategy", fixture.paths.strategy, "--candidate-evidence", fixture.paths.evidence, "--revision-input", revisionPath, mode]
  });
}

function createFixture(options: FixtureOptions = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-resume-draft-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    handoff: path.join(registryRoot, "resume-handoffs", "HANDOFF-2026-link.json"),
    decision: path.join(registryRoot, "decisions", "DEC-2026-link.json"),
    opportunity: path.join(registryRoot, "opportunities", "OPP-2026-link.json"),
    jd: path.join(registryRoot, "jd-snapshots", "JD-2026-content.json"),
    application: path.join(registryRoot, "applications", "APP-synthetic-labs-lead-product-manager-source.json"),
    strategy: path.join(registryRoot, "resume-strategies", "RSTRAT-APP-synthetic-labs-lead-product-manager-source.json"),
    evidence: path.join(workspace, "private", "trusted-candidate-evidence.json"),
    register: path.join(registryRoot, "application-gap-registers", "GAPREG-synthetic-labs.json")
  };

  const handoff = {
    schema_version: "1.0.0",
    resume_os_handoff_id: "HANDOFF-2026-link",
    generated_at: now,
    application_id: "APP-synthetic-labs-lead-product-manager-source",
    opportunity_id: "OPP-2026-link",
    jd_snapshot_id: "JD-2026-content"
  };
  const decision = { schema_version: "1.0.0", decision_id: "DEC-2026-link" };
  const opportunity = { schema_version: "1.0.0", opportunity_id: "OPP-2026-link" };
  const jd = { schema_version: "1.0.0", jd_snapshot_id: "JD-2026-content" };
  const application = mergeRecord(
    {
      schema_version: "1.0.0",
      application_id: "APP-synthetic-labs-lead-product-manager-source",
      company_name: "Synthetic Labs",
      role_title: "Lead Product Manager",
      current_stage: "saved",
      current_status: "action_required",
      active: true,
      jd_snapshot_id: "JD-2026-content",
      jd_hash: "jdhash123456",
      confidentiality: "private",
      contains_personal_data: true,
      safe_to_commit: false
    },
    options.applicationPatch
  );
  const evidence = mergeRecord(
    {
      schema_version: "1.0.0",
      evidence_source_id: "CEV-synthetic-profile",
      source_type: "trusted-candidate-profile",
      trust: { verified: true, verified_at: now, verified_by: "synthetic-reviewer", basis: "Synthetic test evidence." },
      candidate_profile: {
        candidate_name: "Synthetic Candidate",
        current_positioning: "Lead Product Manager"
      },
      evidence_items: [
        {
          evidence_id: "EV-headline",
          statement: "Synthetic product leader focused on platform strategy and evidence-backed execution.",
          tags: ["headline", "Product Strategy"],
          status: "verified",
          source_reference: "candidate.headline",
          category: "headline"
        },
        {
          evidence_id: "EV-summary",
          statement: "Built product systems at Synthetic Labs across platform, analytics, and customer discovery using verified evidence.",
          tags: ["Product Strategy", "Analytics"],
          status: "verified",
          source_reference: "candidate.summary",
          category: "summary"
        },
        {
          evidence_id: "EV-skill-analytics",
          statement: "Analytics",
          tags: ["Analytics"],
          status: "verified",
          source_reference: "skills.analytics",
          category: "skill"
        },
        {
          evidence_id: "EV-employment-one",
          statement: "Lead Product Manager at Synthetic Labs, 2024-Present.",
          tags: ["employment"],
          status: "verified",
          source_reference: "employment.synthetic-labs",
          category: "employment",
          employer: "Synthetic Labs",
          title: "Lead Product Manager",
          dates: "2024-Present"
        },
        {
          evidence_id: "EV-employment-conflict",
          statement: "Senior Product Manager at Synthetic Labs, 2024-Present.",
          tags: ["employment"],
          status: "verified",
          source_reference: "employment.synthetic-labs-conflict",
          category: "employment",
          employer: "Synthetic Labs",
          title: "Senior Product Manager",
          dates: "2024-Present"
        },
        {
          evidence_id: "EV-achievement-platform-latency",
          statement: "Reduced query latency by 42% at Synthetic Labs through platform workflow improvements.",
          tags: ["Platform Thinking", "Analytics"],
          status: "verified",
          source_reference: "achievements.platform-latency",
          category: "achievement",
          employer: "Synthetic Labs",
          metric_state: "achieved",
          collaboration_scope: "individual"
        },
        {
          evidence_id: "EV-projected-retention",
          statement: "Projected retention improvement of 12% if onboarding workflow changes scale.",
          tags: ["Retention"],
          status: "verified",
          source_reference: "achievements.projected-retention",
          category: "achievement",
          employer: "Synthetic Labs",
          metric_state: "projected"
        },
        {
          evidence_id: "EV-collaborative-launch",
          statement: "Led launch of a cross-functional workflow program with design and engineering.",
          tags: ["Leadership"],
          status: "verified",
          source_reference: "achievements.collaborative-launch",
          category: "achievement",
          employer: "Synthetic Labs",
          collaboration_scope: "partnered"
        },
        {
          evidence_id: "EV-education",
          statement: "MBA, Synthetic School of Management.",
          tags: ["education"],
          status: "verified",
          source_reference: "education.mba",
          category: "education"
        },
        {
          evidence_id: "EV-certification",
          statement: "Certified Synthetic Product Practitioner.",
          tags: ["certification"],
          status: "verified",
          source_reference: "certifications.product",
          category: "certification"
        },
        {
          evidence_id: "EV-project",
          statement: "Product OS case study demonstrating platform modernization decisions.",
          tags: ["project"],
          status: "verified",
          source_reference: "projects.product-os",
          category: "project"
        }
      ]
    },
    options.evidencePatch
  );

  for (const [file, value] of [
    [paths.handoff, handoff],
    [paths.decision, decision],
    [paths.opportunity, opportunity],
    [paths.jd, jd],
    [paths.application, application],
    [paths.evidence, evidence]
  ] as Array<[string, unknown]>) {
    writeJson(file, value);
  }

  const evidenceHash = fileHash(paths.evidence);
  const applicationLevelGaps: ApplicationLevelGap[] = options.withApplicationGaps
    ? [
        {
          gap_id: "G01",
          requirement: "Ten years of product management experience",
          normalized_requirement_key: normalizeApplicationRequirement("Ten years of product management experience"),
          status: "unresolved",
          resolution_state: "requires-human-review",
          explanation: "Synthetic evidence supports less than the stated requirement.",
          closest_supported_evidence_ids: ["EV-summary"],
          source_reference: "strategy.application_level_gaps:G01",
          human_review_required: true,
          positive_claim_prohibited: true,
          claim_boundary: "Do not claim ten years of product management experience unless verified evidence is added."
        },
        {
          gap_id: "G02",
          requirement: "Restaurant technology experience",
          normalized_requirement_key: normalizeApplicationRequirement("Restaurant technology experience"),
          status: "bounded-claim",
          resolution_state: "bounded",
          explanation: "Synthetic evidence supports adjacent platform work but not direct restaurant technology ownership.",
          closest_supported_evidence_ids: ["EV-summary"],
          source_reference: "strategy.application_level_gaps:G02",
          human_review_required: true,
          positive_claim_prohibited: true,
          claim_boundary: "May describe bounded adjacent platform experience, not direct restaurant technology ownership."
        }
      ]
    : [];
  const applicationLevelGapsHash = hashApplicationLevelGaps(applicationLevelGaps);
  const strategy = mergeRecord(
    {
      schema_version: "1.0.0",
      strategy_id: "RSTRAT-APP-synthetic-labs-lead-product-manager-source",
      created_at: now,
      artifact_type: "human-review-only-resume-strategy",
      application: { application_id: "APP-synthetic-labs-lead-product-manager-source", current_stage: "saved", current_status: "action_required" },
      opportunity: { opportunity_id: "OPP-2026-link", job_model_id: "job-model", hiring_model_id: "hiring-model", evaluation_framework_id: "eval" },
      jd: { jd_snapshot_id: "JD-2026-content", content_hash: "jdhash123456" },
      handoff: { resume_os_handoff_id: "HANDOFF-2026-link", generated_at: now, source_path: "registry/resume-handoffs/HANDOFF-2026-link.json" },
      target: { company: "Synthetic Labs", role: "Lead Product Manager" },
      decision_state: { outcome: "proceed", readiness_state: options.readiness ?? "human_review_required", blocking_reasons: [] },
      role_requirements: [{ requirement: "Product Strategy", priority: 1, source: "jd" }],
      prioritized_signals: ["Product Strategy", "Kubernetes"],
      evidence_to_requirement_mapping: [
        { requirement: "Product Strategy", status: "evidence-backed", evidence_ids: ["EV-summary"], notes: "Supported." },
        { requirement: "Deep compliance ownership", status: "gap", evidence_ids: [], notes: "No trusted candidate evidence supports this requirement yet." }
      ],
      supported_positioning_themes: [{ theme: "Platform strategy", status: "evidence-backed", evidence_ids: ["EV-summary"] }],
      evidence_gaps_and_unsupported_claims: [
        { claim_or_requirement: "Deep compliance ownership", status: "gap", handling: "Do not convert into a resume claim." }
      ],
      recommended_resume_sections_or_emphasis: [],
      human_review_checklist: [],
      candidate_evidence_source: {
        evidence_source_id: "CEV-synthetic-profile",
        source_hash: evidenceHash,
        verified_by: "synthetic-reviewer",
        verified_at: now
      },
      ...(options.withApplicationGaps
        ? {
            application_level_gap_register: {
              gap_register_id: "GAPREG-synthetic-labs",
              source_path: "registry/application-gap-registers/GAPREG-synthetic-labs.json",
              material_hash: "gap-register-material-hash",
              file_hash: "gap-register-file-hash",
              gap_count: applicationLevelGaps.length,
              unresolved_gap_count: applicationLevelGaps.length,
              gaps_hash: applicationLevelGapsHash
            },
            application_level_gaps: applicationLevelGaps
          }
        : {}),
      integrity: {
        handoff_hash: fileHash(paths.handoff),
        decision_hash: fileHash(paths.decision),
        opportunity_hash: fileHash(paths.opportunity),
        jd_snapshot_hash: fileHash(paths.jd),
        application_hash: fileHash(paths.application),
        candidate_evidence_hash: evidenceHash,
        ...(options.withApplicationGaps
          ? {
              application_gap_register_hash: "gap-register-file-hash",
              application_level_gaps_hash: applicationLevelGapsHash
            }
          : {}),
        material_hash: "strategy-material"
      },
      limitations: ["Human-review-only strategy; not application-ready."]
    },
    options.strategyPatch
  );
  if (!options.preserveStrategyMaterialHash) {
    const typedStrategy = strategy as Parameters<typeof hashResumeStrategyMaterial>[0];
    typedStrategy.integrity = {
      ...typedStrategy.integrity,
      material_hash: hashResumeStrategyMaterial(typedStrategy)
    };
  }
  writeJson(paths.strategy, strategy);
  if (options.withApplicationGaps) {
    const register = withApplicationGapRegisterHash({
      schema_version: "1.0.0",
      artifact_type: "application-level-gap-register",
      gap_register_id: "GAPREG-synthetic-labs",
      application_id: "APP-synthetic-labs-lead-product-manager-source",
      jd_snapshot_id: "JD-2026-content",
      opportunity_id: "OPP-2026-link",
      handoff_id: "HANDOFF-2026-link",
      decision_id: "DEC-2026-link",
      decision_reconciliation_id: null,
      candidate_evidence_id: "CEV-synthetic-profile",
      candidate_evidence_hash: evidenceHash,
      created_at: now,
      created_by: "Synthetic Reviewer",
      source_reference: "synthetic",
      gaps: applicationLevelGaps,
      integrity: { material_hash: "" }
    });
    writeJson(paths.register, register);
  }

  return { workspace, registryRoot, paths };
}

function createRevisionInputFixture(
  fixture: ReturnType<typeof createFixture>,
  options: { statementPatch?: Record<string, unknown> } = {}
): { path: string; statement: RevisionStatement } {
  const predecessorDraftPath = path.join(fixture.registryRoot, "resume-drafts", "RDRAFT-predecessor", "resume-draft.json");
  const predecessorChecklistPath = path.join(fixture.registryRoot, "resume-drafts", "RDRAFT-predecessor", "review-checklist.json");
  const reviewPath = path.join(fixture.registryRoot, "resume-review-decisions", "RREVIEW-synthetic", "resume-review-decision.json");
  const revisionPath = path.join(fixture.registryRoot, "resume-revision-inputs", "RREVINPUT-synthetic", "resume-revision-input.json");
  const predecessorDraft = {
    schema_version: "1.1.0",
    draft_id: "RDRAFT-predecessor",
    references: { application_id: "APP-synthetic-labs-lead-product-manager-source" },
    professional_summary: [{ statement_id: "stmt:EV-summary", text: "Built product systems across platform, analytics, and customer discovery using verified evidence." }],
    core_skills: [],
    role_specific_experience_bullets: [],
    selected_achievements: [],
    education: [],
    certifications: [],
    projects_or_portfolio_evidence: [],
    application_fit_gaps: [{ gap_id: "G01", gap_class: "acknowledged-application-fit-gap", allowed_review_dispositions: ["acknowledge-and-exclude"], included_statement_ids: [] }],
    integrity: { material_hash: "predecessor-material" }
  };
  const predecessorChecklist = { schema_version: "1.1.0", checklist_id: "RCHK-RDRAFT-predecessor", draft_id: "RDRAFT-predecessor", items: [{ check_id: "claim-verification", status: "pending", evidence_ids: ["EV-summary"], applicable_gap_ids: [], required_resolution_reason_classes: ["content-reviewed"] }] };
  writeJson(predecessorDraftPath, predecessorDraft);
  writeJson(predecessorChecklistPath, predecessorChecklist);
  const review: ResumeReviewDecisionArtifact = {
    schema_version: "1.0.0",
    artifact_type: "resume-review-decision",
    review_decision_id: "RREVIEW-synthetic",
    application_id: "APP-synthetic-labs-lead-product-manager-source",
    lifecycle_state: "revision_required",
    approval_granted: false,
    reviewer: { reviewer_id: "candidate:synthetic", display_name: "Synthetic Candidate", reviewer_role: "candidate-content-reviewer" },
    reviewed_at: now,
    draft: { draft_id: "RDRAFT-predecessor", source_path: predecessorDraftPath, file_hash: fileHash(predecessorDraftPath), material_hash: "predecessor-material" },
    checklist: { checklist_id: "RCHK-RDRAFT-predecessor", source_path: predecessorChecklistPath, file_hash: fileHash(predecessorChecklistPath) },
    statement_decisions: [{ statement_id: "stmt:EV-summary", decision: "revise" }],
    gap_decisions: [{ gap_id: "G01", source_gap_class: "acknowledged-application-fit-gap", decision: "acknowledge-and-exclude", reviewed_statement_ids: [], checklist_item_id: "claim-verification", resolution_reason: "acknowledged-gap-claim-excluded" }],
    checklist_decisions: [{ check_id: "claim-verification", decision: "resolved", resolution_reason: "content-reviewed" }],
    section_decision: "authorize-evidence-backed-expansion",
    integrity: { material_hash: "" }
  };
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  writeJson(reviewPath, review);
  const statement = mergeRecord(
    {
      statement_id: "stmt:revision-summary",
      predecessor_statement_id: "stmt:EV-summary",
      target_section: "summary",
      template_id: "action-outcome",
      claim_atoms: { action: "Built", object: "product systems", outcome: "verified evidence", employer: "Synthetic Labs" },
      primary_evidence_id: "EV-summary",
      supporting_evidence_ids: ["EV-achievement-platform-latency"],
      trusted_evidence_ids: ["EV-summary", "EV-achievement-platform-latency"],
      strategy_support_references: ["strategy.mapping:product"],
      related_application_fit_gap_ids: [],
      boundary_class: "ordinary-evidence-backed",
      human_review_required: true
    },
    options.statementPatch
  ) as RevisionStatement;
  const revision: ResumeRevisionInputArtifact = {
    schema_version: "1.0.0",
    artifact_type: "resume-revision-input",
    revision_input_id: "RREVINPUT-synthetic",
    application_id: "APP-synthetic-labs-lead-product-manager-source",
    created_at: now,
    created_by: "Synthetic Candidate",
    lifecycle_state: "human_review_required",
    predecessor_draft: { draft_id: "RDRAFT-predecessor", source_path: predecessorDraftPath, file_hash: fileHash(predecessorDraftPath), material_hash: "predecessor-material" },
    predecessor_checklist: { checklist_id: "RCHK-RDRAFT-predecessor", source_path: predecessorChecklistPath, file_hash: fileHash(predecessorChecklistPath) },
    prior_review_decision: { review_decision_id: "RREVIEW-synthetic", source_path: reviewPath, file_hash: fileHash(reviewPath), material_hash: review.integrity.material_hash },
    strategy: { strategy_id: "RSTRAT-APP-synthetic-labs-lead-product-manager-source", source_path: fixture.paths.strategy, file_hash: fileHash(fixture.paths.strategy), material_hash: readJson<{ integrity: { material_hash: string } }>(fixture.paths.strategy).integrity.material_hash },
    candidate_evidence: { evidence_source_id: "CEV-synthetic-profile", source_path: fixture.paths.evidence, file_hash: fileHash(fixture.paths.evidence) },
    application_gap_register: { gap_register_id: "GAPREG-synthetic-labs", source_path: fixture.paths.register, file_hash: fileHash(fixture.paths.register), material_hash: readJson<{ integrity: { material_hash: string } }>(fixture.paths.register).integrity.material_hash },
    revised_statements: [statement],
    expansion_items: [],
    integrity: { material_hash: "" }
  };
  revision.integrity.material_hash = hashResumeRevisionInputMaterial(revision);
  writeJson(revisionPath, revision);
  return { path: revisionPath, statement };
}

function createProofV2DraftConsumerFixture(): ReturnType<typeof createFixture> & { paths: ReturnType<typeof createFixture>["paths"] & { revision: string } } {
  const fixture = createFixture({
    withApplicationGaps: true,
    strategyPatch: {
      evidence_to_requirement_mapping: [
        { requirement: "Product Strategy", status: "evidence-backed", evidence_ids: ["EV-summary"], notes: "Supported." }
      ],
      evidence_gaps_and_unsupported_claims: []
    }
  }) as ReturnType<typeof createFixture> & { paths: ReturnType<typeof createFixture>["paths"] & { revision: string } };
  fixture.paths.revision = path.join(fixture.registryRoot, "resume-revision-inputs", "RREVINPUT-proof-v2", "resume-revision-input.json");

  const evidence = readJson<{ evidence_items: Array<Record<string, unknown>> }>(fixture.paths.evidence);
  evidence.evidence_items.push(
    {
      evidence_id: "EV-metric-v2",
      statement: "Improved synthetic product strategy by 42% at Synthetic Labs during 2024-Present to measurable outcomes.",
      tags: ["Product Strategy", "Analytics"],
      status: "verified",
      source_reference: "achievements.metric-v2",
      category: "achievement",
      employer: "Synthetic Labs",
      dates: "2024-Present",
      metric: { value: "42", unit: "%", state: "claimed in source" }
    },
    {
      evidence_id: "EV-bounded-v2",
      statement: "AI prioritization framework for Synthetic Labs product planning.",
      tags: ["Product Strategy"],
      status: "verified",
      source_reference: "achievements.bounded-v2",
      category: "achievement",
      employer: "Synthetic Labs"
    }
  );
  writeJson(fixture.paths.evidence, evidence);
  const evidenceHash = fileHash(fixture.paths.evidence);

  const applicationLevelGaps: ApplicationLevelGap[] = [
    ...["G01", "G02", "G03", "G04"].map((gapId) => ({
      gap_id: gapId,
      requirement: `${gapId} unresolved synthetic requirement`,
      normalized_requirement_key: normalizeApplicationRequirement(`${gapId} unresolved synthetic requirement`),
      status: "unresolved" as const,
      resolution_state: "requires-human-review" as const,
      explanation: "Synthetic unresolved predecessor gap.",
      closest_supported_evidence_ids: ["EV-summary"],
      source_reference: `strategy.application_level_gaps:${gapId}`,
      human_review_required: true,
      positive_claim_prohibited: true,
      claim_boundary: `Do not claim ${gapId} synthetic requirement.`
    })),
    {
      gap_id: "G05",
      requirement: "Restaurant AI product experience",
      normalized_requirement_key: normalizeApplicationRequirement("Restaurant AI product experience"),
      status: "bounded-claim",
      resolution_state: "bounded",
      explanation: "Synthetic evidence supports adjacent AI prioritization framework work only.",
      closest_supported_evidence_ids: ["EV-bounded-v2"],
      source_reference: "strategy.application_level_gaps:G05",
      human_review_required: true,
      positive_claim_prohibited: true,
      claim_boundary: "May describe bounded AI prioritization framework work, not direct restaurant AI ownership."
    }
  ];
  const register = withApplicationGapRegisterHash({
    schema_version: "1.0.0",
    artifact_type: "application-level-gap-register",
    gap_register_id: "GAPREG-synthetic-labs",
    application_id: "APP-synthetic-labs-lead-product-manager-source",
    jd_snapshot_id: "JD-2026-content",
    opportunity_id: "OPP-2026-link",
    handoff_id: "HANDOFF-2026-link",
    decision_id: "DEC-2026-link",
    decision_reconciliation_id: null,
    candidate_evidence_id: "CEV-synthetic-profile",
    candidate_evidence_hash: evidenceHash,
    created_at: now,
    created_by: "Synthetic Reviewer",
    source_reference: "synthetic",
    gaps: applicationLevelGaps,
    integrity: { material_hash: "" }
  });
  writeJson(fixture.paths.register, register);
  const registerFileHash = fileHash(fixture.paths.register);
  const applicationLevelGapsHash = hashApplicationLevelGaps(applicationLevelGaps);
  const strategy = readJson<Record<string, unknown> & {
    candidate_evidence_source: Record<string, unknown>;
    application_level_gap_register: Record<string, unknown>;
    evidence_to_requirement_mapping: Array<Record<string, unknown>>;
    integrity: Record<string, unknown>;
  }>(fixture.paths.strategy);
  strategy.candidate_evidence_source.source_hash = evidenceHash;
  strategy.evidence_to_requirement_mapping = [
    ...(strategy.evidence_to_requirement_mapping ?? []),
    { requirement: "Synthetic metric execution", status: "evidence-backed", evidence_ids: ["EV-metric-v2"], notes: "Supported by synthetic metric evidence." }
  ];
  strategy.application_level_gaps = applicationLevelGaps;
  strategy.application_level_gap_register = {
    gap_register_id: "GAPREG-synthetic-labs",
    source_path: "registry/application-gap-registers/GAPREG-synthetic-labs.json",
    material_hash: register.integrity.material_hash,
    file_hash: registerFileHash,
    gap_count: applicationLevelGaps.length,
    unresolved_gap_count: applicationLevelGaps.length,
    gaps_hash: applicationLevelGapsHash
  };
  strategy.integrity = {
    ...strategy.integrity,
    candidate_evidence_hash: evidenceHash,
    application_gap_register_hash: registerFileHash,
    application_level_gaps_hash: applicationLevelGapsHash,
    material_hash: ""
  };
  strategy.integrity.material_hash = hashResumeStrategyMaterial(strategy as Parameters<typeof hashResumeStrategyMaterial>[0]);
  writeJson(fixture.paths.strategy, strategy);

  const predecessorDraftPath = path.join(fixture.registryRoot, "resume-drafts", "RDRAFT-legacy-v2", "resume-draft.json");
  const predecessorChecklistPath = path.join(fixture.registryRoot, "resume-drafts", "RDRAFT-legacy-v2", "review-checklist.json");
  const reviewPath = path.join(fixture.registryRoot, "resume-review-decisions", "RREVIEW-legacy-v2", "resume-review-decision.json");
  const predecessorDraft = {
    schema_version: "1.0.0",
    artifact_type: "evidence-backed-resume-draft",
    draft_id: "RDRAFT-legacy-v2",
    references: { application_id: "APP-synthetic-labs-lead-product-manager-source" },
    professional_summary: [{ statement_id: "stmt:S1", text: "Historical metric statement." }],
    core_skills: [],
    role_specific_experience_bullets: [{ statement_id: "stmt:S2", text: "Historical bounded statement." }],
    selected_achievements: [],
    education: [],
    certifications: [],
    projects_or_portfolio_evidence: [],
    application_level_gaps: applicationLevelGaps,
    integrity: { material_hash: "legacy-v2-draft-material" }
  };
  const predecessorChecklist = {
    schema_version: "1.0.0",
    draft_id: "RDRAFT-legacy-v2",
    items: [
      { check_id: "claim-verification", status: "pending", applicable_gap_ids: [] },
      ...applicationLevelGaps.map((gap) => ({ check_id: `application-gap-${gap.gap_id.toLowerCase()}`, status: "pending", applicable_gap_ids: [gap.gap_id] }))
    ]
  };
  writeJson(predecessorDraftPath, predecessorDraft);
  writeJson(predecessorChecklistPath, predecessorChecklist);
  const review = {
    schema_version: legacyDraftReviewMigrationSchemaVersion,
    artifact_type: "resume-review-decision",
    review_mode: legacyDraftReviewMigrationMode,
    migration_only: true,
    review_decision_id: "RREVIEW-legacy-v2",
    application_id: "APP-synthetic-labs-lead-product-manager-source",
    lifecycle_state: "revision_required",
    approval_granted: false,
    reviewer: { reviewer_id: "candidate:synthetic", display_name: "Synthetic Candidate", reviewer_role: "candidate-content-reviewer" },
    reviewed_at: now,
    draft: { draft_id: "RDRAFT-legacy-v2", source_path: predecessorDraftPath, file_hash: fileHash(predecessorDraftPath), material_hash: "legacy-v2-draft-material" },
    checklist: { checklist_id: "RCHK-RDRAFT-legacy-v2", source_path: predecessorChecklistPath, file_hash: fileHash(predecessorChecklistPath) },
    statement_decisions: [{ statement_id: "stmt:S1", decision: "revise" }, { statement_id: "stmt:S2", decision: "revise" }],
    gap_decisions: applicationLevelGaps.map((gap) => ({
      gap_id: gap.gap_id,
      source_gap_class: gap.status === "bounded-claim" ? "legacy-bounded-application-level-gap" : "legacy-unresolved-application-level-gap",
      decision: gap.status === "bounded-claim" ? "accept-bounded-representation" : "acknowledge-and-exclude",
      reviewed_statement_ids: [],
      checklist_item_id: `application-gap-${gap.gap_id.toLowerCase()}`,
      resolution_reason: gap.status === "bounded-claim" ? "bounded-claim-verified" : "acknowledged-gap-claim-excluded"
    })),
    checklist_decisions: [
      { check_id: "claim-verification", decision: "resolved", resolution_reason: "content-reviewed" },
      ...applicationLevelGaps.map((gap) => ({
        check_id: `application-gap-${gap.gap_id.toLowerCase()}`,
        decision: "resolved",
        resolution_reason: gap.status === "bounded-claim" ? "bounded-claim-verified" : "acknowledged-gap-claim-excluded"
      }))
    ],
    section_decision: "authorize-evidence-backed-expansion",
    integrity: { material_hash: "" }
  } as ResumeReviewDecisionArtifact;
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  writeJson(reviewPath, review);

  const metricEvidence = evidence.evidence_items.find((item) => item.evidence_id === "EV-metric-v2");
  const metricKey = canonicalMetricProjection(metricEvidence as Parameters<typeof canonicalMetricProjection>[0]).metric_key;
  const revision = {
    schema_version: "1.1.0",
    artifact_type: "resume-revision-input",
    revision_input_id: "RREVINPUT-proof-v2",
    application_id: "APP-synthetic-labs-lead-product-manager-source",
    created_at: now,
    created_by: "Synthetic Candidate",
    lifecycle_state: "human_review_required",
    predecessor_draft: { draft_id: "RDRAFT-legacy-v2", source_path: predecessorDraftPath, file_hash: fileHash(predecessorDraftPath), material_hash: "legacy-v2-draft-material" },
    predecessor_checklist: { checklist_id: "RCHK-RDRAFT-legacy-v2", source_path: predecessorChecklistPath, file_hash: fileHash(predecessorChecklistPath) },
    prior_review_decision: { review_decision_id: "RREVIEW-legacy-v2", source_path: reviewPath, file_hash: fileHash(reviewPath), material_hash: review.integrity.material_hash },
    strategy: { strategy_id: strategy.strategy_id, source_path: fixture.paths.strategy, file_hash: fileHash(fixture.paths.strategy), material_hash: strategy.integrity.material_hash },
    candidate_evidence: { evidence_source_id: "CEV-synthetic-profile", source_path: fixture.paths.evidence, file_hash: fileHash(fixture.paths.evidence) },
    application_gap_register: { gap_register_id: "GAPREG-synthetic-labs", source_path: fixture.paths.register, file_hash: fileHash(fixture.paths.register), material_hash: register.integrity.material_hash },
    revised_statements: [
      {
        statement_id: "stmt:metric-v2",
        predecessor_statement_id: "stmt:S1",
        target_section: "achievements",
        template_id: "metric-outcome",
        claim_atoms: { action: "Improved", object: "synthetic product strategy", metric_value: "42", metric_unit: "%", employer: "Synthetic Labs", outcome: "measurable outcomes" },
        primary_evidence_id: "EV-metric-v2",
        supporting_evidence_ids: [],
        trusted_evidence_ids: ["EV-metric-v2"],
        strategy_support_references: ["strategy.evidence_to_requirement_mapping[1]"],
        related_application_fit_gap_ids: [],
        boundary_class: "ordinary-evidence-backed",
        human_review_required: true,
        selected_metric_key: metricKey
      },
      {
        statement_id: "stmt:bounded-g05-v2",
        predecessor_statement_id: "stmt:S2",
        target_section: "experience-bullets",
        template_id: "bounded-product-work",
        claim_atoms: { action: "AI prioritization", object: "framework", employer: "Synthetic Labs" },
        primary_evidence_id: "EV-bounded-v2",
        supporting_evidence_ids: [],
        trusted_evidence_ids: ["EV-bounded-v2"],
        strategy_support_references: ["strategy.application_level_gaps[G05]"],
        related_application_fit_gap_ids: ["G05"],
        boundary_class: "bounded-claim-control",
        human_review_required: true
      }
    ],
    expansion_items: [],
    integrity: { material_hash: "" }
  } as ResumeRevisionInputArtifact;
  revision.integrity.material_hash = hashResumeRevisionInputMaterial(revision);
  writeJson(fixture.paths.revision, revision);
  return fixture;
}

function withApplicationGapRegisterHash(register: ApplicationGapRegister): ApplicationGapRegister {
  return { ...register, integrity: { material_hash: hashApplicationGapRegisterMaterial(register) } };
}

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function mergeRecord(base: Record<string, unknown>, patch: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!patch) {
    return base;
  }
  const next = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    next[key] = isPlainObject(value) && isPlainObject(next[key]) ? mergeRecord(next[key], value) : value;
  }
  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
