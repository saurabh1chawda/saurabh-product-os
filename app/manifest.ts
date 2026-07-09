import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Product Leadership Platform",
    short_name: "Product OS",
    description:
      "Executive product leadership evidence, AI product decision systems, Product Leadership Briefs, and reusable product frameworks by Saurabh Chawda.",
    start_url: "/executive",
    scope: "/",
    display: "standalone",
    background_color: "#f8f6f1",
    theme_color: "#23423a",
    icons: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
