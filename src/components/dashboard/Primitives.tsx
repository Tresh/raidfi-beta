import { ReactNode } from "react";

export const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div>
      <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-xs lg:text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatCard = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
}) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
    <p
      className={`mt-1.5 text-2xl font-semibold tabular-nums ${
        accent ? "text-primary" : "text-foreground"
      }`}
    >
      {value}
    </p>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

export const Panel = ({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <section className="bg-card border border-border rounded-lg">
    <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

export const ScoreMeter = ({ value }: { value: number }) => (
  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
    <div
      className="h-full rounded-full bg-primary transition-all"
      style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
    />
  </div>
);

export const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    approved: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
};
