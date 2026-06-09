type StatusBadgeProps = {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
};

const toneClassMap = {
  neutral: 'bg-card/70 text-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/15 text-destructive',
};

export function StatusBadge({ tone = 'neutral', children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${toneClassMap[tone]}`}
    >
      {children}
    </span>
  );
}
