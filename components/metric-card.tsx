type MetricCardProps = {
  metric: string;
  title: string;
  subtitle: string;
};

export function MetricCard({ metric, title, subtitle }: MetricCardProps) {
  return (
    <article className="rounded-md border border-line bg-panel p-5">
      <p className="text-4xl font-semibold leading-none text-ink">{metric}</p>
      <h3 className="mt-4 text-lg font-semibold leading-tight text-ink">{title}</h3>
      <p className="mt-2 leading-7 text-muted">{subtitle}</p>
    </article>
  );
}
