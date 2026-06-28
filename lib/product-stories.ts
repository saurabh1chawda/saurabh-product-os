import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

import type { ProductStory } from "@/data/product-stories";

const storiesDirectory = path.join(process.cwd(), "content", "stories");
const frontmatterPattern = /^---\s*\n([\s\S]*?)\n---/;

function readStoryFile(filePath: string): ProductStory {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const frontmatterMatch = fileContent.match(frontmatterPattern);

  if (!frontmatterMatch) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }

  return JSON.parse(frontmatterMatch[1]) as ProductStory;
}

export const getProductStories = cache(() => {
  return fs
    .readdirSync(storiesDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => readStoryFile(path.join(storiesDirectory, fileName)))
    .sort((firstStory, secondStory) => firstStory.hero.title.localeCompare(secondStory.hero.title));
});

export function getProductStorySlugs() {
  return getProductStories().map((story) => story.slug);
}

export function getProductStoryBySlug(slug: string) {
  return getProductStories().find((story) => story.slug === slug);
}
