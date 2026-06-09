import type { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
};

export function MetricCard({ title, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <div className="metric-card rounded-[1.8rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-3 text-3xl font-black text-foreground">{value}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
