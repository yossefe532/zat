'use client';

import { useState, useEffect } from 'react';
import { COURSES, DEFAULT_GRANT_CODES, DISCOUNT_RULES, ADMIN_FEES } from '@/lib/data';
import { Course, GrantCode, RegistrationInput } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { CodeGate } from '@/components/CodeGate';
import { CourseSelection } from '@/components/CourseSelection';
import { Basket } from '@/components/Basket';
import { RegistrationForm } from '@/components/RegistrationForm';
import { SuccessPage } from '@/components/SuccessPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { buildWhatsappLink } from '@/lib/utils';
import { submitRegistration, verifyGrantCodeAction } from '@/actions';
import { AnimatePresence, motion } from 'framer-motion';

type Step = 'hero' | 'code' | 'courses' | 'basket' | 'form' | 'success';

export default function Home() {
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
  const [registrationData, setRegistrationData] = useState<{
    fullName: string;
    phone: string;
    age: number;
    registrationCode: string;
  } | null>(null);
  const [requestCodeWhatsappUrl, setRequestCodeWhatsappUrl] = useState<string | null>(null);

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

  const verifyGrantCode = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const result = await verifyGrantCodeAction(normalizedCode);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: lang === 'ar' ? 'الكود غير صحيح أو غير مفعل' : 'Invalid or inactive code',
      };
    }

    const verifiedGrant = result.data;
    const ownerMessage = lang === 'ar'
      ? `مرحباً، تم تفعيل كود المنحة الخاص بك بنجاح.\n\nالكود المستخدم: ${verifiedGrant.code}\nاسم المنحة: ${verifiedGrant.nameAr}\nالوقت: ${new Date().toLocaleString('ar-EG')}\n\nيرجى متابعة التسجيل الجديد داخل المبادرة.`
      : `Hello, your grant code has just been activated.\n\nUsed code: ${verifiedGrant.code}\nGrant name: ${verifiedGrant.nameEn}\nTime: ${new Date().toLocaleString('en-US')}\n\nPlease follow up on the new registration.`;

    setGrantData(verifiedGrant);
    setGrantCode(verifiedGrant.code);
    setStep('courses');

    return {
      success: true,
      grant: verifiedGrant,
      notificationUrl: buildWhatsappLink(verifiedGrant.whatsappNumber, ownerMessage),
    };
  };

  const calculateTotal = () => {
    const subtotal = selectedCourses.reduce((sum, course) => {
      if (grantData) {
        return sum + course.grantPrice + ADMIN_FEES;
      }

      return sum + course.originalPrice;
    }, 0);

    let discount = 0;
    
    for (const rule of DISCOUNT_RULES) {
      if (selectedCourses.length >= rule.count) {
        discount = rule.discount;
      }
    }
    
    const total = Math.max(subtotal - discount, 0);
    const firstInstallment = selectedCourses.length === 0
      ? 0
      : Math.min(total, selectedCourses.length * (200 + (grantData ? ADMIN_FEES : 0)));
    const secondInstallment = total - firstInstallment;
    
    return { subtotal, discount, total, firstInstallment, secondInstallment };
  };

  const handleCourseToggle = (course: Course) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      if (exists) {
        return prev.filter(c => c.id !== course.id);
      }
      return [...prev, course];
    });
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
    setStep('success');
  };

  const handleCodeRequestCreated = (whatsappUrl: string) => {
    setRequestCodeWhatsappUrl(whatsappUrl);
  };

  const resetFlow = () => {
    setStep('hero');
    setGrantCode('');
    setGrantData(null);
    setSelectedCourses([]);
    setRegistrationData(null);
    setRequestCodeWhatsappUrl(null);
  };

  const calculations = calculateTotal();
  const fallbackGrantCodes = DEFAULT_GRANT_CODES as Record<string, Omit<GrantCode, 'code'>>;

  const currentGrantData = grantData || (grantCode && fallbackGrantCodes[grantCode]
    ? { code: grantCode, ...fallbackGrantCodes[grantCode] }
    : null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
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
                onStart={() => setStep('code')} 
              />
            )}
            
            {step === 'code' && (
              <CodeGate 
                lang={lang}
                onVerify={verifyGrantCode}
                onBack={() => setStep('hero')}
                onSkip={() => {
                  setGrantData(null);
                  setGrantCode('');
                  setStep('courses');
                }}
                onCodeRequestCreated={handleCodeRequestCreated}
                codeRequestWhatsappUrl={requestCodeWhatsappUrl}
              />
            )}
            
            {step === 'courses' && (
              <CourseSelection
                lang={lang}
                courses={COURSES}
                selectedCourses={selectedCourses}
                onToggle={handleCourseToggle}
                onBack={() => setStep('code')}
                onContinue={() => setStep('basket')}
                grantData={currentGrantData}
                calculations={calculations}
              />
            )}
            
            {step === 'basket' && (
              <Basket
                lang={lang}
                selectedCourses={selectedCourses}
                grantData={currentGrantData}
                calculations={calculations}
                onBack={() => setStep('courses')}
                onContinue={() => setStep('form')}
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
              />
            )}
            
            {step === 'success' && registrationData && (
              <SuccessPage
                lang={lang}
                registrationData={registrationData}
                selectedCourses={selectedCourses}
                grantData={currentGrantData}
                calculations={calculations}
                onReset={resetFlow}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          {lang === 'ar' ? '© 2024 مبادرة ذات - جميع الحقوق محفوظة' : '© 2024 ZAT Initiative - All Rights Reserved'}
        </div>
      </footer>
    </div>
  );
}
