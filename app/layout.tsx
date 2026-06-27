import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Saurabh Product OS",
    template: "%s | Saurabh Product OS"
  },
  description:
    "An evidence-backed Product Manager portfolio designed to help hiring teams evaluate product judgment, impact, and operating style.",
  metadataBase: new URL("https://saurabh-product-os.vercel.app")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
