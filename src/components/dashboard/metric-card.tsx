type Accent = "primary" | "warning" | "success" | "cyan";

const accents: Record<Accent, string> = {
  primary: "text-primary-soft",
  warning: "text-warning",
  success: "text-success",
  cyan: "text-cyan",
};

export function MetricCard({
  label,
  value,
  hint,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: Accent;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-5 transition hover:border-border-strong">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
