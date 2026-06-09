import { ShieldCheck } from 'lucide-react';

type LoginPanelProps = {
  title: string;
  subtitle: string;
  fields: React.ReactNode;
  error: string | null;
  actionLabel: string;
  onSubmit: () => void;
};

export function LoginPanel({
  title,
  subtitle,
  fields,
  error,
  actionLabel,
  onSubmit,
}: LoginPanelProps) {
  return (
    <div className="mx-auto w-full max-w-md hero-panel rounded-[2rem] p-6 md:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {fields}
        {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
        <button
          type="button"
          onClick={onSubmit}
          className="action-primary w-full rounded-2xl px-4 py-3 text-sm font-black"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
