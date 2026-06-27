import type { Metadata } from "next";

import { ProductStoryTemplate } from "@/components/product-story-template";
import { simplilearnJobGuaranteeGrowthStory } from "@/data/product-stories";

export const metadata: Metadata = {
  title: "How I Helped Grow Job Guarantee Revenue 10×",
  description:
    "A Product Story about growing Simplilearn Job Guarantee revenue from ₹1M to ₹10M through funnel optimization, referral loops, and product-led growth decisions."
};

export default function SimplilearnJobGuaranteeGrowthPage() {
  return <ProductStoryTemplate story={simplilearnJobGuaranteeGrowthStory} />;
}
