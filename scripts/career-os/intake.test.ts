import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OperatorError, runCareerOsIntake } from "./intake";

const now = "2026-08-24T10:00:00.000Z";

describe("career-os intake", () => {
  it("supports valid JSON dry run without durable writes", () => {
    const workspace = tempWorkspace();
    const input = writeJsonInput(workspace);
    const registryRoot = path.join(workspace, "registry");

    const result = runCareerOsIntake({
      cwd: workspace,
      now,
      argv: ["--input", input, "--registry-root", registryRoot, "--dry-run"]
    });

    expect(result.status).toBe("planned");
    expect(result.dry_run).toBe(true);
    expect(result.summary.company).toBe("Acme AI");
    expect(result.summary.application_id).toMatch(/^APP-acme-ai-senior-product-manager-ai-platform-/u);
    expect(existsSync(registryRoot)).toBe(false);
  });

  it("supports Markdown body input with CLI metadata", () => {
    const workspace = tempWorkspace();
    const input = path.join(workspace, "jd.md");
    writeFileSync(input, "Lead product strategy for an AI workflow platform. Partner with engineering and define success metrics.\n");

    const result = runCareerOsIntake({
      cwd: workspace,
      now,
      argv: [
        "--input",
        input,
        "--company",
        "Markdown Co",
        "--role-title",
        "Lead Product Manager",
        "--registry-root",
        path.join(workspace, "registry"),
        "--dry-run"
      ]
    });

    expect(result.summary.company).toBe("Markdown Co");
    expect(result.analysis.required_competencies.length).toBeGreaterThan(0);
  });

  it("rejects missing required fields and empty JD text", () => {
    const workspace = tempWorkspace();
    const missing = path.join(workspace, "missing.json");
    writeFileSync(missing, JSON.stringify({ company: "Acme AI", description: "AI platform role" }));
    const empty = path.join(workspace, "empty.json");
    writeFileSync(empty, JSON.stringify({ company: "Acme AI", roleTitle: "PM", description: "   " }));

    expect(() => runCareerOsIntake({ cwd: workspace, now, argv: ["--input", missing, "--registry-root", path.join(workspace, "registry"), "--dry-run"] })).toThrow(
      /role title is required/u
    );
    expect(() => runCareerOsIntake({ cwd: workspace, now, argv: ["--input", empty, "--registry-root", path.join(workspace, "registry"), "--dry-run"] })).toThrow(
      /job-description text is required/u
    );
  });

  it("rejects unsupported input types, invalid dates, malformed URLs, large files, and credential-like material", () => {
    const workspace = tempWorkspace();
    const registryRoot = path.join(workspace, "registry");
    const txt = path.join(workspace, "jd.txt");
    writeFileSync(txt, "plain text");
    const badDate = writeJsonInput(workspace, { capturedAt: "not-a-date" }, "bad-date.json");
    const badUrl = writeJsonInput(workspace, { sourceUrl: "ftp://example.com/job" }, "bad-url.json");
    const secret = writeJsonInput(workspace, { jobDescription: "This role mentions api_key by mistake." }, "secret.json");
    const large = path.join(workspace, "large.json");
    writeFileSync(large, JSON.stringify({ company: "A", roleTitle: "B", jobDescription: "x".repeat(200_001) }));

    for (const input of [txt, badDate, badUrl, secret, large]) {
      expect(() => runCareerOsIntake({ cwd: workspace, now, argv: ["--input", input, "--registry-root", registryRoot, "--dry-run"] })).toThrow();
    }
  });

  it("apply creates private records with stable ID linkage and Resume OS handoff references", () => {
    const workspace = tempWorkspace();
    const input = writeJsonInput(workspace);
    const registryRoot = path.join(workspace, "registry");

    const result = runCareerOsIntake({
      cwd: workspace,
      now,
      argv: ["--input", input, "--registry-root", registryRoot, "--candidate-evidence-reference", "candidate-profile:v1", "--apply"]
    });

    expect(result.status).toBe("created");
    expect(result.decision.outcome).toBe("pause");
    for (const file of Object.values(result.paths).filter((item) => item !== registryRoot)) {
      expect(existsSync(file)).toBe(true);
    }

    const app = readJson<Record<string, unknown>>(result.paths.application);
    const handoff = readJson<Record<string, unknown>>(result.paths.handoff_manifest);
    expect(app.jd_snapshot_id).toBe(result.summary.jd_snapshot_id);
    expect(handoff.application_id).toBe(result.summary.application_id);
    expect(handoff.jd_snapshot_id).toBe(result.summary.jd_snapshot_id);
    expect(handoff.decision_outcome).toBe("pause");
    expect(handoff.candidate_evidence_reference).toBe("candidate-profile:v1");
    expect(handoff.requested_next_workflow_stage).toBe("human_evidence_review");
  });

  it("returns pause when candidate evidence is not supplied", () => {
    const workspace = tempWorkspace();
    const result = runCareerOsIntake({
      cwd: workspace,
      now,
      argv: ["--input", writeJsonInput(workspace), "--registry-root", path.join(workspace, "registry"), "--dry-run"]
    });

    expect(result.decision.outcome).toBe("pause");
    expect(result.decision.missing_evidence.length).toBeGreaterThan(0);
    expect(result.decision.confidence.status).toBe("not-calculated");
  });

  it("is idempotent for identical apply and conflicts on materially changed JD for the same source", () => {
    const workspace = tempWorkspace();
    const registryRoot = path.join(workspace, "registry");
    const input = writeJsonInput(workspace);

    const first = runCareerOsIntake({ cwd: workspace, now, argv: ["--input", input, "--registry-root", registryRoot, "--apply"] });
    const second = runCareerOsIntake({ cwd: workspace, now, argv: ["--input", input, "--registry-root", registryRoot, "--apply"] });

    expect(first.status).toBe("created");
    expect(second.status).toBe("duplicate");
    expect(readdirSync(path.join(registryRoot, "applications")).filter((file) => file.endsWith(".json"))).toHaveLength(1);

    const changed = writeJsonInput(workspace, { jobDescription: "A materially different AI platform product role.", sourceUrl: "https://example.com/jobs/acme-ai" }, "changed.json");
    expect(() => runCareerOsIntake({ cwd: workspace, now, argv: ["--input", changed, "--registry-root", registryRoot, "--apply"] })).toThrow(/materially different JD/u);
  });

  it("normalizes JSON property order and line endings before creating stable IDs", () => {
    const workspace = tempWorkspace();
    const ordered = writeJsonInput(workspace, { jobDescription: "Own product strategy.\r\nMeasure customer outcomes.\r\n" }, "ordered.json");
    const reordered = path.join(workspace, "reordered.json");
    writeFileSync(
      reordered,
      JSON.stringify(
        {
          employmentType: "FullTime",
          location: "Remote",
          capturedAt: now,
          sourceUrl: "https://example.com/jobs/acme-ai",
          jobDescription: "Own product strategy.\nMeasure customer outcomes.",
          roleTitle: "Senior Product Manager, AI Platform",
          company: "Acme AI"
        },
        null,
        2
      )
    );

    const first = runCareerOsIntake({ cwd: workspace, now, argv: ["--input", ordered, "--registry-root", path.join(workspace, "registry"), "--dry-run"] });
    const second = runCareerOsIntake({ cwd: workspace, now, argv: ["--input", reordered, "--registry-root", path.join(workspace, "registry"), "--dry-run"] });

    expect(first.summary.jd_snapshot_id).toBe(second.summary.jd_snapshot_id);
    expect(first.summary.application_id).toBe(second.summary.application_id);
  });

  it("rolls back partial writes when handoff persistence fails", () => {
    const workspace = tempWorkspace();
    const registryRoot = path.join(workspace, "registry");

    expect(() =>
      runCareerOsIntake({
        cwd: workspace,
        now,
        simulateHandoffFailure: true,
        argv: ["--input", writeJsonInput(workspace), "--registry-root", registryRoot, "--apply"]
      })
    ).toThrow(/handoff write failure/u);

    expect(jsonCount(path.join(registryRoot, "applications"))).toBe(0);
    expect(jsonCount(path.join(registryRoot, "jd-snapshots"))).toBe(0);
    expect(jsonCount(path.join(registryRoot, "decisions"))).toBe(0);
  });

  it("rejects unsafe in-repository registry destinations and keeps private data out of git-visible paths", () => {
    const workspace = tempWorkspace();
    const input = writeJsonInput(workspace);
    const repoRoot = process.cwd();
    const safeRoot = path.join(repoRoot, "data", "private", "application-registry", "cos-2-test");
    const unsafeRoot = path.join(repoRoot, "public-registry");

    expect(() => runCareerOsIntake({ cwd: repoRoot, now, argv: ["--input", input, "--registry-root", unsafeRoot, "--dry-run"] })).toThrow(
      /data\/private/u
    );

    const result = runCareerOsIntake({ cwd: repoRoot, now, argv: ["--input", input, "--registry-root", safeRoot, "--dry-run"] });
    expect(result.paths.application).toContain(path.join("data", "private", "application-registry"));
  });

  it("rejects path traversal out of the private repository storage boundary", () => {
    const workspace = tempWorkspace();
    const traversalRoot = path.join(process.cwd(), "data", "private", "application-registry", "..", "..", "public-registry");

    expect(() => runCareerOsIntake({ cwd: process.cwd(), now, argv: ["--input", writeJsonInput(workspace), "--registry-root", traversalRoot, "--dry-run"] })).toThrow(
      /data\/private/u
    );
  });

  it("surfaces registry failure before writing records and does not use network/provider primitives", () => {
    const workspace = tempWorkspace();
    const registryRoot = path.join(workspace, "registry");

    expect(() =>
      runCareerOsIntake({
        cwd: workspace,
        now,
        simulateRegistryFailure: true,
        argv: ["--input", writeJsonInput(workspace), "--registry-root", registryRoot, "--apply"]
      })
    ).toThrow(OperatorError);
    expect(existsSync(registryRoot)).toBe(false);

    const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "intake.ts"), "utf8");
    expect(source).not.toMatch(/fetch\(|OpenAI|streamText|generateText|api\.openai/u);
  });
});

function tempWorkspace(): string {
  return mkdtempSync(path.join(os.tmpdir(), "career-os-intake-"));
}

function writeJsonInput(workspace: string, overrides: Record<string, unknown> = {}, name = "jd.json"): string {
  const input = {
    company: "Acme AI",
    roleTitle: "Senior Product Manager, AI Platform",
    jobDescription:
      "Own AI platform strategy, customer discovery, roadmap decisions, experimentation, analytics, stakeholder alignment, and cross-functional delivery for enterprise SaaS workflows.",
    sourceUrl: "https://example.com/jobs/acme-ai",
    capturedAt: now,
    location: "Remote",
    employmentType: "FullTime",
    ...overrides
  };
  const file = path.join(workspace, name);
  writeFileSync(file, JSON.stringify(input, null, 2));
  return file;
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function jsonCount(dir: string): number {
  if (!existsSync(dir)) {
    return 0;
  }
  if (!statSync(dir).isDirectory()) {
    return 0;
  }
  return readdirSync(dir).filter((file) => file.endsWith(".json")).length;
}
