import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Sparkles
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/career-os", icon: Home },
  { label: "Operations", href: "/career-os/operations", icon: LayoutDashboard },
  { label: "Applications", href: "/career-os/applications", icon: BriefcaseBusiness },
  { label: "Analytics", href: "/career-os/analytics", icon: BarChart3 },
  { label: "Resume OS", href: "/career-os/resume-os", icon: FileText },
  { label: "Settings", href: "/career-os/settings", icon: Settings }
];

type CareerShellProps = {
  active: string;
  title: string;
  subtitle: string;
  breadcrumbs: string[];
  children: React.ReactNode;
};

export function CareerShell({ active, title, subtitle, breadcrumbs, children }: CareerShellProps) {
  return (
    <div className="min-h-screen border-t border-line bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-line bg-panel/90 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-5 lg:block">
            <Link href="/career-os" className="group flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-white">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold uppercase tracking-[0.08em] text-muted">Career OS</span>
                <span className="block text-lg font-semibold text-ink">Operations</span>
              </span>
            </Link>
            <Link
              href="/"
              className="rounded-md border border-line px-3 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent lg:mt-5 lg:inline-block"
            >
              Product OS
            </Link>
          </div>
          <nav aria-label="Career OS modules" className="flex gap-2 overflow-x-auto px-4 py-3 lg:block lg:space-y-1 lg:overflow-visible lg:p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.label;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-w-max items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive ? "bg-accent text-white" : "text-muted hover:bg-accent-soft hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <nav aria-label="Breadcrumb" className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  {breadcrumbs.join(" / ")}
                </nav>
                <h1 className="text-2xl font-semibold tracking-normal text-ink md:text-3xl">{title}</h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>
              </div>
              <div className="rounded-md border border-line bg-panel px-3 py-2 text-sm text-muted">
                Read-only console · Synthetic public-safe registry
              </div>
            </div>
          </header>
          <main className="px-5 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PlaceholderModule({ moduleName, purpose }: { moduleName: string; purpose: string }) {
  return (
    <section className="rounded-md border border-line bg-panel p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Placeholder</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">{moduleName}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{purpose}</p>
      <Link
        href="/career-os/operations"
        className="mt-5 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Return to Operations
      </Link>
    </section>
  );
}
