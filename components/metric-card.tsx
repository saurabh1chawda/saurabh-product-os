type MetricCardProps = {
  title: string;
  subtitle: string;
};

export function MetricCard({ title, subtitle }: MetricCardProps) {
  return (
    <article className="rounded-md border border-line bg-panel p-5">
      <p className="text-2xl font-semibold leading-tight text-ink">{title}</p>
      <p className="mt-3 leading-7 text-muted">{subtitle}</p>
    </article>
  );
}
