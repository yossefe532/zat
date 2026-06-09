'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockKeyhole, LogOut } from 'lucide-react';

function AccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/site-access/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? 'تعذر تسجيل الدخول');
      }

      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/site-access/logout', { method: 'POST' });
    setPassword('');
    router.refresh();
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="hero-panel w-full max-w-md rounded-[2rem] p-6 md:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-foreground">دخول الموقع</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            جميع الصفحات محمية بكلمة مرور واحدة. أدخلها للمتابعة.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="كلمة مرور الموقع"
            className="field-shell w-full rounded-2xl px-4 py-3"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleSubmit();
              }
            }}
          />

          {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="action-primary w-full rounded-2xl px-4 py-3 text-sm font-black"
          >
            {loading ? 'جارٍ التحقق' : 'فتح الصفحات'}
          </button>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="action-secondary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-destructive"
          >
            <LogOut className="h-4 w-4" />
            حذف جلسة الدخول الحالية
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AccessPage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
          <div className="hero-panel w-full max-w-md rounded-[2rem] p-6 text-center text-sm text-muted-foreground">
            جارٍ تحميل بوابة الدخول...
          </div>
        </main>
      }
    >
      <AccessPageContent />
    </Suspense>
  );
}
