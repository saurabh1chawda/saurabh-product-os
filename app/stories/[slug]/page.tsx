import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductStoryTemplate } from "@/components/product-story-template";
import { getProductStoryBySlug, getProductStorySlugs } from "@/lib/product-stories";

type ProductStoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getProductStorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductStoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getProductStoryBySlug(slug);

  if (!story) {
    return {};
  }

  return {
    title: story.hero.title,
    description: story.metadata.description
  };
}

export default async function ProductStoryPage({ params }: ProductStoryPageProps) {
  const { slug } = await params;
  const story = getProductStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  return <ProductStoryTemplate story={story} />;
}
