import Link from "next/link";

const footerLinks = [
  { href: "/executive", label: "Executive Brief" },
  { href: "/profile", label: "Professional Profile" },
  { href: "/decision-operating-system", label: "Decision OS" },
  { href: "/product-leadership-operating-principles", label: "Operating Principles" },
  { href: "/ai-product-playbook", label: "AI Product Playbook" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/contact", label: "Contact" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-panel" aria-label="Product OS footer">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/executive" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
            Executive Briefing Center
          </Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex min-h-11 items-center transition hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
