import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

import type { EvidenceArtifact } from "@/data/artifacts";

const artifactsDirectory = path.join(process.cwd(), "content", "artifacts");
const frontmatterPattern = /^---\s*\n([\s\S]*?)\n---/;

function readArtifactFile(filePath: string): EvidenceArtifact {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const frontmatterMatch = fileContent.match(frontmatterPattern);

  if (!frontmatterMatch) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }

  return JSON.parse(frontmatterMatch[1]) as EvidenceArtifact;
}

export const getEvidenceArtifacts = cache(() => {
  return fs
    .readdirSync(artifactsDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => readArtifactFile(path.join(artifactsDirectory, fileName)))
    .sort((firstArtifact, secondArtifact) => firstArtifact.title.localeCompare(secondArtifact.title));
});

export function getEvidenceArtifactSlugs() {
  return getEvidenceArtifacts().map((artifact) => artifact.slug);
}

export function getEvidenceArtifactBySlug(slug: string) {
  return getEvidenceArtifacts().find((artifact) => artifact.slug === slug);
}
