import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

type QaReport = {
  status: string;
  p0_failures: string[];
  warnings: string[];
  ats_safe: Record<string, boolean>;
  content_counts: Record<string, number>;
};

type ExportMetadata = {
  docx: string;
  pdf: string;
  content_fingerprint?: {
    headings?: string[];
    bullets?: string[];
    links?: string[];
    metrics?: string[];
    evidence_ids?: string[];
  };
  performance: {
    docx_generation_ms: number;
    pdf_generation_ms: number;
    docx_size_bytes: number;
    pdf_size_bytes: number;
  };
};

const root = process.cwd();
const exportRoot = path.join(root, "docs", "resume-os", "export");
const liveRoot = path.join(root, "docs", "resume-os", "pilots", "ebay", "export");
const fixtureRoot = path.join(exportRoot, "outputs", "fixtures");

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function existsNonEmpty(file: string): boolean {
  try {
    return statSync(file).size > 0;
  } catch {
    return false;
  }
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pdfToken(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function containsAllRequiredText(file: string, values: string[], mode: "docx" | "pdf"): string[] {
  const body = readFileSync(file, mode === "docx" ? "utf8" : "latin1");
  return values.filter((value) => {
    if (!value) return false;
    if (mode === "docx") return !body.includes(xmlEscape(value));
    const importantTokens = value.split(/\s+/).filter((token) => token.length > 3 || /[0-9%]/.test(token)).slice(0, 6);
    return importantTokens.some((token) => !body.includes(pdfToken(token)));
  });
}

function collectQaDirs(): string[] {
  const dirs = [liveRoot];
  for (const entry of readdirSync(fixtureRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) dirs.push(path.join(fixtureRoot, entry.name));
  }
  return dirs;
}

function validateDir(dir: string): { id: string; failures: string[]; warnings: string[]; metrics: Record<string, unknown> } {
  const id = path.basename(dir) === "export" ? "ebay-live-pilot" : path.basename(dir);
  const qaPath = path.join(dir, "export-qa-report.json");
  const metadataPath = path.join(dir, "export-metadata.json");
  const paginationPath = path.join(dir, "pagination-report.json");
  const failures: string[] = [];
  const warnings: string[] = [];
  if (!existsNonEmpty(qaPath)) failures.push(`${id}: missing QA report.`);
  if (!existsNonEmpty(metadataPath)) failures.push(`${id}: missing metadata report.`);
  if (!existsNonEmpty(paginationPath)) failures.push(`${id}: missing pagination report.`);
  if (failures.length) return { id, failures, warnings, metrics: {} };
  const qa = readJson<QaReport>(qaPath);
  const metadata = readJson<ExportMetadata>(metadataPath);
  const pagination = readJson<Record<string, unknown>>(paginationPath);
  if (qa.status !== "pass") failures.push(`${id}: QA status is ${qa.status}.`);
  failures.push(...(qa.p0_failures ?? []).map((failure) => `${id}: ${failure}`));
  for (const [check, passed] of Object.entries(qa.ats_safe)) {
    if (!passed) failures.push(`${id}: ATS check failed: ${check}.`);
  }
  if (!existsNonEmpty(metadata.docx)) failures.push(`${id}: DOCX missing or empty.`);
  if (!existsNonEmpty(metadata.pdf)) failures.push(`${id}: PDF missing or empty.`);
  const fp = metadata.content_fingerprint ?? {};
  if (existsNonEmpty(metadata.docx)) {
    const missingDocx = containsAllRequiredText(metadata.docx, [...(fp.headings ?? []), ...(fp.bullets ?? []), ...(fp.links ?? [])], "docx");
    if (missingDocx.length) failures.push(`${id}: DOCX missing rendered source text: ${missingDocx.slice(0, 3).join("; ")}.`);
  }
  if (existsNonEmpty(metadata.pdf)) {
    const missingPdf = containsAllRequiredText(metadata.pdf, [...(fp.metrics ?? []), ...(fp.links ?? [])], "pdf");
    if (missingPdf.length) failures.push(`${id}: PDF missing searchable source tokens: ${missingPdf.slice(0, 3).join("; ")}.`);
  }
  if ((fp.evidence_ids ?? []).length !== qa.content_counts.evidence_id_count) {
    failures.push(`${id}: evidence ID count changed between fingerprint and QA report.`);
  }
  if ((fp.bullets ?? []).length !== qa.content_counts.bullet_count) {
    failures.push(`${id}: bullet count changed between fingerprint and QA report.`);
  }
  const pageCount = Number(pagination.page_count ?? 0);
  if (pageCount > 2) warnings.push(`${id}: page count ${pageCount} exceeds target.`);
  warnings.push(...(qa.warnings ?? []).filter((warning) => !warning.startsWith("P0")).map((warning) => `${id}: ${warning}`));
  return {
    id,
    failures,
    warnings,
    metrics: {
      page_count: pageCount,
      bullet_count: qa.content_counts.bullet_count,
      section_count: qa.content_counts.section_count,
      docx_generation_ms: metadata.performance.docx_generation_ms,
      pdf_generation_ms: metadata.performance.pdf_generation_ms,
      docx_size_bytes: metadata.performance.docx_size_bytes,
      pdf_size_bytes: metadata.performance.pdf_size_bytes,
    },
  };
}

function main(): void {
  const dirs = collectQaDirs();
  const results = dirs.map(validateDir);
  const failures = results.flatMap((result) => result.failures);
  const warnings = results.flatMap((result) => result.warnings);
  const summary = {
    status: failures.length ? "fail" : "pass",
    exports_validated: results.length,
    failures,
    warnings,
    results,
    readiness_decision: failures.length ? "NOT READY" : "READY FOR DOCX/PDF EXPORT",
  };
  writeFileSync(path.join(exportRoot, "export-validation-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync(
    path.join(exportRoot, "export-validation-summary.md"),
    [
      "# Export Validation Summary",
      "",
      `Status: ${summary.status}`,
      `Exports validated: ${results.length}`,
      `Failures: ${failures.length}`,
      `Warnings: ${warnings.length}`,
      "",
      "## Results",
      "",
      "| Export | Page Count | Bullets | Sections | DOCX ms | PDF ms |",
      "| --- | ---: | ---: | ---: | ---: | ---: |",
      ...results.map((result) => `| ${result.id} | ${result.metrics.page_count ?? "n/a"} | ${result.metrics.bullet_count ?? "n/a"} | ${result.metrics.section_count ?? "n/a"} | ${result.metrics.docx_generation_ms ?? "n/a"} | ${result.metrics.pdf_generation_ms ?? "n/a"} |`),
      "",
      "## Failures",
      "",
      ...(failures.length ? failures.map((failure) => `- ${failure}`) : ["None."]),
      "",
      "## Warnings",
      "",
      ...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ["None."]),
      "",
    ].join("\n"),
  );
  console.log(`Export validation ${summary.status}. Exports: ${results.length}; failures: ${failures.length}; warnings: ${warnings.length}.`);
  if (failures.length) process.exitCode = 1;
}

main();
