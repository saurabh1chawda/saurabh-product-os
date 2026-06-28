import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArtifactTemplate } from "@/components/artifact-template";
import { getEvidenceArtifactBySlug, getEvidenceArtifactSlugs } from "@/lib/artifacts";

type ArtifactPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getEvidenceArtifactSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArtifactPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artifact = getEvidenceArtifactBySlug(slug);

  if (!artifact) {
    return {};
  }

  return {
    title: artifact.title,
    description: artifact.metadata.description
  };
}

export default async function ArtifactPage({ params }: ArtifactPageProps) {
  const { slug } = await params;
  const artifact = getEvidenceArtifactBySlug(slug);

  if (!artifact) {
    notFound();
  }

  return <ArtifactTemplate artifact={artifact} />;
}
