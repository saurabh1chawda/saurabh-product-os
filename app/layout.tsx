import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

import { AnalyticsLinkTracker } from "@/components/analytics-link-tracker";
import { SiteFooter } from "@/components/site-footer";
import "@/styles/globals.css";

const siteUrl = "https://saurabh-product-os.vercel.app";
const siteTitle = "Saurabh Chawda | Lead AI Product Manager | Product Operating System";
const siteDescription =
  "Lead Product Manager with 8+ years building AI products, platform strategy, payments, enterprise SaaS, and growth systems. Explore my Product Operating System, real product decisions, frameworks, case studies, and interview readiness resources.";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

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
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/og-image.png",
    shortcut: "/og-image.png",
    apple: "/og-image.png"
  },
  category: "technology"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
        <div id="main-content">{children}</div>
        <SiteFooter />
        <AnalyticsLinkTracker />
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
        {process.env.NODE_ENV === "production" && clarityProjectId ? (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: getClarityScript(clarityProjectId)
            }}
          />
        ) : null}
      </body>
    </html>
  );
}

function getClarityScript(projectId: string) {
  return `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ${JSON.stringify(projectId)});
  `;
}

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Product OS",
  url: siteUrl,
  description: siteDescription,
  publisher: {
    "@type": "Person",
    name: "Saurabh Chawda",
    url: `${siteUrl}/profile`,
    sameAs: ["https://www.linkedin.com/in/chawdasaurabh/", "https://github.com/saurabh1chawda"]
  },
  potentialAction: {
    "@type": "ReadAction",
    target: [`${siteUrl}/executive`, `${siteUrl}/case-studies`, `${siteUrl}/ai-product-playbook`]
  }
};
