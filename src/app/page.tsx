'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { buildWhatsappLink } from '@/lib/utils';
import { COURSES, DEFAULT_GRANT_CODES, DISCOUNT_RULES, SMART_BUNDLES, SUPPORT_WHATSAPP_NUMBER } from '@/lib/data';
import { Course, GrantCode, LearningBundle, RegistrationDraft, RegistrationInput } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { CodeGate } from '@/components/CodeGate';
import { CourseSelection } from '@/components/CourseSelection';
import { Basket } from '@/components/Basket';
import { RegistrationForm } from '@/components/RegistrationForm';
import { SuccessPage } from '@/components/SuccessPage';
import { PathQuiz } from '@/components/PathQuiz';
import type { QuizResult } from '@/components/PathQuiz';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { submitRegistration, verifyGrantCodeAction } from '@/actions';
import { AnimatePresence, motion } from 'framer-motion';
import { APP_FEATURES } from '@/lib/feature-flags';
import { trackEvent } from '@/lib/analytics';
import { getStickyVariant, type HeroExperimentVariant } from '@/lib/experiments';

type Step = 'hero' | 'quiz' | 'code' | 'courses' | 'basket' | 'form' | 'success';
const FLOW_DRAFT_KEY = 'zat_flow_draft_v1';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [step, setStep] = useState<Step>('hero');
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem('zat_lang') as 'ar' | 'en' | null) || 'ar';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('zat_theme') as 'light' | 'dark' | null) || 'light';
  });
  const [grantCode, setGrantCode] = useState<string>('');
  const [grantData, setGrantData] = useState<GrantCode | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [registrationDraft, setRegistrationDraft] = useState<RegistrationDraft>({
    fullName: '',
    phone: '',
    age: '',
    agreed: false,
  });
  const [registrationData, setRegistrationData] = useState<{
    fullName: string;
    phone: string;
    age: number;
    registrationCode: string;
  } | null>(null);
  const [requestCodeWhatsappUrl, setRequestCodeWhatsappUrl] = useState<string | null>(null);
  const [heroVariant] = useState<HeroExperimentVariant>(() => {
    if (!APP_FEATURES.heroExperiment || typeof window === 'undefined') {
      return 'guided';
    }

    return getStickyVariant('hero_primary_cta', ['direct', 'guided'], 'guided') as HeroExperimentVariant;
  });
  const restoredDraftRef = useRef(false);
  const exposedVariantRef = useRef(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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

        setCourses(payload.data);
      })
      .catch(() => {
        // Keep fallback courses when the API is unavailable.
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!APP_FEATURES.progressDraft || restoredDraftRef.current || typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(FLOW_DRAFT_KEY);
    if (!raw) {
      restoredDraftRef.current = true;
      return;
    }

    try {
      const draft = JSON.parse(raw) as {
        step?: Step;
        grantCode?: string;
        selectedCourseIds?: number[];
        quizResult?: QuizResult | null;
        requestCodeWhatsappUrl?: string | null;
        registrationDraft?: RegistrationDraft;
      };

      if (draft.grantCode) {
        setGrantCode(draft.grantCode);
        const fallback = (DEFAULT_GRANT_CODES as Record<string, Omit<GrantCode, 'code'>>)[draft.grantCode];
        if (fallback) {
          setGrantData({ code: draft.grantCode, ...fallback });
        }
      }

      if (draft.selectedCourseIds?.length) {
        setSelectedCourses(courses.filter((course) => draft.selectedCourseIds?.includes(course.id)));
      }

      if (draft.quizResult) {
        setQuizResult(draft.quizResult);
      }

      if (draft.requestCodeWhatsappUrl) {
        setRequestCodeWhatsappUrl(draft.requestCodeWhatsappUrl);
      }

      if (draft.registrationDraft) {
        setRegistrationDraft(draft.registrationDraft);
      }

      if (draft.step && draft.step !== 'success') {
        setStep(draft.step);
      }
    } catch {
      // Ignore malformed drafts and continue with a clean flow.
    }

    restoredDraftRef.current = true;
  }, [courses]);

  useEffect(() => {
    if (!APP_FEATURES.progressDraft || typeof window === 'undefined' || !restoredDraftRef.current) {
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
        selectedCourseIds: selectedCourses.map((course) => course.id),
        quizResult,
        requestCodeWhatsappUrl,
        registrationDraft,
      })
    );
  }, [step, grantCode, selectedCourses, quizResult, requestCodeWhatsappUrl, registrationDraft, registrationData]);

  useEffect(() => {
    if (!APP_FEATURES.lightweightAnalytics) {
      return;
    }

    trackEvent('step_view', {
      step,
      selectedCourses: selectedCourses.map((course) => course.id),
      hasGrant: Boolean(grantCode),
    });
  }, [step, selectedCourses, grantCode]);

  const verifyGrantCode = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    let result: Awaited<ReturnType<typeof verifyGrantCodeAction>>;

    try {
      result = await verifyGrantCodeAction(normalizedCode);
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
    setStep('courses');
    trackEvent('grant_verified', { code: verifiedGrant.code });

    return {
      success: true,
      grant: verifiedGrant,
    };
  };

  const calculateTotal = () => {
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
    
    const total = Math.max(subtotal - discount, 0);
    const firstInstallment = selectedCourses.length === 0
      ? 0
      : Math.min(total, selectedCourses.length * 200);
    const secondInstallment = total - firstInstallment;
    
    return { subtotal, discount, total, firstInstallment, secondInstallment };
  };

  const handleCourseToggle = (course: Course) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      trackEvent(exists ? 'course_removed' : 'course_added', { courseId: course.id });
      if (exists) {
        return prev.filter(c => c.id !== course.id);
      }
      return [...prev, course];
    });
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setSelectedCourses(courses.filter((course) => result.recommendedCourseIds.includes(course.id)));
    setStep('code');
    trackEvent('quiz_completed', { recommendedCourseIds: result.recommendedCourseIds });
  };

  const handleApplyBundle = (bundle: LearningBundle) => {
    setSelectedCourses(courses.filter((course) => bundle.courseIds.includes(course.id)));
    trackEvent('bundle_applied', { bundleId: bundle.id, courseIds: bundle.courseIds });
  };

  const handleAddSuggestedCourse = (course: Course) => {
    setSelectedCourses((prev) => {
      if (prev.some((selected) => selected.id === course.id)) {
        return prev;
      }

      return [...prev, course];
    });
    trackEvent('smart_basket_accept', { courseId: course.id });
  };

  const getSuggestedNextCourse = () => {
    const selectedIds = selectedCourses.map((course) => course.id);

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
  };

  const handleRegistration = async (data: { fullName: string; phone: string; age: number }) => {
    const calculations = calculateTotal();
    const payload: RegistrationInput = {
      fullName: data.fullName,
      phone: data.phone,
      age: data.age,
      courses: selectedCourses.map((course) => course.id),
      totalPrice: calculations.total,
      firstInstallment: calculations.firstInstallment,
      secondInstallment: calculations.secondInstallment,
      grantCodeUsed: grantCode || undefined,
    };

    const result = await submitRegistration(payload);

    if (!result.success || !result.data) {
      throw new Error('Registration failed');
    }

    setRegistrationData({
      ...data,
      registrationCode: result.data.registration_code,
    });
    trackEvent('registration_completed', {
      selectedCourses: selectedCourses.map((course) => course.id),
      total: calculations.total,
    });
    setStep('success');
  };

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
    setSelectedCourses([]);
    setQuizResult(null);
    setRegistrationDraft({
      fullName: '',
      phone: '',
      age: '',
      agreed: false,
    });
    setRegistrationData(null);
    setRequestCodeWhatsappUrl(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FLOW_DRAFT_KEY);
    }
    trackEvent('flow_reset');
  };

  const calculations = calculateTotal();
  const fallbackGrantCodes = DEFAULT_GRANT_CODES as Record<string, Omit<GrantCode, 'code'>>;

  const currentGrantData = grantData || (grantCode && fallbackGrantCodes[grantCode]
    ? { code: grantCode, ...fallbackGrantCodes[grantCode] }
    : null);
  const supportWhatsappUrl = buildWhatsappLink(
    SUPPORT_WHATSAPP_NUMBER,
    lang === 'ar'
      ? 'مرحباً، أحتاج مساعدة بخصوص التسجيل أو اختيار الكورسات داخل مبادرة ذات.'
      : 'Hello, I need help with registration or choosing courses inside the ZAT initiative.'
  );
  const suggestedNextCourse = getSuggestedNextCourse();

  return (
    <div className="page-shell min-h-screen flex flex-col bg-background/70 text-foreground transition-colors">
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/45">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 text-lg font-black">
            <span className="text-primary">ZAT</span>
            <span className="text-muted-foreground">Initiative</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} onToggle={setLang} />
            <ThemeToggle theme={theme} onToggle={setTheme} />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -22 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
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
                draftData={registrationDraft}
                onDraftChange={setRegistrationDraft}
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
