import Link from "next/link";

const navItems = [
  { href: "/decision-operating-system", label: "Decision OS" },
  { href: "/recruiter-tour", label: "Recruiter Tour" },
  { href: "/for-recruiters", label: "For Recruiters" },
  { href: "/profile", label: "Professional Profile" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.14em] text-ink">
          Saurabh Product OS
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-11 items-center transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
