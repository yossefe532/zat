'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BadgePercent } from 'lucide-react';
import { buildWhatsappLink } from '@/lib/utils';
import { COURSES, DEFAULT_GRANT_CODES, DISCOUNT_RULES, SMART_BUNDLES, SUPPORT_WHATSAPP_NUMBER } from '@/lib/data';
import { Course, GrantCode, LearningBundle, RegistrationDraft, RegistrationInput, RegistrationRecord } from '@/lib/types';
import type { QuizResult } from '@/components/PathQuiz';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { submitRegistration, updateExistingRegistration, verifyAccessCodeAction } from '@/actions';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { APP_FEATURES } from '@/lib/feature-flags';
import { trackEvent } from '@/lib/analytics';
import { getStickyVariant, type HeroExperimentVariant } from '@/lib/experiments';

type Step = 'hero' | 'quiz' | 'code' | 'courses' | 'basket' | 'form' | 'success';
type RegistrationSuccessMode = 'created' | 'updated' | 'resent';
const FLOW_DRAFT_KEY = 'zat_flow_draft_v1';
type FlowDraftSnapshot = {
  step?: Step;
  grantCode?: string;
  referralCodeUsed?: string | null;
  referralDiscount?: number;
  selectedCourseIds?: number[];
  quizResult?: QuizResult | null;
  requestCodeWhatsappUrl?: string | null;
  registrationDraft?: RegistrationDraft;
};
const FALLBACK_GRANT_CODES = DEFAULT_GRANT_CODES as Record<string, Omit<GrantCode, 'code'>>;

function readStoredFlowDraft(): FlowDraftSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(FLOW_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as FlowDraftSnapshot;
  } catch {
    return null;
  }
}

const StepLoading = () => (
  <section className="flex min-h-[60vh] items-center justify-center px-4 py-20">
    <div className="hero-panel w-full max-w-2xl rounded-[2rem] p-8 text-center">
      <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-primary/15" />
      <p className="mt-5 text-sm font-black text-muted-foreground">جارٍ تجهيز الخطوة التالية...</p>
    </div>
  </section>
);

const Hero = dynamic(() => import('@/components/Hero').then((module) => module.Hero), {
  loading: () => <StepLoading />,
});
const PathQuiz = dynamic(() => import('@/components/PathQuiz').then((module) => module.PathQuiz), {
  loading: () => <StepLoading />,
});
const CodeGate = dynamic(() => import('@/components/CodeGate').then((module) => module.CodeGate), {
  loading: () => <StepLoading />,
});
const CourseSelection = dynamic(() => import('@/components/CourseSelection').then((module) => module.CourseSelection), {
  loading: () => <StepLoading />,
});
const Basket = dynamic(() => import('@/components/Basket').then((module) => module.Basket), {
  loading: () => <StepLoading />,
});
const RegistrationForm = dynamic(() => import('@/components/RegistrationForm').then((module) => module.RegistrationForm), {
  loading: () => <StepLoading />,
});
const SuccessPage = dynamic(() => import('@/components/SuccessPage').then((module) => module.SuccessPage), {
  loading: () => <StepLoading />,
});

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [initialFlowDraft] = useState<FlowDraftSnapshot | null>(() => readStoredFlowDraft());
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [step, setStep] = useState<Step>(() => (
    initialFlowDraft?.step && initialFlowDraft.step !== 'success' ? initialFlowDraft.step : 'hero'
  ));
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem('zat_lang') as 'ar' | 'en' | null) || 'ar';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('zat_theme') as 'light' | 'dark' | null) || 'light';
  });
  const [grantCode, setGrantCode] = useState<string>(() => initialFlowDraft?.grantCode ?? '');
  const [referralCodeUsed, setReferralCodeUsed] = useState<string | null>(() => initialFlowDraft?.referralCodeUsed ?? null);
  const [referralDiscount, setReferralDiscount] = useState<number>(() => initialFlowDraft?.referralDiscount ?? 0);
  const [grantData, setGrantData] = useState<GrantCode | null>(() => {
    const code = initialFlowDraft?.grantCode;
    if (!code) {
      return null;
    }

    const fallback = (DEFAULT_GRANT_CODES as Record<string, Omit<GrantCode, 'code'>>)[code];
    return fallback ? { code, ...fallback } : null;
  });
  const [selectedCourses, setSelectedCourses] = useState<Course[]>(() => (
    initialFlowDraft?.selectedCourseIds?.length
      ? COURSES.filter((course) => initialFlowDraft.selectedCourseIds?.includes(course.id))
      : []
  ));
  const [quizResult, setQuizResult] = useState<QuizResult | null>(() => initialFlowDraft?.quizResult ?? null);
  const [registrationDraft, setRegistrationDraft] = useState<RegistrationDraft>(() => (
    initialFlowDraft?.registrationDraft ?? {
      fullName: '',
      phone: '',
      age: '',
      agreed: false,
    }
  ));
  const [registrationData, setRegistrationData] = useState<{
    fullName: string;
    phone: string;
    age: number | null;
    registrationCode: string;
    mode: RegistrationSuccessMode;
  } | null>(null);
  const [existingRegistration, setExistingRegistration] = useState<RegistrationRecord | null>(null);
  const [existingRegistrationAction, setExistingRegistrationAction] = useState<'resend' | 'update' | null>(null);
  const [existingRegistrationError, setExistingRegistrationError] = useState('');
  const [requestCodeWhatsappUrl, setRequestCodeWhatsappUrl] = useState<string | null>(
    () => initialFlowDraft?.requestCodeWhatsappUrl ?? null
  );
  const [heroVariant] = useState<HeroExperimentVariant>(() => {
    if (!APP_FEATURES.heroExperiment || typeof window === 'undefined') {
      return 'guided';
    }

    return getStickyVariant('hero_primary_cta', ['direct', 'guided'], 'guided') as HeroExperimentVariant;
  });
  const exposedVariantRef = useRef(false);
  const selectedCourseIds = useMemo(() => selectedCourses.map((course) => course.id), [selectedCourses]);

  useEffect(() => {
    localStorage.setItem('zat_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('zat_theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [shouldReduceMotion, step]);

  useEffect(() => {
    if (!APP_FEATURES.lightweightAnalytics || exposedVariantRef.current) {
      return;
    }

    trackEvent('hero_variant_assigned', { variant: heroVariant });
    exposedVariantRef.current = true;
  }, [heroVariant]);

  useEffect(() => {
    const controller = new AbortController();

    void fetch('/api/courses', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          data?: Course[];
        };

        if (!response.ok || !payload.data) {
          return;
        }

        const nextCourses = payload.data;
        setCourses(nextCourses);
        setSelectedCourses((previous) => (
          previous.length === 0
            ? previous
            : nextCourses.filter((course) => previous.some((selected) => selected.id === course.id))
        ));
      })
      .catch(() => {
        // Keep fallback courses when the API is unavailable.
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!APP_FEATURES.progressDraft || typeof window === 'undefined') {
      return;
    }

    if (registrationData || step === 'success') {
      window.localStorage.removeItem(FLOW_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(
      FLOW_DRAFT_KEY,
      JSON.stringify({
        step,
        grantCode,
        referralCodeUsed,
        referralDiscount,
        selectedCourseIds,
        quizResult,
        requestCodeWhatsappUrl,
        registrationDraft,
      })
    );
  }, [step, grantCode, referralCodeUsed, referralDiscount, selectedCourseIds, quizResult, requestCodeWhatsappUrl, registrationDraft, registrationData]);

  useEffect(() => {
    if (!APP_FEATURES.lightweightAnalytics) {
      return;
    }

    trackEvent('step_view', {
      step,
      selectedCourses: selectedCourseIds,
      hasGrant: Boolean(grantCode),
    });
  }, [step, selectedCourseIds, grantCode]);

  const verifyGrantCode = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    let result: Awaited<ReturnType<typeof verifyAccessCodeAction>>;

    try {
      result = await verifyAccessCodeAction(normalizedCode);
    } catch {
      trackEvent('grant_verify_error', { code: normalizedCode });
      return {
        success: false,
        error: lang === 'ar' ? 'حدث خطأ أثناء التحقق. حاول مرة أخرى.' : 'Something went wrong while verifying. Please try again.',
      };
    }

    if (!result.success || !result.data) {
      trackEvent('grant_verify_failed', { code: normalizedCode });
      return {
        success: false,
        error: lang === 'ar' ? 'الكود غير صحيح أو غير مفعل' : 'Invalid or inactive code',
      };
    }

    const verifiedGrant = result.data;
    setGrantData(verifiedGrant);
    setGrantCode(verifiedGrant.code);
    setReferralCodeUsed(result.referralCodeUsed ?? null);
    setReferralDiscount(result.referralDiscount ?? 0);
    setStep('courses');
    trackEvent('grant_verified', { code: verifiedGrant.code, type: result.accessType });

    return {
      success: true,
      grant: verifiedGrant,
    };
  };

  const calculations = useMemo(() => {
    const subtotal = selectedCourses.reduce((sum, course) => {
      if (grantData) {
        return sum + course.grantPrice;
      }

      return sum + course.originalPrice;
    }, 0);

    let countDiscount = 0;
    
    for (const rule of DISCOUNT_RULES) {
      if (selectedCourses.length >= rule.count) {
        countDiscount = rule.discount;
      }
    }

    const activeBundle = SMART_BUNDLES.find((bundle) => {
      if (bundle.courseIds.length !== selectedCourses.length) {
        return false;
      }

      return bundle.courseIds.every((courseId) => selectedCourses.some((course) => course.id === courseId));
    });

    const bundleDiscount = activeBundle?.extraDiscount ?? 0;
    const discount = Math.max(countDiscount, bundleDiscount);
    
    const total = Math.max(subtotal - discount - referralDiscount, 0);
    const firstInstallment = selectedCourses.length === 0
      ? 0
      : Math.min(total, selectedCourses.length * 200);
    const secondInstallment = total - firstInstallment;
    
    return { subtotal, discount, total, firstInstallment, secondInstallment };
  }, [grantData, referralDiscount, selectedCourses]);

  const handleCourseToggle = useCallback((course: Course) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      trackEvent(exists ? 'course_removed' : 'course_added', { courseId: course.id });
      if (exists) {
        return prev.filter(c => c.id !== course.id);
      }
      return [...prev, course];
    });
  }, []);

  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResult(result);
    setSelectedCourses(courses.filter((course) => result.recommendedCourseIds.includes(course.id)));
    setStep('code');
    trackEvent('quiz_completed', { recommendedCourseIds: result.recommendedCourseIds });
  }, [courses]);

  const handleApplyBundle = useCallback((bundle: LearningBundle) => {
    setSelectedCourses(courses.filter((course) => bundle.courseIds.includes(course.id)));
    trackEvent('bundle_applied', { bundleId: bundle.id, courseIds: bundle.courseIds });
  }, [courses]);

  const handleAddSuggestedCourse = useCallback((course: Course) => {
    setSelectedCourses((prev) => {
      if (prev.some((selected) => selected.id === course.id)) {
        return prev;
      }

      return [...prev, course];
    });
    trackEvent('smart_basket_accept', { courseId: course.id });
  }, []);

  const suggestedNextCourse = useMemo(() => {
    const selectedIds = selectedCourseIds;
    const quizSuggested = quizResult?.recommendedCourseIds.find((courseId) => !selectedIds.includes(courseId));
    if (quizSuggested) {
      return courses.find((course) => course.id === quizSuggested) ?? null;
    }

    const bundleGapCourseId = SMART_BUNDLES
      .map((bundle) => {
        const missingCourseIds = bundle.courseIds.filter((courseId) => !selectedIds.includes(courseId));
        const matchedCount = bundle.courseIds.length - missingCourseIds.length;

        return {
          missingCourseIds,
          matchedCount,
        };
      })
      .filter((entry) => entry.matchedCount > 0 && entry.missingCourseIds.length > 0)
      .sort((a, b) => b.matchedCount - a.matchedCount)[0]?.missingCourseIds[0];

    if (bundleGapCourseId) {
      return courses.find((course) => course.id === bundleGapCourseId) ?? null;
    }

    return courses.find((course) => !selectedIds.includes(course.id)) ?? null;
  }, [courses, quizResult, selectedCourseIds]);

  const syncGrantStateFromCode = useCallback(async (code?: string | null) => {
    const normalizedCode = code?.trim().toUpperCase() ?? '';

    if (!normalizedCode) {
      setGrantCode('');
      setGrantData(null);
      setReferralCodeUsed(null);
      setReferralDiscount(0);
      return;
    }

    setGrantCode(normalizedCode);
    try {
      const grantResult = await verifyAccessCodeAction(normalizedCode);
      setGrantData(grantResult.success && grantResult.data ? grantResult.data : null);
      setReferralCodeUsed(grantResult.success ? (grantResult.referralCodeUsed ?? null) : null);
      setReferralDiscount(grantResult.success ? (grantResult.referralDiscount ?? 0) : 0);
    } catch {
      setGrantData(null);
      setReferralCodeUsed(null);
      setReferralDiscount(0);
    }
  }, []);

  const openRegistrationSuccess = useCallback(async (record: RegistrationRecord, mode: RegistrationSuccessMode) => {
    await syncGrantStateFromCode(record.grantCodeUsed ?? null);
    setSelectedCourses(courses.filter((course) => record.courses.includes(course.id)));
    setRegistrationData({
      fullName: record.fullName,
      phone: record.phone,
      age: record.age,
      registrationCode: record.registrationCode,
      mode,
    });
    setExistingRegistration(null);
    setExistingRegistrationError('');
    setStep('success');
  }, [courses, syncGrantStateFromCode]);

  const handleRegistration = async (data: { fullName: string; phone: string; age: number }) => {
    setExistingRegistration(null);
    setExistingRegistrationError('');
    const payload: RegistrationInput = {
      fullName: data.fullName,
      phone: data.phone,
      age: data.age,
      courses: selectedCourseIds,
      totalPrice: calculations.total,
      firstInstallment: calculations.firstInstallment,
      secondInstallment: calculations.secondInstallment,
      grantCodeUsed: grantCode || undefined,
      referralCodeUsed: referralCodeUsed ?? undefined,
    };

    const result = await submitRegistration(payload);

    if (!result.success || !result.data || !result.mode) {
      throw new Error('Registration failed');
    }

    if (result.mode === 'existing') {
      setExistingRegistration(result.data);
      trackEvent('registration_duplicate_found', {
        registrationCode: result.data.registrationCode,
        selectedCourses: result.data.courses,
      });
      return;
    }

    setRegistrationData({
      fullName: result.data.fullName,
      phone: result.data.phone,
      age: result.data.age,
      registrationCode: result.data.registrationCode,
      mode: 'created',
    });
    trackEvent('registration_completed', {
      selectedCourses: selectedCourseIds,
      total: calculations.total,
      mode: result.mode,
    });
    setStep('success');
  };

  const handleResendExistingRegistration = useCallback(async () => {
    if (!existingRegistration) {
      return;
    }

    try {
      setExistingRegistrationAction('resend');
      setExistingRegistrationError('');
      await openRegistrationSuccess(existingRegistration, 'resent');
      trackEvent('registration_existing_reused', {
        action: 'resend',
        registrationCode: existingRegistration.registrationCode,
      });
    } catch {
      setExistingRegistrationError(
        lang === 'ar'
          ? 'تعذر تجهيز تفاصيل الحجز الحالي. حاول مرة أخرى.'
          : 'Unable to load your current booking details. Please try again.',
      );
    } finally {
      setExistingRegistrationAction(null);
    }
  }, [existingRegistration, lang, openRegistrationSuccess]);

  const handleUpdateExistingRegistration = useCallback(async () => {
    if (!existingRegistration) {
      return;
    }

    try {
      setExistingRegistrationAction('update');
      setExistingRegistrationError('');
      const result = await updateExistingRegistration(existingRegistration.id, {
        courses: selectedCourseIds,
        totalPrice: calculations.total,
        firstInstallment: calculations.firstInstallment,
        secondInstallment: calculations.secondInstallment,
        grantCodeUsed: grantCode || undefined,
      });

      if (!result.success || !result.data) {
        throw new Error(result.errorMessage ?? 'Failed to update registration');
      }

      await openRegistrationSuccess(result.data, 'updated');
      trackEvent('registration_existing_reused', {
        action: 'update',
        registrationCode: result.data.registrationCode,
        selectedCourses: selectedCourseIds,
      });
    } catch {
      setExistingRegistrationError(
        lang === 'ar'
          ? 'تعذر تحديث الحجز الحالي. حاول مرة أخرى.'
          : 'Unable to update the current booking. Please try again.',
      );
    } finally {
      setExistingRegistrationAction(null);
    }
  }, [calculations.firstInstallment, calculations.secondInstallment, calculations.total, existingRegistration, grantCode, lang, openRegistrationSuccess, selectedCourseIds]);

  const handleCodeRequestCreated = (whatsappUrl: string) => {
    setRequestCodeWhatsappUrl(whatsappUrl);
    trackEvent('code_request_whatsapp_created');
  };

  const handleStartFlow = () => {
    trackEvent('hero_cta_clicked', { variant: heroVariant });
    setStep('quiz');
  };

  const resetFlow = () => {
    setStep('hero');
    setGrantCode('');
    setGrantData(null);
    setReferralCodeUsed(null);
    setReferralDiscount(0);
    setSelectedCourses([]);
    setQuizResult(null);
    setRegistrationDraft({
      fullName: '',
      phone: '',
      age: '',
      agreed: false,
    });
    setRegistrationData(null);
    setExistingRegistration(null);
    setExistingRegistrationAction(null);
    setExistingRegistrationError('');
    setRequestCodeWhatsappUrl(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FLOW_DRAFT_KEY);
    }
    trackEvent('flow_reset');
  };

  const currentGrantData = useMemo(
    () => grantData || (grantCode && FALLBACK_GRANT_CODES[grantCode]
      ? { code: grantCode, ...FALLBACK_GRANT_CODES[grantCode] }
      : null),
    [grantCode, grantData]
  );
  const supportWhatsappUrl = useMemo(
    () => buildWhatsappLink(
      SUPPORT_WHATSAPP_NUMBER,
      lang === 'ar'
        ? 'مرحباً، أحتاج مساعدة بخصوص التسجيل أو اختيار الكورسات داخل مبادرة ذات.'
        : 'Hello, I need help with registration or choosing courses inside the ZAT initiative.'
    ),
    [lang]
  );
  const handleRegistrationDraftChange = useCallback((draft: RegistrationDraft) => {
    setRegistrationDraft(draft);
    setExistingRegistration(null);
    setExistingRegistrationError('');
  }, []);

  return (
    <div className="page-shell min-h-screen flex flex-col bg-background/70 text-foreground transition-colors">
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/45">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 text-lg font-black">
            <span className="text-primary">ZAT</span>
            <span className="text-muted-foreground">Initiative</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/referrals"
              className="action-secondary hidden items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black text-primary hover:border-primary/35 hover:bg-primary/5 md:inline-flex"
            >
              <BadgePercent className="h-4 w-4" />
              {lang === 'ar' ? 'تابع مسار خصمي' : 'Track My Discount'}
            </Link>
            <LanguageToggle lang={lang} onToggle={setLang} />
            <ThemeToggle theme={theme} onToggle={setTheme} />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={shouldReduceMotion ? { opacity: 0.98 } : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0.98 } : { opacity: 0, y: -22 }}
            transition={shouldReduceMotion ? { duration: 0.12 } : { duration: 0.28, ease: 'easeOut' }}
          >
            {step === 'hero' && (
              <Hero 
                lang={lang} 
                onStart={handleStartFlow}
                experimentVariant={heroVariant}
              />
            )}

            {step === 'quiz' && (
              <PathQuiz
                lang={lang}
                onBack={() => setStep('hero')}
                onSkip={() => {
                  setQuizResult(null);
                  trackEvent('quiz_skipped');
                  setStep('code');
                }}
                onComplete={handleQuizComplete}
              />
            )}
            
            {step === 'code' && (
              <CodeGate 
                lang={lang}
                onVerify={verifyGrantCode}
                onBack={() => setStep('quiz')}
                onSkip={() => {
                  setGrantData(null);
                  setGrantCode('');
                  setReferralCodeUsed(null);
                  setReferralDiscount(0);
                  trackEvent('grant_step_skipped');
                  setStep('courses');
                }}
                onCodeRequestCreated={handleCodeRequestCreated}
                codeRequestWhatsappUrl={requestCodeWhatsappUrl}
              />
            )}
            
            {step === 'courses' && (
              <CourseSelection
                lang={lang}
                courses={courses}
                selectedCourses={selectedCourses}
                onToggle={handleCourseToggle}
                onBack={() => setStep('code')}
                onContinue={() => setStep('basket')}
                grantData={currentGrantData}
                calculations={calculations}
                quizResult={quizResult}
                bundles={SMART_BUNDLES}
                onApplyBundle={handleApplyBundle}
              />
            )}
            
            {step === 'basket' && (
              <Basket
                lang={lang}
                allCourses={courses}
                selectedCourses={selectedCourses}
                grantData={currentGrantData}
                quizResult={quizResult}
                calculations={calculations}
                onBack={() => setStep('courses')}
                onContinue={() => setStep('form')}
                onAddSuggestedCourse={handleAddSuggestedCourse}
                supportWhatsappUrl={supportWhatsappUrl}
              />
            )}
            
            {step === 'form' && (
              <RegistrationForm
                lang={lang}
                selectedCourses={selectedCourses}
                grantCode={grantCode}
                grantData={currentGrantData}
                calculations={calculations}
                onBack={() => setStep('basket')}
                onSubmit={handleRegistration}
                allCourses={courses}
                draftData={registrationDraft}
                onDraftChange={handleRegistrationDraftChange}
                existingRegistration={existingRegistration}
                existingRegistrationAction={existingRegistrationAction}
                existingRegistrationError={existingRegistrationError}
                onResendExistingRegistration={handleResendExistingRegistration}
                onUpdateExistingRegistration={handleUpdateExistingRegistration}
                supportWhatsappUrl={supportWhatsappUrl}
              />
            )}
            
            {step === 'success' && registrationData && (
              <SuccessPage
                lang={lang}
                registrationData={registrationData}
                selectedCourses={selectedCourses}
                grantData={currentGrantData}
                calculations={calculations}
                suggestedNextCourse={suggestedNextCourse}
                supportWhatsappUrl={supportWhatsappUrl}
                onReset={resetFlow}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/70 bg-card/50 py-6 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center text-xs font-bold text-muted-foreground md:text-sm">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
            <Link href="/privacy" className="hover:text-primary transition-colors">{lang === 'ar' ? 'الخصوصية' : 'Privacy'}</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">{lang === 'ar' ? 'الشروط' : 'Terms'}</Link>
            <Link href="/refund-support" className="hover:text-primary transition-colors">{lang === 'ar' ? 'الاسترجاع والدعم' : 'Refund & Support'}</Link>
            <Link href="/payment-security" className="hover:text-primary transition-colors">{lang === 'ar' ? 'الدفع والأمان' : 'Payment & Security'}</Link>
          </div>
          <div>
            {lang === 'ar' ? '© 2024 مبادرة ذات - جميع الحقوق محفوظة' : '© 2024 ZAT Initiative - All Rights Reserved'}
          </div>
        </div>
      </footer>
    </div>
  );
}
