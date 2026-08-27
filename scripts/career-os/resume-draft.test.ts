import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hashApplicationLevelGaps, normalizeApplicationRequirement, type ApplicationLevelGap } from "./application-gap-register";
import { ResumeDraftError, runCareerOsResumeDraft } from "./resume-draft";
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
        .filter((item) => item.category === "Application-level gap review")
        .map((item) => [item.check_id.replace(/^application-gap-/u, "").toUpperCase(), item]) ?? []
    );

    expect(result.draft?.references.application_gap_register_id).toBe("GAPREG-synthetic-labs");
    expect(result.draft?.application_level_gaps.map((gap) => gap.gap_id)).toEqual(["G01", "G02"]);
    expect(activeGaps.map((gap) => gap.gap_id)).toEqual(["G01", "G02"]);
    expect(result.draft?.evidence_gaps.map((gap) => gap.requirement)).toContain("Ten years of product management experience");
    expect(result.draft?.evidence_gaps.map((gap) => gap.requirement)).toContain("Restaurant technology experience");
    expect(result.draft?.excluded_unsupported_claims.map((claim) => claim.claim)).toContain("Ten years of product management experience");
    expect(result.draft?.excluded_unsupported_claims.map((claim) => claim.claim)).toContain("Restaurant technology experience");
    expect(checklistByGapId.size).toBe(activeGaps.length);
    expect(result.checklist?.approval_state).toBe("human_review_required");
    for (const gap of activeGaps) {
      const checklistItem = checklistByGapId.get(gap.gap_id);
      expect(checklistItem?.status).toBe("pending");
      expect(checklistItem?.prompt).toContain(`application-level gap ${gap.gap_id}`);
      expect(checklistItem?.prompt).toContain(gap.requirement);
      expect(checklistItem?.prompt).toContain("Preserve the claim boundary");
      expect(checklistItem?.prompt).toContain("Do not convert it into a positive resume claim");
      expect(gap.human_review_required).toBe(true);
    }
    expect(activeGaps.find((gap) => gap.gap_id === "G01")?.positive_claim_prohibited).toBe(true);
    expect(activeGaps.find((gap) => gap.gap_id === "G02")?.claim_boundary).toContain("bounded adjacent platform experience");
    expect(result.draft?.excluded_unsupported_claims.find((claim) => claim.claim === "Restaurant technology experience")?.reason).toContain("bounded adjacent platform experience");
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
    evidence: path.join(workspace, "private", "trusted-candidate-evidence.json")
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
          statement: "Built product systems across platform, analytics, and customer discovery using verified evidence.",
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

  return { workspace, registryRoot, paths };
}

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
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
