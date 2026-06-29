import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

const siteUrl = "https://saurabh-product-os.vercel.app";
const siteTitle = "Saurabh Chawda | Lead AI Product Manager | Product Operating System";
const siteDescription =
  "Lead Product Manager with 8+ years building AI products, platform strategy, payments, enterprise SaaS, and growth systems. Explore my Product Operating System, real product decisions, frameworks, case studies, and interview readiness resources.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s | Saurabh Chawda"
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Product Operating System",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Saurabh Chawda Product Operating System"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
