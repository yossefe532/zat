'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, Gift, Loader2, Navigation2, Sparkles, Trophy, Users } from 'lucide-react';

type ReferralMilestoneStatus = {
  milestone: 1 | 3 | 5 | 7 | 10;
  achieved: boolean;
  claimable: boolean;
  benefit?: {
    id: string;
    type: 'discount_total' | 'free_course' | 'perk';
    value: number;
    isConsumed: boolean;
  } | null;
};

type ReferralDashboard = {
  referralCode: string;
  shareTextAr: string;
  shareTextEn: string;
  directCount: number;
  tierProgressCount: number;
  milestones: ReferralMilestoneStatus[];
  grantOwnerWhatsapp: string;
  grantCodeUsed: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? 'تعذر تنفيذ الطلب');
  }
  return payload;
}

export default function ReferralsPage() {
  const [lang] = useState<'ar' | 'en'>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem('zat_lang') as 'ar' | 'en' | null) || 'ar';
  });
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginState, setLoginState] = useState({
    phone: '',
    registrationCode: '',
    busy: false,
    error: '',
  });
  const [redeemBusy, setRedeemBusy] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const shareText = useMemo(() => (isAr
    ? 'شارك المنحة واحصل على خصم 50 جنيهًا أنت وصديقك على إجمالي سعر أي كورس'
    : 'Share the grant and get 50 EGP off the total price for you and your friend on any course order.'), [isAr]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/referrals/me', { cache: 'no-store' });
      const payload = await parseResponse<{ success: boolean; data: ReferralDashboard }>(response);
      setDashboard(payload.data);
    } catch (loadError) {
      setDashboard(null);
      setError(loadError instanceof Error ? loadError.message : 'تعذر تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(isAr ? 'تم النسخ' : 'Copied');
    } catch {
      setToast(isAr ? 'تعذر النسخ' : 'Unable to copy');
    }
  };

  const handleLogin = async () => {
    setLoginState((prev) => ({ ...prev, busy: true, error: '' }));
    try {
      const response = await fetch('/api/auth/registrant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: loginState.phone,
          registrationCode: loginState.registrationCode,
        }),
      });
      await parseResponse(response);
      await loadDashboard();
    } catch (loginError) {
      setLoginState((prev) => ({
        ...prev,
        error: loginError instanceof Error ? loginError.message : (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid login details'),
      }));
    } finally {
      setLoginState((prev) => ({ ...prev, busy: false }));
    }
  };

  const handleRedeem = async (milestone: 1 | 3 | 5 | 7 | 10) => {
    try {
      setRedeemBusy(milestone);
      const response = await fetch('/api/referrals/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone }),
      });
      const payload = await parseResponse<{ success: boolean; data: { whatsappUrl: string } }>(response);
      window.open(payload.data.whatsappUrl, '_blank', 'noopener,noreferrer');
      await loadDashboard();
    } catch (redeemError) {
      setToast(redeemError instanceof Error ? redeemError.message : (isAr ? 'تعذر استرداد المكافأة' : 'Unable to redeem'));
    } finally {
      setRedeemBusy(null);
    }
  };

  const milestones = useMemo(() => (dashboard?.milestones ?? []), [dashboard]);

  if (loading) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center px-4 py-20">
        <div className="hero-panel w-full max-w-xl rounded-[2rem] p-8 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm font-black text-muted-foreground">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center px-4 py-16">
        <div className="hero-panel w-full max-w-xl rounded-[2rem] p-6 md:p-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/15 bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="section-title text-primary">{isAr ? 'تابع مسار خصمك' : 'Track your discounts'}</h1>
            <p className="section-subtitle font-bold">
              {isAr
                ? 'هذه الصفحة متاحة فقط للمستخدمين المسجلين في المنحة. ادخل رقم هاتفك وكود التسجيل للوصول.'
                : 'This page is only available for registered grant users. Enter your phone and registration code to continue.'}
            </p>
            {error ? <p className="text-sm font-black text-destructive">{error}</p> : null}
          </div>

          <div className="mt-8 space-y-4 text-right">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground md:text-sm">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
              <input
                value={loginState.phone}
                onChange={(event) => setLoginState((prev) => ({ ...prev, phone: event.target.value }))}
                className="field-shell w-full rounded-2xl px-4 py-3"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground md:text-sm">{isAr ? 'كود التسجيل' : 'Registration Code'}</label>
              <input
                value={loginState.registrationCode}
                onChange={(event) => setLoginState((prev) => ({ ...prev, registrationCode: event.target.value.toUpperCase() }))}
                className="field-shell w-full rounded-2xl px-4 py-3 text-center font-black"
                placeholder={isAr ? 'مثال: M.955' : 'Example: M.955'}
                dir="ltr"
              />
            </div>
            {loginState.error ? <p className="text-sm font-black text-destructive">{loginState.error}</p> : null}

            <button
              type="button"
              onClick={() => void handleLogin()}
              disabled={loginState.busy}
              className="action-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black disabled:opacity-50"
            >
              {loginState.busy ? (isAr ? 'جارٍ التحقق...' : 'Verifying...') : (isAr ? 'دخول' : 'Login')}
              {loginState.busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            </button>

            <Link
              href="/"
              className="action-secondary inline-flex w-full items-center justify-center rounded-2xl py-4 text-sm font-black text-primary hover:border-primary/35 hover:bg-primary/5"
            >
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen px-4 py-10 md:py-16">
      <div className="container mx-auto max-w-6xl space-y-8">
        {toast ? (
          <div className="fixed inset-x-4 top-5 z-50 mx-auto max-w-xl rounded-2xl border border-border/70 bg-card/90 px-4 py-3 text-center text-sm font-black text-foreground shadow-xl backdrop-blur-xl">
            {toast}
          </div>
        ) : null}

        <section className="hero-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2 text-xs font-black text-primary shadow-sm backdrop-blur-md md:text-sm">
                <Sparkles className="h-4 w-4" />
                {isAr ? 'تابع مسار خصمي' : 'Referral Rewards'}
              </div>
              <h1 className="section-title text-foreground">{isAr ? 'لوحة الإحالات' : 'Referral Dashboard'}</h1>
              <p className="section-subtitle font-bold">
                {shareText}
              </p>
            </div>
            <Link
              href="/"
              className="action-secondary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-black text-primary hover:border-primary/35 hover:bg-primary/5"
            >
              {isAr ? 'العودة للموقع' : 'Back to site'}
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="hero-panel rounded-[2rem] p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 text-right">
                <p className="text-xs font-black text-muted-foreground md:text-sm">{isAr ? 'كود الإحالة الخاص بك' : 'Your referral code'}</p>
                <p className="text-3xl font-black text-primary md:text-4xl" dir="ltr">
                  {dashboard.referralCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyToClipboard(dashboard.referralCode)}
                className="action-primary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black"
              >
                <Copy className="h-4 w-4" />
                {isAr ? 'نسخ' : 'Copy'}
              </button>
            </div>

            <div className="mt-6 space-y-4 text-right">
              <div className="metric-card rounded-[1.6rem] p-5">
                <p className="text-sm font-black text-primary">{isAr ? 'إحصائيات كودك' : 'Your stats'}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-card/80 p-4">
                    <p className="text-xs font-black text-muted-foreground">{isAr ? 'إحالات مباشرة' : 'Direct referrals'}</p>
                    <p className="mt-2 text-2xl font-black text-foreground">{dashboard.directCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/80 p-4">
                    <p className="text-xs font-black text-muted-foreground">{isAr ? 'التقدم للمكافآت' : 'Milestone progress'}</p>
                    <p className="mt-2 text-2xl font-black text-primary">{dashboard.tierProgressCount}</p>
                  </div>
                </div>
              </div>

              <div className="metric-card rounded-[1.6rem] p-5">
                <p className="text-sm font-black text-primary">{isAr ? 'كيف تستخدم الكود؟' : 'How it works'}</p>
                <ul className="mt-4 list-disc space-y-2 ps-5 text-sm font-bold leading-7 text-muted-foreground">
                  <li>{isAr ? 'انسخ الكود وأرسله لصديقك.' : 'Copy and share the code with your friend.'}</li>
                  <li>{isAr ? 'صديقك يدخل الكود في خطوة كود المنحة/الإحالة.' : 'Your friend enters it in the grant/referral code step.'}</li>
                  <li>{isAr ? 'عند اكتمال التسجيل، يتم احتساب الإحالة تلقائيًا.' : 'After registration completes, the referral is counted automatically.'}</li>
                  <li>{isAr ? 'عند اكتمال أي مرحلة، استرد المكافأة عبر زر الاسترداد.' : 'Once a milestone is reached, redeem via the button.'}</li>
                </ul>
                <Link
                  href="/referrals/guide"
                  className="action-secondary mt-5 inline-flex w-full items-center justify-center rounded-2xl py-3 text-sm font-black text-primary hover:border-primary/35 hover:bg-primary/5"
                >
                  {isAr ? 'اقرأ الدليل الكامل' : 'Read full guide'}
                </Link>
              </div>
            </div>
          </div>

          <div className="hero-panel rounded-[2rem] p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-right">
                <p className="text-xs font-black text-muted-foreground md:text-sm">{isAr ? 'مراحل المكافآت' : 'Reward milestones'}</p>
                <p className="text-lg font-black text-foreground md:text-xl">{isAr ? 'اكسب مكافآت أكبر مع كل مرحلة' : 'Earn bigger rewards with each step'}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Trophy className="h-6 w-6" />
              </div>
            </div>

            <div className="relative mt-6">
              <div className="absolute inset-y-0 left-6 w-0.5 rounded-full bg-route-dash rtl:left-auto rtl:right-6" />
              <div className="absolute left-2 top-0 flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-card/80 text-primary shadow-lg backdrop-blur-md rtl:left-auto rtl:right-2">
                <Navigation2 className="h-5 w-5" />
              </div>

              <div className="space-y-4">
                {milestones.map((item) => (
                  <div key={item.milestone} className="relative pl-14 rtl:pl-0 rtl:pr-14">
                    <div
                      className={`absolute left-[1.07rem] top-7 h-4 w-4 rounded-full border-4 rtl:left-auto rtl:right-[1.07rem] ${
                        item.achieved ? 'border-success bg-success/20' : 'border-border bg-card'
                      }`}
                    />

                    <div
                      className={`rounded-[1.7rem] border p-5 transition-colors ${
                        item.achieved
                          ? 'border-success/30 bg-success/10'
                          : 'border-border/70 bg-card/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 text-right">
                          <div className="inline-flex items-center gap-2 text-sm font-black text-foreground">
                            <Gift className={`h-4 w-4 ${item.achieved ? 'text-success' : 'text-muted-foreground'}`} />
                            {isAr ? `محطة ${item.milestone}` : `Stop ${item.milestone}`}
                          </div>
                          <p className="text-sm font-bold text-muted-foreground">
                            {item.milestone === 1
                              ? (isAr ? 'خصم 50 جنيه لك ولصديقك على إجمالي سعر الطلب' : '50 EGP off the total order for you and your friend')
                              : item.milestone === 3
                                ? (isAr ? 'خصم 200 جنيه على إجمالي سعر أي طلب' : '200 EGP off the total order')
                                : item.milestone === 5
                                  ? (isAr ? 'كورس مجاني (يُخصم قيمة كورس واحد من إجمالي الطلب)' : 'One free course (discounted from total)')
                                  : item.milestone === 7
                                    ? (isAr ? 'اشتراك Canva Pro مجانًا' : 'Free Canva Pro subscription')
                                    : (isAr ? 'كورسين مجانًا (يُخصم قيمة كورسين من إجمالي الطلب)' : 'Two free courses (discounted from total)')}
                          </p>
                        </div>

                        <div className="text-left">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                            item.achieved ? 'bg-success/15 text-success' : 'bg-muted/50 text-muted-foreground'
                          }`}>
                            {item.achieved ? (isAr ? 'مكتملة' : 'Done') : (isAr ? 'غير مكتملة' : 'Locked')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-black text-muted-foreground">
                          {item.claimable
                            ? (isAr ? 'يمكنك استرداد المكافأة الآن.' : 'You can redeem now.')
                            : item.benefit
                              ? (item.benefit.type === 'perk'
                                ? (isAr ? 'تم تسجيل استرداد الميزة عبر واتساب وسيتم التواصل لتسليمها.' : 'Perk redemption recorded via WhatsApp. Delivery will be coordinated.')
                                : (item.benefit.isConsumed
                                  ? (isAr ? 'تم استخدام المكافأة بالفعل.' : 'Reward already used.')
                                  : (isAr ? 'تم تجهيز المكافأة ويمكن استخدامها في طلبك القادم.' : 'Reward is ready for your next order.')))
                              : (isAr ? 'أكمل المرحلة لفتح زر الاسترداد.' : 'Complete the milestone to unlock redeem.')}
                        </p>
                        <button
                          type="button"
                          disabled={!item.claimable || redeemBusy !== null}
                          onClick={() => void handleRedeem(item.milestone)}
                          className="action-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black disabled:opacity-40"
                        >
                          {redeemBusy === item.milestone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          {isAr ? 'استرداد المكافأة' : 'Redeem'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-primary/15 bg-primary/5 p-5 text-right">
              <p className="text-sm font-black text-primary">{isAr ? 'ملاحظة مهمة' : 'Important note'}</p>
              <p className="mt-2 text-sm font-bold leading-7 text-muted-foreground">
                {isAr
                  ? 'الخصم يُحسب على السعر الإجمالي للطلب (وليس على كورس واحد منفرد). عند استرداد المكافأة سيتم فتح واتساب برسالة جاهزة لتأكيد الاستحقاق.'
                  : 'Discounts apply to the total order price (not a single course). When you redeem, WhatsApp opens with a ready confirmation message.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
