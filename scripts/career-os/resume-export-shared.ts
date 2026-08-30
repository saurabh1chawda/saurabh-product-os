import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { EvidenceConstructionProof } from "./resume-construction-proof.ts";

export type Mode = "dry-run" | "apply";

export class CareerOsExportError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export type DraftStatement = {
  statement_id?: string;
  text: string;
  provenance: { evidence_record_id: string };
  construction?: EvidenceConstructionProof;
};

export type ResumeDraft = {
  schema_version: "1.0.0" | "1.1.0";
  draft_id: string;
  created_at: string;
  artifact_type: "evidence-backed-resume-draft";
  lifecycle_state: string;
  readiness_state: string;
  label: string;
  candidate_identity: { evidence_source_id: string; candidate_name_reference: { statement: string; evidence_record_id?: string } };
  target: { company: string; role: string };
  references: {
    strategy_id: string;
    application_id: string;
    opportunity_id: string;
    jd_snapshot_id: string;
    handoff_id: string;
    application_gap_register_id?: string;
    predecessor_draft_id?: string;
    prior_review_decision_id?: string;
    revision_input_id?: string;
  };
  professional_headline: DraftStatement | null;
  professional_summary: DraftStatement[];
  core_skills: DraftStatement[];
  employment_history: Array<{ employer: string; title: string; dates: string; provenance?: { evidence_record_id: string }; review_flags?: string[] }>;
  role_specific_experience_bullets: DraftStatement[];
  selected_achievements: DraftStatement[];
  education: DraftStatement[];
  certifications: DraftStatement[];
  projects_or_portfolio_evidence: DraftStatement[];
  evidence_gaps: Array<{ requirement: string; reason: string; source: string }>;
  application_fit_gaps?: Array<{
    gap_id: string;
    gap_register_id: string;
    requirement: string;
    normalized_requirement_key: string;
    gap_class: "acknowledged-application-fit-gap" | "bounded-claim-control";
    generated_disposition: "pending-human-review" | "generated-exclusion" | "generated-bounded-control";
    allowed_review_dispositions: Array<"acknowledge-and-exclude" | "accept-bounded-representation" | "revise" | "require-evidence" | "reject-contradictory-content">;
    claim_boundary: string;
    closest_supported_evidence_ids: string[];
    included_statement_ids: string[];
    excluded_from_positive_claims: boolean;
    human_review_required: true;
    positive_claim_prohibited: true;
    source_reference: string;
  }>;
  excluded_unsupported_claims: Array<{ claim: string; reason: string }>;
  review_flags: string[];
  source_provenance: { strategy_path: string; candidate_evidence_path: string };
  integrity: { strategy_hash: string; candidate_evidence_hash: string; material_hash: string };
};

export type ReviewChecklist = {
  schema_version: "1.0.0" | "1.1.0";
  checklist_id?: string;
  draft_id: string;
  approval_state: string;
  draft?: { material_hash: string };
  items: Array<{
    check_id: string;
    status: string;
    evidence_ids: string[];
    applicable_gap_ids?: string[];
    required_resolution_reason_classes?: Array<
      "acknowledged-gap-claim-excluded" | "bounded-claim-verified" | "blocking-content-removed" | "evidence-verified" | "content-reviewed"
    >;
  }>;
};

export type ResumeApproval = {
  schema_version: "1.0.0" | "1.1.0";
  approval_id: string;
  artifact_type: "human-approved-resume-export-approval";
  lifecycle_state: "approved_for_export";
  approval_scope: "document_export_only_not_application_submission";
  approved_at: string;
  reviewer: string;
  approver?: { approver_id: string; display_name: string };
  draft: { draft_id: string; source_path: string; draft_hash: string; material_hash: string };
  checklist: { checklist_id?: string; source_path: string; checklist_hash: string; resolved_item_count: number };
  review_decision?: { review_decision_id: string; source_path: string; file_hash: string; material_hash: string; reviewer: string; reviewer_id?: string };
  references: ResumeDraft["references"];
  confirmations: Record<string, true>;
  integrity: { draft_hash: string; checklist_hash: string; review_decision_hash?: string; evidence_hash: string; approval_material_hash: string };
};

export type RenderLine = {
  kind: "name" | "headline" | "section" | "role" | "body" | "bullet";
  text: string;
};

type PdfLine = {
  kind: RenderLine["kind"];
  text: string;
  x?: number;
  prefix?: string;
};

export const schemaVersion = "1.0.0" as const;
export const requiredConfirmations = [
  "factual-accuracy",
  "chronology",
  "employer-title-accuracy",
  "metric-accuracy",
  "ownership-collaboration-wording",
  "projected-versus-achieved-wording",
  "contact-information",
  "absence-of-unsupported-claims",
  "approval-for-export"
];

const maxJsonBytes = 750_000;
const credentialPattern = /(password|api[_-]?key|secret|token|private[_-]?key|credential)/i;

export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) flags[key] = true;
    else {
      flags[key] = next;
      i += 1;
    }
  }
  return flags;
}

export function resolveMode(flags: Record<string, string | boolean>): Mode {
  if (flags.apply && flags["dry-run"]) throw new CareerOsExportError("invalid-input", "Use either --apply or --dry-run, not both.");
  if (flags.apply) return "apply";
  if (flags["dry-run"]) return "dry-run";
  throw new CareerOsExportError("invalid-input", "Choose --dry-run or --apply.");
}

export function readJson<T>(file: string): T {
  rejectSymlink(file);
  const stat = statSync(file);
  if (!stat.isFile()) throw new CareerOsExportError("invalid-input", `Expected a file: ${file}`);
  if (stat.size > maxJsonBytes) throw new CareerOsExportError("invalid-input", `JSON file exceeds safe size limit: ${file}`);
  const raw = readFileSync(file, "utf8");
  if (credentialPattern.test(raw)) throw new CareerOsExportError("unsafe-input", `Input contains suspected credential material: ${file}`);
  return JSON.parse(raw) as T;
}

export function resolveExistingJsonPath(cwd: string, input: string): string {
  if (containsTraversal(input)) throw new CareerOsExportError("unsafe-reference", `Path traversal is not allowed: ${input}`);
  const resolved = path.resolve(cwd, input);
  if (!existsSync(resolved)) throw new CareerOsExportError("missing-record", `File not found: ${resolved}`);
  if (path.extname(resolved).toLowerCase() !== ".json") throw new CareerOsExportError("invalid-input", "Only JSON inputs are supported.");
  rejectSymlink(resolved);
  return resolved;
}

export function inferRegistryRootFromDraft(draftPath: string): string {
  const artifactDir = path.dirname(draftPath);
  if (path.basename(artifactDir) === "resume-drafts") {
    return path.dirname(artifactDir);
  }
  const collectionDir = path.dirname(artifactDir);
  if (path.basename(collectionDir) === "resume-drafts") {
    return path.dirname(collectionDir);
  }
  throw new CareerOsExportError("invalid-draft", "Draft artifact must live under a resume-drafts directory.");
}

export function assertPrivatePath(file: string, cwd: string, label: string): void {
  if (isInside(file, os.tmpdir())) return;
  const normalized = toRelative(cwd, file);
  if (!normalized.startsWith("data/private/")) {
    throw new CareerOsExportError("unsafe-storage", `${label} must stay under data/private/ when inside the repository.`);
  }
  assertGitIgnores(cwd, normalized);
}

export function assertInside(file: string, root: string, label: string): void {
  if (!isInside(file, root)) throw new CareerOsExportError("unsafe-reference", `${label} must resolve inside the private registry root.`);
}

export function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

export function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 8);
}

export function writeJson(file: string, value: unknown): void {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function atomicWriteFiles(writes: Array<{ file: string; value: string | Buffer }>, failOnFile: string | null = null): void {
  const written: string[] = [];
  try {
    for (const write of writes) {
      if (existsSync(write.file)) throw new CareerOsExportError("output-conflict", `Refusing to overwrite existing output: ${write.file}`);
      if (failOnFile === write.file) throw new CareerOsExportError("write-failure", "Simulated write failure.");
      mkdirSync(path.dirname(write.file), { recursive: true });
      const temp = `${write.file}.tmp-${process.pid}-${Date.now()}`;
      try {
        writeFileSync(temp, write.value, { flag: "wx" });
        renameSync(temp, write.file);
        written.push(write.file);
      } catch (error) {
        rmSync(temp, { force: true });
        throw error;
      }
    }
  } catch (error) {
    for (const file of written.reverse()) rmSync(file, { force: true });
    throw error;
  }
}

export function toRelative(cwd: string, file: string): string {
  const relative = path.relative(cwd, file);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) return relative.replace(/\\/g, "/");
  return file;
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function resumeLines(draft: ResumeDraft): RenderLine[] {
  const lines: RenderLine[] = [
    { kind: "name", text: draft.candidate_identity.candidate_name_reference.statement },
    ...(draft.professional_headline ? [{ kind: "headline" as const, text: draft.professional_headline.text }] : []),
    { kind: "section", text: "Professional Summary" },
    ...draft.professional_summary.map((item) => ({ kind: "body" as const, text: item.text })),
    { kind: "section", text: "Core Skills" },
    { kind: "body", text: draft.core_skills.map((item) => item.text).join(", ") },
    { kind: "section", text: "Experience" },
    ...draft.employment_history.map((role) => ({ kind: "role" as const, text: `${role.title} - ${role.employer} | ${role.dates}` })),
    ...draft.role_specific_experience_bullets.map((item) => ({ kind: "bullet" as const, text: item.text })),
    ...(draft.education.length ? [{ kind: "section" as const, text: "Education" }, ...draft.education.map((item) => ({ kind: "body" as const, text: item.text }))] : []),
    ...(draft.certifications.length ? [{ kind: "section" as const, text: "Certifications" }, ...draft.certifications.map((item) => ({ kind: "body" as const, text: item.text }))] : []),
    ...(draft.projects_or_portfolio_evidence.length ? [{ kind: "section" as const, text: "Projects / Portfolio Evidence" }, ...draft.projects_or_portfolio_evidence.map((item) => ({ kind: "body" as const, text: item.text }))] : [])
  ];
  return lines.filter((line) => line.text.trim());
}

export function countPdfPages(buffer: Buffer): number {
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page\b/g);
  return matches?.length ?? 0;
}

export function renderDocx(lines: RenderLine[]): Buffer {
  const paragraphs = lines.map((line) => docxParagraph(line)).join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/></w:rPr><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Name"><w:name w:val="Name"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Headline"><w:name w:val="Headline"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr><w:rPr><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Section"><w:name w:val="Section"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="140" w:after="40"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Role"><w:name w:val="Role"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="80" w:after="30"/></w:pPr><w:rPr><w:b/><w:sz w:val="21"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:ind w:left="360" w:hanging="180"/><w:spacing w:after="20"/></w:pPr></w:style></w:styles>`;
  const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="180"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:hint="default"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num></w:numbering>`;
  return createZip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>` },
    { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
    { name: "word/document.xml", data: documentXml },
    { name: "word/styles.xml", data: stylesXml },
    { name: "word/numbering.xml", data: numberingXml },
    { name: "word/_rels/document.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>` }
  ]);
}

export function renderPdf(lines: RenderLine[]): Buffer {
  const renderedLines = lines.flatMap((line) => wrapPdfLine(line));
  const pages = chunkLines(renderedLines, 49);
  const pageObjects: string[] = [];
  const contentObjects: string[] = [];
  const kids: string[] = [];
  for (let index = 0; index < pages.length; index += 1) {
    const pageObjectNumber = 5 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    let y = 738;
    const ops = pages[index].map((line) => {
      const operator = pdfLineOperator(line, y);
      y -= lineHeight(line.kind);
      return operator;
    }).join("\n");
    kids.push(`${pageObjectNumber} 0 R`);
    pageObjects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    contentObjects.push(`<< /Length ${Buffer.byteLength(ops)} >>\nstream\n${ops}\nendstream`);
  }
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    ...pageObjects.flatMap((page, index) => [page, contentObjects[index]])
  ];
  const parts = ["%PDF-1.4\n"];
  const offsets = [0];
  let cursor = Buffer.byteLength(parts[0]);
  objects.forEach((object, index) => {
    const entry = `${index + 1} 0 obj\n${object}\nendobj\n`;
    offsets.push(cursor);
    parts.push(entry);
    cursor += Buffer.byteLength(entry);
  });
  const xrefStart = cursor;
  parts.push([
    `xref\n0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefStart),
    "%%EOF"
  ].join("\n"));
  return Buffer.from(parts.join(""));
}

export function extractDocxText(buffer: Buffer): string {
  return xmlUnescape(buffer.toString("utf8").replace(/<[^>]+>/g, " "));
}

export function extractPdfText(buffer: Buffer): string {
  return buffer.toString("latin1").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\n/g, " ");
}

export function validateOfficeOpenXml(buffer: Buffer): boolean {
  const body = buffer.toString("utf8");
  return body.includes("[Content_Types].xml") && body.includes("word/document.xml") && body.includes("word/styles.xml");
}

export function existingFiles(paths: string[]): string[] {
  return paths.filter((file) => existsSync(file));
}

export function safeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "resume-export";
}

function rejectSymlink(file: string): void {
  if (existsSync(file) && lstatSync(file).isSymbolicLink()) throw new CareerOsExportError("unsafe-reference", `Symlink inputs are not allowed: ${file}`);
}

function containsTraversal(reference: string): boolean {
  return reference.split(/[\\/]+/u).some((part) => part === "..");
}

function isInside(file: string, root: string): boolean {
  const relative = path.relative(root, file);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertGitIgnores(cwd: string, relativePath: string): void {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", relativePath], { cwd, stdio: "ignore" });
  } catch {
    throw new CareerOsExportError("unsafe-storage", `Private path is not ignored by Git: ${relativePath}`);
  }
}

function docxParagraph(line: RenderLine): string {
  const style = line.kind === "name" ? "Name" : line.kind === "headline" ? "Headline" : line.kind === "section" ? "Section" : line.kind === "role" ? "Role" : line.kind === "bullet" ? "Bullet" : "Normal";
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t>${xmlEscape(line.text)}</w:t></w:r></w:p>`;
}

function wrapPdfLine(line: RenderLine): PdfLine[] {
  const maxChars = line.kind === "name" ? 54 : line.kind === "headline" ? 74 : line.kind === "bullet" ? 82 : 90;
  return wrapText(line.text, maxChars).map((text, index) => {
    if (line.kind !== "bullet") return { kind: index === 0 ? line.kind : "body", text };
    return { kind: "bullet", text, x: index === 0 ? 72 : 84, prefix: index === 0 ? `${pdfBullet()} ` : "" };
  });
}

function pdfLineOperator(line: PdfLine, y: number): string {
  const style = pdfStyle(line.kind);
  const x = line.x ?? (line.kind === "name" ? centeredX(line.text, style.size) : line.kind === "headline" ? centeredX(line.text, style.size) : line.kind === "bullet" ? 72 : 54);
  const prefix = line.prefix ?? (line.kind === "bullet" ? `${pdfBullet()} ` : "");
  return `BT 0 Tc 0 Tw ${style.font} ${style.size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${prefix}${pdfEscape(line.text)}) Tj ET`;
}

function pdfStyle(kind: RenderLine["kind"]): { font: "/F1" | "/F2"; size: number } {
  if (kind === "name") return { font: "/F2", size: 16 };
  if (kind === "section") return { font: "/F2", size: 11 };
  if (kind === "role") return { font: "/F2", size: 10.5 };
  if (kind === "headline") return { font: "/F1", size: 10.5 };
  return { font: "/F1", size: 10 };
}

function lineHeight(kind: RenderLine["kind"]): number {
  if (kind === "name") return 19;
  if (kind === "headline") return 17;
  if (kind === "section") return 17;
  if (kind === "role") return 15;
  return 14;
}

function centeredX(text: string, size: number): number {
  const approximateWidth = text.length * size * 0.26;
  return Math.max(54, 306 - approximateWidth);
}

function pdfBullet(): string {
  return "\\225";
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function xmlUnescape(value: string): string {
  return value.replace(/&quot;/g, "\"").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function chunkLines<T>(lines: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < lines.length; index += size) chunks.push(lines.slice(index, index + size));
  return chunks.length ? chunks : [[]];
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let c = i;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c >>> 0;
}

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: Array<{ name: string; data: string | Buffer }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralStart = offset;
  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(centralStart, 16);
  return Buffer.concat([...localParts, central, end]);
}
