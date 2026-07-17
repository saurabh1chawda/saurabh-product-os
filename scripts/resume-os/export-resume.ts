import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

type Link = {
  label: string;
  value?: string | null;
  url?: string | null;
  portfolio_url?: string | null;
};

type Bullet = {
  bullet_id: string;
  achievement_id: string;
  text: string;
  [key: string]: unknown;
};

type ExperienceSection = {
  company: string;
  title: string;
  dates: string;
  bullets: Bullet[];
};

type Draft = {
  assembly_metadata?: { assembly_id?: string; label?: string; status?: string; [key: string]: unknown };
  target_company?: string;
  target_role?: string;
  selected_headline: string | { text: string; [key: string]: unknown };
  selected_summary?: { text: string; [key: string]: unknown };
  summary?: string;
  contact_links?: Link[];
  experience_sections: ExperienceSection[];
  selected_projects?: Array<Record<string, unknown>>;
  selected_product_os_module?: Record<string, unknown>;
  skills?: string[];
  tools?: string[];
  credentials?: { certifications?: string[]; education?: string[]; awards?: string[] };
  certifications?: string[];
  education?: string[];
  awards?: string[];
  publications?: string[];
  selected_achievement_ids?: string[];
  selected_bullet_ids?: string[];
  warnings?: string[];
  gaps?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type RenderLine = {
  kind: "name" | "contact" | "headline" | "section" | "role" | "body" | "bullet";
  text: string;
  url?: string;
};

type ExportRecord = {
  id: string;
  input: string;
  outputDir: string;
  docx: string;
  pdf: string;
  metadata: string;
  formattingReport: string;
  paginationReport: string;
  qaReport: string;
  isLivePilot: boolean;
};

const root = process.cwd();
const exportRoot = path.join(root, "docs", "resume-os", "export");
const outputsRoot = path.join(exportRoot, "outputs");
const fixtureRoot = path.join(outputsRoot, "fixtures");
const liveRoot = path.join(root, "docs", "resume-os", "pilots", "ebay", "export");

const PAGE_HEIGHT = 792;
const PAGE_WIDTH = 612;
const MARGIN_X = 54;
const MARGIN_TOP = 54;
const MARGIN_BOTTOM = 54;
const BODY_SIZE = 10.5;
const HEADER_SIZE = 16;
const SECTION_SIZE = 11;
const LINE_HEIGHT = 13.5;
const usableWidth = PAGE_WIDTH - (MARGIN_X * 2);

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, value: unknown): void {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function textOf(value: string | { text: string } | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.text;
}

function publicValue(link: Link): string {
  return link.url ?? link.portfolio_url ?? link.value ?? "";
}

function visibleContactLinks(draft: Draft): Link[] {
  return (draft.contact_links ?? []).filter((link) => {
    const value = publicValue(link);
    return Boolean(value) && !/redacted/i.test(value);
  });
}

function selectedCertifications(draft: Draft): string[] {
  return draft.credentials?.certifications ?? draft.certifications ?? [];
}

function selectedEducation(draft: Draft): string[] {
  return draft.credentials?.education ?? draft.education ?? [];
}

function selectedAwards(draft: Draft): string[] {
  return draft.credentials?.awards ?? draft.awards ?? [];
}

function normalizeDraft(draft: Draft): RenderLine[] {
  const name = "Saurabh Chawda";
  const summary = draft.summary ?? draft.selected_summary?.text ?? "";
  const headline = textOf(draft.selected_headline);
  const lines: RenderLine[] = [{ kind: "name", text: name }];
  const contacts = visibleContactLinks(draft);
  if (contacts.length) {
    for (const link of contacts) {
      const value = publicValue(link);
      lines.push({
        kind: "contact",
        text: `${link.label}: ${value}`,
        url: /^https?:\/\//.test(value) || /^mailto:/i.test(value) ? value : undefined,
      });
    }
  }
  lines.push({ kind: "headline", text: headline });
  lines.push({ kind: "section", text: "Professional Summary" });
  lines.push({ kind: "body", text: summary });
  lines.push({ kind: "section", text: "Experience" });
  for (const section of draft.experience_sections) {
    lines.push({ kind: "role", text: `${section.title} - ${section.company} | ${section.dates}` });
    for (const bullet of section.bullets) {
      lines.push({ kind: "bullet", text: bullet.text });
    }
  }
  if (draft.selected_projects?.length) {
    lines.push({ kind: "section", text: "Selected Project" });
    for (const project of draft.selected_projects) {
      const url = String(project.portfolio_url ?? project.url ?? "");
      const label = String(project.label ?? "Supporting proof");
      const nameText = String(project.name ?? project.project_id ?? "Selected project");
      const note = project.note ? ` - ${String(project.note)}` : "";
      lines.push({ kind: "body", text: `${nameText} (${label})${note}${url ? ` - ${url}` : ""}`, url: url || undefined });
    }
  }
  if (draft.selected_product_os_module) {
    lines.push({ kind: "section", text: "Product OS Proof" });
    const productOsModule = draft.selected_product_os_module;
    const url = String(productOsModule.portfolio_url ?? productOsModule.url ?? "");
    lines.push({ kind: "body", text: `${String(productOsModule.name ?? productOsModule.project_id ?? "Product OS")} - ${url}`, url: url || undefined });
  }
  if (draft.skills?.length) {
    lines.push({ kind: "section", text: "Skills" });
    lines.push({ kind: "body", text: draft.skills.join(", ") });
  }
  if (draft.tools?.length) {
    lines.push({ kind: "section", text: "Tools" });
    lines.push({ kind: "body", text: draft.tools.join(", ") });
  }
  if (selectedCertifications(draft).length) {
    lines.push({ kind: "section", text: "Certifications" });
    lines.push({ kind: "body", text: selectedCertifications(draft).join("; ") });
  }
  if (selectedEducation(draft).length) {
    lines.push({ kind: "section", text: "Education" });
    lines.push({ kind: "body", text: selectedEducation(draft).join("; ") });
  }
  if (selectedAwards(draft).length) {
    lines.push({ kind: "section", text: "Awards" });
    lines.push({ kind: "body", text: selectedAwards(draft).join("; ") });
  }
  return lines;
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
  return lines.length ? lines : [""];
}

function renderModelLines(lines: RenderLine[]): Array<RenderLine & { wrapped: string[] }> {
  return lines.map((line) => {
    const maxChars = line.kind === "name" ? 48 : line.kind === "contact" ? 95 : line.kind === "bullet" ? 94 : 98;
    return { ...line, wrapped: wrapText(line.text, maxChars) };
  });
}

function fingerprint(draft: Draft, lines: RenderLine[]): Record<string, unknown> {
  const bulletTexts = draft.experience_sections.flatMap((section) => section.bullets.map((bullet) => bullet.text));
  const headings = lines.filter((line) => ["section", "role", "headline"].includes(line.kind)).map((line) => line.text);
  const links = [
    ...visibleContactLinks(draft).map(publicValue),
    ...(draft.selected_projects ?? []).map((project) => String(project.portfolio_url ?? project.url ?? "")).filter(Boolean),
    draft.selected_product_os_module ? String(draft.selected_product_os_module.portfolio_url ?? draft.selected_product_os_module.url ?? "") : "",
  ].filter(Boolean);
  return {
    section_count: lines.filter((line) => line.kind === "section").length,
    heading_count: headings.length,
    bullet_count: bulletTexts.length,
    bullets: bulletTexts,
    headings,
    links,
    metrics: lines.flatMap((line) => line.text.match(/(?:Rs\. ?[0-9.]+M\+?|[0-9]+(?:\.[0-9]+)?%|\+[0-9]+%|[0-9]+x|10M\+|10M\+ monthly)/g) ?? []),
    dates: draft.experience_sections.map((section) => section.dates),
    evidence_ids: draft.selected_achievement_ids ?? draft.experience_sections.flatMap((section) => section.bullets.map((bullet) => bullet.achievement_id)),
    bullet_ids: draft.selected_bullet_ids ?? draft.experience_sections.flatMap((section) => section.bullets.map((bullet) => bullet.bullet_id)),
  };
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let c = i;
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
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
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralStart = offset;
  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(centralStart, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, central, end]);
}

function docxParagraph(line: RenderLine, relationshipId?: string): string {
  const style = line.kind === "name" ? "Name" : line.kind === "headline" ? "Headline" : line.kind === "section" ? "Section" : line.kind === "role" ? "Role" : line.kind === "bullet" ? "Bullet" : "Normal";
  const text = xmlEscape(line.text);
  const run = relationshipId
    ? `<w:hyperlink r:id="${relationshipId}" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/></w:rPr><w:t>${text}</w:t></w:r></w:hyperlink>`
    : `<w:r><w:t>${text}</w:t></w:r>`;
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${run}</w:p>`;
}

function renderDocx(file: string, lines: RenderLine[]): void {
  const rels: string[] = [];
  let relCounter = 1;
  const paragraphs = lines.map((line) => {
    const url = line.url;
    if (url) {
      const id = `rId${relCounter}`;
      relCounter += 1;
      rels.push(`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscape(url)}" TargetMode="External"/>`);
      return docxParagraph(line, id);
    }
    return docxParagraph(line);
  }).join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr></w:body>
</w:document>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/></w:rPr><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Name"><w:name w:val="Name"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Headline"><w:name w:val="Headline"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr><w:rPr><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Section"><w:name w:val="Section"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="140" w:after="40"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Role"><w:name w:val="Role"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="80" w:after="30"/></w:pPr><w:rPr><w:b/><w:sz w:val="21"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360" w:hanging="180"/><w:spacing w:after="20"/></w:pPr></w:style>
<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr></w:style>
</w:styles>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
${rels.join("")}
</Relationships>`;
  writeFileSync(file, createZip([
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rootRels },
    { name: "word/document.xml", data: documentXml },
    { name: "word/styles.xml", data: stylesXml },
    { name: "word/_rels/document.xml.rels", data: documentRels },
  ]));
}

function paginate(lines: RenderLine[]): Array<Array<RenderLine & { wrapped: string[] }>> {
  const wrapped = renderModelLines(lines);
  const pages: Array<Array<RenderLine & { wrapped: string[] }>> = [[]];
  let y = MARGIN_TOP;
  const blockHeightFor = (item: RenderLine & { wrapped: string[] }): number => {
    const fontSize = item.kind === "name" ? HEADER_SIZE : item.kind === "section" ? SECTION_SIZE : BODY_SIZE;
    return Math.max(LINE_HEIGHT, item.wrapped.length * (fontSize + 3)) + (item.kind === "section" ? 6 : 2);
  };
  for (let index = 0; index < wrapped.length; index += 1) {
    const item = wrapped[index];
    const blockHeight = blockHeightFor(item);
    const nextHeight = item.kind === "section" && wrapped[index + 1] ? blockHeightFor(wrapped[index + 1]) : 0;
    if (y + blockHeight > PAGE_HEIGHT - MARGIN_BOTTOM && pages[pages.length - 1].length) {
      pages.push([]);
      y = MARGIN_TOP;
    }
    if (item.kind === "section" && y + blockHeight + nextHeight > PAGE_HEIGHT - MARGIN_BOTTOM && pages[pages.length - 1].length) {
      pages.push([]);
      y = MARGIN_TOP;
    }
    pages[pages.length - 1].push(item);
    y += blockHeight;
  }
  return pages;
}

function renderPdf(file: string, lines: RenderLine[]): { pageCount: number; text: string; annotations: number } {
  const pages = paginate(lines);
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const fontId = 3;
  const annotationObjects: string[] = [];
  let annotationCount = 0;
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = "";
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  for (const page of pages) {
    const ops: string[] = ["BT"];
    let y = PAGE_HEIGHT - MARGIN_TOP;
    const pageAnnots: number[] = [];
    for (const item of page) {
      const fontSize = item.kind === "name" ? HEADER_SIZE : item.kind === "section" ? SECTION_SIZE : BODY_SIZE;
      const x = item.kind === "bullet" ? MARGIN_X + 12 : MARGIN_X;
      const prefix = item.kind === "bullet" ? "- " : "";
      for (const wrapped of item.wrapped) {
        y -= fontSize + 3;
        ops.push(`/F1 ${fontSize} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(prefix + wrapped)}) Tj ${(-x).toFixed(2)} 0 Td`);
        if (item.url) {
          const annotId = 4 + pages.length * 2 + annotationObjects.length;
          const width = Math.min(usableWidth, (prefix.length + wrapped.length) * fontSize * 0.48);
          annotationObjects.push(`<< /Type /Annot /Subtype /Link /Rect [${x.toFixed(2)} ${(y - 2).toFixed(2)} ${(x + width).toFixed(2)} ${(y + fontSize + 2).toFixed(2)}] /Border [0 0 0] /A << /S /URI /URI (${pdfEscape(item.url)}) >> >>`);
          pageAnnots.push(annotId);
          annotationCount += 1;
        }
      }
      y -= item.kind === "section" ? 6 : 2;
    }
    ops.push("ET");
    const stream = ops.join("\n");
    const contentId = objects.length + 1;
    const pageId = contentId + 1;
    objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R${pageAnnots.length ? ` /Annots [${pageAnnots.map((id) => `${id} 0 R`).join(" ")}]` : ""} >>`);
    pageObjectIds.push(pageId);
  }
  for (const annotation of annotationObjects) {
    objects.push(annotation);
  }
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  const parts: string[] = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  let cursor = Buffer.byteLength(parts[0]);
  objects.forEach((object, index) => {
    const entry = `${index + 1} 0 obj\n${object}\nendobj\n`;
    offsets.push(cursor);
    parts.push(entry);
    cursor += Buffer.byteLength(entry);
  });
  const xrefStart = cursor;
  const xref = [
    `xref\n0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefStart),
    "%%EOF",
  ].join("\n");
  parts.push(xref);
  writeFileSync(file, parts.join(""));
  return { pageCount: pages.length, text: lines.map((line) => line.text).join("\n"), annotations: annotationCount };
}

function paginationDiagnostics(lines: RenderLine[], pageCount: number): Record<string, unknown> {
  const sections = lines.filter((line) => line.kind === "section").map((line) => line.text);
  const largeSummary = lines.some((line) => line.kind === "body" && line.text.length > 750);
  const orphanHeadingWarnings: string[] = [];
  const pages = paginate(lines);
  for (const page of pages) {
    const last = page[page.length - 1];
    if (last?.kind === "section") orphanHeadingWarnings.push(`Section heading '${last.text}' appears at page end.`);
  }
  return {
    page_count: pageCount,
    estimated_one_page: pageCount <= 1,
    estimated_two_page: pageCount <= 2,
    section_count: sections.length,
    large_summary_detected: largeSummary,
    orphan_heading_warnings: orphanHeadingWarnings,
    widow_detection: "best-effort",
    blank_page_detected: pages.some((page) => page.length === 0),
    section_split_detection: "best-effort",
  };
}

function formattingDiagnostics(lines: RenderLine[]): Record<string, unknown> {
  return {
    font_family: "Arial",
    body_font_size: BODY_SIZE,
    heading_font_size: SECTION_SIZE,
    single_column: true,
    tables_used: false,
    text_boxes_used: false,
    floating_graphics_used: false,
    icons_used: false,
    standard_headings: lines.filter((line) => line.kind === "section").map((line) => line.text),
    hyperlink_count: lines.filter((line) => Boolean(line.url)).length,
    alignment: "centered header; left-aligned body",
  };
}

function exportOne(id: string, input: string, outputDir: string, isLivePilot: boolean): ExportRecord {
  mkdirSync(outputDir, { recursive: true });
  const draft = readJson<Draft>(input);
  const lines = normalizeDraft(draft);
  const fp = fingerprint(draft, lines);
  const docx = path.join(outputDir, `${id}.docx`);
  const pdf = path.join(outputDir, `${id}.pdf`);
  const startDocx = performance.now();
  renderDocx(docx, lines);
  const docxMs = Math.round(performance.now() - startDocx);
  const startPdf = performance.now();
  const pdfResult = renderPdf(pdf, lines);
  const pdfMs = Math.round(performance.now() - startPdf);
  const metadata = path.join(outputDir, "export-metadata.json");
  const formattingReport = path.join(outputDir, "formatting-report.json");
  const paginationReport = path.join(outputDir, "pagination-report.json");
  const qaReport = path.join(outputDir, "export-qa-report.json");
  const warnings = [
    ...(pdfResult.pageCount > 2 ? ["P1: page count exceeds two-page target."] : []),
    ...((paginationDiagnostics(lines, pdfResult.pageCount).orphan_heading_warnings as string[]) ?? []),
  ];
  writeJson(metadata, {
    export_id: id,
    input,
    docx,
    pdf,
    draft_status: draft.draft_status ?? draft.assembly_metadata?.status ?? "unknown",
    renderer_role: "rendering-only",
    content_fingerprint: fp,
    performance: {
      docx_generation_ms: docxMs,
      pdf_generation_ms: pdfMs,
      memory_rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      docx_size_bytes: statSync(docx).size,
      pdf_size_bytes: statSync(pdf).size,
      warning_count: warnings.length,
    },
  });
  writeJson(formattingReport, formattingDiagnostics(lines));
  writeJson(paginationReport, paginationDiagnostics(lines, pdfResult.pageCount));
  writeJson(qaReport, {
    status: warnings.some((warning) => warning.startsWith("P0")) ? "fail" : "pass",
    p0_failures: warnings.filter((warning) => warning.startsWith("P0")),
    warnings,
    ats_safe: {
      single_column: true,
      no_tables: true,
      no_text_boxes: true,
      no_floating_graphics: true,
      no_icons: true,
      standard_headings: true,
      searchable_pdf: pdfResult.text.length > 0,
      hyperlinks_preserved: pdfResult.annotations >= (formattingDiagnostics(lines).hyperlink_count as number),
    },
    content_counts: {
      section_count: fp.section_count,
      heading_count: fp.heading_count,
      bullet_count: fp.bullet_count,
      link_count: (fp.links as string[]).length,
      evidence_id_count: (fp.evidence_ids as string[]).length,
    },
  });
  return { id, input, outputDir, docx, pdf, metadata, formattingReport, paginationReport, qaReport, isLivePilot };
}

function renderIndex(records: ExportRecord[]): void {
  const lines = [
    "# Resume OS Export Run",
    "",
    `Exports generated: ${records.length}`,
    "",
    "| Export | DOCX | PDF | QA |",
    "| --- | --- | --- | --- |",
    ...records.map((record) => `| ${record.id} | ${path.relative(exportRoot, record.docx)} | ${path.relative(exportRoot, record.pdf)} | ${path.relative(exportRoot, record.qaReport)} |`),
    "",
  ];
  writeFileSync(path.join(exportRoot, "export-run-summary.md"), lines.join("\n"));
}

function main(): void {
  mkdirSync(outputsRoot, { recursive: true });
  mkdirSync(fixtureRoot, { recursive: true });
  mkdirSync(liveRoot, { recursive: true });

  const records: ExportRecord[] = [];
  const ebayInput = path.join(root, "docs", "resume-os", "pilots", "ebay", "narrative", "resume-draft.narrative.json");
  records.push(exportOne("ebay-live-pilot", ebayInput, liveRoot, true));

  const samplesRoot = path.join(root, "docs", "resume-os", "assembly", "samples");
  for (const entry of readdirSync(samplesRoot, { withFileTypes: true }).filter((item) => item.isDirectory())) {
    const input = path.join(samplesRoot, entry.name, "resume-draft.json");
    const out = path.join(fixtureRoot, entry.name);
    records.push(exportOne(entry.name, input, out, false));
  }
  renderIndex(records);
  console.log(`Exported ${records.length} resumes.`);
  console.log(`Live pilot: ${records.find((record) => record.isLivePilot)?.docx}`);
}

main();
