import { ExternalLink } from "lucide-react";

type MetricCardProps = {
  value: string;
  label: string;
  evidence: string;
};

export function MetricCard({ value, label, evidence }: MetricCardProps) {
  return (
    <article className="rounded-md border border-line bg-panel p-5">
      <p className="text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-3 leading-7 text-muted">{label}</p>
      <a href="#" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
        {evidence}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </article>
  );
}
